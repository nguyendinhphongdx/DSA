# Clean Naming

## 1. Tên phải Reveal Intent

```javascript
// ❌ Bad: Không biết biến này là gì
const d = 86400;
const arr = users.filter(u => u.a > 18 && u.s === 1);
const x = p * q * (1 + r);

// ✅ Good: Đọc tên là hiểu
const SECONDS_IN_A_DAY = 86400;
const activeAdultUsers = users.filter(u => u.age > 18 && u.status === ACTIVE);
const totalPrice = quantity * unitPrice * (1 + taxRate);
```

---

## 2. Tránh viết tắt khó hiểu

```javascript
// ❌ Bad
const usrMgr = new UsrMgr();
const genRpt = (dt) => { /* ... */ };
const calcTtl = (itms) => itms.reduce((s, i) => s + i.prc, 0);
const crtDt = new Date();
function chkPerm(u, a) { /* ... */ }

// ✅ Good
const userManager = new UserManager();
const generateReport = (data) => { /* ... */ };
const calculateTotal = (items) => items.reduce((sum, item) => sum + item.price, 0);
const createdDate = new Date();
function checkPermission(user, action) { /* ... */ }
```

**Viết tắt chấp nhận được:** `id`, `url`, `api`, `db`, `config`, `err`, `req`, `res`, `btn`, `msg`

---

## 3. Quy tắc đặt tên theo loại

### Class Names: Danh từ
```javascript
// ✅ Good
class User {}
class OrderProcessor {}
class PaymentGateway {}
class EmailService {}
class ProductRepository {}

// ❌ Bad
class ProcessOrder {}    // Động từ
class ManageUser {}      // Động từ
class DataHelper {}      // Quá chung chung
class Utility {}         // Quá chung chung
```

### Method/Function Names: Động từ + Danh từ
```javascript
// ✅ Good
function getUser(id) {}
function createOrder(data) {}
function calculateTotal(items) {}
function sendNotification(user) {}
function validateEmail(email) {}
function parseJSON(text) {}
function formatCurrency(amount) {}

// ❌ Bad
function user(id) {}         // Thiếu verb
function data(input) {}      // Mơ hồ
function process(x) {}       // Quá chung
```

### Boolean: is/has/can/should
```javascript
// ✅ Good
const isActive = true;
const hasPermission = user.role === 'admin';
const canDelete = hasPermission && isOwner;
const shouldRedirect = !isAuthenticated;
const isLoading = false;
const hasErrors = errors.length > 0;

// ❌ Bad
const active = true;         // Tính từ, không rõ là boolean
const permission = true;     // Danh từ
const delete_ = true;        // ???
const flag = true;           // Vô nghĩa
```

### Constants: UPPER_SNAKE_CASE
```javascript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT_MS = 5000;
const HTTP_STATUS_OK = 200;
const ITEMS_PER_PAGE = 20;
```

### Arrays: Số nhiều
```javascript
// ✅ Good
const users = [user1, user2];
const productIds = [1, 2, 3];
const selectedItems = [];
const errorMessages = ['Invalid email', 'Too short'];

// ❌ Bad
const userList = [];    // Thừa "List"
const data = [];        // Quá chung
```

---

## 4. Quy ước trong JavaScript

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Variable | camelCase | `userName`, `totalPrice` |
| Function | camelCase | `getUser()`, `calculateTax()` |
| Class | PascalCase | `UserService`, `OrderProcessor` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Private | `_prefix` hoặc `#` | `_cache`, `#password` |
| File | kebab-case hoặc camelCase | `user-service.js` |
| Component (React) | PascalCase | `UserProfile.jsx` |

---

## 5. Tránh Context thừa

```javascript
// ❌ Bad: Thừa context
class User {
  userName;        // "User" đã nằm trong class name
  userEmail;
  userAge;
  getUserName() {}
}

// ✅ Good
class User {
  name;
  email;
  age;
  getName() {}
}
```

---

## 6. Tên phải có thể search được

```javascript
// ❌ Bad: Không search được
setTimeout(callback, 604800000);
if (status === 4) {}
const price = amount * 0.08;

// ✅ Good: Search-friendly
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ORDER_STATUS_CANCELLED = 4;
const TAX_RATE = 0.08;

setTimeout(callback, ONE_WEEK_MS);
if (status === ORDER_STATUS_CANCELLED) {}
const price = amount * TAX_RATE;
```

---

## 7. Bài tập

### Bài 1: Đổi tên cho rõ ràng
```javascript
// Rename tất cả biến, function, class cho clean
const d = new Date();
const arr = [];
function fn1(a, b) { return a > b; }
function proc(lst) {
  const r = [];
  for (const x of lst) {
    if (x.s === 1 && x.t > 100) {
      r.push(x);
    }
  }
  return r;
}
class Mgr {
  constructor() { this.lst = []; }
  add(itm) { this.lst.push(itm); }
  rmv(idx) { this.lst.splice(idx, 1); }
  get(idx) { return this.lst[idx]; }
}
```

### Bài 2: Đặt tên cho functions
```javascript
// Đặt tên phù hợp cho mỗi function
function ???(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function ???(arr) { return [...new Set(arr)]; }
function ???(obj, keys) { return keys.reduce((r, k) => ({...r, [k]: obj[k]}), {}); }
function ???(ms) { return new Promise(r => setTimeout(r, ms)); }
function ???(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}
```
