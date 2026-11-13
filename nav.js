// The top bar, shared by every page (no library needed). Include it on each page after site.js:
//   <script src="site.js"></script><script src="nav.js"></script>   (from a sub-page: ../site.js, ../nav.js)
// It fills the studio's name into labels, the city and the e-mail links, marks the current page in the nav, and runs
// the phone menu: the nav drops as a sheet under the bar; the button, a tap outside, Esc or any link closes it.
(function () {
  var root = document.documentElement, S = window.STUDIO || {};
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  all("[data-label]").forEach(function (el) { el.setAttribute("aria-label", el.getAttribute("data-label").replace("{name}", S.name || "")); });
  all("[data-city]").forEach(function (el) { if (S.city) el.textContent = S.city; });
  all("[data-mail]").forEach(function (a) { if (S.email) a.href = "mailto:" + S.email + "?subject=" + encodeURIComponent(S.subject || "New project"); });

  // the current page: a nav link whose folder is the one this page lives in
  var here = location.pathname.replace(/index\.html$/, "");
  all(".nav a, .foot-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#") return;
    var path = new URL(href, location.href).pathname.replace(/index\.html$/, "");
    if (path === here && !/^\/?$/.test(href)) a.setAttribute("aria-current", "page");
  });

  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (!btn || !nav) return;
  var phone = matchMedia("(max-width: 900px)");
  function isOpen() { return root.classList.contains("menu-open"); }
  function set(open, focusBack) {
    if (open === isOpen()) return;
    root.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close the menu" : "Open the menu");
    if (window.__lenis) { if (open) window.__lenis.stop(); else window.__lenis.start(); }
    if (open) { var first = nav.querySelector("a"); if (first) first.focus({ preventScroll: true }); }
    else if (focusBack) btn.focus({ preventScroll: true });
  }
  btn.setAttribute("aria-label", "Open the menu");
  btn.addEventListener("click", function () { set(!isOpen(), true); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false, false); });
  document.addEventListener("click", function (e) {
    if (isOpen() && !e.target.closest(".nav") && !e.target.closest(".menu-btn")) set(false, false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) { set(false, true); return; }
    if (e.key === "Tab" && isOpen()) {                      // keep the keyboard inside the open sheet
      var items = [btn].concat(Array.prototype.slice.call(nav.querySelectorAll("a")));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus({ preventScroll: true }); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus({ preventScroll: true }); }
    }
  });
  (phone.addEventListener ? phone.addEventListener.bind(phone, "change") : phone.addListener.bind(phone))(function () { if (!phone.matches) set(false, false); });
})();
