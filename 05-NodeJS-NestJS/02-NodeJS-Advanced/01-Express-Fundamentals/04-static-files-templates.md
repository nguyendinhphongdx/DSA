# Serving Static Files & Template Engines

## 7. Serving Static Files

Express cung cấp middleware `express.static()` để phục vụ các file tĩnh (HTML, CSS, JS, ảnh, video, ...).

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ===== CƠ BẢN: Serve thư mục public =====
app.use(express.static('public'));
// URL: http://localhost:3000/images/logo.png
// File: public/images/logo.png

// ===== Với đường dẫn tuyệt đối (khuyến nghị) =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== Virtual path prefix =====
app.use('/static', express.static('public'));
// URL: http://localhost:3000/static/images/logo.png
// File: public/images/logo.png

// ===== Nhiều thư mục static =====
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('assets'));
// Express sẽ tìm file theo thứ tự khai báo

// ===== Options =====
app.use(express.static('public', {
  dotfiles: 'ignore',       // Ẩn file bắt đầu bằng dấu chấm
  etag: true,                // Bật ETag header
  extensions: ['htm', 'html'], // Thử thêm extension nếu file không tìm thấy
  index: 'index.html',      // File mặc định khi truy cập thư mục
  maxAge: '1d',              // Cache trong 1 ngày
  redirect: true,            // Redirect đến trailing "/" nếu là thư mục
  setHeaders: (res, filePath, stat) => {
    // Custom headers cho static files
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));
```

### Cấu trúc thư mục static files

```
project/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── images/
│   │   ├── logo.png
│   │   └── banner.jpg
│   └── favicon.ico
├── uploads/
│   └── avatars/
│       └── user1.jpg
└── src/
    └── app.js
```

---

## 8. Template Engines

Template engines cho phép render HTML động từ server.

### 8.1 Cấu hình EJS

```bash
npm install ejs
```

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Cấu hình template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route render view
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Trang chủ',
    users: [
      { name: 'Phong', age: 25 },
      { name: 'Lan', age: 23 },
    ]
  });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'Giới thiệu' });
});
```

### File template EJS

```html
<!-- views/index.ejs -->
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
</head>
<body>
  <h1><%= title %></h1>

  <!-- Vòng lặp -->
  <ul>
    <% users.forEach(user => { %>
      <li><%= user.name %> - <%= user.age %> tuổi</li>
    <% }) %>
  </ul>

  <!-- Điều kiện -->
  <% if (users.length > 0) { %>
    <p>Có <%= users.length %> users</p>
  <% } else { %>
    <p>Chưa có user nào</p>
  <% } %>

  <!-- Include partial -->
  <%- include('partials/header') %>
  <%- include('partials/footer') %>

  <!-- Unescaped HTML (cẩn thận XSS!) -->
  <%- rawHTML %>

  <!-- Escaped HTML (an toàn) -->
  <%= userInput %>
</body>
</html>
```

### 8.2 Cấu hình Handlebars

```bash
npm install express-handlebars
```

```javascript
const express = require('express');
const { engine } = require('express-handlebars');
const app = express();

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: 'views/layouts',
  partialsDir: 'views/partials'
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Trang chủ',
    users: [{ name: 'A' }, { name: 'B' }]
  });
});
```

---
