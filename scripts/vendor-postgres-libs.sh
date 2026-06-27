#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/vendor/postgres/linux-x86_64"
VENDOR_LIB="$DEST/lib/grims-vendor"

if [ ! -x "$DEST/bin/postgres" ]; then
  echo "error: postgres not found at $DEST (run download-postgres-linux.sh first)" >&2
  exit 1
fi

mkdir -p "$VENDOR_LIB"
find "$VENDOR_LIB" -mindepth 1 -delete

skip_lib() {
  local base
  base="$(basename "$1")"

  case "$base" in
    linux-vdso.so.1 | ld-linux-x86-64.so.2 | ld-linux-aarch64.so.1) return 0 ;;
    libc.so.6 | libm.so.6 | libpthread.so.0 | libdl.so.2 | librt.so.1) return 0 ;;
    libresolv.so.2 | libutil.so.1 | libcrypt.so.1 | libnss_files.so.2 | libnss_dns.so.2) return 0 ;;
  esac

  return 1
}

bundle_deps_for() {
  local bin="$1"
  local lib

  while IFS= read -r lib; do
    if [ ! -f "$lib" ]; then
      continue
    fi

    if skip_lib "$lib"; then
      continue
    fi

    cp -L "$lib" "$VENDOR_LIB/$(basename "$lib")"
  done < <(ldd "$bin" 2>/dev/null | awk '/ => / { print $3 }' || true)
}

for bin in postgres initdb pg_ctl pg_isready createdb; do
  if [ -x "$DEST/bin/$bin" ]; then
    bundle_deps_for "$DEST/bin/$bin"
  fi
done

count="$(find "$VENDOR_LIB" -type f | wc -l)"
echo "Bundled ${count} shared libraries into $VENDOR_LIB"
