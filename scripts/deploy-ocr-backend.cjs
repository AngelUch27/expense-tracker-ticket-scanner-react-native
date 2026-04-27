#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend', 'ocr-proxy');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runGcloud(args, options = {}) {
  try {
    const output = execFileSync('gcloud', args, {
      encoding: 'utf8',
      stdio: options.stdio || 'pipe',
    });
    return typeof output === 'string' ? output.trim() : '';
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      fail(
        'Error: gcloud no esta instalado.\n' +
          'Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install'
      );
    }

    const stderr = error && error.stderr ? String(error.stderr) : '';
    const stdout = error && error.stdout ? String(error.stdout) : '';
    fail(
      `Error ejecutando gcloud ${args.join(' ')}.\n` +
        [stdout.trim(), stderr.trim()].filter(Boolean).join('\n')
    );
  }
}

function readEnvMap() {
  const map = new Map();
  if (!fs.existsSync(ENV_FILE)) return map;

  const lines = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) map.set(key, value);
  }
  return map;
}

function upsertEnv(filePath, key, value) {
  let lines = [];
  if (fs.existsSync(filePath)) {
    lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  }

  const prefix = `${key}=`;
  const index = lines.findIndex((line) => line.startsWith(prefix));
  const entry = `${key}=${value}`;

  if (index >= 0) {
    lines[index] = entry;
  } else {
    lines.push(entry);
  }

  const normalized = lines.filter((line, idx, arr) => {
    if (line !== '') return true;
    return idx !== arr.length - 1;
  });

  fs.writeFileSync(filePath, `${normalized.join('\n')}\n`, 'utf8');
}

function main() {
  const env = readEnvMap();

  const projectId = env.get('EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID') || '';
  const location = env.get('EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION') || 'us';
  const processorId = env.get('EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID') || '';

  if (!projectId || !processorId) {
    fail(
      'Faltan variables en .env: EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID y/o EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID'
    );
  }

  const runRegion = process.env.GOOGLE_CLOUD_RUN_REGION || 'us-central1';
  const serviceName = process.env.GOOGLE_CLOUD_RUN_OCR_SERVICE || 'controlgastos-ocr';
  const processorResource = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  console.log(`Usando proyecto: ${projectId}`);
  runGcloud(['config', 'set', 'project', projectId], { stdio: 'inherit' });

  console.log('Habilitando APIs necesarias...');
  runGcloud(
    [
      'services',
      'enable',
      'run.googleapis.com',
      'cloudbuild.googleapis.com',
      'artifactregistry.googleapis.com',
      'documentai.googleapis.com',
    ],
    { stdio: 'inherit' }
  );

  const projectNumber = runGcloud([
    'projects',
    'describe',
    projectId,
    '--format=value(projectNumber)',
  ]);

  const runtimeServiceAccount = `${projectNumber}-compute@developer.gserviceaccount.com`;
  console.log(`Asignando rol Document AI al service account: ${runtimeServiceAccount}`);
  runGcloud(
    [
      'projects',
      'add-iam-policy-binding',
      projectId,
      '--member',
      `serviceAccount:${runtimeServiceAccount}`,
      '--role',
      'roles/documentai.apiUser',
      '--quiet',
    ],
    { stdio: 'inherit' }
  );

  for (const role of ['roles/cloudbuild.builds.builder', 'roles/run.builder']) {
    console.log(`Asignando ${role} al service account: ${runtimeServiceAccount}`);
    runGcloud(
      [
        'projects',
        'add-iam-policy-binding',
        projectId,
        '--member',
        `serviceAccount:${runtimeServiceAccount}`,
        '--role',
        role,
        '--quiet',
      ],
      { stdio: 'inherit' }
    );
  }

  console.log('Desplegando backend OCR en Cloud Run...');
  runGcloud(
    [
      'run',
      'deploy',
      serviceName,
      '--source',
      BACKEND_DIR,
      '--region',
      runRegion,
      '--platform',
      'managed',
      '--allow-unauthenticated',
      '--set-env-vars',
      `DOCUMENT_AI_PROCESSOR_RESOURCE=${processorResource}`,
      '--quiet',
    ],
    { stdio: 'inherit' }
  );

  const baseUrl = runGcloud([
    'run',
    'services',
    'describe',
    serviceName,
    '--region',
    runRegion,
    '--format=value(status.url)',
  ]);
  const receiptEndpoint = `${baseUrl}/api/ocr/receipt`;

  if (fs.existsSync(ENV_FILE)) {
    upsertEnv(ENV_FILE, 'EXPO_PUBLIC_OCR_BACKEND_URL', receiptEndpoint);
  }
  upsertEnv(path.join(ROOT_DIR, '.env.example'), 'EXPO_PUBLIC_OCR_BACKEND_URL', receiptEndpoint);

  console.log('\nListo. Endpoint OCR backend:');
  console.log(receiptEndpoint);
  console.log('\nSe actualizo EXPO_PUBLIC_OCR_BACKEND_URL en .env y .env.example');
}

main();
