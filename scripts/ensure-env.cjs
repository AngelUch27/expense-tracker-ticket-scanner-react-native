#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_FILE = path.join(ROOT_DIR, '.env.example');

if (fs.existsSync(ENV_FILE)) {
  process.exit(0);
}

if (!fs.existsSync(ENV_EXAMPLE_FILE)) {
  console.error(
    'No existe .env ni .env.example. Crea .env manualmente para continuar.'
  );
  process.exit(1);
}

fs.copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
console.log('Se creo .env a partir de .env.example');
