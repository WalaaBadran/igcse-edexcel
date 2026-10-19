// Offline support: pages come from the network when online (so they are always up to date) and from the
// saved copy when offline. Other files (scripts, pictures) are served from the saved copy and refreshed in the background.
const CACHE = 'site-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.add('./')).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\.(mp4|webm)$/.test(url.pathname)) return;  // videos stream from the site, never stored on the phone
  if (req.mode === 'navigate') {
    if (url.pathname !== '/' && url.pathname !== '/index.html') return;  // only the app page is the offline copy (not PDFs or other pages)
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return res; })
      .catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});
