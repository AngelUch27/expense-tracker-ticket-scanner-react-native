#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Error: gcloud no esta instalado."
  echo "Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

TOKEN="$(gcloud auth print-access-token)"

if [ -z "$TOKEN" ]; then
  echo "Error: no se pudo obtener access token. Ejecuta: gcloud auth login"
  exit 1
fi

touch "$ENV_FILE"

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|g" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert_env "EXPO_PUBLIC_GOOGLE_DOC_AI_ACCESS_TOKEN" "$TOKEN"

if ! grep -q "^EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID=" "$ENV_FILE"; then
  echo "EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID=" >> "$ENV_FILE"
fi

if ! grep -q "^EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION=" "$ENV_FILE"; then
  echo "EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION=us" >> "$ENV_FILE"
fi

if ! grep -q "^EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID=" "$ENV_FILE"; then
  echo "EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID=" >> "$ENV_FILE"
fi

echo "Token actualizado en .env"
echo "Si es tu primera vez, completa PROJECT_ID y PROCESSOR_ID en $ENV_FILE"
