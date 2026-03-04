# BOM (Browser Object Model)

## BOM là gì?

BOM là tập hợp các APIs cho phép JavaScript tương tác với **browser** (không phải nội dung trang). BOM bao gồm: `window`, `location`, `navigator`, `history`, `screen`.

---

## 1. window

`window` là **global object** trong browser. Tất cả biến global, hàm global, và Web APIs đều là property của `window`.

```js
// Kích thước viewport
window.innerWidth;   // Chiều rộng viewport (không bao gồm scrollbar)
window.innerHeight;  // Chiều cao viewport

// Kích thước cửa sổ browser
window.outerWidth;   // Bao gồm toolbar, scrollbar
window.outerHeight;

// Scroll
window.scrollX;      // Số pixel đã scroll ngang
window.scrollY;      // Số pixel đã scroll dọc
window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu

// Mở cửa sổ mới
const popup = window.open('https://example.com', '_blank', 'width=600,height=400');
popup.close();
```

## 2. location

Thông tin và điều khiển **URL hiện tại**.

```js
// URL: https://example.com:8080/path/page?name=Phong&age=25#section1

location.href;       // Full URL
location.protocol;   // 'https:'
location.host;       // 'example.com:8080'
location.hostname;   // 'example.com'
location.port;       // '8080'
location.pathname;   // '/path/page'
location.search;     // '?name=Phong&age=25'
location.hash;       // '#section1'

// Parse query string
const params = new URLSearchParams(location.search);
params.get('name');   // 'Phong'
params.get('age');    // '25'
params.has('name');   // true

// Navigation
location.href = '/new-page';          // Navigate (thêm vào history)
location.replace('/new-page');         // Navigate (KHÔNG thêm vào history)
location.reload();                     // Reload trang
```

## 3. history

Điều khiển **lịch sử duyệt web** (back/forward/pushState).

```js
history.back();       // Quay lại trang trước
history.forward();    // Đi tới trang sau
history.go(-2);       // Quay lại 2 trang

// Thay đổi URL mà KHÔNG reload trang (SPA routing)
history.pushState({ page: 'about' }, '', '/about');
history.replaceState({ page: 'home' }, '', '/');

// Lắng nghe khi user nhấn back/forward
window.addEventListener('popstate', (event) => {
  console.log('State:', event.state);
  // Render trang tương ứng
});
```

## 4. navigator

Thông tin về **browser và thiết bị**.

```js
navigator.userAgent;     // User agent string
navigator.language;      // 'vi' hoặc 'en-US'
navigator.languages;     // ['vi', 'en-US', 'en']
navigator.onLine;        // true/false — có mạng không?
navigator.cookieEnabled; // Cookies được bật?
navigator.platform;      // 'MacIntel', 'Win32', 'Linux x86_64'

// Online/offline detection
window.addEventListener('online', () => console.log('Back online!'));
window.addEventListener('offline', () => console.log('Lost connection'));

// Clipboard
await navigator.clipboard.writeText('Copied!');
const text = await navigator.clipboard.readText();

// Geolocation
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err),
);
```
