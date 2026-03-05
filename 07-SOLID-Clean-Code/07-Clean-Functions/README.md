# Clean Functions

## 1. Function nên nhỏ, làm MỘT việc

```javascript
// ❌ Bad: Function làm nhiều việc
function processUserRegistration(data) {
  // Validate
  if (!data.email.includes('@')) throw new Error('Invalid email');
  if (data.password.length < 8) throw new Error('Weak password');
  // Hash password
  const hash = bcrypt.hashSync(data.password, 10);
  // Save to DB
  const user = db.users.insert({ email: data.email, password: hash });
  // Send email
  mailer.send(data.email, 'Welcome!');
  // Log
  logger.info(`New user: ${data.email}`);
  return user;
}

// ✅ Good: Mỗi function 1 việc
function validateRegistration(data) {
  if (!data.email.includes('@')) throw new Error('Invalid email');
  if (data.password.length < 8) throw new Error('Weak password');
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function createUser(email, hashedPassword) {
  return db.users.insert({ email, password: hashedPassword });
}

function sendWelcomeEmail(email) {
  mailer.send(email, 'Welcome!');
}

function registerUser(data) {
  validateRegistration(data);
  const hash = hashPassword(data.password);
  const user = createUser(data.email, hash);
  sendWelcomeEmail(data.email);
  return user;
}
```

---

## 2. Tên hàm phải mô tả rõ ràng

```javascript
// ❌ Bad
function handle(d) { /* ... */ }
function process(x) { /* ... */ }
function doStuff(item) { /* ... */ }
function manage(data) { /* ... */ }

// ✅ Good: verb + noun
function validateEmail(email) { /* ... */ }
function calculateTotalPrice(items) { /* ... */ }
function sendNotification(user, message) { /* ... */ }
function formatCurrency(amount) { /* ... */ }
function isValidPassword(password) { /* ... */ }
function hasPermission(user, action) { /* ... */ }
```

---

## 3. Tối đa 2-3 Parameters

```javascript
// ❌ Bad: Quá nhiều parameters
function createUser(name, email, age, phone, address, role, department) {
  // ...
}

// ✅ Good: Dùng object
function createUser({ name, email, age, phone, address, role, department }) {
  // ...
}

createUser({
  name: 'Phong',
  email: 'phong@mail.com',
  role: 'admin'
});
```

---

## 4. Tránh Side Effects

```javascript
// ❌ Bad: Side effect ẩn
let taxRate = 0.1;

function calculatePrice(price) {
  taxRate = 0.15; // ← Side effect! Thay đổi biến ngoài scope
  return price * (1 + taxRate);
}

// ✅ Good: Pure function
function calculatePrice(price, taxRate = 0.1) {
  return price * (1 + taxRate);
}
```

---

## 5. Không dùng Flag Arguments

```javascript
// ❌ Bad: Boolean flag → function làm 2 việc
function renderUser(user, isAdmin) {
  if (isAdmin) {
    return `<div class="admin">${user.name} [ADMIN]</div>`;
  }
  return `<div class="user">${user.name}</div>`;
}

// ✅ Good: Tách thành 2 functions
function renderUser(user) {
  return `<div class="user">${user.name}</div>`;
}

function renderAdmin(user) {
  return `<div class="admin">${user.name} [ADMIN]</div>`;
}
```

---

## 6. Early Return Pattern

```javascript
// ❌ Bad: Nested if/else sâu
function getDiscount(user) {
  let discount = 0;
  if (user) {
    if (user.isActive) {
      if (user.isPremium) {
        if (user.yearsAsCustomer > 5) {
          discount = 30;
        } else {
          discount = 20;
        }
      } else {
        discount = 10;
      }
    }
  }
  return discount;
}

// ✅ Good: Early return
function getDiscount(user) {
  if (!user) return 0;
  if (!user.isActive) return 0;
  if (!user.isPremium) return 10;
  if (user.yearsAsCustomer > 5) return 30;
  return 20;
}
```

---

## 7. Command-Query Separation

```javascript
// ❌ Bad: Vừa thay đổi state vừa trả về giá trị
function setAndGetUsername(user, name) {
  user.name = name;     // Command (thay đổi)
  return user.name;     // Query (trả về)
}

// ✅ Good: Tách riêng
function setUsername(user, name) {
  user.name = name;     // Command
}

function getUsername(user) {
  return user.name;     // Query
}
```

---

## 8. Tránh Magic Numbers/Strings

```javascript
// ❌ Bad
if (user.age >= 18) { /* ... */ }
if (status === 3) { /* ... */ }
setTimeout(fn, 86400000);

// ✅ Good
const LEGAL_AGE = 18;
const STATUS_COMPLETED = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (user.age >= LEGAL_AGE) { /* ... */ }
if (status === STATUS_COMPLETED) { /* ... */ }
setTimeout(fn, ONE_DAY_MS);
```

---

## 9. Bài tập

### Bài 1: Refactor function
```javascript
// Áp dụng clean function principles
function proc(d, t, f) {
  let r = 0;
  if (t === 1) {
    for (let i = 0; i < d.length; i++) {
      if (d[i].a > 0) {
        r += d[i].a;
      }
    }
    if (f) {
      r = r * 1.1;
    }
  } else if (t === 2) {
    for (let i = 0; i < d.length; i++) {
      if (d[i].a > r) r = d[i].a;
    }
  }
  return r;
}
```

### Bài 2: Viết clean functions cho Order system
```javascript
// Viết các functions clean cho:
// - Validate order (items not empty, quantities > 0)
// - Calculate subtotal
// - Apply coupon (percentage or fixed amount)
// - Calculate shipping (free if > 500k)
// - Calculate total
```
