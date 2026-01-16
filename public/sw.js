const CACHE_NAME = 'hyper-ai-news-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response('<h1>Offline</h1><p>Please check your internet connection.</p>', {
                        headers: { 'Content-Type': 'text/html' }
                    });
                })
        );
    }
});
