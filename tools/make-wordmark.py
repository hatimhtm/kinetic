#!/usr/bin/env python3
"""Draws the studio wordmark from Mona Sans (SIL Open Font Licence), as SVG and as pixels.

The letters are Mona Sans outlines at a fixed width and weight, spaced by the font's own kerning
with a slightly tight track. The one drawn change: the dot of every lowercase "i" is a small
landscape screen (16:10, rounded), so the name carries a lit screen on each i. A name without a
lowercase i is drawn as plain letters.

tools/rename.py uses this for the whole rename (wordmark, favicons, link-preview picture).
On its own, to look at a spelling before renaming:
  python3 tools/make-wordmark.py tools/MonaSans-var-latin.woff2 "Name" out.svg [page.html]
The optional page gets its inline <symbol id="wordmark"> (between the WORDMARK comments) replaced.

Needs fontTools and brotli (to read the .woff2); the pixel drawing also needs Pillow. The font file
came from the Google Fonts CSS API (Mona Sans, latin subset). Look at a new name large before using
it: PAIRS below takes hand corrections for a pair of letters.
"""
import io
import sys
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen

WDTH, WGHT = 116, 700
TRACK = -12           # font units added between letters (1000 per em), on top of the font's kerning
PAIRS = {             # hand corrections for a pair of letters, in font units, on top of the kerning
    ("L", "i"): -38,  # the open corner of the L leaves a hole before the i
}
DOT_W, DOT_H = 1.3, 0.8     # the screen dot, in stem widths (16:10)
DOT_R = 0.24               # corner radius, in dot heights


def load(path, text):
    """The font cut down to the letters of `text` (with its kerning), then fixed at WDTH and WGHT."""
    font = TTFont(path)
    opts = subset.Options()
    opts.layout_features = ["kern"]
    opts.notdef_outline = False
    sub = subset.Subsetter(opts)
    sub.populate(text=text + "ı")
    sub.subset(font)
    buf = io.BytesIO()
    font.save(buf)                      # subset first, then instance (see shared memory)
    buf.seek(0)
    font = TTFont(buf)
    return instancer.instantiateVariableFont(font, {"wdth": WDTH, "wght": WGHT})


class Kerning:
    """Pair adjustments from the font's GPOS 'kern' feature (static once the font is instanced)."""

    def __init__(self, font):
        self.lookups = []
        if "GPOS" not in font:
            return
        gpos = font["GPOS"].table
        wanted = set()
        for rec in gpos.FeatureList.FeatureRecord:
            if rec.FeatureTag == "kern":
                wanted.update(rec.Feature.LookupListIndex)
        for i in sorted(wanted):
            lookup = gpos.LookupList.Lookup[i]
            subs = []
            for st in lookup.SubTable:
                kind = lookup.LookupType
                if kind == 9:
                    kind, st = st.ExtensionLookupType, st.ExtSubTable
                if kind == 2:
                    subs.append((st, {g: n for n, g in enumerate(st.Coverage.glyphs)}))
            self.lookups.append(subs)

    def get(self, a, b):
        total = 0
        for subs in self.lookups:
            for st, cov in subs:
                if a not in cov:
                    continue
                if st.Format == 1:
                    hit = [r for r in st.PairSet[cov[a]].PairValueRecord if r.SecondGlyph == b]
                    if not hit:
                        continue
                    value = hit[0].Value1
                else:
                    c1 = st.ClassDef1.classDefs.get(a, 0)
                    c2 = st.ClassDef2.classDefs.get(b, 0)
                    value = st.Class1Record[c1].Class2Record[c2].Value1
                total += getattr(value, "XAdvance", 0) or 0
                break
        return total


def outline(gs, name):
    rec = DecomposingRecordingPen(gs)
    gs[name].draw(rec)
    return rec


def bounds(gs, rec):
    bp = BoundsPen(gs)
    rec.replay(bp)
    return bp.bounds


def num(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")


class Wordmark:
    """The drawn word, in font units (y up, baseline 0, the first letter's origin at x 0).

    glyphs: one entry per character: char, glyph name, x, the outline, and `dot` (x, bottom, w, h, r)
    for a lowercase i. cap: the cap height. top: the top of the box the page aligns (cap height, or the
    screen dots if they sit higher). ink: (left, bottom, right, top) of everything drawn, descenders too.
    """

    def __init__(self, font_path, text):
        if not text or text != text.strip():
            raise ValueError("the wordmark text is empty or starts or ends with a space")
        self.text = text
        self.font = load(font_path, text)
        gs = self.font.getGlyphSet()
        cmap = self.font.getBestCmap()
        missing = sorted(set(ch for ch in text if ord(ch) not in cmap))
        if missing:
            raise ValueError("Mona Sans (latin) has no letter for: " + " ".join(missing))
        hmtx = self.font["hmtx"].metrics
        kern = Kerning(self.font)

        stem_rec = outline(gs, "dotlessi")
        sx0, sy0, sx1, sy1 = bounds(gs, stem_rec)
        stem = sx1 - sx0
        xh = sy1
        self.cap = cap = self.font["OS/2"].sCapHeight
        dot_h, dot_w = stem * DOT_H, stem * DOT_W
        # the screen hangs from the cap line, so its top lines up with the capitals and ascenders
        dot_top = cap
        if dot_top - dot_h - xh < stem * 0.35:         # keep a clear gap above the stem
            dot_top = xh + stem * 0.35 + dot_h

        self.glyphs = []
        lo_x = lo_y = float("inf")
        hi_x = hi_y = float("-inf")
        x, prev, prev_k = 0.0, None, None
        for ch in text:
            kname = cmap[ord(ch)]
            gname = "dotlessi" if ch == "i" else kname
            if prev is not None:
                x += TRACK + kern.get(prev_k, kname) + PAIRS.get((prev, ch), 0)
            rec = outline(gs, gname)
            b = bounds(gs, rec)
            g = {"char": ch, "glyph": gname, "x": x, "rec": rec, "dot": None}
            if b:
                lo_x, lo_y = min(lo_x, x + b[0]), min(lo_y, b[1])
                hi_x, hi_y = max(hi_x, x + b[2]), max(hi_y, b[3])
            if ch == "i":
                cx = x + (b[0] + b[2]) / 2
                g["dot"] = (cx - dot_w / 2, dot_top - dot_h, dot_w, dot_h, dot_h * DOT_R)
                lo_x, hi_x = min(lo_x, cx - dot_w / 2), max(hi_x, cx + dot_w / 2)
                hi_y = max(hi_y, dot_top)
            self.glyphs.append(g)
            x += hmtx[gname][0]
            prev, prev_k = ch, kname
        self.top = max(cap, dot_top) if any(g["dot"] for g in self.glyphs) else cap
        self.ink = (lo_x, lo_y, hi_x, hi_y)

    # ---- SVG ----
    def parts(self, glyphs=None):
        out = []
        for g in self.glyphs if glyphs is None else glyphs:
            pen = SVGPathPen(None, ntos=num)
            g["rec"].replay(TransformPen(pen, (1, 0, 0, -1, g["x"], 0)))   # move, and flip y for SVG
            d = pen.getCommands()
            if d:
                out.append('<path d="%s"/>' % d)
            if g["dot"]:
                dx, db, dw, dh, dr = g["dot"]
                out.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f"/>'
                           % (dx, -(db + dh), dw, dh, dr))
        return "".join(out)

    def cap_box(self):
        """viewBox for the page: the cap height (or the dots) to the baseline; descenders hang below."""
        left, _, right, _ = self.ink
        return (left, -self.top, right - left, self.top)

    def ratio(self):
        b = self.cap_box()
        return b[2] / b[3]

    def ink_box(self):
        left, bottom, right, top = self.ink
        top, bottom = max(top, self.top), min(bottom, 0)
        return (left, -top, right - left, top - bottom)

    def svg_file(self, label):
        """A standalone file: everything drawn fits its viewBox, descenders too."""
        vb = " ".join("%.1f" % v for v in self.ink_box())
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" role="img" aria-label="%s">'
                '<g fill="currentColor">%s</g></svg>\n' % (vb, esc(label), self.parts()))

    def symbol_block(self):
        """The inline copy the page uses (<use href="#wordmark">), between the WORDMARK comments."""
        vb = " ".join("%.1f" % v for v in self.cap_box())
        return ('<!--WORDMARK--><svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">'
                '<symbol id="wordmark" viewBox="%s" overflow="visible"><g fill="currentColor">%s</g></symbol>'
                '</svg><!--/WORDMARK-->' % (vb, self.parts()))

    # ---- pixels ----
    def ttf(self):
        buf = io.BytesIO()
        self.font.flavor = None
        self.font.save(buf)
        return buf.getvalue()

    def draw(self, mask, k, ox, base, glyphs=None, ss=1):
        """Draw white (255) on an 'L' image: k pixels per font unit, the origin at (ox, base) in pixels.
        Coordinates are multiplied by ss, for drawing on a canvas ss times larger and reducing it after."""
        from PIL import ImageDraw, ImageFont
        face = ImageFont.truetype(io.BytesIO(self.ttf()), k * self.font["head"].unitsPerEm * ss)
        d = ImageDraw.Draw(mask)
        for g in self.glyphs if glyphs is None else glyphs:
            ch = "ı" if g["char"] == "i" else g["char"]
            if ch.strip():
                d.text(((ox + g["x"] * k) * ss, base * ss), ch, font=face, fill=255, anchor="ls")
            if g["dot"]:
                dx, db, dw, dh, dr = g["dot"]
                x0, y0 = (ox + dx * k) * ss, (base - (db + dh) * k) * ss
                x1, y1 = (ox + (dx + dw) * k) * ss, (base - db * k) * ss
                d.rounded_rectangle([round(x0), round(y0), round(x1) - 1, round(y1) - 1],
                                    radius=dr * k * ss, fill=255)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def replace_symbol(html, block):
    a = html.find("<!--WORDMARK-->")
    b = html.find("<!--/WORDMARK-->")
    if a < 0 or b < 0:
        raise ValueError("the page has no <!--WORDMARK--> ... <!--/WORDMARK--> block")
    return html[:a] + block + html[b + len("<!--/WORDMARK-->"):]


def main():
    src, text, out = sys.argv[1], sys.argv[2], sys.argv[3]
    wm = Wordmark(src, text)
    open(out, "w", encoding="utf-8").write(wm.svg_file(text))
    print("wrote", out, "ratio %.3f" % wm.ratio())
    if len(sys.argv) > 4:
        page = sys.argv[4]
        html = open(page, encoding="utf-8").read()
        open(page, "w", encoding="utf-8").write(replace_symbol(html, wm.symbol_block()))
        print("updated", page)


if __name__ == "__main__":
    main()
