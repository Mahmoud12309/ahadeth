// ====================================================
// Service Worker — دعم العمل دون اتصال والإشعارات
// ====================================================

const CACHE_NAME = 'hadith-memorizer-v1';

// الملفات الأساسية للتخزين المؤقت
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── التثبيت ─────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // تجاهل الأخطاء في حالة عدم توفر الملفات بعد
      });
    })
  );
  self.skipWaiting();
});

// ─── التفعيل ─────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── الطلبات — Cache First ────────────────────────────

self.addEventListener('fetch', (event) => {
  // تجاهل طلبات غير GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // تخزين الاستجابات الناجحة فقط
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      }).catch(() => {
        // في حالة عدم الاتصال، إرجاع الصفحة الرئيسية
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ─── الإشعارات الواردة ───────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'وقت مراجعة حديث جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    requireInteraction: true,
    tag: data.tag || 'hadith-notification',
    data: { url: '/' },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '📖 حافظ الأحاديث',
      options
    )
  );
});

// ─── النقر على الإشعار ───────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // إذا كان التطبيق مفتوحاً، نركز عليه
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // وإلا نفتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
