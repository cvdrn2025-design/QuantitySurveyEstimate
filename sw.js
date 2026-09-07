// ============================================
// QSE PRO - SERVICE WORKER
// Versi: 6.3 - Complete Offline Support
// ============================================

const CACHE_NAME = 'qse-cache-v6.3';
const OFFLINE_URL = '/offline.html';

// ============================================
// ASSET YANG DI-CACHE
// ============================================
const urlsToCache = [
    // HTML
    './',
    'index.html',
    'offline.html',
    
    // CSS
    'css/style.css',
    
    // JavaScript
    'js/utils.js',
    'js/database.js',
    'js/project.js',
    'js/app.js',
    
    // PWA
    'manifest.json',
    'favicon.ico',
    
    // Icons
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/favicon-32x32.png',
    'icons/favicon-16x16.png',
    
    // Fonts (Google Fonts)
    'https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
    
    // Font Awesome
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-brands-400.woff2'
];

// ============================================
// INSTALL SERVICE WORKER
// ============================================
self.addEventListener('install', event => {
    console.log('[SW] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching assets...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Cache complete!');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Cache failed:', error);
            })
    );
});

// ============================================
// ACTIVATE SERVICE WORKER
// ============================================
self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[SW] Claiming clients...');
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH - NETWORK FIRST STRATEGY
// ============================================
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') {
        event.respondWith(fetch(request));
        return;
    }

    // API calls - network only
    if (url.pathname.includes('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // Gambar - cache first with network fallback
    if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                const responseClone = networkResponse.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, responseClone);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // Return placeholder untuk gambar yang gagal
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f4f8"/><text x="100" y="100" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Gambar tidak tersedia</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        });
                })
        );
        return;
    }

    // HTML - network first, fallback to cache, then offline page
    if (request.destination === 'document' || url.pathname.endsWith('/') || url.pathname.match(/\.html$/)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    }
                    throw new Error('Network response was not ok');
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            return caches.match(OFFLINE_URL) || caches.match('index.html');
                        });
                })
        );
        return;
    }

    // CSS & JS - stale-while-revalidate
    if (request.destination === 'style' || request.destination === 'script' || 
        url.pathname.match(/\.(css|js|json)$/)) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    const fetchPromise = fetch(request)
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                const responseClone = networkResponse.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, responseClone);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // Return cached response if fetch fails
                            return cachedResponse;
                        });
                    
                    return cachedResponse || fetchPromise;
                })
        );
        return;
    }

    // Default - cache first with network fallback
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request)
                    .then(networkResponse => {
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return a simple offline response
                        return new Response('Offline - konten tidak tersedia', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// ============================================
// SYNC - BACKGROUND SYNC
// ============================================
self.addEventListener('sync', event => {
    console.log('[SW] Sync event:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Get data from IndexedDB or cache
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.matchAll('/api/sync');
        
        for (const request of requests) {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
            }
        }
        
        console.log('[SW] Sync completed');
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', event => {
    console.log('[SW] Push received');
    
    let data = {
        title: 'QSE Pro',
        body: 'Ada update pada proyek Anda',
        icon: 'icons/icon-192.png'
    };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || 'icons/icon-192.png',
        badge: 'icons/favicon-32x32.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Buka Aplikasi'
            },
            {
                action: 'close',
                title: 'Tutup'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click');
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('[SW] Cache cleared');
                    return caches.open(CACHE_NAME);
                })
                .then(cache => {
                    return cache.addAll(urlsToCache);
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
        );
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    return cache.keys();
                })
                .then(keys => {
                    const totalSize = keys.reduce((acc, req) => acc + req.url.length, 0);
                    event.ports[0].postMessage({ size: totalSize, count: keys.length });
                })
        );
    }
});

// ============================================
// OFFLINE PAGE
// ============================================
const offlineHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Offline - QSE Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #f0f4f8;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
        }
        .offline-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .offline-container .icon {
            font-size: 64px;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        .offline-container h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .offline-container p {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .offline-container .btn {
            display: inline-block;
            padding: 10px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: 0.15s;
        }
        .offline-container .btn:hover {
            background: #1d4ed8;
        }
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; }
            .offline-container { background: #1e293b; color: #e2e8f0; }
            .offline-container p { color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="icon">📡</div>
        <h1>Anda Offline</h1>
        <p>
            Maaf, Anda sedang tidak terhubung ke internet.
            Beberapa fitur mungkin tidak tersedia.
        </p>
        <button class="btn" onclick="location.reload()">
            <i class="fas fa-sync-alt"></i> Coba Lagi
        </button>
        <p style="margin-top:12px; font-size:12px; color:#94a3b8;">
            Data yang sudah dimuat tetap tersedia
        </p>
    </div>
</body>
</html>
`;

// ============================================
// REGISTER OFFLINE PAGE
// ============================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.put(
                    OFFLINE_URL,
                    new Response(offlineHTML, {
                        headers: { 'Content-Type': 'text/html' }
                    })
                );
            })
    );
});

// ============================================
// PERIODIC SYNC (jika didukung)
// ============================================
if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('periodic-sync', {
        minInterval: 24 * 60 * 60 * 1000 // 24 jam
    })
    .then(() => {
        console.log('[SW] Periodic sync registered');
    })
    .catch(error => {
        console.log('[SW] Periodic sync not supported:', error);
    });
}

// ============================================
// CLEANUP OLD CACHES
// ============================================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEANUP_CACHES') {
        const maxCaches = 5;
        event.waitUntil(
            caches.keys()
                .then(keys => {
                    return Promise.all(
                        keys
                            .filter(key => key.startsWith('qse-cache-'))
                            .sort()
                            .reverse()
                            .slice(maxCaches)
                            .map(key => {
                                console.log('[SW] Removing old cache:', key);
                                return caches.delete(key);
                            })
                    );
                })
        );
    }
});

console.log('[SW] Service Worker loaded successfully!');
