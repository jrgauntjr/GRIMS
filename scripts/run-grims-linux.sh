#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -x "$SCRIPT_DIR/grims_linux" ]; then
  DESKTOP_DIR="$SCRIPT_DIR"
elif [ -x "$SCRIPT_DIR/../backend/burrito_out/grims_linux" ]; then
  DESKTOP_DIR="$(cd "$SCRIPT_DIR/../backend/burrito_out" && pwd)"
else
  echo "error: grims_linux not found. Build with: cd backend && MIX_ENV=prod mix release.desktop" >&2
  exit 1
fi

BINARY="$DESKTOP_DIR/grims_linux"
PORT="${GRIMS_PORT:-4000}"
LAUNCH_URL="http://127.0.0.1:${PORT}/desktop/launcher"
URL="http://127.0.0.1:${PORT}/"

export GRIMS_HOME="$DESKTOP_DIR"
export GRIMS_BIN="$BINARY"
export GRIMS_DESKTOP=1
export GRIMS_BUNDLE_POSTGRES=1

if [ -f "$SCRIPT_DIR/igdb.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$SCRIPT_DIR/igdb.env"
  set +a
fi

server_up() {
  if command -v curl >/dev/null 2>&1; then
    curl -sf "$URL" >/dev/null 2>&1 && return 0
  fi

  # Works in bash without curl/wget (common on minimal Ubuntu installs).
  (echo >/dev/tcp/127.0.0.1/"$PORT") >/dev/null 2>&1
}

"$BINARY" &
PID=$!

stop_grims() {
  kill "$PID" 2>/dev/null || true
}

# Only stop GRIMS when the user interrupts the launcher (Ctrl+C).
trap stop_grims INT TERM

ready=0
for _ in $(seq 1 120); do
  if server_up; then
    ready=1
    break
  fi

  if ! kill -0 "$PID" 2>/dev/null; then
    echo "error: GRIMS exited during startup" >&2
    wait "$PID" || true
    exit 1
  fi

  sleep 0.5
done

if [ "$ready" -eq 0 ]; then
  if kill -0 "$PID" 2>/dev/null; then
    echo "warning: could not confirm $URL is responding yet, but GRIMS is still running" >&2
    echo "warning: open $URL in your browser; press Ctrl+C here to stop GRIMS" >&2
  else
    echo "error: GRIMS did not start on $URL" >&2
    wait "$PID" 2>/dev/null || true
    exit 1
  fi
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$LAUNCH_URL" >/dev/null 2>&1 || true
fi

echo "GRIMS is running at $URL (Ctrl+C to stop)"
wait "$PID"
