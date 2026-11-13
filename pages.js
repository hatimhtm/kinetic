// The inner pages (work, services, contact). Everything the studio names comes from site.js.
// Motion engine as on the home page: Lenis only with a mouse or touchpad, native scroll on touch screens, every
// scroll scene tied straight to the scroll position and written as transforms and opacity only.
(function () {
  "use strict";
  var S = window.STUDIO || {}, CONCEPTS = window.CONCEPTS || [], SHOTS = window.CONCEPT_SHOTS || [];
  var root = document.documentElement, body = document.body;
  var BASE = body.getAttribute("data-root") || "../";
  var PAGE = body.getAttribute("data-page") || "";
  var mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = matchMedia("(hover: hover) and (pointer: fine)");
  var mqDesk = matchMedia("(min-width: 901px)");
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(p, a, b) { return clamp01((p - a) / (b - a)); }
  function idle(fn, wait) { return (window.requestIdleCallback || function (f) { return setTimeout(f, 50); })(fn, { timeout: wait || 1500 }); }
  function pageTop(el) { return el.getBoundingClientRect().top + (window.pageYOffset || 0); }
  function barH() { var b = $(".bar"); return b ? b.offsetHeight : 0; }

  // ---- the studio's own fields (nav.js fills the labels, the city and the e-mail links on every page) ----
  // a break chance before "@": a long address wraps as name / @domain, never mid-word
  $$("[data-email]").forEach(function (el) {
    var e = S.email || "", at = e.indexOf("@");
    el.textContent = at > 0 ? e.slice(0, at) : e;
    if (at > 0) { el.appendChild(document.createElement("wbr")); el.appendChild(document.createTextNode(e.slice(at))); }
  });

  // ---- the concepts (work page): one panel per live concept slot in site.js ----
  function isLive(c) { return !!(c.slug && (c.shot || c.name)); }
  function shotOf(c) { return c.shot || (SHOTS.indexOf(c.slug) > -1 ? c.slug : null); }
  function hrefOf(c) { return BASE + (S.conceptsBase || "concepts/") + c.slug + "/index.html"; }
  var ARROW = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var live = CONCEPTS.filter(isLive);
  // each concept as a short case: the brief we wrote for the made-up brand, and what its site does about it
  // (from the concept notes in the Studio's DESIGN.md; every line describes something the concept site really has)
  var CASES = {
    noodle: ["Show that every bowl is pulled by hand, and that it is halal.", "The cook at work in an arched window, every thickness, and pickup orders."],
    settle: ["Make invoicing software clear before anyone signs up.", "The product on the first screen: a sample invoice, sent, chased and paid."],
    architect: ["Show solid, thick-walled houses with the calm of a drawing.", "A floor plan that inks itself in, with photos in its rooms, then four houses."],
    skincare: ["Sell one mineral sunscreen online, straight from the page.", "Noon sun: the shade slides off as you arrive, and the bag answers every add."],
    realty: ["Show Brooklyn homes for sale, and win the next seller on the block.", "Photos that climb in on cut steps, and homes sorted by neighbourhood."],
    saas: ["Show dispatchers the software working, in seconds.", "A live map on the first screen: an order lands, the nearest rider takes it."],
    agency: ["Prove an ad agency can say it all in seven words.", "A billboard that turns through campaigns, and a seven-word brief form."],
    fitness: ["Get first-timers through the door of a bouldering gym.", "Holds that bolt onto the headline, classes by day and a four-step first visit."]
  };
  var panelsBox = $("#panels");
  if (panelsBox) {
    var phoneNow = !mqDesk.matches, A = BASE + "assets/";
    panelsBox.innerHTML = live.map(function (c, i) {
      var sh = shotOf(c), eagerD = i < 2 && !phoneNow, eagerP = i < 2 && phoneNow;
      var pics = sh
        ? '<img class="d" src="' + A + "concepts/" + sh + '-computer.jpg" alt="" width="1440" height="900" decoding="async"' + (eagerD ? "" : ' loading="lazy"') + ">" +
          '<img class="p" src="' + A + "concepts/" + sh + '-phone.jpg" alt="" width="780" height="1688" decoding="async"' + (eagerP ? "" : ' loading="lazy"') + ">"
        : '<span class="pn-blank" style="position:absolute;inset:0;background:' + esc(c.theme || "#1A1A1C") + '"></span>';
      return '<a class="pn" href="' + esc(hrefOf(c)) + '" target="_blank" rel="noopener" data-i="' + i + '">' +
        '<span class="pn-move">' +
          (sh ? '<span class="pn-light" aria-hidden="true"><img src="' + A + "light/concept-" + sh + '-d.jpg" alt=""></span>' : "") +
          '<span class="pn-frame"><span class="pn-pic">' + pics + '</span><span class="pn-dim"></span></span>' +
          (sh ? '<span class="pn-phone" aria-hidden="true"><img src="' + A + "concepts/" + sh + '-phone.jpg" alt="" width="780" height="1688" loading="lazy" decoding="async"><span class="pn-dim"></span></span>' : "") +
          '<span class="pn-cap"><span class="pn-kind">' + esc(c.kind || "") + " concept</span>" +
          '<span class="pn-name"><span>' + esc(c.name || c.slug) + ARROW.replace('class="arrow"', 'class="arrow pn-arr"') + "</span></span>" +
          (CASES[c.slug] ? '<span class="pn-case"><span class="pn-cl"><b>Needed</b> ' + esc(CASES[c.slug][0]) + '</span><span class="pn-cl"><b>The site</b> ' + esc(CASES[c.slug][1]) + "</span></span>" : "") +
          '<span class="pn-open">Open the site' + ARROW + '</span><span class="vh"> (opens in a new tab)</span></span>' +
        "</span></a>";
    }).join("");
    var names = $("#railNames");
    if (names) names.innerHTML = live.map(function (c, i) { return '<span data-go="' + i + '">' + esc(c.name || c.slug) + "</span>"; }).join("");
    var ix = $("#ix");
    if (ix) ix.innerHTML = live.map(function (c) {
      return '<li class="rise"><a href="' + esc(hrefOf(c)) + '" target="_blank" rel="noopener"><span class="ix-name">' + esc(c.name || c.slug) + '</span><span class="ix-kind">' +
        esc(c.kind || "") + '</span><span class="ix-line">' + esc(c.line || "") + '</span><span class="ix-go">' + ARROW + '</span><span class="vh"> (opens in a new tab)</span></a></li>';
    }).join("");
  }

  // ---- words that rise: each word out of its own slot, a longer pause before the last ----
  function splitWords(h) {
    var words = h.textContent.trim().split(/\s+/), n = words.length;
    h.innerHTML = '<span class="vh">' + esc(words.join(" ")) + "</span>" + words.map(function (w, i) {
      var d = i * 110 + (i === n - 1 && n > 2 ? 170 : 0);
      return '<span class="w" aria-hidden="true"><span style="transition-delay:' + d + 'ms">' + esc(w) + "</span></span>";
    }).join(" ");
  }
  $$(".split").forEach(splitWords);

  // ---- flow: content rises once as it arrives, in reading order ----
  // It rises as it crosses the reading line (12% above the bottom). Whatever still waits inside the window once the scroll
  // comes to rest rises too: after a jump, a reload mid-page or a stop just short of the line it would stay blank or half-drawn.
  var flow = $$(".rise, .split.later, .drows, .vow-row"), seen = new Set(), restT = 0, tickAt = 0;
  function rise(batch) {
    batch.forEach(function (el, i) {
      if (el.classList.contains("rise")) el.style.transitionDelay = Math.min(i * 60, 300) + "ms";
      if (el.classList.contains("vow-row")) { // each tick 140 ms after the one above, even across batches
        var now = performance.now(), at = Math.max(now + Math.min(i * 140, 560), tickAt);
        el.style.setProperty("--d", Math.round(at - now) + "ms"); tickAt = at + 140;
      }
      el.classList.add("in");
      riseIO.unobserve(el); viewIO.unobserve(el); seen.delete(el);
    });
  }
  var riseIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    rise(es.filter(function (e) { return e.isIntersecting && !e.target.classList.contains("in"); }).map(function (e) { return e.target; }));
  }, { rootMargin: "0px 0px -12% 0px" }) : null;
  var viewIO = riseIO && new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
  });
  flow.forEach(function (el) { if (riseIO) { riseIO.observe(el); viewIO.observe(el); } else el.classList.add("in"); });
  if (riseIO) addEventListener("scroll", function () {
    clearTimeout(restT);
    restT = setTimeout(function () { rise(flow.filter(function (el) { return seen.has(el) && !el.classList.contains("in"); })); }, 240);
  }, { passive: true });

  // ---- contact: copy the address ----
  $$("[data-copy]").forEach(function (b) {
    var status = $("#copied"), t = 0;
    b.addEventListener("click", function () {
      function done(ok) {
        clearTimeout(t);
        b.textContent = ok ? "Copied" : "Copy address";
        if (status) status.textContent = ok ? "The address is copied." : "Copying did not work here. Select the address above instead.";
        t = setTimeout(function () { b.textContent = "Copy address"; if (status) status.textContent = ""; }, 2600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.email || "").then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  });

  // ---- start: wait for the fonts so the headlines rise in their own letters ----
  var started = false;
  function start() {
    if (started) return; started = true;
    requestAnimationFrame(function () { root.classList.add("ready"); if (window.ScrollTrigger && G) window.ScrollTrigger.refresh(); });
  }

  // =====================================================================================================
  // Motion engine
  // =====================================================================================================
  var G = window.gsap, ST = window.ScrollTrigger, LenisLib = window.Lenis, lenis = null;
  var forced = /[?&]motion=(full|still)/.exec(location.search);
  var weak = root.getAttribute("data-weak") === "1";

  function scrollToY(y, instant) {
    if (lenis) lenis.scrollTo(y, instant ? { immediate: true, force: true } : { duration: 1.1, force: true });
    else window.scrollTo({ top: y, behavior: instant || mqReduce.matches ? "auto" : "smooth" });
  }
  // same-page anchors glide (with Lenis) or scroll natively, and land under the bar
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute("href").slice(1), t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    var y = Math.max(0, pageTop(t) - barH() - 16);
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: mqReduce.matches ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    if (id === "main") t.focus({ preventScroll: true });
  });

  if (!G || !ST) {                                   // the libraries did not load: the still page works on its own
    root.classList.remove("scenes-on"); root.classList.add("still");
    $$(".pn").forEach(function (p) { p.classList.add("on"); });
    $$(".run-steps li").forEach(function (li) { li.classList.add("lit"); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    setTimeout(start, 1600);
    return;
  }
  G.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });
  G.ticker.lagSmoothing(0);

  // Lenis only with a mouse or touchpad, never under Reduce Motion. A gesture that starts with 60 px or more (or a line step) is a mouse wheel.
  if (LenisLib && !weak && !mqReduce.matches && ST.isTouch !== 1 && mqFine.matches && !(forced && forced[1] === "still")) {
    var wheelKind = "pad", lastWheel = -1e9;
    lenis = new LenisLib({
      autoRaf: false, lerp: 0.07, wheelMultiplier: 1, anchors: false, allowNestedScroll: true, stopInertiaOnNavigate: true,
      virtualScroll: function (d) {
        var e = d.event;
        if (!e || e.type !== "wheel") return true;
        var now = e.timeStamp || performance.now();
        if (now - lastWheel > 600) {
          wheelKind = e.deltaMode === 1 || Math.abs(e.deltaY) >= 60 ? "wheel" : "pad";
          lenis.options.lerp = wheelKind === "wheel" ? 0.09 : 0.07;
        }
        lastWheel = now;
        var m = wheelKind === "wheel" ? 2 : 1.2;
        d.deltaX *= m; d.deltaY *= m;
        return true;
      }
    });
    lenis.on("scroll", ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    window.__lenis = lenis;                          // read by the checks
  }

  // ---------------------------------------------------------------------------------------------------
  // work: the row. The stage holds (CSS sticky) and the scroll moves the track right to left, 1 px for 1 px.
  // One pure function of the scroll position, so it is right in both directions at any speed.
  // ---------------------------------------------------------------------------------------------------
  function workScenes(full, desk) {
    var pan = $("#pan");
    if (!pan) return null;
    var stage = $(".pan-stage", pan), track = $("#track"), intro = $(".pan-intro-in", pan), endEl = $(".pan-end", pan);
    var panels = $$(".pn", track), btns = $$("#railNames [data-go]"), fill = $("#railFill"), nowBox = $("#railNow");
    if (!full) { panels.forEach(function (p) { p.classList.add("on"); }); return null; }
    var K = desk ? { settle: 0.1, scale: 0.08, reveal: 0.36, lag: 0.12 } : { settle: 0.07, scale: 0.07, reveal: 0.32, lag: 0.1 };
    var g = { vw: 0, sh: 0, dist: 0, travel: 1, iw: 1, P: [] }, last = {}, cur = -2, st = null;
    function put(el, k, prop, v) { if (el && last[k] !== v) { last[k] = v; el.style[prop] = v; } }
    function measure() {
      g.vw = stage.clientWidth;
      g.sh = stage.offsetHeight;
      g.dist = Math.max(0, track.offsetWidth - g.vw);
      g.travel = g.dist + Math.round(g.vw * (desk ? 0.06 : 0.1));     // a breath after the last item
      pan.style.height = Math.round(g.sh + g.travel) + "px";
      g.iw = intro ? intro.offsetWidth : 1;
      g.P = panels.map(function (el) {
        var fr = $(".pn-frame", el), pic = $(".pn-pic", el);
        return { el: el, move: $(".pn-move", el), pic: pic, dims: $$(".pn-dim", el), ph: $(".pn-phone", el), light: $(".pn-light", el), cap: $(".pn-cap", el),
                 left: el.offsetLeft, w: el.offsetWidth, fw: fr.offsetWidth, hidden: Math.max(0, pic.offsetHeight - fr.offsetHeight), on: el.classList.contains("on") };
      });
      last = {};
    }
    function setCurrent(i) {
      cur = i;
      btns.forEach(function (b, k) { b.classList.toggle("on", k === i); });
      if (!nowBox) return;
      var old = nowBox.querySelector("span:not(.out)");
      if (old) { old.classList.add("out"); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 260); }
      if (i < 0 || !live[i]) return;
      var sp = document.createElement("span");
      sp.className = "wait"; sp.textContent = live[i].name || "";
      nowBox.appendChild(sp);
      requestAnimationFrame(function () { requestAnimationFrame(function () { sp.classList.remove("wait"); }); });
    }
    function render() {
      if (!st) return;
      var x = -Math.min(g.dist, st.progress * g.travel), vw = g.vw, best = -1, bestD = 0.5;
      put(track, "t", "transform", "translate3d(" + x.toFixed(2) + "px,0,0)");
      if (intro) {
        put(intro, "i", "transform", "translate3d(" + (-x * K.lag).toFixed(2) + "px,0,0)");
        put(intro, "io", "opacity", (1 - 0.8 * seg(-x, g.iw * 0.15, g.iw * 0.95)).toFixed(3));
      }
      for (var i = 0; i < g.P.length; i++) {
        var P = g.P[i], u = (P.left + P.w / 2 + x - vw / 2) / vw, a = Math.abs(u);
        if (a > 1.45) continue;                                  // far off the stage: nothing to draw
        var inc = u > 0 ? Math.min(u, 1.2) : 0;                   // panels still coming sit further apart and smaller
        var dx = inc * inc * vw * K.settle, s = 1 - Math.min(a, 1) * K.scale;
        put(P.move, "m" + i, "transform", "translate3d(" + dx.toFixed(2) + "px,0,0) scale(" + s.toFixed(4) + ")");
        var dim = (Math.min(a / 0.85, 1) * 0.42).toFixed(3);
        for (var k = 0; k < P.dims.length; k++) put(P.dims[k], "d" + i + "-" + k, "opacity", dim);
        if (desk) {                                               // the picture lags inside its frame; the phone runs ahead
          put(P.pic, "p" + i, "transform", "translate3d(" + (-u * P.fw * 0.07).toFixed(2) + "px,0,0) scale(1.12)");
          put(P.ph, "q" + i, "transform", "translate3d(" + (u * P.fw * 0.1).toFixed(2) + "px,0,0)");
        } else {                                                  // the page scrolls a little inside its phone frame
          put(P.pic, "p" + i, "transform", "translate3d(0," + (-P.hidden * clamp01((0.3 - u) / 1.1)).toFixed(2) + "px,0)");
        }
        put(P.light, "l" + i, "opacity", (0.46 * (1 - Math.min(a / 0.75, 1))).toFixed(3));
        put(P.cap, "c" + i, "opacity", (1 - 0.78 * seg(a, 0.3, 0.7)).toFixed(3));     // only the panel in focus reads at full strength
        if (!P.on && u < K.reveal) { P.on = true; P.el.classList.add("on"); }
        if (a < bestD) { bestD = a; best = i; }
      }
      put(fill, "f", "transform", "scaleX(" + (g.dist ? -x / g.dist : 0).toFixed(4) + ")");
      if (best !== cur) setCurrent(best);
    }
    function yFor(i) { var P = g.P[i]; return st.start + Math.max(0, Math.min(g.dist, P.left + P.w / 2 - g.vw / 2)); }
    function onFocus(e) {
      var t = e.target, kb = false;
      try { kb = t.matches(":focus-visible"); } catch (err) { kb = true; }
      if (!kb || !st) return;
      var pn = t.closest(".pn");
      if (pn) scrollToY(yFor(panels.indexOf(pn)), true);
      else if (endEl && endEl.contains(t)) scrollToY(st.end, true);
      else if (intro && intro.contains(t)) scrollToY(st.start, true);
    }
    function onRail(e) { var b = e.target.closest("[data-go]"); if (b && st) scrollToY(yFor(+b.getAttribute("data-go")), false); }
    measure();
    ST.addEventListener("refreshInit", measure);
    st = ST.create({
      trigger: pan,
      start: function () { return pageTop(pan) - barH(); },
      end: function () { return pageTop(pan) - barH() + g.travel; },
      invalidateOnRefresh: true, onRefresh: render, onUpdate: render
    });
    render();
    track.addEventListener("focusin", onFocus);
    var railBox = $("#railNames"); if (railBox) railBox.addEventListener("click", onRail);
    window.__pan = { st: st, g: g };                                   // read by the checks
    return function () {
      ST.removeEventListener("refreshInit", measure);
      track.removeEventListener("focusin", onFocus);
      if (railBox) railBox.removeEventListener("click", onRail);
      pan.style.height = ""; track.style.transform = "";
      if (intro) { intro.style.transform = ""; intro.style.opacity = ""; }
      g.P.forEach(function (P) {
        P.move.style.transform = ""; P.pic.style.transform = ""; if (P.ph) P.ph.style.transform = ""; if (P.light) P.light.style.opacity = ""; if (P.cap) P.cap.style.opacity = "";
        P.dims.forEach(function (d) { d.style.opacity = ""; });
      });
      if (fill) fill.style.transform = "";
      if (nowBox) nowBox.innerHTML = "";
      window.__pan = null;
    };
  }

  // ---------------------------------------------------------------------------------------------------
  // services
  // ---------------------------------------------------------------------------------------------------
  function appsAct(act, desk) {
    var stage = $(".apps-stage", act), held = $(".apps-held", act);
    var A = $(".scr-a", held), B = $(".scr-b", held), C = $(".scr-c", held), aDim = $(".a-dim", held), note = $(".lk-note", held);
    var hl = $(".chip-hl", held), chips = $$(".chip", held), btn = $(".a-btn", held), ph = $(".ph", held);
    var cues = $$(".apps-cues .cue", act), dots = $$(".apps-dots i", act), last = {}, idx = -1;
    var EDGES = [0, 0.4, 0.7, 1];
    function put(el, k, prop, v) {
      if (!el || last[k] === v) return;
      last[k] = v;
      if (prop.charAt(0) === "-") el.style.setProperty(prop, v); else el.style[prop] = v;
    }
    function render(self) {
      var p = self.progress;
      var c = seg(p, 0.08, 0.17);                                     // the thickness moves from Thin to Wide
      put(hl, "hl", "transform", "translate3d(" + (100 + c * 100).toFixed(2) + "%,0,0)");
      if (chips[1]) { chips[1].classList.toggle("sel", c < 0.5); chips[2].classList.toggle("sel", c >= 0.5); }
      var press = seg(p, 0.23, 0.26) - seg(p, 0.26, 0.29);             // the order button goes down and up
      put(btn, "b", "transform", "scale(" + (1 - 0.05 * press).toFixed(4) + ")");
      var k = seg(p, 0.33, 0.43);                                     // the next page pushes in, as in the app
      put(B, "B", "transform", "translate3d(" + ((1 - k) * 100).toFixed(2) + "%,0,0)");
      put(B, "Bv", "visibility", k > 0 ? "" : "hidden");               // parked just past the edge it still showed a cream hairline down the red screen
      put(A, "A", "transform", "translate3d(" + (-k * 28).toFixed(2) + "%,0,0)");
      put(aDim, "ad", "opacity", (k * 0.3).toFixed(3));
      var l = seg(p, 0.63, 0.69), n = seg(p, 0.7, 0.78);               // the phone locks, the notification drops in
      put(C, "C", "opacity", l.toFixed(3));
      put(note, "n", "transform", "translate3d(0," + ((1 - n) * -140).toFixed(2) + "%,0) scale(" + (0.96 + 0.04 * n).toFixed(4) + ")");
      put(note, "no", "opacity", Math.min(1, n * 1.6).toFixed(3));
      put(ph, "ph", "transform", "scale(" + (0.95 + 0.05 * p).toFixed(4) + ")");   // one slow push-in under the act
      var i = p < EDGES[1] ? 0 : p < EDGES[2] ? 1 : 2;
      if (i !== idx) {
        idx = i;
        cues.forEach(function (q, j) { q.classList.toggle("on", j === i); });
        dots.forEach(function (d, j) { d.classList.toggle("on", j <= i); });
      }
      if (desk) cues.forEach(function (q, j) { put(q, "f" + j, "--f", seg(p, EDGES[j], EDGES[j + 1]).toFixed(3)); });
    }
    var st = ST.create({
      trigger: act,
      start: function () { return pageTop(act) - barH(); },
      end: function () { return pageTop(act) - barH() + act.offsetHeight - stage.offsetHeight; },
      invalidateOnRefresh: true, onUpdate: render, onRefresh: render
    });
    return function () {
      [hl, btn, A, B, C, aDim, note, ph].forEach(function (el) { if (el) { el.style.transform = ""; el.style.opacity = ""; el.style.visibility = ""; } });
      cues.forEach(function (q) { q.style.removeProperty("--f"); q.classList.remove("on"); });
      st.kill();
    };
  }
  function serviceScenes(full, desk) {
    var offs = [];
    var art = $(".web-art");
    if (art && full) {
      var amp = desk ? 1 : 0.6, clock = { trigger: art, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true };
      G.fromTo(".wa-back", { y: 60 * amp }, { y: -40 * amp, ease: "none", scrollTrigger: clock });
      G.fromTo(".wa-front", { y: 24 * amp }, { y: -24 * amp, ease: "none", scrollTrigger: clock });
      G.fromTo(".wa-phone", { y: 120 * amp }, { y: -110 * amp, ease: "none", scrollTrigger: clock });
      G.fromTo(".web-art .wa-in", { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: clock });
    }
    var act = $(".apps-act");
    if (act && full) offs.push(appsAct(act, desk));
    var win = $(".win");
    if (win && full) G.fromTo(".win-sash", { yPercent: 0 }, { yPercent: -101, ease: "none", scrollTrigger: { trigger: win, start: "top 92%", end: "top 40%", scrub: true, invalidateOnRefresh: true } });
    var flip = $(".drow.flip");
    if (flip) ST.create({ trigger: flip, start: "center 58%", onEnter: function () { flip.classList.add("done"); }, onLeaveBack: function () { flip.classList.remove("done"); } });
    var run = $(".run-wrap");
    if (run) {
      var items = $$("li", run), line = $(".run-line i", run), marks = [];
      if (full) {
        var draw = function (self) {
          var p = self.progress;
          line.style.transform = (desk ? "scaleX(" : "scaleY(") + p.toFixed(4) + ")";
          items.forEach(function (li, k) { li.classList.toggle("lit", p >= marks[k]); });
        };
        ST.create({
          trigger: run, start: "top 74%", end: "bottom 64%", invalidateOnRefresh: true, onUpdate: draw,
          onRefresh: function (self) {
            var L = line.parentNode, len = desk ? L.offsetWidth : L.offsetHeight;
            marks = items.map(function (li) { return len ? clamp01(((desk ? li.offsetLeft : li.offsetTop) - (desk ? L.offsetLeft : L.offsetTop)) / len + 0.015) : 0; });
            draw(self);
          }
        });
        offs.push(function () { line.style.transform = ""; items.forEach(function (li) { li.classList.remove("lit"); }); });
      } else items.forEach(function (li) { li.classList.add("lit"); });
    }
    return function () { offs.forEach(function (f) { if (f) f(); }); };
  }

  // ---- scenes per layout and per motion setting; gsap.matchMedia undoes them when either changes ----
  // gsap.matchMedia calls the function only while at least one condition matches, so phones have their own.
  var mm = G.matchMedia();
  mm.add({ desk: "(min-width: 901px)", phone: "(max-width: 900px)", reduce: "(prefers-reduced-motion: reduce)" }, function (ctx) {
    var c = ctx.conditions;
    var full = forced ? forced[1] === "full" : !weak && !c.reduce;
    root.classList.toggle("scenes-on", full);
    root.classList.toggle("still", !full);
    var off = PAGE === "work" ? workScenes(full, c.desk) : PAGE === "services" ? serviceScenes(full, c.desk) : null;
    return function () { if (off) off(); };
  });

  // positions are measured again on load, after the fonts and after a real resize (a phone's address bar never counts)
  var lastW = innerWidth, lastH = innerHeight, resizeT = 0;
  addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var w = innerWidth, h = innerHeight;
      if (w === lastW && (ST.isTouch === 1 || h === lastH)) return;
      lastW = w; lastH = h;
      ST.refresh();
    }, 300);
  });

  // decode every picture the row will show, one at a time while the browser is idle, so none arrives mid-scroll
  function decodeAhead() {
    if (weak) return;
    var list = $$(".pn img, .wa img, .ph img").filter(function (im) { return getComputedStyle(im).display !== "none" && getComputedStyle(im.parentNode).display !== "none"; });
    var i = 0;
    (function next() {
      if (i >= list.length) return;
      var im = list[i++];
      if (im.loading === "lazy") im.loading = "eager";
      (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { idle(next, 800); });
    })();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 1600);
  addEventListener("load", function () { idle(decodeAhead, 1200); });
})();
