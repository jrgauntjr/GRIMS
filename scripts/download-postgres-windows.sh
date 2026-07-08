#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${POSTGRES_VERSION:-16.13.0}"
ARCHIVE="postgresql-${VERSION}-x86_64-pc-windows-msvc.tar.gz"
URL="https://github.com/theseus-rs/postgresql-binaries/releases/download/${VERSION}/${ARCHIVE}"
DEST="$ROOT/vendor/postgres/windows-x86_64"
TMP="$ROOT/vendor/postgres/.download-windows"

if [ -x "$DEST/bin/postgres.exe" ] || [ -f "$DEST/bin/postgres.exe" ]; then
  echo "PostgreSQL already present at $DEST"
  exit 0
fi

mkdir -p "$TMP"
cd "$TMP"

echo "Downloading PostgreSQL ${VERSION} for Windows..."
curl -fsSL "$URL" -o "$ARCHIVE"

rm -rf "$DEST"
mkdir -p "$DEST"

tar -xzf "$ARCHIVE" -C "$DEST" --strip-components=1

rm -rf "$TMP"

echo "Installed PostgreSQL to $DEST"
