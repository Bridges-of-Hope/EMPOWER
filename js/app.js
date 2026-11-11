(function () {
  var IDLE_MS = 60 * 1000;
  var isHome = document.body.classList.contains("is-home");
  var timer;

  function goHome() {
    if (isHome) {
      window.scrollTo(0, 0);
      return;
    }
    window.location.href = "index.html";
  }

  function resetIdle() {
    clearTimeout(timer);
    timer = setTimeout(goHome, IDLE_MS);
  }

  ["pointerdown", "touchstart", "keydown", "wheel"].forEach(function (evt) {
    window.addEventListener(evt, resetIdle, { passive: true, capture: true });
  });
  resetIdle();

  // Kiosk: no long-press menus or pinch zoom.
  window.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

  // A page restored from the back/forward cache should start fresh.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && !isHome) window.location.reload();
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  window.EMPOWER = {
    shuffle: function (list) {
      var a = list.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };
})();
