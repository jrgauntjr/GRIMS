#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/vendor/vcredist/vc_redist.x64.exe"
URL="https://aka.ms/vs/17/release/vc_redist.x64.exe"

if [ -f "$DEST" ]; then
  echo "VC++ redistributable already present at $DEST"
  exit 0
fi

mkdir -p "$(dirname "$DEST")"

echo "Downloading Microsoft VC++ 2015-2022 redistributable (x64)..."
curl -fsSL -o "$DEST" "$URL"

echo "Downloaded VC++ redistributable to $DEST"
