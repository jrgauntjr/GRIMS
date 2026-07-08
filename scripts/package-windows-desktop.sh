#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_POSTGRES="$ROOT/vendor/postgres/windows-x86_64"
DESKTOP_DIR="$ROOT/backend/burrito_out"
DIST_DIR="$ROOT/dist/grims-desktop-windows-x86_64"
ARCHIVE="$ROOT/dist/grims-desktop-windows-x86_64.zip"

bash "$ROOT/scripts/download-postgres-windows.sh"
bash "$ROOT/scripts/download-vcredist-windows.sh"
python3 "$ROOT/scripts/generate-installer-assets.py"

if [ ! -f "$DESKTOP_DIR/grims_windows.exe" ]; then
  echo "error: $DESKTOP_DIR/grims_windows.exe not found. Run: cd backend && MIX_ENV=prod mix release.desktop" >&2
  exit 1
fi

rm -rf "$DESKTOP_DIR/postgres"
cp -a "$VENDOR_POSTGRES" "$DESKTOP_DIR/postgres"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cp "$DESKTOP_DIR/grims_windows.exe" "$DIST_DIR/"
rm -rf "$DIST_DIR/postgres"
cp -a "$VENDOR_POSTGRES" "$DIST_DIR/postgres"

cp "$ROOT/scripts/run-grims-windows.bat" "$DIST_DIR/run-grims.bat"
cp "$ROOT/scripts/run-grims.vbs" "$DIST_DIR/run-grims.vbs"
cp "$ROOT/scripts/installer/grims.ico" "$DIST_DIR/grims.ico"

mkdir -p "$DIST_DIR/redist"
cp "$ROOT/vendor/vcredist/vc_redist.x64.exe" "$DIST_DIR/redist/"

bash "$ROOT/scripts/bundle-shop-igdb-env.sh" "$ROOT" "$DIST_DIR"

cat > "$DIST_DIR/README.txt" <<'EOF'
GRIMS Desktop for Windows (x86_64)

Recommended install:
  1. On Windows, build the installer from the packaged dist folder:
       iscc scripts\grims-desktop.iss
  2. Run the installer from Documents\GRIMS\grims-desktop-windows-x86_64-setup.exe
     (Inno Setup writes there when the repo is on WSL; avoid building into \\wsl.localhost\dist)
     The installer includes the Microsoft Visual C++ runtime when needed.

Portable / zip use (advanced):
  1. Extract this folder anywhere (e.g. C:\GRIMS)
  2. Install the VC++ runtime once if grims_windows.exe reports a missing DLL:
       redist\vc_redist.x64.exe /install /quiet /norestart
  3. Double-click run-grims.vbs (recommended) or run-grims.bat

Requirements:
  - Windows 10 or later (64-bit)
  - A web browser

PostgreSQL is bundled. No system PostgreSQL install needed.

If upgrading from an older build, also remove cached Burrito files:
  %LOCALAPPDATA%\.burrito\grims_*

The app creates:
  - %APPDATA%\GRIMS\grims.env
  - %LOCALAPPDATA%\GRIMS\postgres-data\

Open http://127.0.0.1:4000 in your browser.

Inventory game search uses IGDB when igdb.env is present in this folder (shop builds).
Otherwise add API keys to %APPDATA%\GRIMS\grims.env:
  IGDB_CLIENT_ID=
  IGDB_CLIENT_SECRET=
EOF

mkdir -p "$ROOT/dist"
rm -f "$ARCHIVE"

if command -v zip >/dev/null 2>&1; then
  (cd "$DIST_DIR" && zip -rq "$ARCHIVE" .)
else
  DIST_DIR="$DIST_DIR" ARCHIVE="$ARCHIVE" python3 - <<'PY'
import os
import zipfile

root = os.environ["DIST_DIR"]
archive = os.environ["ARCHIVE"]

with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            path = os.path.join(dirpath, name)
            zf.write(path, os.path.relpath(path, root))
PY
fi

echo "Packaged desktop bundle:"
echo "  $DIST_DIR"
echo "  $ARCHIVE"
