var CACHE = "empower-v2";
var FONT_CSS = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap";
var FILES = [
  "./",
  "index.html",
  "trivia.html",
  "give.html",
  "js/give.js",
  "css/style.css",
  "js/app.js",
  "js/trivia.js",
  "questions.js",
  "assets/logo.png",
  "assets/icon-180.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "manifest.webmanifest"
];

function cacheFonts(cache) {
  return fetch(FONT_CSS, { mode: "cors" })
    .then(function (res) {
      if (!res.ok) return;
      return res.clone().text().then(function (css) {
        var urls = css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || [];
        return Promise.all([cache.put(FONT_CSS, res)].concat(urls.map(function (u) {
          return fetch(u, { mode: "cors" }).then(function (r) { if (r.ok) return cache.put(u, r); });
        })));
      });
    })
    .catch(function () {});
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILES).then(function () { return cacheFonts(cache); });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;

  // Fonts never change: cache first.
  if (isFont) {
    event.respondWith(
      caches.open(CACHE).then(function (cache) {
        return cache.match(req).then(function (cached) {
          return cached || fetch(req).then(function (res) {
            if (res.ok || res.type === "opaque") cache.put(req, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // Site files: network first so updates show up right away,
  // falling back to the cache when offline or the Wi-Fi is too slow.
  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      var network = fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      var fallback = function () {
        return cache.match(req, { ignoreSearch: true }).then(function (cached) {
          if (cached) return cached;
          if (req.mode === "navigate") return cache.match("index.html");
          return network;
        });
      };
      var timeout = new Promise(function (resolve) { setTimeout(resolve, 3000); }).then(fallback);
      return Promise.race([network.catch(fallback), timeout]);
    })
  );
});
