#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT/frontend"
npm run build

rm -rf "$ROOT/backend/priv/static"
mkdir -p "$ROOT/backend/priv/static"
cp -r "$ROOT/frontend/dist/." "$ROOT/backend/priv/static/"

JS_BUNDLE="$(find "$ROOT/backend/priv/static/assets" -name 'index-*.js' | head -1)"

if [ -z "$JS_BUNDLE" ] || ! grep -q 'path:"/inventory"' "$JS_BUNDLE"; then
  echo "error: frontend bundle is missing /inventory route" >&2
  exit 1
fi

echo "Synced frontend build to backend/priv/static"
echo "Bundle: $(basename "$JS_BUNDLE")"
