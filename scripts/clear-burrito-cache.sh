#!/usr/bin/env bash
set -euo pipefail

CACHE_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/.burrito"

if [ -d "$CACHE_ROOT" ]; then
  rm -rf "$CACHE_ROOT"/grims_*
  echo "Cleared Burrito cache in $CACHE_ROOT"
else
  echo "No Burrito cache found at $CACHE_ROOT"
fi
