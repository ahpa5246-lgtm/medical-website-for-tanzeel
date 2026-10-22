#!/usr/bin/env bash
# Configure the existing Codespace using a verified public Supabase API key.
# The key is entered without echo, verified against the target project, and
# stored in a gitignored local file only after the API accepts it.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_ROOT/Build Medical Consultation Platform"
ENV_FILE="$APP_DIR/.env.local"
PROJECT_REF="${1:-enicmfiyoalhklmwdcnq}"
PROJECT_URL="https://$PROJECT_REF.supabase.co"

if [[ ! "$PROJECT_REF" =~ ^[a-z0-9]{20}$ ]]; then
  echo "Invalid project ref. Expected the 20-character Project Reference ID from Supabase." >&2
  exit 1
fi

if [[ -t 0 ]]; then
  echo "Open Supabase Dashboard > Project Settings > API Keys > Publishable key."
  echo "Copy the VALUE of the Publishable key for: $PROJECT_REF"
  read -r -s -p "Paste the full public API key (hidden input): " API_KEY
  printf '\n'
else
  API_KEY="${VITE_SUPABASE_ANON_KEY:-}"
fi

API_KEY="${API_KEY//$'\r'/}"

if [[ "$API_KEY" != sb_publishable_* && "$API_KEY" != eyJ* ]]; then
  echo "This is not a Publishable (sb_publishable_...) or legacy anon (eyJ...) API key." >&2
  echo "Do not paste a Secret/service_role key, key name, placeholder, or Project ID." >&2
  exit 1
fi

echo "Checking the public key against $PROJECT_URL ..."
if ! SUPABASE_CHECK_URL="$PROJECT_URL" SUPABASE_CHECK_KEY="$API_KEY" node --input-type=module <<'NODE'
const key = process.env.SUPABASE_CHECK_KEY
const url = process.env.SUPABASE_CHECK_URL
if (key.startsWith("eyJ")) {
  try {
    const encodedPayload = key.split(".")[1]
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
    if (payload.role !== "anon") {
      console.error("Refusing a JWT with a role other than anon. Never use service_role in Vite.")
      process.exit(1)
    }
  } catch {
    console.error("Invalid legacy anon JWT. Copy the public key from the current project.")
    process.exit(1)
  }
}
try {
  const response = await fetch(
    new URL("/rest/v1/content_entries?select=id&limit=1", url),
    { headers: { apikey: key }, signal: AbortSignal.timeout(15000) },
  )
  if (response.status === 200) {
    console.log("API key accepted: HTTP 200. The content table is accessible.")
    process.exit(0)
  }
  const body = (await response.text()).slice(0, 200)
  if (response.status === 401 || body.includes("Invalid API key")) {
    console.error("HTTP 401: Supabase rejected this key for this project.")
    console.error("Copy the Publishable key VALUE from the matching Supabase project's API Keys page.")
  } else {
    console.error("Supabase returned HTTP " + response.status + " while reading content_entries.")
    console.error("The database table, permissions, or API settings may need attention.")
  }
  process.exit(1)
} catch (error) {
  console.error("Could not verify the key due to a network error: " + error.message)
  process.exit(1)
}
NODE
then
  echo "Configuration was NOT changed. Correct the key and run this script again." >&2
  exit 1
fi

if [[ -f "$ENV_FILE" && -t 0 ]]; then
  read -r -p "A local environment file exists. Replace it with the VERIFIED key? [y/N] " RESPONSE
  if [[ "$RESPONSE" != "y" && "$RESPONSE" != "Y" ]]; then
    echo "No changes made. Existing environment configuration retained."
    exit 0
  fi
elif [[ -f "$ENV_FILE" ]]; then
  echo "Refusing to overwrite .env.local non-interactively." >&2
  exit 1
fi

umask 077
printf '%s\n' \
  "VITE_SUPABASE_URL=$PROJECT_URL" \
  "VITE_SUPABASE_ANON_KEY=$API_KEY" \
  'VITE_ENABLE_PROTOTYPE=false' \
  'VITE_ENABLE_CONSULTATIONS=false' \
  > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "Verified public key saved privately to Build Medical Consultation Platform/.env.local."
echo "Neither the key nor the configuration file was committed to GitHub."
echo "Restart the Vite server or Codespace to reload the environment."
echo "Consultations remain disabled until the workflow and RLS have been verified."
