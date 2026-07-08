/* ============================================================
   PIXELCLOUDZ — COOKIE CONSENT
   Lightweight consent gate for analytics/advertising cookies.
   Blocks non-essential script loading until the visitor chooses.
   NOTE: for full IAB TCF / Google-certified CMP compliance ahead
   of live AdSense serving in the EEA/UK, swap this for a certified
   CMP (e.g. a provider from Google's CMP partner list) — this
   custom banner covers the baseline consent-before-cookies
   requirement but is not itself IAB-TCF registered.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "pc_cookie_consent"; // "accepted" | "rejected"

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { }
  }

  function loadDeferredScripts() {
    document.querySelectorAll('script[type="text/plain"][data-consent="non-essential"]').forEach(function (tpl) {
      var s = document.createElement("script");
      if (tpl.src) { s.src = tpl.src; } else { s.text = tpl.text; }
      Array.prototype.forEach.call(tpl.attributes, function (attr) {
        if (attr.name !== "type" && attr.name !== "data-consent") s.setAttribute(attr.name, attr.value);
      });
      tpl.parentNode.replaceChild(s, tpl);
    });
    window.dispatchEvent(new CustomEvent("pc-consent-granted"));
  }

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "pcCookieBanner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "pcCookieTitle");
    wrap.setAttribute("aria-describedby", "pcCookieDescription");

    wrap.innerHTML =
      '<div class="pc-cookie-inner">' +

      '<h4 id="pcCookieTitle">Cookie Preferences</h4>' +

      '<p class="pc-cookie-text" id="pcCookieDescription">' +
      'We use essential cookies to keep PixelCloudz running smoothly and optional analytics and advertising cookies to improve your experience. You can accept or reject non-essential cookies. See our <a href="privacy-policy.html">Privacy Policy</a> for more information.' +
      '</p>' +

      '<div class="pc-cookie-actions">' +

      '<button type="button" class="btn-outline-neon btn-sm" id="pcCookieReject">' +
      'Reject Non-Essential' +
      '</button>' +

      '<button type="button" class="btn-neon btn-sm" id="pcCookieAccept">' +
      'Accept All' +
      '</button>' +

      '</div>' +

      '</div>';

    document.body.appendChild(wrap);

    document.getElementById("pcCookieAccept").addEventListener("click", function () {
      setConsent("accepted");
      hideBanner();
      loadDeferredScripts();
    });

    document.getElementById("pcCookieReject").addEventListener("click", function () {
      setConsent("rejected");
      hideBanner();
    });
  }

  function hideBanner() {
    var el = document.getElementById("pcCookieBanner");
    if (el) { el.classList.add("pc-cookie-hide"); setTimeout(function () { el.remove(); }, 350); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var consent = getConsent();
    if (consent === "accepted") {
      loadDeferredScripts();
      return;
    }
    if (consent === "rejected") {
      return; // respect prior choice, don't load non-essential scripts, don't re-prompt
    }
    buildBanner();
  });
})();
