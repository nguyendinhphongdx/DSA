# 10 - Web APIs

## 1. Fetch API

```js
// GET
const res = await fetch('/api/users');
const data = await res.json();

// POST
const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Phong' }),
});

// Với AbortController (cancel request)
const controller = new AbortController();
const res = await fetch('/api/data', { signal: controller.signal });
controller.abort(); // Cancel request

// Timeout
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}
```

## 2. Web Workers

```js
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ type: 'calculate', data: [1, 2, 3] });
worker.onmessage = (e) => console.log('Result:', e.data);
worker.terminate();

// worker.js
self.onmessage = (e) => {
  const result = heavyCalculation(e.data);
  self.postMessage(result);
};
```

## 3. Intersection Observer

```js
// Lazy loading, infinite scroll, animations on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Ngừng theo dõi
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate').forEach(el => observer.observe(el));
```

## 4. WebSocket

```js
const ws = new WebSocket('wss://example.com/socket');

ws.onopen = () => ws.send(JSON.stringify({ type: 'hello' }));
ws.onmessage = (event) => console.log(JSON.parse(event.data));
ws.onerror = (error) => console.error('WebSocket error:', error);
ws.onclose = () => console.log('Disconnected');
```

## 5. Canvas

```js
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Hình chữ nhật
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 50);
ctx.strokeRect(10, 10, 100, 50);

// Đường thẳng
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

// Hình tròn
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();

// Text
ctx.font = '20px Arial';
ctx.fillText('Hello Canvas', 50, 50);
```

## 6. Geolocation

```js
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log(pos.coords.latitude, pos.coords.longitude);
  },
  (err) => console.error(err),
  { enableHighAccuracy: true }
);

// Watch position
const watchId = navigator.geolocation.watchPosition(callback);
navigator.geolocation.clearWatch(watchId);
```

## 7. Service Workers (PWA)

```js
// Đăng ký
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then(cache => cache.addAll(['/index.html', '/app.js']))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
```
