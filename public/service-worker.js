/* eslint-disable no-restricted-globals */

// ====== Версии кэшей (обнови номер при релизе) ======
const SW_VERSION    = 'v1.2.0';
const STATIC_CACHE  = `tracker-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `tracker-dynamic-${SW_VERSION}`;
const HTML_CACHE    = `tracker-html-${SW_VERSION}`;

// ====== Предзагрузка статических файлов (не критично, если чего-то нет) ======
const STATIC_FILES = [
  './index.html',
  './manifest.json',
  'icon-192.png',
  'icon-512.png',
];

// ====== Хосты API/изображений, которые кэшируем ======
const API_HOSTS = new Set([
  'anilist.co',
  'myanimelist.net',
  'shikimori.one',
  'api.themoviedb.org',
  'image.tmdb.org',
]);

// ====== Установка SW ======
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.all(
      STATIC_FILES.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'reload' });
          if (res.ok) await cache.put(url, res.clone());
        } catch (_) {
          // тихо пропускаем — файл может отсутствовать в дев-сборке
        }
      })
    );
    // моментально активируем новую версию по запросу клиента
    self.skipWaiting();
  })());
});

// ====== Активация SW ======
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // включаем navigation preload там, где поддерживается
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    // чистим старые кэши
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE, HTML_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );

    // сразу берем контроль над клиентами
    await self.clients.claim();
  })());
});

// ====== Хелперы ======
function isApiOrDataRequest(reqUrl, req) {
  if (reqUrl.pathname.includes('/api/')) return true;
  if (API_HOSTS.has(reqUrl.host)) return true;

  // JSON / текстовые данные от сторонних API
  const accept = req.headers.get('accept') || '';
  return accept.includes('application/json');
}

function isImageRequest(reqUrl, req) {
  if (req.destination === 'image') return true;
  return API_HOSTS.has(reqUrl.host) && /(\.png|\.jpg|\.jpeg|\.webp|\.avif)$/i.test(reqUrl.pathname);
}

async function cachePutSafe(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (_) {
    // например, QuotaExceededError — тихо игнорируем
  }
}

// ====== Обработка запросов ======
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Пропускаем не-GET и chrome-extension
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  const reqUrl = new URL(request.url);

  // 1) Навигации (SPA): network-first с офлайн-фолбэком на index.html
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // navigation preload быстрее обычного fetch, если доступен
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const netRes = await fetch(request);
        if (netRes && netRes.ok) {
          await cachePutSafe(HTML_CACHE, '/index.html', netRes.clone());
        }
        return netRes;
      } catch (_) {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match('/index.html') || await cache.match('index.html');
        if (cached) return cached;
        // последний шанс — любой HTML из HTML_CACHE
        const htmlCache = await caches.open(HTML_CACHE);
        const keys = await htmlCache.keys();
        for (const k of keys) {
          const res = await htmlCache.match(k);
          if (res) return res;
        }
        return new Response('<h1>Оффлайн</h1><p>Нет кэша для оффлайн режима.</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 503,
        });
      }
    })());
    return;
  }

  // 2) API: network-first с fallback к кэшу
  if (isApiOrDataRequest(reqUrl, request)) {
    event.respondWith((async () => {
      try {
        const netRes = await fetch(request);
        // кэшируем только валидные ответы (opaque тоже можно — для картинок ниже)
        if (netRes && (netRes.ok || netRes.type === 'opaque')) {
          await cachePutSafe(DYNAMIC_CACHE, request, netRes.clone());
        }
        return netRes;
      } catch (_) {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true, message: 'Нет сети и нет кэша' }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          status: 504,
        });
      }
    })());
    return;
  }

  // 3) Изображения (включая постеры TMDB/Shikimori): stale-while-revalidate
  if (isImageRequest(reqUrl, request)) {
    event.respondWith((async () => {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(request);

      const fetchPromise = fetch(request)
        .then(async (netRes) => {
          if (netRes && (netRes.ok || netRes.type === 'opaque')) {
            await cachePutSafe(DYNAMIC_CACHE, request, netRes.clone());
          }
          return netRes;
        })
        .catch(() => cached); // если сеть упала — вернём кэш, если он был

      return cached || fetchPromise;
    })());
    return;
  }

  // 4) Скрипты/стили/шрифты того же домена: cache-first
  if (reqUrl.origin === self.location.origin &&
      ['script', 'style', 'font', 'worker'].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;

      const netRes = await fetch(request);
      if (netRes && netRes.ok) {
        await cachePutSafe(STATIC_CACHE, request, netRes.clone());
      }
      return netRes;
    })());
    return;
  }

  // 5) Прочее: network-first с кеш-фолбэком
  event.respondWith((async () => {
    try {
      const netRes = await fetch(request);
      return netRes;
    } catch (_) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      // как крайний случай — ничего
      return new Response('Offline', { status: 504 });
    }
  })());
});

// ====== Сообщения от клиента ======
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Кэшируем данные медиа для офлайн работы
  if (event.data && event.data.type === 'CACHE_MEDIA_DATA') {
    const cache = caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(event.data.data), {
      headers: { 'Content-Type': 'application/json' }
    });
    cache.then(c => c.put('/api/media-data', response));
  }
  
  // Периодическая очистка кэша
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache();
  }
});

// Очистка старого кэша
async function cleanOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
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
