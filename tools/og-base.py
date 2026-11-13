#!/usr/bin/env python3
"""Redraws the base of the link-preview picture (tools/og-base.png, 1200 x 630).

  python3 tools/og-base.py "Made by Your Name"
  python3 tools/og-base.py "A web studio in Lisbon" --headline "We design and build|websites and apps."

The base holds everything but the wordmark: a small grey line at the top right and the headline at the bottom
left, in the site's own display style (Mona Sans 690, width 114 %, letter spacing -0.04 em). Then run
`python3 tools/rename.py "Name" --from "Name"` to draw the wordmark on it and write assets/og.png.
Needs Python 3 with fontTools, brotli and Pillow (pip3 install fonttools brotli pillow).
"""
import argparse
import os
import tempfile

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, "tools", "MonaSans-var-latin.woff2")
OUT = os.path.join(ROOT, "tools", "og-base.png")
W, H, MARGIN = 1200, 630, 64
LINE_RIGHT, LINE_TOP, LINE_CAP = 1135, 70, 18      # the top-right line: right edge, cap top, cap height (px)
INK, GROUND = (163, 163, 168), (0, 0, 0)


def instance(wght, wdth, folder):
    font = TTFont(FONT)
    font = instancer.instantiateVariableFont(font, {"wght": wght, "wdth": wdth})
    font.flavor = None
    path = os.path.join(folder, f"mona-{wght}-{wdth}.ttf")
    font.save(path)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("line", help="the small line at the top right")
    ap.add_argument("--headline", default="We design and build|websites and apps.", help="headline lines, split by |")
    args = ap.parse_args()
    lines = args.headline.split("|")
    with tempfile.TemporaryDirectory() as tmp:
        body, disp = instance(430, 100, tmp), instance(690, 114, tmp)
        img = Image.new("RGB", (W, H), GROUND)
        d = ImageDraw.Draw(img)
        size = 10.0
        while ImageFont.truetype(body, size).getbbox("H")[3] - ImageFont.truetype(body, size).getbbox("H")[1] < LINE_CAP:
            size += 0.5
        f = ImageFont.truetype(body, size)
        d.text((LINE_RIGHT - f.getlength(args.line), LINE_TOP - f.getbbox("H")[1]), args.line, font=f, fill=INK)
        size = 140
        while True:
            f = ImageFont.truetype(disp, size)
            track = -0.04 * size
            widest = max(f.getlength(t) + track * (len(t) - 1) for t in lines)
            if widest <= W - 2 * MARGIN:
                break
            size -= 1
        lh = 1.02 * size
        top_of_caps = f.getbbox("W")[1]
        depth = f.getbbox("p")[3] - top_of_caps
        y0 = H - MARGIN - (lh * (len(lines) - 1) + depth)
        for i, t in enumerate(lines):
            y = y0 + i * lh - top_of_caps
            for k, ch in enumerate(t):
                d.text((MARGIN + f.getlength(t[:k]) + track * k, y), ch, font=f, fill=(255, 255, 255))
        img.save(OUT)
    print(f"wrote {os.path.relpath(OUT, ROOT)}: line {args.line!r}, headline {size}px")


if __name__ == "__main__":
    main()
