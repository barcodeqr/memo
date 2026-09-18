const CACHE_NAME = 'hyo-memo-v3'; // ← バージョンを v3 などに上げます（更新時はここを変更）
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// インストール時に新しいキャッシュを作成し、即座に待機状態をスキップする
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // 追加: すぐに新しいSWを有効化
  );
});

// リクエストに対してネットワークを優先し、失敗した場合にキャッシュを返す（ネットワークファースト）
// または、キャッシュを返しつつバックグラウンドで更新するなどの方式が有効です
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // ネットワークから最新が取得できた場合は、そのまま返す
        return networkResponse;
      })
      .catch(() => {
        // オフラインなどでネットワーク失敗時にキャッシュを利用
        return caches.match(event.request);
      })
  );
});

// 古いキャッシュの削除（アップデート時）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 追加: すべてのクライアント（タブ）をすぐに新しいSWの制御下に置く
  );
});
