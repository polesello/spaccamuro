self.addEventListener('install', e => {
    console.log('Installo il Service Worker...');
    e.waitUntil(caches.open('muro_cache').then(
        cache => {
            return cache.addAll([
                '/',
                '/index.html',
            ]).then(() => self.skipWaiting());
        }))
});
self.addEventListener('activate', event => {
    console.log('Attivo il Service Worker...');
    event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(
        response => {
            return response || fetch(event.request);
        }));
});