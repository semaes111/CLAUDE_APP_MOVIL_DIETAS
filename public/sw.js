/**
 * NutriMed Service Worker
 * Proporciona funcionalidad offline completa para la aplicación móvil
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `nutrimed-${CACHE_VERSION}`;
const STATIC_CACHE = `nutrimed-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nutrimed-dynamic-${CACHE_VERSION}`;
const API_CACHE = `nutrimed-api-${CACHE_VERSION}`;

// Recursos estáticos que siempre deben estar en caché
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Patrones de URLs a cachear dinámicamente
const CACHEABLE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.ico$/,
  /\.webp$/
];

// APIs que deben cachearse para uso offline
const API_PATTERNS = [
  /api\.base44\.com/,
  /\/api\//
];

// Duración máxima del caché de API (en milisegundos)
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Evento de instalación: pre-cachear recursos estáticos
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Error en instalación:', error);
      })
  );
});

/**
 * Evento de activación: limpiar cachés antiguos
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activando...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Eliminar cachés de versiones anteriores
              return name.startsWith('nutrimed-') &&
                     !name.includes(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[ServiceWorker] Eliminando caché antiguo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activación completada');
        return self.clients.claim();
      })
  );
});

/**
 * Determina si una URL debe cachearse
 */
function shouldCache(url) {
  return CACHEABLE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Determina si es una petición de API
 */
function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Estrategia Stale-While-Revalidate para recursos dinámicos
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || networkResponsePromise;
}

/**
 * Estrategia Network-First para APIs con fallback a caché
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Guardar en caché con timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cache-timestamp', Date.now().toString());

      const cachedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      await cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Red no disponible, usando caché para:', request.url);

    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Verificar si el caché no ha expirado
      const cachedTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      if (cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < API_CACHE_DURATION) {
          return cachedResponse;
        }
      }
      // Devolver caché incluso si expiró (mejor que nada offline)
      return cachedResponse;
    }

    // No hay caché disponible
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        offline: true,
        message: 'No hay datos en caché disponibles. Por favor, conecta a internet.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Estrategia Cache-First para recursos estáticos
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Error fetching:', request.url);
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

/**
 * Manejador principal de fetch
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones de extensiones del navegador
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Manejar peticiones de API
  if (isApiRequest(url.href)) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Manejar navegación (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Manejar recursos estáticos cacheables
  if (shouldCache(url.pathname)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Para todo lo demás, intentar red primero
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

/**
 * Manejar mensajes del cliente
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('nutrimed-'))
            .map((name) => caches.delete(name))
        );
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    caches.keys().then((cacheNames) => {
      const nutrimedCaches = cacheNames.filter(name => name.startsWith('nutrimed-'));
      event.ports[0].postMessage({
        caches: nutrimedCaches,
        version: CACHE_VERSION
      });
    });
  }
});

/**
 * Sincronización en segundo plano (para cuando vuelva la conexión)
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Evento de sincronización:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

/**
 * Sincronizar datos pendientes cuando hay conexión
 */
async function syncPendingData() {
  // Esta función será llamada por el cliente cuando haya datos pendientes
  // de sincronizar. Se puede implementar para enviar cambios locales al servidor.
  console.log('[ServiceWorker] Sincronizando datos pendientes...');

  // Notificar a todos los clientes que la sincronización está lista
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      timestamp: Date.now()
    });
  });
}

/**
 * Manejar notificaciones push
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Notificación push recibida');

  let notificationData = {
    title: 'NutriMed',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'nutrimed-notification'
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data || {},
      vibrate: [200, 100, 200]
    })
  );
});

/**
 * Manejar clic en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Clic en notificación');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        return self.clients.openWindow(urlToOpen);
      })
  );
});

console.log('[ServiceWorker] Script cargado');
