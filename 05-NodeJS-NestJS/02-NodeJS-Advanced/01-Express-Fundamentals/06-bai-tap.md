# Sai lầm thường gặp & Bài tập thực hành

## 11. Sai lầm thường gặp

### Sai lầm 1: Quên return sau khi gửi response

```javascript
// SAI - Sẽ gây lỗi "Cannot set headers after they are sent to the client"
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    res.status(404).json({ message: 'Not found' });
    // Không có return! Code tiếp tục chạy xuống dưới
  }

  res.json({ data: user }); // LỖI! Response đã được gửi ở trên
});

// ĐÚNG
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ message: 'Not found' }); // Có return
  }

  res.json({ data: user });
});
```

### Sai lầm 2: Không parse request body

```javascript
// SAI - req.body sẽ là undefined
app.post('/api/users', (req, res) => {
  console.log(req.body); // undefined!
});

// ĐÚNG - Phải dùng middleware parse body TRƯỚC routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/users', (req, res) => {
  console.log(req.body); // { name: '...', email: '...' }
});
```

### Sai lầm 3: Không xử lý lỗi async

```javascript
// SAI - Promise rejection không được catch, server có thể crash
app.get('/api/users', async (req, res) => {
  const users = await User.find(); // Nếu lỗi sẽ crash!
  res.json(users);
});

// ĐÚNG - Bọc trong try/catch
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error); // Chuyển lỗi cho error middleware
  }
});

// ĐÚNG HƠN - Dùng wrapper function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

### Sai lầm 4: Route params là string, không phải number

```javascript
// SAI
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  // Nếu u.id là number thì sẽ không bao giờ match!
  // Vì req.params.id luôn là string
});

// ĐÚNG
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
});
```

### Sai lầm 5: Đặt middleware sai vị trí

```javascript
// SAI - Route đã match trước khi middleware chạy
app.get('/api/users', (req, res) => {
  res.json(users);
});
app.use(express.json()); // Quá muộn! Middleware này không ảnh hưởng route trên

// ĐÚNG - Middleware trước routes
app.use(express.json());
app.get('/api/users', (req, res) => {
  res.json(users);
});
```

---

## 12. Bài tập thực hành

### Bài tập 1: CRUD API Quản lý Sinh viên (Cơ bản)

**Yêu cầu:**
Xây dựng REST API quản lý sinh viên với các tính năng:

1. **GET /api/students** - Lấy danh sách sinh viên
   - Hỗ trợ query: `?search=`, `?class=`, `?page=`, `?limit=`
2. **GET /api/students/:id** - Lấy sinh viên theo MSSV
3. **POST /api/students** - Thêm sinh viên mới
   - Validate: name (bắt buộc), email (bắt buộc, đúng format), age (số, 18-60), class
4. **PUT /api/students/:id** - Cập nhật thông tin sinh viên
5. **DELETE /api/students/:id** - Xóa sinh viên
6. **GET /api/students/stats/summary** - Thống kê số sinh viên theo lớp

**Dữ liệu mẫu:**

```javascript
const students = [
  { id: 'SV001', name: 'Nguyễn Văn A', email: 'a@university.edu.vn', age: 20, class: 'CNTT01' },
  { id: 'SV002', name: 'Trần Thị B', email: 'b@university.edu.vn', age: 21, class: 'CNTT02' },
  { id: 'SV003', name: 'Lê Văn C', email: 'c@university.edu.vn', age: 19, class: 'CNTT01' },
];
```

### Bài tập 2: API Quản lý Todo List (Nâng cao)

**Yêu cầu:**

1. CRUD cho todo items
2. Mỗi todo có: `id`, `title`, `description`, `status` (pending/in-progress/done), `priority` (low/medium/high), `dueDate`, `tags[]`, `createdAt`, `updatedAt`
3. Filter theo status, priority, tags
4. Sort theo dueDate, priority, createdAt
5. Search theo title, description
6. Pagination
7. Route: `PATCH /api/todos/:id/status` - Chỉ cập nhật status
8. Route: `GET /api/todos/overdue` - Lấy các todo quá hạn
9. Tổ chức code theo cấu trúc MVC

### Bài tập 3: Tổ chức Express App theo MVC

**Yêu cầu:**

Refactor bài tập 1 hoặc 2 theo cấu trúc MVC hoàn chỉnh:

```
src/
├── app.js
├── server.js
├── routes/
│   └── student.routes.js
├── controllers/
│   └── student.controller.js
├── services/
│   └── student.service.js
├── middlewares/
│   ├── logger.middleware.js
│   └── error.middleware.js
└── utils/
    └── AppError.js
```

**Gợi ý cách test API (dùng curl):**

```bash
# Lấy tất cả
curl http://localhost:3000/api/students

# Lấy theo ID
curl http://localhost:3000/api/students/SV001

# Tạo mới
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Phạm Văn D", "email": "d@university.edu.vn", "age": 22, "class": "CNTT03"}'

# Cập nhật
curl -X PUT http://localhost:3000/api/students/SV001 \
  -H "Content-Type: application/json" \
  -d '{"name": "Nguyễn Văn A Updated", "email": "a@university.edu.vn", "age": 21, "class": "CNTT01"}'

# Xóa
curl -X DELETE http://localhost:3000/api/students/SV001

# Tìm kiếm + Pagination
curl "http://localhost:3000/api/students?search=Nguyen&page=1&limit=5"
```

---

> **Tiếp theo:** [02 - Middleware and Routing](../02-Middleware-and-Routing/README.md) - Tìm hiểu sâu hơn về middleware pipeline và cách tổ chức routing module hóa.
