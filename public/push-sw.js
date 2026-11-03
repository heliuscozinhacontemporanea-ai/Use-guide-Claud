/*
 * Push do Use Guide (D25), carregado pelo service worker do PWA (workbox `importScripts`).
 * O FCM entrega o JSON com `notification` e `fcmOptions.link`; o toque abre o app na tela do aviso.
 * Referência: https://firebase.google.com/docs/cloud-messaging/js/receive
 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    return;
  }
  const notification = payload.notification || {};
  const link = (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.link) || '/';
  if (!notification.title) return;
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body || '',
      icon: notification.icon || '/pwa-192x192.png',
      badge: notification.badge || '/favicon-32x32.png',
      tag: notification.tag,
      data: { link },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.link) || '/', self.location.origin);
  // Só abre páginas do próprio app (nunca um link externo vindo do payload).
  const url = target.origin === self.location.origin ? target.href : self.location.origin;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(url).then((page) => (page || client).focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
