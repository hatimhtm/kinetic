# The light each award site's screen spills into the room on the home page, drawn ahead of time so the wall of
# sixteen screens needs no CSS blur or mask (each was a large blurred, masked layer). For every site in the menu in
# site.js: assets/light/<slug>-d.jpg (48 x 30, the screen's own colours) becomes assets/light/<slug>-glow.webp: the
# screen widened by 30 % on each side and 40 % above and below (edges carried outward), blurred, colours lifted 40 %,
# and faded out from 30 % of the way to the edge like radial-gradient(closest-side, #000 30%, transparent).
# usage, from this folder: python3 tools/award-glows.py      (needs Pillow and numpy)
import os, re
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIGHT = os.path.join(SITE, "assets", "light")
slugs = re.findall(r'slug:"([^"]+)"', open(os.path.join(SITE, "site.js"), encoding="utf-8").read().split("window.MENU", 1)[1].split("window.CONCEPTS", 1)[0])
W, H = 96, 60                                   # the screen, drawn at this size before it is widened
PX, PY = round(W * .3), round(H * .4)           # what the glow adds on each side
for slug in slugs:
    im = Image.open(os.path.join(LIGHT, slug + "-d.jpg")).convert("RGB")
    im = ImageEnhance.Color(im).enhance(1.4).resize((W, H), Image.BICUBIC)
    a = np.pad(np.asarray(im, dtype=np.uint8), ((PY, PY), (PX, PX), (0, 0)), mode="edge")
    im = Image.fromarray(a).filter(ImageFilter.GaussianBlur(9))
    h, w = a.shape[:2]
    y, x = np.mgrid[0:h, 0:w]
    r = np.hypot((x + .5 - w / 2) / (w / 2), (y + .5 - h / 2) / (h / 2))
    alpha = np.clip((1 - r) / .7, 0, 1)
    out = im.convert("RGBA")
    out.putalpha(Image.fromarray((alpha * 255).round().astype(np.uint8)))
    out = out.resize((w * 5 // 8, h * 5 // 8), Image.LANCZOS)
    dst = os.path.join(LIGHT, slug + "-glow.webp")
    out.save(dst, "WEBP", quality=82, method=6)
    print(slug, out.size, os.path.getsize(dst))
