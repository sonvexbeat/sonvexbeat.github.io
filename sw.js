self.addEventListener('install', (e) => {
  console.log('Sonvex Service Worker Installed');
});

self.addEventListener('fetch', (e) => {
  // ده بيخلي التطبيق يفتح حتى لو النت ضعيف
  e.respondWith(fetch(e.request));
});
