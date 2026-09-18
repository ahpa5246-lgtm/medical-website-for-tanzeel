#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPOSITORY_ROOT/Build Medical Consultation Platform"
LOG_FILE="/tmp/medical-prototype-vite.log"
PID_FILE="/tmp/medical-prototype-vite.pid"
HEALTH_URL="http://127.0.0.1:8443/"

is_ready() {
  node -e 'fetch(process.argv[1]).then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))' "$HEALTH_URL"
}

if is_ready; then
  exit 0
fi

cd "$APP_DIR"
nohup pnpm exec vite --host 0.0.0.0 --port 8443 --strictPort >"$LOG_FILE" 2>&1 </dev/null &
server_pid=$!
printf '%s\n' "$server_pid" >"$PID_FILE"

for _ in $(seq 1 30); do
  if is_ready; then
    exit 0
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    cat "$LOG_FILE" >&2
    exit 1
  fi

  sleep 1
done

cat "$LOG_FILE" >&2
exit 1
