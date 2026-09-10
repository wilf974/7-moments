/**
 * Service worker de 7 Rendez-vous : l'application s'ouvre même quand
 * le serveur est injoignable. Les moments sont de toute façon enregistrés
 * sur l'appareil et partent au serveur au retour de la connexion.
 *
 * - /_next/static/* : fichiers immuables (nom haché) → cache d'abord.
 * - pages et le reste : réseau d'abord ; si le réseau échoue ou traîne
 *   plus de 4 s, on sert la dernière version gardée en cache.
 * - /api/* : jamais mis en cache.
 */
const VERSION = 'v1';
const STATIC_CACHE = `7rdv-static-${VERSION}`;
const PAGES_CACHE = `7rdv-pages-${VERSION}`;
const PAGES = ['/', '/calendar'];
const NETWORK_TIMEOUT_MS = 4000;
const MAX_PAGE_ENTRIES = 60;
const MAX_STATIC_ENTRIES = 200;

/** Supprime les entrées les plus anciennes au-delà de `max`, sans jamais toucher aux pages de base. */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = (await cache.keys()).filter((req) => {
    const url = new URL(req.url);
    return !(PAGES.includes(url.pathname) && url.search === '');
  });
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/** Met les pages en cache, ainsi que les fichiers /_next/static qu'elles référencent. */
async function precache() {
  const pages = await caches.open(PAGES_CACHE);
  const statics = await caches.open(STATIC_CACHE);
  for (const page of PAGES) {
    const res = await fetch(page, { cache: 'no-store' });
    if (!res.ok || res.redirected) continue;
    const html = await res.clone().text();
    await pages.put(page, res);
    const assets = new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || []);
    await Promise.all(
      [...assets].map((url) =>
        statics.match(url).then((hit) => hit || statics.add(url).catch(() => undefined)),
      ),
    );
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().catch(() => undefined).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('7rdv-') && key !== STATIC_CACHE && key !== PAGES_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) {
    cache.put(request, res.clone()).then(() => trim(STATIC_CACHE, MAX_STATIC_ENTRIES)).catch(() => undefined);
  }
  return res;
}

async function fallbackFor(cache, request) {
  const exact = await cache.match(request, { ignoreVary: true });
  if (exact) return exact;
  if (request.mode !== 'navigate') return undefined;
  const { pathname } = new URL(request.url);
  return (await cache.match(pathname, { ignoreVary: true })) || cache.match('/', { ignoreVary: true });
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  const network = fetch(request).then((res) => {
    if (res.ok && res.type === 'basic' && !res.redirected) {
      cache.put(request, res.clone()).then(() => trim(PAGES_CACHE, MAX_PAGE_ENTRIES)).catch(() => undefined);
    }
    return res;
  });
  network.catch(() => undefined);

  const cached = await fallbackFor(cache, request);
  if (!cached) return network;

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  try {
    const winner = await Promise.race([network, timeout]);
    // Réseau trop lent, ou serveur en panne (502/503 de nginx quand l'app est arrêtée) : copie en cache.
    return winner && winner.status < 500 ? winner : cached;
  } catch {
    return cached;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});
