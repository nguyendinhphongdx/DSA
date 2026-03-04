# Request & Response Objects

## 4. Request và Response Objects

### 4.1 Request Object (`req`)

Request object chứa toàn bộ thông tin về HTTP request gửi đến server.

```javascript
app.get('/api/test', (req, res) => {
  // ===== THÔNG TIN REQUEST =====
  console.log(req.method);        // 'GET'
  console.log(req.url);           // '/api/test?page=1'
  console.log(req.originalUrl);   // '/api/test?page=1'
  console.log(req.path);          // '/api/test'
  console.log(req.protocol);      // 'http' hoặc 'https'
  console.log(req.hostname);      // 'localhost'
  console.log(req.ip);            // '::1' hoặc '127.0.0.1'
  console.log(req.baseUrl);       // '' (URL gốc nếu dùng Router)

  // ===== HEADERS =====
  console.log(req.headers);                    // Object chứa tất cả headers
  console.log(req.get('Content-Type'));         // Lấy header cụ thể
  console.log(req.get('Authorization'));        // 'Bearer xxx...'
  console.log(req.headers['user-agent']);       // Thông tin trình duyệt

  // ===== PARAMS, QUERY, BODY =====
  console.log(req.params);        // Route parameters: /users/:id => { id: '123' }
  console.log(req.query);         // Query strings: ?page=1&limit=10 => { page: '1', limit: '10' }
  console.log(req.body);          // Request body (cần middleware parse)

  // ===== COOKIES =====
  console.log(req.cookies);       // Cần cookie-parser middleware
  console.log(req.signedCookies); // Signed cookies

  // ===== KIỂM TRA =====
  console.log(req.is('json'));         // Kiểm tra Content-Type
  console.log(req.accepts('html'));    // Kiểm tra Accept header
  console.log(req.secure);            // true nếu HTTPS
  console.log(req.xhr);               // true nếu XMLHttpRequest (AJAX)
  console.log(req.fresh);             // true nếu response chưa stale
  console.log(req.stale);             // ngược lại fresh

  res.json({ received: true });
});
```

### 4.2 Response Object (`res`)

Response object dùng để gửi HTTP response về client.

```javascript
app.get('/api/demo', (req, res) => {
  // ===== GỬI RESPONSE =====

  // 1. Gửi JSON (phổ biến nhất cho API)
  res.json({ name: 'Phong', age: 25 });

  // 2. Gửi text
  res.send('Hello World');

  // 3. Gửi HTML
  res.send('<h1>Hello World</h1>');

  // 4. Gửi file
  res.sendFile('/absolute/path/to/file.pdf');

  // 5. Download file
  res.download('/path/to/file.pdf', 'custom-name.pdf');

  // 6. Redirect
  res.redirect('/new-url');
  res.redirect(301, '/permanent-new-url');

  // 7. Render template (cần cấu hình template engine)
  res.render('index', { title: 'Trang chủ' });

  // 8. Kết thúc response (không gửi body)
  res.end();
});
```

### Thiết lập Status Code và Headers

```javascript
app.post('/api/users', (req, res) => {
  // ===== STATUS CODE =====
  res.status(201).json({ message: 'Tạo thành công' });
  res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  res.status(404).json({ error: 'Không tìm thấy' });
  res.status(500).json({ error: 'Lỗi server' });

  // ===== HEADERS =====
  res.set('X-Custom-Header', 'my-value');
  res.set({
    'Content-Type': 'application/json',
    'X-Request-Id': '12345',
    'Cache-Control': 'no-cache'
  });

  // Shortcut cho Content-Type
  res.type('json');     // 'application/json'
  res.type('html');     // 'text/html'
  res.type('png');      // 'image/png'

  // ===== COOKIES =====
  res.cookie('token', 'abc123', {
    httpOnly: true,       // Không truy cập được từ JavaScript
    secure: true,         // Chỉ gửi qua HTTPS
    maxAge: 3600000,      // Hết hạn sau 1 giờ (milliseconds)
    sameSite: 'strict'    // Chống CSRF
  });

  res.clearCookie('token'); // Xóa cookie

  // ===== CHAINING =====
  res
    .status(201)
    .set('X-Request-Id', '12345')
    .json({ message: 'Created' });
});
```

### Response methods quan trọng - tổng hợp

| Method | Mô tả | Ví dụ |
|--------|--------|-------|
| `res.json()` | Gửi JSON response | `res.json({ ok: true })` |
| `res.send()` | Gửi response (auto detect type) | `res.send('Hello')` |
| `res.status()` | Set status code | `res.status(404)` |
| `res.redirect()` | Redirect đến URL khác | `res.redirect('/login')` |
| `res.render()` | Render template | `res.render('home', data)` |
| `res.sendFile()` | Gửi file | `res.sendFile(path)` |
| `res.download()` | Prompt download file | `res.download(path)` |
| `res.set()` | Set response header | `res.set('X-Key', 'val')` |
| `res.cookie()` | Set cookie | `res.cookie('k', 'v')` |
| `res.end()` | Kết thúc response | `res.end()` |

---
