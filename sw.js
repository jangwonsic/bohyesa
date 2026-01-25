// 간단한 캐시형 서비스워커 예시 — 경로는 모두 상대경로('./')로 사용합니다.
const CACHE_NAME = 'bohyesa-v1';
const ASSETS = [
  './index.html',
  './index.css',
  './index.tsx',
  './sw.js',
  './manifest.json',
  // 필요하면 여기에 추가 자원(이미지, 오디오 등) 목록을 넣으세요.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // 네트워크 응답을 캐시에 저장 (선택 사항)
        return caches.open(CACHE_NAME).then((cache) => {
          // 캐시 가능한 응답만 저장
          if (event.request.method === 'GET' && res && res.status === 200 && res.type === 'basic') {
            cache.put(event.request, res.clone());
          }
          return res;
        });
      }).catch(() => caches.match('./index.html')); // 오프라인에서 SPA fallback
    })
  );
});
