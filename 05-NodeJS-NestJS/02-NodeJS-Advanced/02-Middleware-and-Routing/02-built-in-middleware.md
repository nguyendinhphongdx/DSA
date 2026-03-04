# Built-in Middleware

## 4. Built-in Middleware

Express 4.x có 3 built-in middleware chính:

### 4.1 express.json()

Parse request body có Content-Type `application/json`.

```javascript
// Cơ bản
app.use(express.json());

// Với options
app.use(express.json({
  limit: '10mb',          // Giới hạn body size (mặc định 100kb)
  strict: true,            // Chỉ chấp nhận arrays và objects (mặc định true)
  type: 'application/json', // Content-Type để parse (mặc định 'application/json')
  reviver: null,            // Hàm reviver cho JSON.parse()
  verify: (req, res, buf, encoding) => {
    // Custom verification (VD: verify webhook signature)
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}));

// Ví dụ sử dụng
app.post('/api/users', (req, res) => {
  // req.body đã được parse từ JSON
  console.log(req.body); // { name: 'Phong', email: 'phong@gmail.com' }
  res.json(req.body);
});
```

### 4.2 express.urlencoded()

Parse request body có Content-Type `application/x-www-form-urlencoded` (HTML form submissions).

```javascript
app.use(express.urlencoded({
  extended: true,     // true: dùng qs library (hỗ trợ nested objects)
                       // false: dùng querystring library (đơn giản hơn)
  limit: '10mb',      // Giới hạn body size
  parameterLimit: 1000 // Giới hạn số lượng parameters
}));

// Ví dụ: HTML form submit
// <form method="POST" action="/login">
//   <input name="username" value="phong">
//   <input name="password" value="123456">
// </form>

app.post('/login', (req, res) => {
  console.log(req.body); // { username: 'phong', password: '123456' }
  res.json(req.body);
});

// extended: true cho phép nested objects
// name[first]=Phong&name[last]=Nguyen
// => { name: { first: 'Phong', last: 'Nguyen' } }

// extended: false chỉ hỗ trợ flat key-value
// name[first]=Phong&name[last]=Nguyen
// => { 'name[first]': 'Phong', 'name[last]': 'Nguyen' }
```

### 4.3 express.static()

Phục vụ static files (HTML, CSS, JS, images, ...).

```javascript
const path = require('path');

// Cơ bản
app.use(express.static('public'));

// Với virtual path prefix
app.use('/static', express.static(path.join(__dirname, 'public')));

// Với options chi tiết
app.use(express.static('public', {
  dotfiles: 'ignore',          // 'allow', 'deny', 'ignore'
  etag: true,                   // Bật ETag
  extensions: ['html', 'htm'], // Fallback extensions
  fallthrough: true,            // Để next() handle nếu file không tìm thấy
  immutable: false,             // Bật immutable directive trong Cache-Control
  index: 'index.html',         // File index mặc định
  lastModified: true,           // Set Last-Modified header
  maxAge: '1d',                 // Cache max-age
  redirect: true,               // Redirect đến trailing "/" cho directories
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
    }
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 năm
    }
  }
}));
```

---
