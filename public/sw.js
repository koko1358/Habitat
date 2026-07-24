// Minimal offline cache for the app shell. Habit data itself lives in
// IndexedDB and works offline regardless of this file — this just keeps the
// JS/CSS/icons/pages available so the app can even *open* without a
// connection once it's been visited at least once.
const CACHE_NAME = "taphabit-shell-v1";
const CORE_ROUTES = ["/", "/habits", "/history", "/analytics", "/settings"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ROUTES).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      // Stale-while-revalidate: serve the cache instantly if we have it,
      // refresh it in the background; otherwise wait for the network.
      return cached ?? network;
    })
  );
});
