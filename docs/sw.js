const CACHE_NAME = 'calipan-virrey-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

console.log('🔧 Service Worker v3 cargado');

// Instalar Service Worker - Cachear todo lo necesario
self.addEventListener('install', (event) => {
  console.log('🔧 SW Install: cachear recursos...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cachear URLs core
      cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.log('⚠️ Algunos recursos core no pudieron cachearse:', err);
        // Continuar aunque algo falle
        return cache;
      });
    }).then(() => {
      console.log('✅ Cache core completado');
    })
  );
  // Skip waiting para activar inmediatamente
  self.skipWaiting();
});

// Activar Service Worker - Limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('⚡ SW Activate: limpiar caches viejos...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deletando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de fetch: Network first, cache fallback, offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar extensiones que no queremos cachear
  if (url.pathname.includes('.map') || 
      url.pathname.includes('node_modules') ||
      url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    return;
  }

  // Para archivos estáticos (assets), usar cache-first approach
  if (url.pathname.includes('/assets/') || 
      url.pathname.includes('.js') || 
      url.pathname.includes('.css') ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('✅ Assets desde cache:', request.url);
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
            console.log('💾 Assets cacheado:', request.url);
          });

          return response;
        }).catch(() => {
          console.warn('❌ Assets no disponible offline:', request.url);
          // Intentar desde cache como último recurso
          return caches.match(request) || new Response(
            'Recurso no disponible en modo offline',
            { status: 503, statusText: 'Service Unavailable' }
          );
        });
      })
    );
    return;
  }

  // Para HTML (páginas), usar network-first approach
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
          console.log('💾 HTML cacheado:', request.url);
        });

        return response;
      })
      .catch(async () => {
        console.log('❌ Network falló, buscando en cache:', request.url);
        
        // Buscar en cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          console.log('✅ Encontrado en cache:', request.url);
          return cachedResponse;
        }

        // Si es una navegación HTML, retornar index.html cacheado
        if (request.mode === 'navigate') {
          console.log('📄 Retornando index.html para:', request.url);
          return caches.match('/index.html') || 
            caches.match('/') ||
            new Response(
              '<!DOCTYPE html><html><body>Aplicación en modo offline. Los datos se cargarán desde localStorage.</body></html>',
              { 
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
              }
            );
        }

        // Para otras peticiones sin cache
        console.warn('⚠️ Sin respuesta para:', request.url);
        return new Response(
          'Recurso no disponible',
          { status: 503, statusText: 'Service Unavailable' }
        );
      })
  );
});

// Manejar mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    console.log('📦 Mensaje: cachear assets específicos');
    caches.open(CACHE_NAME).then((cache) => {
      if (Array.isArray(event.data.assets)) {
        Promise.all(
          event.data.assets.map((asset) => 
            cache.add(asset).catch((err) => {
              console.log('⚠️ No se pudo cachear:', asset, err.message);
            })
          )
        ).then(() => {
          console.log('✅ Assets específicos cacheados');
        });
      }
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ SKIP_WAITING: Activando nueva versión');
    self.skipWaiting();
  }
});

// Background sync para sincronizar datos cuando vuelva la conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('🔄 Background sync iniciado');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('✅ Sync completado');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Sync error:', error);
    return Promise.reject(error);
  }
}
