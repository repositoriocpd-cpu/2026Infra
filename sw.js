const CACHE_NAME = 'infrasmedu-cache-v11';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/2026_script.js',
  '/config.js',
  '/confirm-modal.js',
  '/pwa-handler.js',
  '/ui-kit.css',
  '/ui-kit.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// List of external CDN assets to cache selectively
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4',
  'https://fonts.googleapis.com',
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Network first - for critical documents and data
  networkFirst: ['/index.html', '/'],
  
  // Cache first - for static assets
  cacheFirst: [
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ],
  
  // Network only - for API calls and sensitive data
  networkOnly: [
    '/api',
    'supabase.co',
  ],
  
  // Stale while revalidate - for images and less critical assets
  staleWhileRevalidate: [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
  ],
};

/**
 * Get cache strategy for request
 */
function getCacheStrategy(url) {
  const urlPath = new URL(url).pathname;
  
  if (CACHE_STRATEGIES.networkFirst.some(pattern => urlPath.includes(pattern))) {
    return 'networkFirst';
  }
  
  if (CACHE_STRATEGIES.networkOnly.some(pattern => url.includes(pattern))) {
    return 'networkOnly';
  }
  
  if (CACHE_STRATEGIES.cacheFirst.some(pattern => url.endsWith(pattern))) {
    return 'cacheFirst';
  }
  
  return 'staleWhileRevalidate';
}

/**
 * Network first strategy - try network, fallback to cache
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache on network error
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Cache first strategy - use cache if available, fallback to network
 */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page or error response
    throw error;
  }
}

/**
 * Stale while revalidate - return cached immediately, update in background
 */
async function staleWhileRevalidateStrategy(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// ============ SERVICE WORKER LIFECYCLE ============

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('[SW] Cache addAll error:', error);
        // Don't fail install if some assets fail
        return Promise.resolve();
      });
    })
  );
  
  // Force new SW to take over immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (!cacheName.startsWith('infrasmedu-cache-')) {
            return caches.delete(cacheName);
          }
          
          // Delete caches from different dates (keep only current date)
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

/**
 * Message event - handle client messages
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({success: true});
    });
  }
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip video/media requests (they use Range headers)
  if (url.match(/\.(mp4|webm|ogg|mov|mp3|wav)$/i)) {
    return;
  }
  
  // Skip blob URLs
  if (url.startsWith('blob:')) {
    return;
  }
  
  // Apply appropriate caching strategy
  const strategy = getCacheStrategy(url);
  
  try {
    switch (strategy) {
      case 'networkFirst':
        event.respondWith(networkFirstStrategy(request));
        break;
      
      case 'cacheFirst':
        event.respondWith(cacheFirstStrategy(request));
        break;
      
      case 'networkOnly':
        event.respondWith(fetch(request));
        break;
      
      case 'staleWhileRevalidate':
      default:
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
  } catch (error) {
      console.error('[SW] Fetch error:', error);
  }
});
