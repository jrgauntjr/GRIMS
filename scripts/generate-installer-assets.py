#!/usr/bin/env python3
"""Generate Inno Setup branding assets from GRIMS PNG sources."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("error: Pillow is required. Install with: pip3 install pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "scripts" / "installer"
ICON_SRC = ROOT / "frontend" / "public" / "grim16.png"
LOGO_SRC = ROOT / "frontend" / "src" / "assets" / "GRIMS_logo.png"

ICON_SIZES = (256, 128, 64, 48, 32, 16)
WIZARD_SMALL = (55, 58)
WIZARD_LARGE = (164, 314)
WIZARD_BG = (255, 255, 255)


def fit_on_canvas(src: Path, size: tuple[int, int], background: tuple[int, int, int]) -> Image.Image:
    image = Image.open(src).convert("RGBA")
    fitted = image.copy()
    fitted.thumbnail(size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", size, background + (255,))
    offset = ((size[0] - fitted.size[0]) // 2, (size[1] - fitted.size[1]) // 2)
    canvas.paste(fitted, offset, fitted)
    return canvas.convert("RGB")


def write_icon(src: Path, dest: Path) -> None:
    base = Image.open(src).convert("RGBA")
    base.save(
        dest,
        format="ICO",
        sizes=[(size, size) for size in ICON_SIZES],
    )


def main() -> None:
    if not ICON_SRC.is_file():
        raise SystemExit(f"error: icon source not found: {ICON_SRC}")
    if not LOGO_SRC.is_file():
        raise SystemExit(f"error: logo source not found: {LOGO_SRC}")

    OUT.mkdir(parents=True, exist_ok=True)

    write_icon(ICON_SRC, OUT / "grims.ico")
    fit_on_canvas(LOGO_SRC, WIZARD_SMALL, WIZARD_BG).save(OUT / "wizard-small.bmp", format="BMP")
    fit_on_canvas(LOGO_SRC, WIZARD_LARGE, WIZARD_BG).save(OUT / "wizard-large.bmp", format="BMP")

    print(f"Generated installer assets in {OUT}")


if __name__ == "__main__":
    main()
