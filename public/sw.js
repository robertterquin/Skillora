// Skillora service worker: keeps the app and recently opened pages usable offline.
// Progress already saves to localStorage first, so completions made offline sync later.
const CACHE = "skillora-v1";
const APP_SHELL = ["/dashboard", "/library", "/icons/icon-192.png", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isFont = (url) => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname === "/logo.svg";

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackPath) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = (await caches.match(request)) || (fallbackPath && (await caches.match(fallbackPath)));
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (isFont(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Supabase, AI calls and other services always go to the network.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/dashboard"));
  } else {
    event.respondWith(networkFirst(request));
  }
});
