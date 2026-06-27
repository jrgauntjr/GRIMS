#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${POSTGRES_VERSION:-16.13.0}"
ARCHIVE="postgresql-${VERSION}-x86_64-unknown-linux-gnu.tar.gz"
URL="https://github.com/theseus-rs/postgresql-binaries/releases/download/${VERSION}/${ARCHIVE}"
DEST="$ROOT/vendor/postgres/linux-x86_64"
TMP="$ROOT/vendor/postgres/.download"

if [ -x "$DEST/bin/postgres" ]; then
  echo "PostgreSQL already present at $DEST"
  exit 0
fi

mkdir -p "$TMP"
cd "$TMP"

echo "Downloading PostgreSQL ${VERSION}..."
curl -fsSL "$URL" -o "$ARCHIVE"

rm -rf "$DEST"
mkdir -p "$DEST"

tar -xzf "$ARCHIVE" -C "$DEST" --strip-components=1

rm -rf "$TMP"

echo "Installed PostgreSQL to $DEST"
