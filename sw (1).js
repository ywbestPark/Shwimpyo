// 서비스 워커: 앱 껍데기를 캐시해 오프라인에서도 열리게 한다.
// 파일을 수정해 다시 배포할 때는 CACHE 버전 숫자를 올려야 옛 캐시가 교체된다.
const CACHE = "shwimpyo-v3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting(); // 새 버전을 기다리지 않고 바로 활성화
});

self.addEventListener("activate", (e) => {
  // 이전 버전 캐시 삭제
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // 캐시 우선, 없으면 네트워크. 이 프로토타입은 서버 통신이 없어서 단순하게 간다.
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
