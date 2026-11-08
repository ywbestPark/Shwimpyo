// 서비스 워커: 오프라인에서도 열리게 하되, 온라인일 때는 항상 최신 파일을 먼저 가져온다(네트워크 우선).
// 이전의 '캐시 우선' 방식은 수정본을 올려도 폰에 옛 화면이 남는 문제가 있었다.
// 파일을 수정해 배포할 때는 CACHE 버전 숫자를 올려 옛 캐시를 정리한다.
const CACHE = "shwimpyo-v6";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  // cache:"reload"는 브라우저 HTTP 캐시를 건너뛰고 서버에서 새로 받아 오라는 뜻
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })            // 1) 최신 파일을 먼저 시도
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request))             // 2) 오프라인이면 저장된 파일 사용
  );
});
