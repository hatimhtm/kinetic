// The home page: headline words, the work strip, and the scroll scenes. The bar and its phone menu are nav.js.
(function () {
  var root = document.documentElement, S = window.STUDIO || {}, CONCEPTS = window.CONCEPTS || [];
  var mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = matchMedia("(hover: hover) and (pointer: fine)");
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function idle(fn, wait) { return (window.requestIdleCallback || function (f) { return setTimeout(f, 50); })(fn, { timeout: wait || 1500 }); }
  function barH() { return parseFloat(getComputedStyle(root).getPropertyValue("--bar")) || 72; }

  // ---- headline words: each rises out of a slot, with its own delay (a pause before the word that pays off) ----
  function split(h, delays) {
    var words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map(function (w, i) {
      var d = delays ? delays[Math.min(i, delays.length - 1)] : i * 90;
      return '<span class="w"><span style="transition-delay:' + d + 'ms">' + esc(w) + "</span></span>";
    }).join(" ");
  }
  split($(".hh-l1"), [120, 230, 340, 450]);
  split($(".hh-l2"), [620, 730, 990]);
  $$("[data-split]").forEach(function (h) { if (!h.classList.contains("hh-l")) split(h, null); });

  // ---- the work strip, from the concept list in site.js (Long Pull first: the site the scene above just built) ----
  var ORDER = ["noodle", "settle", "realty", "fitness", "skincare", "saas", "agency", "architect"];
  var shown = ORDER.map(function (slug) { return CONCEPTS.filter(function (c) { return c.slug === slug; })[0]; }).filter(Boolean);
  function href(c) { return (S.conceptsBase || "concepts/") + c.slug + "/index.html"; }
  $("#wkCards").innerHTML = shown.map(function (c, i) {
    return '<article class="wk-card" data-i="' + i + '"><a class="wk-shot" href="' + href(c) + '" tabindex="-1" aria-hidden="true">' +
      '<span class="wk-comp"><img src="assets/concepts/' + c.slug + '-computer.jpg" alt="" width="1440" height="900" loading="lazy" decoding="async"></span>' +
      '<span class="wk-ph"><img src="assets/concepts/' + c.slug + '-phone.jpg" alt="" width="780" height="1688" loading="lazy" decoding="async"></span></a>' +
      '<h3><a href="' + href(c) + '">' + esc(c.name) + "</a></h3><p>" + esc(c.kind) + ", concept site</p></article>";
  }).join("");
  $("#wkRoom").innerHTML = shown.map(function (c) { return '<img src="assets/light/concept-' + c.slug + '-d.jpg" alt="">'; }).join("");
  var roomImgs = $$("#wkRoom img");
  if (roomImgs[0]) roomImgs[0].classList.add("on");

  // ---- the bar we build to: the award-winning sites in site.js, all made by OTHER studios. Each card names its studio and
  // opens the real site in a new tab. A wall of screens: columns per layout, the light of each screen in a layer behind ----
  var MENU = window.MENU || [];
  var AW_ORDER = ["shopify-editions", "theobroma", "justin-jefferson", "lajoya", "grail", "agrumea-farm", "esr-bespoke", "oryzo",
    "endurosat", "illoca", "g-colombel", "polpharma", "arthur-engel", "heron-ai", "brandon-yasin", "belgrade-arbor"];
  var awSites = AW_ORDER.map(function (slug) { return MENU.filter(function (s) { return s.slug === slug; })[0]; }).filter(Boolean)
    .concat(MENU.filter(function (s) { return AW_ORDER.indexOf(s.slug) < 0; }));
  function host(u) { return String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, ""); }
  var awIn = $("#awIn"), awRoom = $("#awRoom");
  var awCards = awSites.map(function (s) {
    var el = document.createElement("article"), u = esc(s.url), R = "assets/refs/" + s.slug;
    el.className = "aw-card";
    el.innerHTML = '<a class="aw-shot" href="' + u + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><span class="aw-win">' +
      '<span class="aw-bar"><i></i><i></i><i></i><span class="aw-url">' + esc(host(s.url)) + "</span></span>" +
      '<span class="aw-scr"><picture><source media="(max-width: 900px)" srcset="' + R + '-phone.jpg" width="585" height="1266">' +
      '<img src="' + R + '-desktop.jpg" alt="" width="960" height="600" loading="lazy" decoding="async"></picture><span class="aw-dim"></span></span></span></a>' +
      '<h3 class="aw-name"><a href="' + u + '" target="_blank" rel="noopener">' + esc(s.name) +
      '<svg class="aw-out" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"/></svg>' +
      '<span class="vh"> (opens the real site in a new tab)</span></a></h3>' +
      '<p class="aw-by">Made by ' + esc(s.maker) + '</p><p class="aw-prize">' + esc(s.award) + ", " + esc(s.date) + "</p>";
    return el;
  });
  var awGlows = awSites.map(function (s) {
    var g = new Image();
    g.className = "aw-glow"; g.alt = ""; g.decoding = "async"; g.src = "assets/light/" + s.slug + "-glow.webp";
    return g;
  });
  // the layouts: cards per column, where each column starts (in card heights, for the reading order: the first sites in
  // AW_ORDER land where the eye starts) and how far it glides (a share of the window's height, both ways, at most 96 px:
  // every column at its own rate, none against the page, so a column never climbs into the words above it)
  var AW_LAYOUTS = [
    { name: "d4", q: "(min-width: 1181px)", n: [3, 3, 5, 5], at: [1.45, 1.8, 0, .33], amp: [0, .095, .04, .07] },
    { name: "d3", q: "(min-width: 901px)", n: [5, 5, 6], at: [1.45, 1.8, 0], amp: [0, .095, .045] },
    { name: "t3", q: "(min-width: 600px)", n: [6, 5, 5], at: [0, .5, .25], amp: [0, .085, .04] },
    { name: "p2", q: "all", n: [8, 8], at: [0, .45], amp: [0, .1] }
  ];
  AW_LAYOUTS.forEach(function (L) { L.mq = matchMedia(L.q); });
  var awLayout = null, awCols = [], awGcols = [], awSync = null;   // awSync: set by the scroll scene while it runs
  function awPlace() {                                 // each glow sits behind its screen, its column's box in the room
    awCols.forEach(function (col, c) {
      var g = awGcols[c], cards = $$(".aw-card", col);
      g.style.left = col.offsetLeft + "px"; g.style.top = col.offsetTop + "px"; g.style.width = col.offsetWidth + "px"; g.style.height = col.offsetHeight + "px";
      cards.forEach(function (card, k) {
        var shot = card.firstChild, h = shot.offsetHeight;
        g.children[k].style.top = (card.offsetTop + shot.offsetTop - h * .4) + "px";
        g.children[k].style.height = (h * 1.8) + "px";
      });
    });
    if (awSync) awSync();
  }
  function awBuild() {
    var L = AW_LAYOUTS.filter(function (l) { return l.mq.matches; })[0];
    if (!awIn || L === awLayout) return;
    awLayout = L;
    var slots = [];
    L.n.forEach(function (n, c) { for (var k = 0; k < n; k++) slots.push({ c: c, k: k, y: L.at[c] + k }); });
    slots.sort(function (a, b) { return a.y - b.y || a.c - b.c; });
    var per = L.n.map(function () { return []; });
    slots.forEach(function (s, i) { per[s.c][s.k] = i; });
    awCols.forEach(function (el) { el.remove(); }); awGcols.forEach(function (el) { el.remove(); });
    awCols = []; awGcols = [];
    awIn.setAttribute("data-layout", L.name);
    // the columns join the page in the order of their first card, so the keyboard meets them as the eye does
    L.n.map(function (n, c) { return c; }).sort(function (a, b) { return L.at[a] - L.at[b] || a - b; }).forEach(function (c) {
      var col = document.createElement("div"), g = document.createElement("div");
      col.className = "aw-col"; col.setAttribute("data-col", c); g.className = "aw-gcol";
      per[c].forEach(function (i) { col.appendChild(awCards[i]); g.appendChild(awGlows[i]); });
      awIn.appendChild(col); awRoom.appendChild(g);
      awCols[c] = col; awGcols[c] = g;
      if (window.ResizeObserver) awRO.observe(col);
    });
    awPlace();
  }
  var awRO = window.ResizeObserver ? new ResizeObserver(function () { awPlace(); }) : null;
  if (awIn && MENU.length) {
    awBuild();
    if (awRO) awRO.observe(awIn); else addEventListener("resize", awPlace);
    AW_LAYOUTS.forEach(function (L) { if (L.mq.addEventListener) L.mq.addEventListener("change", awBuild); });
    if (mqFine.matches) awCards.forEach(function (card, i) {   // pointing at a screen turns its light up (and wakes it)
      card.addEventListener("pointerenter", function () { card.classList.add("on"); awGlows[i].classList.add("on", "hot"); });
      card.addEventListener("pointerleave", function () { awGlows[i].classList.remove("hot"); });
    });
  }

  // pictures a scene will show are fetched and decoded before it arrives, one at a time while the browser is idle
  function warm(list) {
    var i = 0;
    (function next() {
      if (i >= list.length) return;
      var im = list[i++];
      if (im.loading === "lazy") im.loading = "eager";
      (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { idle(next, 600); });
    })();
  }
  if ("IntersectionObserver" in window) {
    var warmIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        warmIO.unobserve(e.target);
        warm($$("img", e.target));
      });
    }, { rootMargin: "150% 0px 150% 0px" });
    [$("#make"), $("#process"), $("#awards"), $("#work")].forEach(function (el) { if (el) warmIO.observe(el); });
  }

  // ---- flow: blocks rise once as they arrive, in reading order; split headings rise word by word ----
  // whatever still waits inside the window once the scroll comes to rest rises too (after a jump, a reload mid-page or a stop
  // just short of the reading line it would stay blank)
  var seen = new Set(), restT = 0;
  function rise(batch) {
    batch.forEach(function (el, i) {
      if (el.classList.contains("rise")) el.style.transitionDelay = (i * 70) + "ms";
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
  var flow = $$("[data-rise], [data-split]").filter(function (el) { return !el.classList.contains("hh-l"); });
  flow.forEach(function (el) {
    if (!riseIO) { if (el.hasAttribute("data-split")) el.classList.add("in"); return; }
    if (el.hasAttribute("data-rise")) el.classList.add("rise");
    riseIO.observe(el); viewIO.observe(el);
  });
  if (riseIO) addEventListener("scroll", function () {
    clearTimeout(restT);
    restT = setTimeout(function () { rise(flow.filter(function (el) { return seen.has(el) && !el.classList.contains("in"); })); }, 240);
  }, { passive: true });

  // =====================================================================================================
  // Motion engine. One smoothing layer: Lenis with a mouse or touchpad, native scroll on touch screens.
  // Every scroll animation is tied straight to the scroll position (scrub: true); positions are linear or land on a
  // curve inside their own short window, and only transforms and opacity move.
  // =====================================================================================================
  var G = window.gsap, ST = window.ScrollTrigger, LenisLib = window.Lenis;
  var forced = /[?&]motion=(full|still)/.exec(location.search);
  var weak = root.getAttribute("data-weak") === "1";
  var full = false, lenis = null, procST = null;

  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.3 });
    else window.scrollTo({ top: y, behavior: mqReduce.matches ? "auto" : "smooth" });
  }
  // in-page links: Lenis glides to them; without it the browser scrolls (scroll-padding keeps them under the bar)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute("href").slice(1), t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -barH(), duration: 1.3 });
    else t.scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
  });

  function startIntro() {
    var started = false;
    function go() {
      if (started) return; started = true;
      requestAnimationFrame(function () { root.classList.add("ready"); $$(".hh-l").forEach(function (l) { l.classList.add("in"); }); if (ST) ST.refresh(); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1600);
  }

  if (!G || !ST) {                                   // the libraries did not load: the still page, which works on its own
    root.classList.remove("scenes-on"); root.classList.add("still");
    startIntro();
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
    window.__lenis = lenis;                          // read by the checks and by nav.js
  }

  // ---------- 1. first screen: the lines part to the left and the right, the screens drift apart at their own rates ----------
  function heroScene(phone) {
    var hero = $(".hm-hero"), H = function () { return hero.offsetHeight; }, Wd = function () { return innerWidth; };
    var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: 0, end: function () { return hero.offsetTop + hero.offsetHeight - barH(); }, scrub: true, invalidateOnRefresh: true } });
    tl.to($(".hh-l1"), { x: function () { return -(phone ? .18 : .11) * Wd(); } }, 0)
      .to($(".hh-l2"), { x: function () { return (phone ? .18 : .11) * Wd(); } }, 0)
      .fromTo($$(".hh-l"), { opacity: 1 }, { opacity: 0, ease: "power2.in", duration: .9 }, 0)
      .fromTo($(".hh-foot"), { opacity: 1, y: 0 }, { opacity: 0, y: -24, ease: "power1.in", duration: .5 }, 0);
    if (phone) {
      tl.to($(".hh-left"), { x: function () { return -.24 * Wd(); }, y: function () { return .04 * H(); } }, 0)
        .to($(".hh-far"), { x: function () { return .24 * Wd(); }, y: function () { return .1 * H(); }, scale: 1.05 }, 0)
        .to($(".hh-right"), { y: function () { return -.08 * H(); }, scale: 1.06 }, 0);
    } else {
      tl.to($(".hh-far"), { y: function () { return .24 * H(); }, scale: 1.08 }, 0)
        .to($(".hh-left"), { x: function () { return -.09 * Wd(); }, y: function () { return .1 * H(); } }, 0)
        .to($(".hh-right"), { x: function () { return .07 * Wd(); }, y: function () { return -.06 * H(); } }, 0);
    }
  }
  // the screens lean toward the pointer, nearer ones more (computers only)
  function heroLean() {
    var hero = $(".hm-hero");
    var leans = [[".hh-far .hh-lean", 10], [".hh-left .hh-lean", 18], [".hh-right .hh-lean", 26]].map(function (p) {
      var el = $(p[0]);
      return { x: G.quickTo(el, "x", { duration: 1, ease: "power3" }), y: G.quickTo(el, "y", { duration: 1, ease: "power3" }), d: p[1], el: el };
    });
    function move(e) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      leans.forEach(function (l) { l.x(nx * l.d * 2); l.y(ny * l.d); });
    }
    function out() { leans.forEach(function (l) { l.x(0); l.y(0); }); }
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", out);
    return function () { hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", out); G.set(leans.map(function (l) { return l.el; }), { x: 0, y: 0 }); };
  }

  // ---------- 2. what we make: each demo comes in from its own side and plays its own motion ----------
  function makeScenes(phone) {
    $$(".mk-row").forEach(function (row) {
      var side = row.getAttribute("data-side") === "left" ? -1 : 1, demo = $(".mk-demo", row);
      G.timeline({ scrollTrigger: { trigger: row, start: "top 100%", end: phone ? "top 30%" : "top 40%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(demo, { x: function () { return side * innerWidth * (phone ? .22 : .12); } }, { x: 0, ease: "none", duration: 1 }, 0)
        .fromTo(demo, { opacity: 0 }, { opacity: 1, ease: "power1.out", duration: .6 }, 0);
    });
    // a website: its page scrolls inside the window
    var page = $(".mk-page"), view = $(".mk-site .mk-view");
    G.fromTo(page, { yPercent: 0 }, { yPercent: function () { return -(1 - view.clientHeight / (page.clientHeight || 1)) * 100; }, ease: "none",
      scrollTrigger: { trigger: $(".mk-site"), start: phone ? "top 55%" : "top 70%", end: phone ? "bottom 15%" : "bottom 25%", scrub: true, invalidateOnRefresh: true } });
    // an app: tap a class, the detail pushes in, book it, the sheet rises
    var ap = $(".ap"), s1 = $(".ap-s1"), s2 = $(".ap-s2"), sheet = $(".ap-sheet");
    var d1 = $(".ap-d1") || s1.insertAdjacentHTML("afterend", '<span class="ap-dimmer ap-d1"></span>') || $(".ap-d1");
    var d2 = $(".ap-d2") || s2.insertAdjacentHTML("afterend", '<span class="ap-dimmer ap-d2"></span>') || $(".ap-d2");
    G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: $(".mk-app"), start: phone ? "top 45%" : "top 65%", end: phone ? "bottom 25%" : "bottom 35%", scrub: true, invalidateOnRefresh: true } })
      .to({}, { duration: 1 }, 0)
      .fromTo($(".ap-pick"), { scale: 1 }, { scale: .965, duration: .05, ease: "power2.out" }, .14)
      .to($(".ap-pick"), { scale: 1, duration: .06, ease: "power2.out" }, .19)
      // x: 0 beside each percent: GSAP reads the CSS translateX(100%) of s2 (and the sheet's translateY) as pixels and
      // keeps them, so without it s2 stayed off screen and the push never showed
      .fromTo(s2, { x: 0, xPercent: 100 }, { x: 0, xPercent: 0, duration: .2, ease: "power2.inOut" }, .22)
      .fromTo(s1, { xPercent: 0 }, { xPercent: -28, duration: .2, ease: "power2.inOut" }, .22)
      .fromTo(d1, { opacity: 0 }, { opacity: .45, duration: .2, ease: "power2.inOut" }, .22)
      .fromTo($(".ap-s2 .ap-btn"), { scale: 1 }, { scale: .96, duration: .05, ease: "power2.out" }, .52)
      .to($(".ap-s2 .ap-btn"), { scale: 1, duration: .06, ease: "power2.out" }, .57)
      .fromTo(sheet, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: .2, ease: "power3.out" }, .6)
      .fromTo(d2, { opacity: 0 }, { opacity: .4, duration: .2, ease: "power2.out" }, .6)
      .fromTo($(".ap-check"), { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .1, ease: "back.out(2.2)" }, .7);
    // a web app: the chart fills in, then the invoices turn paid one by one
    var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: $(".mk-web"), start: phone ? "top 50%" : "top 65%", end: phone ? "bottom 25%" : "bottom 35%", scrub: true, invalidateOnRefresh: true } });
    tl.to({}, { duration: 1 }, 0)
      .fromTo($$(".sd-bars i"), { scaleY: .04 }, { scaleY: 1, duration: .16, stagger: .02, ease: "power2.out" }, .04);
    $$(".mk-web .sd-tr:not(.sd-th)").forEach(function (r, i) {
      var at = .3 + i * .12;
      tl.fromTo($(".s-sent", r), { opacity: 1 }, { opacity: 0, duration: .04 }, at)
        .fromTo($(".s-paid", r), { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .06, ease: "back.out(2)" }, at + .02);
    });
  }

  // ---------- 4. the peak: the work happens on one held stage ----------
  var STEPS = [[0, .2], [.2, .42], [.42, .66], [.66, .82], [.82, 1]];
  var LAND = [.135, .385, .63, .79, .985];           // where each step has fully played (the rail jumps there)
  var railLis = $$(".pr-rail li"), current = -1;
  function railState(p) {
    var k = 0;
    for (var i = 0; i < STEPS.length; i++) if (p >= STEPS[i][0]) k = i;
    if (k === current) return;
    current = k;
    railLis.forEach(function (li, i) { li.classList.toggle("on", i === k); li.classList.toggle("done", i < k); });
  }
  $$(".pr-rail button").forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (!procST) return;
      scrollToY(procST.start + LAND[i] * (procST.end - procST.start));
    });
  });

  function processScene(phone) {
    var act = $("#prAct"), stage = $("#prStage");
    var sw = function () { return stage.clientWidth; };
    var off = function (f) { return function () { return f * sw(); }; };
    var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: {
      trigger: act, start: function () { return "top " + barH() + "px"; }, end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
      onUpdate: function (self) { railState(self.progress); }, onRefresh: function (self) { railState(self.progress); } } });
    procST = tl.scrollTrigger;
    tl.to({}, { duration: 1 }, 0);

    // the copy: one step at a time, each rising in as the last one rises away; the rail fills under each step
    var steps = $$(".pr-step"), fills = $$(".pr-rf");
    steps.forEach(function (st, k) {
      var a = STEPS[k][0], b = STEPS[k][1];
      if (k > 0) tl.fromTo(st, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .03, ease: "power2.out" }, a);
      if (k < steps.length - 1) tl.fromTo(st, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -26, duration: .025, ease: "power2.in", immediateRender: false }, b - .02);
      tl.fromTo(fills[k], { scaleX: 0 }, { scaleX: 1, duration: b - a }, a);
    });

    // we talk: messages come in from both sides, then fold into the brief (computer) or leave by their sides (phone)
    var bubbles = $$(".pr-b"), brief = $(".pr-brief");
    bubbles.forEach(function (b, i) {
      var s = b.classList.contains("pr-us") ? 1 : -1;
      tl.fromTo(b, { autoAlpha: 0, x: s * (phone ? 80 : 130), y: 16 }, { autoAlpha: 1, x: 0, y: 0, duration: .035, ease: "power2.out" }, .012 + i * .03);
      if (phone) tl.to(b, { x: function () { return s * sw() * .9; }, autoAlpha: 0, duration: .04, ease: "power2.in" }, .158 + i * .008);
      else tl.to(b, { x: function () { return -sw() * .27; }, y: -60 + i * 10, scale: .42, autoAlpha: 0, duration: .045, ease: "power2.in" }, .15 + i * .008);
    });
    if (!phone) tl.fromTo(brief, { autoAlpha: 0, x: -50, scale: .92 }, { autoAlpha: 1, x: 0, scale: 1, duration: .035, ease: "power2.out" }, .178);

    // we design: the device draws its own edges, its body and screen come up, the wireframe draws in,
    // colour samples arrive from the left and a type sample from the right
    var e = function (s) { return $(".pr-main .pe-" + s); };
    tl.fromTo(e("t"), { scaleX: 0 }, { scaleX: 1, duration: .03 }, .205)
      .fromTo(e("r"), { scaleY: 0 }, { scaleY: 1, duration: .03 }, .225)
      .fromTo(e("b"), { scaleX: 0 }, { scaleX: 1, duration: .03 }, .245)
      .fromTo(e("l"), { scaleY: 0 }, { scaleY: 1, duration: .03 }, .265)
      .fromTo($(".pr-bg"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .04, ease: "power1.inOut" }, .272)
      .fromTo($(".pr-clip"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .04, ease: "power1.inOut" }, .272)
      .fromTo($(".pr-chrome"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .03 }, .285)
      .fromTo($(".pr-island"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .03 }, .285)
      .fromTo($(".st-draft"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .02 }, .3)
      .to($$(".pr-main .pe"), { autoAlpha: 0, duration: .05 }, .52);
    $$(".wf").forEach(function (w, i) {
      var arch = w.classList.contains("wf-arch");
      tl.fromTo(w, arch ? { scaleY: 0 } : { scaleX: 0 }, arch ? { scaleY: 1, duration: .05, ease: "power1.out" } : { scaleX: 1, duration: .03, ease: "power1.out" }, .3 + i * .009);
    });
    if (!phone) tl.fromTo($(".pr-side"), { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: .05, ease: "power2.out" }, .31)
      .fromTo($(".pr-sview img"), { yPercent: 102 }, { yPercent: 0, duration: .06, ease: "power2.out" }, .585);
    var sws = $$(".sw"), red = $(".sw-chili"), typeS = $(".pr-type");
    sws.forEach(function (s, i) {
      tl.fromTo(s, { autoAlpha: 0, x: phone ? -50 : -90, scale: .6 }, { autoAlpha: 1, x: 0, scale: 1, duration: .03, ease: "power3.out" }, .315 + i * .012);
    });
    tl.fromTo(typeS, { autoAlpha: 0, x: phone ? 50 : 90 }, { autoAlpha: 1, x: 0, duration: .035, ease: "power3.out" }, .34);

    // we build: the red sample flies into the page and the red ground wipes across; the pieces fly in from both sides
    tl.to(red, { x: function () { return phone ? sw() * .2 : sw() * .14; }, y: phone ? -40 : -110, scale: .35, autoAlpha: 0, duration: .03, ease: "power2.in" }, .422)
      .fromTo($(".lp-ground"), { xPercent: -101 }, { xPercent: 0, duration: .05, ease: "power2.inOut" }, .44)
      .to(sws.filter(function (s) { return s !== red; }), { autoAlpha: 0, x: -30, duration: .03, stagger: .006 }, .43)
      .to(typeS, { x: function () { return -(phone ? sw() * .3 : sw() * .2); }, scale: .6, autoAlpha: 0, duration: .03, ease: "power2.in" }, .462)
      .to($$(".wf"), { autoAlpha: 0, duration: .04, stagger: .005 }, .49);
    var F = phone ? .9 : .5;
    tl.fromTo($(".lp-nav"), { x: off(-F), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .045, ease: "power2.out" }, .468);
    $$(".lp-h").forEach(function (h, i) {
      tl.fromTo(h, { x: off(-F * 1.1), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .05, ease: "power2.out" }, .486 + i * .014);
    });
    tl.fromTo($(".lp-arch"), { x: off(F), autoAlpha: 0, scale: .92 }, { x: 0, autoAlpha: 1, scale: 1, duration: .055, ease: "power2.out" }, .5)
      .fromTo($(".lp-p"), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .03, ease: "power2.out" }, .548)
      .fromTo($(".lp-btns"), { x: off(F * .9), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .04, ease: "power2.out" }, .56)
      .fromTo($(".lp-chip"), { x: off(-F * .8), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .035, ease: "power2.out" }, .585);

    // we launch: Draft turns Live, the props leave, the devices push in and their light spills into the room
    if (!phone) tl.to(brief, { autoAlpha: 0, x: -40, duration: .03, ease: "power2.in" }, .662);
    tl.to($(".st-draft"), { autoAlpha: 0, duration: .015 }, .69)
      .fromTo($(".st-live"), { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: .02, ease: "power2.out" }, .695)
      .fromTo($(".pr-glow"), { autoAlpha: 0 }, { autoAlpha: .55, duration: .07, ease: "power1.inOut" }, .7)
      .fromTo($(".pr-devs"), { scale: 1 }, { scale: phone ? 1.03 : 1.05, duration: .34 }, .66);
    if (!phone) tl.fromTo($(".pr-sglow"), { autoAlpha: 0 }, { autoAlpha: .35, duration: .07, ease: "power1.inOut" }, .71);

    // we keep improving: updates land, and the site changes with each one
    var ups = $$(".pr-u");
    ups.forEach(function (c, i) {
      var at = .835 + i * .05;
      tl.fromTo(c, { autoAlpha: 0, x: phone ? off(.9) : 90 }, { autoAlpha: 1, x: 0, duration: .03, ease: "power2.out" }, at);
      if (phone && i < ups.length - 1) tl.to(c, { autoAlpha: 0, x: off(-.6), duration: .028, ease: "power2.in" }, at + .046);
    });
    tl.fromTo($(".lp-lang"), { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: .02, ease: "power2.out" }, .855)
      .fromTo($(".lp-ready"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .02, ease: "power2.out" }, .905)
      .fromTo($(".lp-ph2"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .03, ease: "power1.inOut" }, .955);
  }

  // ---------- before our work: the bar we build to. The columns glide at their own rates (a share of the window's height
  // each, both ways, laid out as designed when the section's middle crosses the window's) with the light behind them, and
  // each screen powers on once as it arrives: when its top crosses 78 % of the window, or when the scroll comes to rest with
  // it in view. One trigger for the whole wall; the cards' places are read once per layout, never during the scroll ----------
  function awardsScene() {
    var sec = $("#awards");
    if (!sec || !awCards.length) return null;
    var items = [], amps = [], last = [], vh = innerHeight, dpr = 1, restT = 0, clearT = 0, prog = 0, st = null;
    function docTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
    function measure() {
      vh = innerHeight; dpr = window.devicePixelRatio || 1;
      amps = awLayout ? awLayout.amp.map(function (a) { return Math.min(a * vh, 96); }) : [];
      items = []; last = [];
      awCols.forEach(function (col, c) {
        $$(".aw-card", col).forEach(function (card) { items.push({ card: card, glow: awGlows[awCards.indexOf(card)], c: c, top: docTop(card) }); });
      });
      items.sort(function (a, b) { return a.top - b.top || a.c - b.c; });   // reading order, for the stagger
    }
    function power(batch) {
      if (!batch.length) return;
      batch.forEach(function (it, i) {
        var d = Math.min(i, 6) * 70 + "ms";
        it.card.style.setProperty("--d", d); it.glow.style.setProperty("--d", d);
        it.card.classList.add("on"); it.glow.classList.add("on");
      });
      clearTimeout(clearT);
      clearT = setTimeout(function () { items.forEach(function (it) { it.card.style.removeProperty("--d"); it.glow.style.removeProperty("--d"); }); }, 2200);
    }
    function shiftOf(c) { return Math.round((amps[c] || 0) * (1 - 2 * prog) * dpr) / dpr; }
    function waiting(edge) {
      var y = window.scrollY, out = [];
      items.forEach(function (it) { if (!it.card.classList.contains("on") && it.top + shiftOf(it.c) - y < edge) out.push(it); });
      return out;
    }
    function apply() {
      awCols.forEach(function (col, c) {
        var v = shiftOf(c);
        if (v === last[c]) return;
        last[c] = v;
        col.style.transform = awGcols[c].style.transform = "translate3d(0," + v + "px,0)";
      });
      power(waiting(vh * .78));
      clearTimeout(restT);
      restT = setTimeout(function () { power(waiting(vh)); }, 240);
    }
    // (the trigger can call back while it is being made, so the callbacks read their own instance)
    st = ST.create({ trigger: sec, start: "top bottom", end: "bottom top",
      onUpdate: function (self) { prog = self.progress; apply(); },
      onRefresh: function (self) { prog = self.progress; measure(); apply(); } });
    awSync = function () { prog = st.progress; measure(); apply(); };
    awSync();
    return function () {
      awSync = null; clearTimeout(restT); clearTimeout(clearT);
      awCols.concat(awGcols).forEach(function (el) { el.style.transform = ""; });
    };
  }

  // ---------- 5. our work: the row travels sideways while the page scrolls down ----------
  function workScene(phone) {
    var act = $("#wkAct"), stage = $(".wk-stage"), track = $("#wkTrack"), cards = $$(".wk-card"), SPEED = phone ? 1.1 : 1.25;
    var shots = cards.map(function (c) { return $(".wk-shot", c); }), phs = cards.map(function (c) { return $(".wk-ph", c); });
    var setX = phs.map(function (p) { return G.quickSetter(p, "x", "px"); });
    var setS = shots.map(function (s) { return G.quickSetter(s, "scale"); });
    var centres = [], dist = 0, lit = 0;
    function measure() { dist = Math.max(0, track.scrollWidth - stage.clientWidth); centres = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; }); }
    function size() { measure(); act.style.height = "calc(100svh - var(--bar) + " + Math.round(dist / SPEED) + "px)"; }
    function inner(p) {
      var tx = -p * dist, W = innerWidth, best = 0, bestD = 1e9;
      for (var i = 0; i < centres.length; i++) {
        var d = (tx + centres[i] - W / 2) / W, a = Math.abs(d);
        if (phone) setS[i](1 - Math.min(a, 1) * .08); else setX[i](-d * 80);
        if (a < bestD) { bestD = a; best = i; }
      }
      if (best !== lit) { roomImgs[lit] && roomImgs[lit].classList.remove("on"); lit = best; roomImgs[lit] && roomImgs[lit].classList.add("on"); }
    }
    ST.addEventListener("refreshInit", size);
    size();
    G.fromTo(track, { x: 0 }, { x: function () { return -dist; }, ease: "none", scrollTrigger: {
      trigger: act, start: function () { return "top " + barH() + "px"; }, end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
      onUpdate: function (self) { inner(self.progress); }, onRefresh: function (self) { measure(); inner(self.progress); } } });
    return function () {
      ST.removeEventListener("refreshInit", size);
      act.style.height = "";
      G.set(phs.concat(shots), { clearProps: "transform" });
    };
  }

  // ---------- 6. who builds it: each line of the name comes in from its own side while a light passes over it, and
  // the promises tick in one by one at the reading line ----------
  function whoScene(phone) {
    $$(".wh-l").forEach(function (l, i) {
      var s = i ? 1 : -1;
      G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: l, start: "top 94%", end: phone ? "top 48%" : "top 60%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(l, { x: function () { return s * innerWidth * (phone ? .14 : .09); } }, { x: 0, duration: .75, ease: "power2.out" }, 0)
        .fromTo($(".wh-lit", l), { xPercent: -101 }, { xPercent: 0, duration: .78 }, .22)
        .fromTo($(".wh-lit > span", l), { xPercent: 101 }, { xPercent: 0, duration: .78 }, .22)
        .fromTo($(".wh-beam", l), { autoAlpha: .75 }, { autoAlpha: 0, duration: .12, immediateRender: false }, .88);
    });
    $$(".wh-p").forEach(function (li) {
      G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: li, start: "top 96%", end: "top 66%", scrub: true, invalidateOnRefresh: true } })
        .fromTo($(".wh-rule", li), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .fromTo($(".wh-ck", li), { scale: .5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .3, ease: "back.out(2)" }, .08)
        .fromTo($(".wh-ck path", li), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .32, ease: "power2.out" }, .34)
        .fromTo($(".wh-t", li), { autoAlpha: 0, x: phone ? 28 : 44 }, { autoAlpha: 1, x: 0, duration: .5, ease: "power2.out" }, .14);
    });
  }

  // ---- the live proof in the last call: this page's own load time, read from the visitor's browser and rounded ----
  (function proof() {
    var box = $("#proof"), P = window.performance;
    if (!box || !P || !P.getEntriesByType) return;
    function after(fn) { if (document.readyState === "complete") setTimeout(fn, 0); else addEventListener("load", function () { setTimeout(fn, 0); }, { once: true }); }
    after(function () {
      var nav = P.getEntriesByType("navigation")[0], load = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd : 0;
      var paint = P.getEntriesByType("paint").filter(function (e) { return e.name === "first-contentful-paint"; })[0];
      var fcp = paint ? Math.min(paint.startTime, load) : 0;
      if (!load) return;                                   // no reading, no claim: the row stays hidden
      var rows = [[$(".ep-load", box), load], [$(".ep-fcp", box), fcp]];
      if (!fcp) { rows[1][0].remove(); rows.pop(); }
      var tenth = function (ms) { return Math.round(ms / 100) / 10; };
      var say = function (ms) { return ms < 50 ? "under 0.1" : tenth(ms).toFixed(1); };
      $("[data-say]", box).textContent = "This page loaded in " + say(load) + " seconds on your device" + (fcp ? ", and its first screen appeared in " + say(fcp) + " seconds." : ".");
      function draw(k) {
        rows.forEach(function (r) {
          $("[data-v]", r[0]).textContent = k < 1 ? (tenth(r[1]) * k).toFixed(1) : say(r[1]);
          $(".ep-rail i", r[0]).style.setProperty("--f", (r[1] / load * k).toFixed(4));
        });
      }
      draw(0);
      box.hidden = false;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        if (G && root.classList.contains("scenes-on")) {
          var o = { k: 0 };
          G.to(o, { k: 1, duration: 1.4, ease: "power3.out", onUpdate: function () { draw(o.k); }, onComplete: function () { draw(1); box.classList.add("done"); } });
        } else { draw(1); box.classList.add("done"); }
      }, { threshold: .6 }) : null;
      if (io) io.observe(box); else { draw(1); box.classList.add("done"); }
    });
  })();

  // ---------- 7. the last call: a soft light rises from the floor ----------
  function endScene() {
    G.fromTo($(".en-glow"), { opacity: 0 }, { opacity: 1, ease: "power1.inOut", scrollTrigger: { trigger: $(".hm-end"), start: "top 90%", end: "bottom bottom", scrub: true } });
  }

  // ---- scenes per layout and per motion setting; gsap.matchMedia undoes them when either changes ----
  // gsap.matchMedia calls the function only while at least one condition matches, so the phone layout has its own
  // condition: with only desk and reduce, a phone without Reduce Motion matched neither and got no scenes.
  var mm = G.matchMedia();
  mm.add({ desk: "(min-width: 901px)", phone: "(max-width: 900px)", reduce: "(prefers-reduced-motion: reduce)" }, function (ctx) {
    var c = ctx.conditions, phone = !c.desk, undo = [];
    full = forced ? forced[1] === "full" : !weak && !c.reduce;
    root.classList.toggle("scenes-on", full);
    root.classList.toggle("still", !full);
    procST = null;
    if (full) {
      heroScene(phone);
      if (!phone && mqFine.matches) undo.push(heroLean());
      makeScenes(phone);
      processScene(phone);
      undo.push(awardsScene());
      undo.push(workScene(phone));
      whoScene(phone);
      endScene();
    } else {
      railLis.forEach(function (li) { li.classList.remove("on", "done"); });
      current = -1;
    }
    return function () { undo.forEach(function (f) { f && f(); }); procST = null; current = -1; };
  });

  // positions are measured again on load, after the fonts, and after a real resize (300 ms after it ends; a phone's
  // address bar never counts)
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
  startIntro();
})();
