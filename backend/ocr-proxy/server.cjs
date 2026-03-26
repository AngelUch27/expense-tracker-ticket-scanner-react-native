#!/usr/bin/env node
'use strict';

const http = require('node:http');
const { execFileSync } = require('node:child_process');

const PORT = Number(process.env.PORT || 8080);
const MAX_BODY_BYTES = 12 * 1024 * 1024;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function parseProcessorResource() {
  const value = process.env.DOCUMENT_AI_PROCESSOR_RESOURCE;
  if (!value) {
    throw new Error(
      'Falta DOCUMENT_AI_PROCESSOR_RESOURCE. Ejemplo: projects/PROJECT/locations/us/processors/PROCESSOR_ID'
    );
  }

  const match = value.match(
    /^projects\/([^/]+)\/locations\/([^/]+)\/processors\/([^/]+)$/
  );
  if (!match) {
    throw new Error(
      'DOCUMENT_AI_PROCESSOR_RESOURCE invalido. Debe tener formato projects/PROJECT/locations/LOCATION/processors/PROCESSOR_ID'
    );
  }

  return {
    resource: value,
    projectId: match[1],
    location: match[2],
    processorId: match[3],
  };
}

async function getAccessTokenFromMetadata() {
  const response = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    {
      headers: { 'Metadata-Flavor': 'Google' },
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Metadata token request fallo (${response.status}): ${detail || 'sin detalle'}`
    );
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Metadata token response no contiene access_token');
  }

  return data.access_token;
}

function getAccessTokenFromGcloud() {
  try {
    return execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

async function getAccessToken() {
  const explicit = (process.env.GOOGLE_ACCESS_TOKEN || '').trim();
  if (explicit) return explicit;

  try {
    return await getAccessTokenFromMetadata();
  } catch {
    const gcloudToken = getAccessTokenFromGcloud();
    if (gcloudToken) return gcloudToken;
    throw new Error(
      'No se pudo obtener token de acceso de metadata server ni de gcloud auth print-access-token'
    );
  }
}

async function callDocumentAi({ content, mimeType }) {
  const { resource, location } = parseProcessorResource();
  const token = await getAccessToken();
  const endpoint = `https://${location}-documentai.googleapis.com/v1/${resource}:process`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rawDocument: {
        content,
        mimeType,
      },
      skipHumanReview: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Document AI error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const document = data.document || {};

  return {
    rawText: document.text || '',
    entities: Array.isArray(document.entities) ? document.entities : [],
  };
}

async function readJsonBody(req) {
  const chunks = [];
  let received = 0;

  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_BODY_BYTES) {
      throw new Error('Payload demasiado grande');
    }
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new Error('JSON invalido');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/healthz') {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/ocr/receipt') {
    try {
      const body = await readJsonBody(req);
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      const mimeType =
        typeof body.mimeType === 'string' && body.mimeType.trim()
          ? body.mimeType.trim()
          : 'image/jpeg';

      if (!content) {
        json(res, 400, { error: 'Falta campo content (base64)' });
        return;
      }

      const result = await callDocumentAi({ content, mimeType });
      json(res, 200, result);
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido en OCR backend';
      json(res, 500, { error: message });
      return;
    }
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`OCR proxy backend escuchando en puerto ${PORT}`);
});
