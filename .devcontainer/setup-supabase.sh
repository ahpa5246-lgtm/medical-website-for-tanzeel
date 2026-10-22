#!/usr/bin/env bash
# Configure the existing Codespace to use the user's Supabase test project.
# Never commit this generated file or print the publishable key.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_ROOT/Build Medical Consultation Platform"
ENV_FILE="$APP_DIR/.env.local"
PROJECT_REF="${1:-enicmfiyoahlklmwdcnq}"

if [[ ! "$PROJECT_REF" =~ ^[a-z0-9]{20}$ ]]; then
  echo "Invalid Supabase project ref (expected 20 lowercase letters/digits)." >&2
  exit 1
fi

API_KEY="${VITE_SUPABASE_ANON_KEY:-}"
if [[ -z "$API_KEY" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Run this script from an interactive Codespaces terminal, or configure the VITE_SUPABASE_ANON_KEY Codespaces secret." >&2
    exit 1
  fi
  read -r -s -p "Paste Supabase publishable key (hidden input): " API_KEY
  printf '\n'
fi

if [[ "$API_KEY" != sb_publishable_* && "$API_KEY" != eyJ* ]]; then
  echo "Expected a Supabase publishable key (sb_publishable_...) or legacy anon key, not a secret/service_role key." >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Refusing to overwrite an existing .env.local without interactive confirmation." >&2
    exit 1
  fi
  read -r -p "An .env.local file already exists. Replace it? [y/N] " RESPONSE
  if [[ "$RESPONSE" != "y" && "$RESPONSE" != "Y" ]]; then
    echo "Kept the existing configuration."
    exit 0
  fi
fi

umask 077
printf '%s\n' \
  "VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co" \
  "VITE_SUPABASE_ANON_KEY=$API_KEY" \
  'VITE_ENABLE_PROTOTYPE=false' \
  'VITE_ENABLE_CONSULTATIONS=false' \
  > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "Saved private Vite configuration to: Build Medical Consultation Platform/.env.local"
echo "Project ref: $PROJECT_REF"
echo "Consultations remain disabled until test database migrations and RLS are verified."
echo "Restart the Codespace to reload Vite environment variables, then open private port 8443."
echo "To prepare the DB from repository root: npx --yes supabase@2 init (only if config.toml is missing), login, link, db push --dry-run."
