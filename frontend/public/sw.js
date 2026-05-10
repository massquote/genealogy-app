// FamilyKnot Service Worker — handles Web Push notifications.
// Registered from src/main.tsx; lives at the site root so its scope
// covers the whole app.

self.addEventListener('install', (event) => {
  // Activate immediately so updates take effect on next page load.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'FamilyKnot', body: 'You have a new notification', url: '/' };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (_) {
      payload.body = event.data.text();
    }
  }

  // Use a unique tag per push so repeat tests definitely re-trigger
  // a system notification instead of being silently deduped.
  const tag = payload.tag ?? `familyknot-${Date.now()}`;

  const options = {
    body: payload.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: payload.url || '/' },
    tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      // If the app is already open in a window, focus it and navigate.
      for (const client of clientsList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window.
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
