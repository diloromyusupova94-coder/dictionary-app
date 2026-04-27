const CACHE_NAME = 'lugat-v1';
const assets = [
  '/',
  '/index.html',
  '/app.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
