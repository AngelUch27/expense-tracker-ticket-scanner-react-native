#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_FILE = path.join(ROOT_DIR, '.env.example');

function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
}

function parseEnv(lines) {
  const map = new Map();
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1);
    map.set(key, value);
  }
  return map;
}

if (!fs.existsSync(ENV_EXAMPLE_FILE)) {
  if (fs.existsSync(ENV_FILE)) process.exit(0);
  console.error('No existe .env ni .env.example. Crea .env manualmente para continuar.');
  process.exit(1);
}

if (!fs.existsSync(ENV_FILE)) {
  fs.copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
  console.log('Se creo .env a partir de .env.example');
  process.exit(0);
}

const envLines = readLines(ENV_FILE);
const exampleLines = readLines(ENV_EXAMPLE_FILE);
const envMap = parseEnv(envLines);
const exampleMap = parseEnv(exampleLines);

let added = 0;
for (const [key, value] of exampleMap.entries()) {
  if (envMap.has(key)) continue;
  envLines.push(`${key}=${value}`);
  added += 1;
}

if (added === 0) {
  process.exit(0);
}

const normalized = envLines.filter((line, idx, arr) => {
  if (line !== '') return true;
  return idx !== arr.length - 1;
});

fs.writeFileSync(ENV_FILE, `${normalized.join('\n')}\n`, 'utf8');
console.log(`Se agregaron ${added} variables faltantes a .env desde .env.example`);
