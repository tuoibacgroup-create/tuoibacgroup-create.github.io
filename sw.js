const CACHE_VERSION = "tuoibac-pwa-v32";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./progression.js",
  "./telemetry.js",
  "./tearoom3d.js",
  "./temple3d.js",
  "./xiangqi.js",
  "./realtime.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./assets/temple-wide.jpg",
  "./assets/temple-altar.jpg",
  "./assets/temple-courtyard.jpg",
  "./assets/ancestral-wide.jpg",
  "./assets/ancestral-altar.jpg",
  "./assets/ancestral-courtyard.jpg",
  "./assets/zengarden-wide.jpg",
  "./assets/zengarden-altar.jpg",
  "./assets/zengarden-courtyard.jpg",
  "./assets/temple-sprites.webp",
  "./assets/tearoom-table-25d.jpg",
  "./assets/tearoom-lobby-25d.jpg",
  "./assets/room-viahe-lobby.jpg",
  "./assets/room-viahe-table.jpg",
  "./assets/room-tho-lobby.jpg",
  "./assets/room-tho-table.jpg",
  "./assets/room-co-lobby.jpg",
  "./assets/room-co-table.jpg",
  "./assets/room-ccb-lobby.jpg",
  "./assets/room-ccb-table.jpg",
  "./assets/room-caycanh-lobby.jpg",
  "./assets/room-caycanh-table.jpg",
  "./assets/tearoom-sprites.webp",
  "./assets/tearoom-items.webp",
  "./assets/tearoom-items-extra.webp",
  "./assets/tearoom-viahe-item.webp",
  "./assets/tearoom-accessories.webp",
  "./assets/tearoom-accessories-extra.webp",
  "./assets/tearoom-regional-acc.webp",
  "./assets/audio/chao-buoi-sang.mp3",
  "./assets/audio/diem-danh-xong.mp3",
  "./assets/audio/chao-ban-tra.mp3",
  "./assets/audio/dan-chanh-dien.mp3",
  "./assets/audio/dan-nha-tho-ho.mp3",
  "./assets/audio/dan-vuon-thien.mp3",
  "./assets/audio/dan-co-tuong.mp3",
  "./assets/audio/dan-o-an-quan.mp3",
  "./assets/audio/nhac-nghi-mat.mp3",
  "./assets/audio/que-01.mp3",
  "./assets/audio/que-02.mp3",
  "./assets/audio/que-03.mp3",
  "./assets/audio/que-04.mp3",
  "./assets/audio/que-05.mp3",
  "./assets/audio/que-06.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => { })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_VERSION) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never intercept WebSocket, TTS audio streams, or live RSS / Supabase API calls
  if (
    url.hostname.includes("googleapis.com") && url.pathname.includes("translate_tts") ||
    url.hostname.includes("rss2json.com") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("emqx.io") ||
    url.hostname.includes("hivemq.com")
  ) {
    return;
  }

  // Network-first for same-origin HTML/CSS/JS so updates appear right away when online
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone)).catch(() => { });
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // Stale-while-revalidate for CDN libraries & Google Fonts
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone)).catch(() => { });
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});
