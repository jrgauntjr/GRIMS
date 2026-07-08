#!/usr/bin/env bash
# Writes igdb.env into a desktop dist folder from repo-root .env.shop.
set -euo pipefail

ROOT="${1:?repo root required}"
DIST_DIR="${2:?dist dir required}"
ENV_SHOP="$ROOT/.env.shop"
OUT="$DIST_DIR/igdb.env"

if [ ! -f "$ENV_SHOP" ]; then
  echo "note: $ENV_SHOP not found; shop bundle will not include IGDB keys"
  rm -f "$OUT"
  exit 0
fi

set -a
# shellcheck disable=SC1090
source "$ENV_SHOP"
set +a

client_id="${IGDB_CLIENT_ID:-${TWITCH_CLIENT_ID:-}}"
client_secret="${IGDB_CLIENT_SECRET:-${TWITCH_CLIENT_SECRET:-}}"

if [ -z "$client_id" ] || [ -z "$client_secret" ]; then
  echo "warning: $ENV_SHOP exists but IGDB credentials are missing; skipping igdb.env" >&2
  rm -f "$OUT"
  exit 0
fi

{
  echo "# GRIMS shop IGDB credentials (bundled at package time; do not redistribute)"
  printf 'IGDB_CLIENT_ID=%s\n' "$client_id"
  printf 'IGDB_CLIENT_SECRET=%s\n' "$client_secret"
} > "$OUT"

chmod 600 "$OUT" 2>/dev/null || true
echo "Bundled shop IGDB credentials into $OUT"
