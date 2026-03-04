# Routing trong Express.js

## 5. Routing cơ bản

### 5.1 HTTP Methods

Express hỗ trợ tất cả HTTP methods. Dưới đây là các method phổ biến nhất:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Giả lập database
let users = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@gmail.com' },
  { id: 2, name: 'Trần Thị B', email: 'b@gmail.com' },
];

// ===== GET - Lấy dữ liệu =====
// Lấy tất cả users
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// Lấy user theo ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user'
    });
  }
  res.json({ success: true, data: user });
});

// ===== POST - Tạo mới =====
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  // Validate đơn giản
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp name và email'
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Tạo user thành công',
    data: newUser
  });
});

// ===== PUT - Cập nhật toàn bộ (replace) =====
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user'
    });
  }

  const { name, email } = req.body;

  // PUT thay thế toàn bộ resource
  users[index] = { id, name, email };

  res.json({
    success: true,
    message: 'Cập nhật user thành công',
    data: users[index]
  });
});

// ===== PATCH - Cập nhật một phần =====
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user'
    });
  }

  // PATCH chỉ cập nhật các field được gửi lên
  users[index] = { ...users[index], ...req.body };

  res.json({
    success: true,
    message: 'Cập nhật user thành công',
    data: users[index]
  });
});

// ===== DELETE - Xóa =====
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user'
    });
  }

  const deletedUser = users.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'Xóa user thành công',
    data: deletedUser
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 5.2 Route matching patterns

```javascript
// ===== EXACT MATCH =====
app.get('/about', handler);              // Chỉ match "/about"

// ===== ROUTE PARAMETERS =====
app.get('/users/:id', handler);           // Match "/users/123", "/users/abc"
app.get('/users/:userId/posts/:postId', handler); // Nhiều params

// ===== OPTIONAL PARAMETERS =====
app.get('/users/:id?', handler);          // Match "/users" và "/users/123"

// ===== REGEX PATTERNS =====
app.get('/users/:id(\\d+)', handler);     // Chỉ match khi id là số
app.get('/files/*', handler);             // Match "/files/a/b/c"

// ===== STRING PATTERNS =====
app.get('/ab?cd', handler);               // Match "acd" và "abcd"
app.get('/ab+cd', handler);               // Match "abcd", "abbcd", "abbbcd",...
app.get('/ab*cd', handler);               // Match "abcd", "abXYZcd",...

// ===== app.all() - Match tất cả HTTP methods =====
app.all('/api/secret', (req, res, next) => {
  console.log('Truy cập API bí mật...');
  next();
});

// ===== app.route() - Chain nhiều methods cho cùng 1 route =====
app.route('/api/books')
  .get((req, res) => {
    res.json({ message: 'Lấy tất cả sách' });
  })
  .post((req, res) => {
    res.status(201).json({ message: 'Tạo sách mới' });
  });

app.route('/api/books/:id')
  .get((req, res) => {
    res.json({ message: `Lấy sách ${req.params.id}` });
  })
  .put((req, res) => {
    res.json({ message: `Cập nhật sách ${req.params.id}` });
  })
  .delete((req, res) => {
    res.json({ message: `Xóa sách ${req.params.id}` });
  });
```

---

## 6. Route Parameters, Query Strings và Request Body

### 6.1 Route Parameters (`req.params`)

Route parameters là các giá trị được nhúng trực tiếp vào URL path.

```javascript
// URL: /api/users/42
app.get('/api/users/:id', (req, res) => {
  console.log(req.params);     // { id: '42' }
  console.log(req.params.id);  // '42' (luôn là string!)

  // Phải convert sang number nếu cần
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID phải là số' });
  }

  res.json({ userId });
});

// Nhiều params
// URL: /api/users/42/posts/7/comments/3
app.get('/api/users/:userId/posts/:postId/comments/:commentId', (req, res) => {
  console.log(req.params);
  // { userId: '42', postId: '7', commentId: '3' }
  res.json(req.params);
});

// Param validation middleware
app.param('id', (req, res, next, value) => {
  // Tự động chạy khi route có :id parameter
  const id = parseInt(value, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }
  req.id = id; // Gán giá trị đã validate vào req
  next();
});

// Mọi route có :id sẽ tự động được validate
app.get('/api/users/:id', (req, res) => {
  // req.id đã được validate và convert sang number
  res.json({ id: req.id });
});
```

### 6.2 Query Strings (`req.query`)

Query strings là các tham số truyền qua URL sau dấu `?`.

```javascript
// URL: /api/products?page=2&limit=10&sort=price&order=desc&category=electronics
app.get('/api/products', (req, res) => {
  console.log(req.query);
  // {
  //   page: '2',
  //   limit: '10',
  //   sort: 'price',
  //   order: 'desc',
  //   category: 'electronics'
  // }

  // Parse và set default values
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  const category = req.query.category || null;

  // Tính offset cho pagination
  const skip = (page - 1) * limit;

  res.json({
    page,
    limit,
    sort,
    order: order === 1 ? 'asc' : 'desc',
    category,
    skip,
    message: `Lấy ${limit} sản phẩm từ vị trí ${skip}`
  });
});

// Query string với array
// URL: /api/search?tags=nodejs&tags=express&tags=mongodb
app.get('/api/search', (req, res) => {
  console.log(req.query.tags);
  // ['nodejs', 'express', 'mongodb']
  res.json({ tags: req.query.tags });
});

// Query string với nested object
// URL: /api/filter?price[min]=100&price[max]=500
app.get('/api/filter', (req, res) => {
  console.log(req.query.price);
  // { min: '100', max: '500' }
  res.json({ filter: req.query });
});
```

### 6.3 Request Body (`req.body`)

Request body chứa dữ liệu gửi từ client (thường qua POST, PUT, PATCH).

```javascript
const express = require('express');
const app = express();

// QUAN TRỌNG: Phải dùng middleware parse body
app.use(express.json());                          // Parse JSON body
app.use(express.urlencoded({ extended: true }));   // Parse form data

// JSON body
// Content-Type: application/json
// Body: { "name": "Phong", "email": "phong@gmail.com" }
app.post('/api/users', (req, res) => {
  console.log(req.body);
  // { name: 'Phong', email: 'phong@gmail.com' }

  const { name, email } = req.body;
  res.status(201).json({ name, email });
});

// Form data (URL-encoded)
// Content-Type: application/x-www-form-urlencoded
// Body: name=Phong&email=phong@gmail.com
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.json({ username });
});

// Multipart form data (file upload) - cần multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('avatar'), (req, res) => {
  console.log(req.file);   // Thông tin file upload
  console.log(req.body);   // Các field khác trong form

  res.json({
    file: req.file,
    body: req.body
  });
});
```

### So sánh params vs query vs body

| | `req.params` | `req.query` | `req.body` |
|---|---|---|---|
| **Vị trí** | Trong URL path | Sau dấu `?` | Trong request body |
| **Ví dụ** | `/users/:id` | `/users?page=1` | `{ "name": "A" }` |
| **Dùng cho** | Xác định resource | Filter, pagination | Dữ liệu tạo/cập nhật |
| **HTTP Method** | Tất cả | Thường GET | POST, PUT, PATCH |
| **Kiểu dữ liệu** | Luôn string | Luôn string | Tùy parser (object) |

---
