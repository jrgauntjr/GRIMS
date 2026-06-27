#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_POSTGRES="$ROOT/vendor/postgres/linux-x86_64"
DESKTOP_DIR="$ROOT/backend/burrito_out"
DIST_DIR="$ROOT/dist/grims-desktop-linux-x86_64"
ARCHIVE="$ROOT/dist/grims-desktop-linux-x86_64.tar.gz"

bash "$ROOT/scripts/download-postgres-linux.sh"
bash "$ROOT/scripts/vendor-postgres-libs.sh"

if [ ! -x "$DESKTOP_DIR/grims_linux" ]; then
  echo "error: $DESKTOP_DIR/grims_linux not found. Run: cd backend && MIX_ENV=prod mix release.desktop" >&2
  exit 1
fi

rm -rf "$DESKTOP_DIR/postgres"
cp -a "$VENDOR_POSTGRES" "$DESKTOP_DIR/postgres"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cp "$DESKTOP_DIR/grims_linux" "$DIST_DIR/"
chmod +x "$DIST_DIR/grims_linux"

rm -rf "$DIST_DIR/postgres"
cp -a "$VENDOR_POSTGRES" "$DIST_DIR/postgres"

cp "$ROOT/scripts/run-grims-linux.sh" "$DIST_DIR/run-grims.sh"
chmod +x "$DIST_DIR/run-grims.sh"

cat > "$DIST_DIR/README.txt" <<'EOF'
GRIMS Desktop for Linux (x86_64)

Requirements:
  - Ubuntu 22.04+ or similar Linux x86_64 system
  - A web browser

PostgreSQL is bundled with required libraries. No system PostgreSQL install needed.
curl is not required to run GRIMS.

First run:
  1. Extract this folder anywhere
  2. Run: ./run-grims.sh
     Or:  ./grims_linux

If upgrading from an older build, also remove cached Burrito files:
  rm -rf ~/.local/share/.burrito/grims_*

The app creates:
  - ~/.config/grims/grims.env
  - ~/.local/share/grims/postgres-data/

Open http://127.0.0.1:4000 in your browser.

Optional API keys for inventory game search can be added to ~/.config/grims/grims.env:
  IGDB_CLIENT_ID=
  IGDB_CLIENT_SECRET=
EOF

mkdir -p "$ROOT/dist"
tar -czf "$ARCHIVE" -C "$ROOT/dist" "grims-desktop-linux-x86_64"

echo "Packaged desktop bundle:"
echo "  $DIST_DIR"
echo "  $ARCHIVE"
