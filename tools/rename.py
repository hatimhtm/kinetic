#!/usr/bin/env python3
"""Renames the studio everywhere, in one step.

  python3 tools/rename.py "New Name"
  python3 tools/rename.py "New Name" --wordmark "New name"    (the drawn wordmark in another case; by default it keeps
                                                              the current one's style: all lowercase, like "kinetic")

The name lives in site.js: STUDIO.name, and STUDIO.wordmark (how the drawn wordmark spells it; the same
letters, any case). This command:
  1. writes the new name (and its wordmark spelling) into site.js;
  2. redraws the wordmark: assets/wordmark.svg, the inline copy in every page (between the WORDMARK
     comments) and its width-to-height ratio (--wm) in styles.css. Each lowercase "i" gets the lit-screen
     dot; a name without one is drawn as plain letters;
  3. redraws the favicons (assets/favicon.svg, favicon-32.png, apple-touch-icon.png: the first letter,
     and the "i" after it when there is one; favicon.ico at the root too) and the link-preview picture (assets/og.png, the new
     wordmark on tools/og-base.png);
  4. replaces the old name wherever the pages write it: every .html page in this folder and in work/, services/,
     contact/ (title,
     link-preview tags, labels, alt texts, text, comments; not inside scripts or styles), the concept
     pages (the folder STUDIO.conceptsBase points to, and any --also folder), and the comments of styles.css.
Nothing else changes. It prints every line it changed, and anything it left alone.

Run it with the Python that has fontTools, brotli and Pillow (pip3 install fonttools brotli pillow).
If the name in site.js was edited by hand, pass the old one: --from "Old Name".
"""
import argparse
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "tools")
FONT = os.path.join(TOOLS, "MonaSans-var-latin.woff2")
OG_BASE = os.path.join(TOOLS, "og-base.png")

# The link-preview picture (1200 x 630): the wordmark's left edge at x 64 and its cap height from y 60,
# 34.05 px tall (the size it was first set at), shrunk only if it would run past x 800 (the line on the right).
OG_LEFT, OG_TOP, OG_CAP, OG_RIGHT = 64, 60, 34.05, 800
FAV_RADIUS = 0.22      # favicon corner, as a share of its side
FAV_FILL = 0.75        # the letters' longest side, as a share of the favicon's side, at most (never enlarged)


def wordmark_module():
    spec = importlib.util.spec_from_file_location("make_wordmark", os.path.join(TOOLS, "make-wordmark.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def word_re(s):
    return re.compile(r"(?<![\w-])" + re.escape(s) + r"(?![\w-])")


def studio_field(js, key):
    block = re.search(r"window\.STUDIO\s*=\s*\{.*?\n\};", js, re.S)
    if not block:
        raise SystemExit("site.js: no window.STUDIO = { ... }; block found")
    m = re.search(r'^(\s*%s:\s*)("(?:[^"\\\n]|\\.)*")' % key, block.group(0), re.M)
    if not m:
        return None, block, None
    return json.loads(m.group(2)), block, m


def set_field(js, key, value, after=None):
    old, block, m = studio_field(js, key)
    lit = json.dumps(value, ensure_ascii=False)
    b = block.group(0)
    if m:
        b = b[:m.start(2)] + lit + b[m.end(2):]
    else:                                   # add the field on the line after `after`
        _, _, ma = studio_field(js, after)
        end = b.index("\n", ma.end(0)) + 1
        b = b[:end] + "%s%s: %s,\n" % (re.match(r"\s*", ma.group(1)).group(0), key, lit) + b[end:]
    return js[:block.start()] + b + js[block.end():]


def report(path, before, after):
    """Print each changed line (not the long inline wordmark)."""
    import difflib
    short = lambda t: t.strip()[:150] + ("..." if len(t.strip()) > 150 else "")
    a, b = before.split("\n"), after.split("\n")
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            continue
        gone = [x for x in a[i1:i2] if "<!--WORDMARK-->" not in x]
        came = [y for y in b[j1:j2] if "<!--WORDMARK-->" not in y]
        if gone or came:
            print("  %s:%d" % (os.path.relpath(path, ROOT), j1 + 1))
            for x in gone:
                print("    - " + short(x))
            for y in came:
                print("    + " + short(y))


SKIP = re.compile(r"(<script\b.*?</script>|<style\b.*?</style>|<!--WORDMARK-->.*?<!--/WORDMARK-->)", re.S | re.I)


def rename_html(html, old, new):
    """Replace the old name as a whole word everywhere in the page except scripts, styles and the wordmark."""
    pat, rep = word_re(esc(old)), esc(new)
    out = []
    for i, part in enumerate(SKIP.split(html)):
        out.append(part if i % 2 else pat.sub(lambda m: rep, part))
    return "".join(out)


def left_over(text, old):
    return [n for n, line in enumerate(text.split("\n"), 1) if word_re(old).search(line) or word_re(esc(old)).search(line)]


def pages(args, js):
    found = sorted(os.path.join(ROOT, f) for f in os.listdir(ROOT) if f.endswith(".html"))
    # the inner pages: work/, services/, contact/ (any first-level folder with its own index.html)
    for d in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, d, "index.html")
        if d not in ("concepts", "tools", "vendor", "assets") and os.path.isfile(p):
            found.append(p)
    base, _, _ = studio_field(js, "conceptsBase")
    folders = [os.path.normpath(os.path.join(ROOT, base))] if base else []
    folders += [os.path.normpath(os.path.join(ROOT, d)) for d in args.also]
    for folder in folders:
        if not os.path.isdir(folder):
            print("  (no concept folder at %s)" % folder)
            continue
        for slug in sorted(os.listdir(folder)):
            p = os.path.join(folder, slug, "index.html")
            if os.path.isfile(p) and p not in found:
                found.append(p)
    return found


def favicon_letters(wm):
    """The first letter, and the i right after it when there is one (so its screen shows)."""
    g = wm.glyphs
    return g[:2] if len(g) > 1 and g[1]["char"] == "i" else g[:1]


def box_of(wm, glyphs):
    """(left, bottom, right, top) in font units of the given letters, dots included."""
    from fontTools.pens.boundsPen import BoundsPen
    lo_x = lo_y = float("inf")
    hi_x = hi_y = float("-inf")
    for g in glyphs:
        bp = BoundsPen(wm.font.getGlyphSet())
        g["rec"].replay(bp)
        if bp.bounds:
            x0, y0, x1, y1 = bp.bounds
            lo_x, lo_y, hi_x, hi_y = min(lo_x, g["x"] + x0), min(lo_y, y0), max(hi_x, g["x"] + x1), max(hi_y, y1)
        if g["dot"]:
            dx, db, dw, dh, _ = g["dot"]
            lo_x, lo_y, hi_x, hi_y = min(lo_x, dx), min(lo_y, db), max(hi_x, dx + dw), max(hi_y, db + dh)
    return lo_x, lo_y, hi_x, hi_y


def make_favicons(wm, assets):
    from PIL import Image, ImageDraw
    letters = favicon_letters(wm)
    x0, y0, x1, y1 = box_of(wm, letters)
    side = max(1000.0, max(x1 - x0, y1 - y0) / FAV_FILL)       # the square, in font units
    vx, vy = (x0 + x1) / 2 - side / 2, -(y0 + y1) / 2 - side / 2  # SVG coordinates (y down)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f">'
           '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#000"/>'
           '<g fill="#fff">%s</g></svg>' % (vx, vy, side, side, vx, vy, side, side, side * FAV_RADIUS, wm.parts(letters)))
    write(os.path.join(assets, "favicon.svg"), svg)

    def letters_mask(px, ss):
        k = px / side
        m = Image.new("L", (px * ss, px * ss), 0)
        wm.draw(m, k, -vx * k, -vy * k, glyphs=letters, ss=ss)
        return m.reduce(ss)

    def rounded(px, ss):
        alpha = Image.new("L", (px * ss, px * ss), 0)
        ImageDraw.Draw(alpha).rounded_rectangle([0, 0, px * ss - 1, px * ss - 1], radius=px * ss * FAV_RADIUS, fill=255)
        ink = letters_mask(px, ss)
        return Image.merge("RGBA", (ink, ink, ink, alpha.reduce(ss)))

    rounded(32, 8).save(os.path.join(assets, "favicon-32.png"), optimize=True)
    # favicon.ico at the root, for pages that name no icon (the concept pages) and for browsers that ask for it
    rounded(256, 2).save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    ink = letters_mask(180, 4)
    Image.merge("RGB", (ink, ink, ink)).save(os.path.join(assets, "apple-touch-icon.png"), optimize=True)
    return "".join(g["char"] for g in letters)


def make_og(wm, assets):
    from PIL import Image
    base = Image.open(OG_BASE).convert("RGB")
    left, _, right, _ = wm.ink
    k = OG_CAP / wm.cap
    if (right - left) * k > OG_RIGHT - OG_LEFT:
        k = (OG_RIGHT - OG_LEFT) / (right - left)
    ss = 4
    mask = Image.new("L", (base.width * ss, base.height * ss), 0)
    wm.draw(mask, k, OG_LEFT - left * k, OG_TOP + wm.top * k, ss=ss)
    base.paste((255, 255, 255), (0, 0), mask.reduce(ss))
    base.save(os.path.join(assets, "og.png"), optimize=True)
    return k


def main():
    ap = argparse.ArgumentParser(description="Rename the studio everywhere on the site.")
    ap.add_argument("name", help='the new name, as it is written in sentences, e.g. "Kinetic"')
    ap.add_argument("--wordmark", help="how the drawn wordmark spells it (same letters, any case); default: the name, in lowercase when the current wordmark is")
    ap.add_argument("--from", dest="old", help="the old name, if site.js was already edited by hand")
    ap.add_argument("--also", action="append", default=[], help="another folder of concept pages to update")
    args = ap.parse_args()

    new = " ".join(args.name.split())
    js_path = os.path.join(ROOT, "site.js")
    js = read(js_path)
    # by default the drawn wordmark keeps the site's style: all lowercase when the current one is ("kinetic"), so a
    # rename and its way back leave the site exactly as it was
    drawn, _, _ = studio_field(js, "wordmark")
    default = new.lower() if drawn and drawn == drawn.lower() and drawn != drawn.upper() else new
    spelled = " ".join((args.wordmark or default).split())
    for s in (new, spelled):
        if not s or any(t in s for t in ("*/", "<!--", "-->", "{", "}")):
            raise SystemExit("rename: the name is empty or holds characters the pages can't take (*/ <!-- --> { })")
    if spelled.casefold() != new.casefold():
        raise SystemExit('rename: --wordmark must spell the same letters as the name (only the case may differ)')

    current, _, _ = studio_field(js, "name")
    old = args.old or current
    if not old:
        raise SystemExit("rename: no name in site.js and no --from given")

    mw = wordmark_module()
    try:
        wm = mw.Wordmark(FONT, spelled)
    except ValueError as e:
        raise SystemExit("rename: " + str(e))
    print('Renaming "%s" to "%s" (wordmark "%s")' % (old, new, spelled))

    # 1. site.js
    js2 = set_field(set_field(js, "name", new), "wordmark", spelled, after="name")
    report(js_path, js, js2)
    write(js_path, js2)

    # 2. the wordmark, its inline copy and ratio
    assets = os.path.join(ROOT, "assets")
    write(os.path.join(assets, "wordmark.svg"), wm.svg_file(new))
    css_path = os.path.join(ROOT, "styles.css")
    css = read(css_path)
    css2 = re.sub(r"(--wm:\s*)[0-9.]+", lambda m: m.group(1) + ("%.3f" % wm.ratio()), css, count=1)
    pat = word_re(old)
    css2 = re.sub(r"/\*.*?\*/", lambda m: pat.sub(lambda _: new, m.group(0)), css2, flags=re.S)
    report(css_path, css, css2)
    write(css_path, css2)

    # 3. favicons and the link-preview picture
    fav = make_favicons(wm, assets)
    k = make_og(wm, assets)

    # 4. the pages
    leftovers = []
    for p in pages(args, js2):
        html = read(p)
        out = rename_html(html, old, new)
        if "<!--WORDMARK-->" in out:            # every page that carries its own inline wordmark
            out = mw.replace_symbol(out, wm.symbol_block())
        if out != html:
            report(p, html, out)
            write(p, out)
        if old.casefold() != new.casefold():
            leftovers += ["%s:%d" % (os.path.relpath(p, ROOT), n) for n in left_over(out, old)]

    print("Wordmark: ratio %.3f (--wm), %d lit screen(s); favicon letters \"%s\"; og.png wordmark %.1f px wide."
          % (wm.ratio(), sum(1 for g in wm.glyphs if g["dot"]), fav, (wm.ink[2] - wm.ink[0]) * k))
    if leftovers:
        print('Left alone (inside a script or style; check by hand): "%s" at %s' % (old, ", ".join(leftovers)))


if __name__ == "__main__":
    main()
