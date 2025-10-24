const CACHE_NAME = 'media-tracker-v1';
const STATIC_CACHE_NAME = 'media-tracker-static-v1';
const DYNAMIC_CACHE_NAME = 'media-tracker-dynamic-v1';

// Файлы для кэширования при установке
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Файлы для кэширования с fallback
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /\/static\//
];

// Файлы для network-first стратегии
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\.json$/
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Кэшируем статические файлы
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Сразу активируем новый SW
      self.skipWaiting()
    ])
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Берем контроль над всеми страницами
      self.clients.claim()
    ])
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем не-GET запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // Пропускаем chrome-extension и другие протоколы
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Основная логика обработки запросов
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Стратегия Cache First для статических ресурсов
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return cacheFirst(request);
  }
  
  // Стратегия Network First для API и JSON
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return networkFirst(request);
  }
  
  // Для HTML страниц - Stale While Revalidate
  if (request.destination === 'document') {
    return staleWhileRevalidate(request);
  }
  
  // По умолчанию - Network First
  return networkFirst(request);
}

// Cache First стратегия
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First стратегия
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback для HTML страниц
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Если сеть недоступна, возвращаем кэшированную версию
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_MEDIA_DATA') {
    // Кэшируем данные медиа для офлайн работы
    const cache = caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(event.data.data), {
      headers: { 'Content-Type': 'application/json' }
    });
    cache.then(c => c.put('/api/media-data', response));
  }
});

// Периодическая очистка кэша
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const requests = await cache.keys();
  
  // Удаляем кэш старше 7 дней
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader && new Date(dateHeader).getTime() < weekAgo) {
        await cache.delete(request);
      }
    }
  }
}
