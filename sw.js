/* خدمة بسيطة: تعرض أحدث نسخة من الإنترنت دائمًا، وتعود لنسخة محفوظة إذا انقطع الاتصال.
   لا تتدخل في الطلبات الخارجية (الخطوط، تلجرام، واجهة البوت) حتى لا تتأخر المنتجات الجديدة. */
const CACHE = "hadhram-v1";

self.addEventListener("install", e => { self.skipWaiting(); });

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./") : undefined)))
  );
});

/* إشعارات لوحة التحكم (Web Push بدون محتوى): تظهر رسالة عامة وتفتح اللوحة عند الضغط */
self.addEventListener("push", e => {
  e.waitUntil(self.registration.showNotification("🔔 حضرم شوب — الإدارة", {
    body: "عندك تنبيه جديد (تاجر / إيصال دفع / طلب). افتح لوحة التحكم.",
    icon: "icon-192.png", badge: "icon-192.png", tag: "hs-admin", renotify: true, data: { url: "orders.html" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.includes("orders.html") && "focus" in c) return c.focus(); }
    return clients.openWindow("orders.html");
  }));
});
