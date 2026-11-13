# Turns each concept's covers into the site's pictures, so its screen shows a picture instead of a live frame.
#   in:  Studio/concepts/<slug>/cover.png (1440 x 900) and cover-phone.png (390 x 844 at any scale)
#   out: site/assets/concepts/<slug>-computer.jpg (1440 x 900), <slug>-phone.jpg (780 x 1688),
#        site/assets/light/concept-<slug>-d.jpg (48 x 30) and -p.jpg (24 x 52), the light each screen spills,
#        and site/assets/concepts/shots.js, the list of concepts that have pictures.
# A concept without both covers is left out and keeps its live frame. Run again whenever a cover is added or changed:
#   python3 site/tools/concept-covers.py
import os
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONCEPTS = os.path.join(os.path.dirname(SITE), "concepts")
PICS = os.path.join(SITE, "assets", "concepts")
LIGHT = os.path.join(SITE, "assets", "light")


def fit(im, w, h):
    """Fill w x h, cropping the excess from the bottom (the top of a page is what matters), like object-position 50% 0."""
    s = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x = (im.width - w) // 2
    return im.crop((x, 0, x + w, h))


done, made = [], 0
for slug in sorted(os.listdir(CONCEPTS)):
    comp, phone = os.path.join(CONCEPTS, slug, "cover.png"), os.path.join(CONCEPTS, slug, "cover-phone.png")
    if not (os.path.isfile(comp) and os.path.isfile(phone)):
        continue
    jobs = [
        (comp, os.path.join(PICS, slug + "-computer.jpg"), 1440, 900, 84),
        (phone, os.path.join(PICS, slug + "-phone.jpg"), 780, 1688, 84),
        (comp, os.path.join(LIGHT, "concept-" + slug + "-d.jpg"), 48, 30, 85),
        (phone, os.path.join(LIGHT, "concept-" + slug + "-p.jpg"), 24, 52, 85),
    ]
    for src, dst, w, h, q in jobs:
        if os.path.isfile(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        fit(Image.open(src).convert("RGB"), w, h).save(dst, "JPEG", quality=q, optimize=True, progressive=w > 100)
        made += 1
    done.append(slug)

with open(os.path.join(PICS, "shots.js"), "w") as f:
    f.write("// Concepts that have pictures in this folder: <slug>-computer.jpg (1440 x 900), <slug>-phone.jpg (780 x 1688),\n"
            "// and ../light/concept-<slug>-d.jpg and -p.jpg. Written by tools/concept-covers.py from each concept's\n"
            "// cover.png and cover-phone.png; a concept missing here is shown as its live page in a frame until it has both.\n"
            "window.CONCEPT_SHOTS = [" + ", ".join('"%s"' % s for s in done) + "];\n")
print("concepts with covers:", ", ".join(done) or "none", "| pictures written:", made)
