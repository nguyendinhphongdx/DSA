# Code Smells & Refactoring

## 1. Code Smells là gì?

Code smell là dấu hiệu cho thấy code **có vấn đề** tiềm ẩn. Không phải bug, nhưng cho thấy thiết kế kém, khó maintain.

---

## 2. Code Smells phổ biến

### 2.1. Long Method
```javascript
// ❌ Function quá dài (>20 dòng)
function processOrder(order) {
  // 50+ dòng validate, calculate, save, notify, log...
}

// ✅ Fix: Extract Method
function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  saveOrder(order, total);
  notifyCustomer(order);
}
```

### 2.2. God Object / Large Class
```javascript
// ❌ Class biết quá nhiều, làm quá nhiều
class AppManager {
  handleAuth() {}
  manageUsers() {}
  processOrders() {}
  sendEmails() {}
  generateReports() {}
  managePayments() {}
  handleNotifications() {}
  // 500+ dòng...
}

// ✅ Fix: Tách thành nhiều class (SRP)
class AuthService {}
class UserService {}
class OrderService {}
class EmailService {}
```

### 2.3. Feature Envy
```javascript
// ❌ Method sử dụng data của class khác nhiều hơn class mình
class OrderPrinter {
  printOrder(order) {
    console.log(order.customer.name);       // Dùng customer data
    console.log(order.customer.email);      // Dùng customer data
    console.log(order.customer.address);    // Dùng customer data
    console.log(order.items.length);
  }
}

// ✅ Fix: Move method hoặc delegate
class Customer {
  getContactInfo() {
    return `${this.name} - ${this.email} - ${this.address}`;
  }
}

class OrderPrinter {
  printOrder(order) {
    console.log(order.customer.getContactInfo());
    console.log(order.items.length);
  }
}
```

### 2.4. Data Clumps
```javascript
// ❌ Nhóm data luôn đi cùng nhau
function createEvent(startDate, startTime, endDate, endTime, timezone) {}
function validateRange(startDate, startTime, endDate, endTime, timezone) {}

// ✅ Fix: Introduce Parameter Object
class DateTimeRange {
  constructor(start, end, timezone) {
    this.start = start;
    this.end = end;
    this.timezone = timezone;
  }
}

function createEvent(dateRange) {}
function validateRange(dateRange) {}
```

### 2.5. Primitive Obsession
```javascript
// ❌ Dùng primitive cho mọi thứ
const email = 'test@mail.com';    // string
const price = 29.99;              // number (USD? VND?)
const phone = '0901234567';       // string

// ✅ Fix: Value Objects
class Email {
  constructor(value) {
    if (!value.includes('@')) throw new Error('Invalid email');
    this.value = value;
  }
}

class Money {
  constructor(amount, currency = 'VND') {
    this.amount = amount;
    this.currency = currency;
  }
  add(other) {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 2.6. Switch Statements
```javascript
// ❌ Switch lặp lại nhiều nơi
function calculateArea(shape) {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'rect': return shape.w * shape.h;
  }
}

function calculatePerimeter(shape) {
  switch (shape.type) {
    case 'circle': return 2 * Math.PI * shape.r;
    case 'rect': return 2 * (shape.w + shape.h);
  }
}

// ✅ Fix: Replace Conditional with Polymorphism
class Circle {
  constructor(r) { this.r = r; }
  area() { return Math.PI * this.r ** 2; }
  perimeter() { return 2 * Math.PI * this.r; }
}

class Rectangle {
  constructor(w, h) { this.w = w; this.h = h; }
  area() { return this.w * this.h; }
  perimeter() { return 2 * (this.w + this.h); }
}
```

### 2.7. Dead Code
```javascript
// ❌ Code không bao giờ chạy
function calculate(x) {
  return x * 2;
  console.log('Done'); // Dead code - sau return

  // function cũ không ai gọi
  // function oldCalculate(x) { return x + 1; }
}

// ✅ Fix: Xóa hẳn
function calculate(x) {
  return x * 2;
}
```

### 2.8. Comments thay cho code rõ ràng
```javascript
// ❌ Comment giải thích code tệ
// Check if user is old enough to buy alcohol
if (u.a >= 21 && u.s === 1 && !u.b) {
  // process the purchase of the alcohol product
  proc(u, p);
}

// ✅ Fix: Code tự giải thích
const isLegalDrinkingAge = user.age >= LEGAL_DRINKING_AGE;
const isActiveUser = user.status === STATUS_ACTIVE;
const isNotBanned = !user.isBanned;

if (isLegalDrinkingAge && isActiveUser && isNotBanned) {
  processPurchase(user, product);
}
```

---

## 3. Refactoring Techniques

### 3.1. Extract Method
```javascript
// Before
function printReport(employee) {
  console.log('=== REPORT ===');
  console.log(`Name: ${employee.name}`);

  // Calculate pay
  let pay = employee.baseSalary;
  if (employee.overtime > 0) {
    pay += employee.overtime * employee.hourlyRate * 1.5;
  }
  if (employee.bonus) pay += employee.bonus;

  console.log(`Pay: ${pay}`);
}

// After: Extract Method
function calculatePay(employee) {
  let pay = employee.baseSalary;
  if (employee.overtime > 0) {
    pay += employee.overtime * employee.hourlyRate * 1.5;
  }
  if (employee.bonus) pay += employee.bonus;
  return pay;
}

function printReport(employee) {
  console.log('=== REPORT ===');
  console.log(`Name: ${employee.name}`);
  console.log(`Pay: ${calculatePay(employee)}`);
}
```

### 3.2. Replace Temp with Query
```javascript
// Before
function getPrice(order) {
  const basePrice = order.quantity * order.itemPrice;
  const discount = basePrice > 1000 ? basePrice * 0.05 : 0;
  return basePrice - discount;
}

// After
function getBasePrice(order) {
  return order.quantity * order.itemPrice;
}

function getDiscount(order) {
  return getBasePrice(order) > 1000 ? getBasePrice(order) * 0.05 : 0;
}

function getPrice(order) {
  return getBasePrice(order) - getDiscount(order);
}
```

### 3.3. Introduce Parameter Object
```javascript
// Before
function amountInvoiced(startDate, endDate) { /* ... */ }
function amountReceived(startDate, endDate) { /* ... */ }
function amountOverdue(startDate, endDate) { /* ... */ }

// After
class DateRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

function amountInvoiced(dateRange) { /* ... */ }
function amountReceived(dateRange) { /* ... */ }
function amountOverdue(dateRange) { /* ... */ }
```

---

## 4. Bài tập

### Bài 1: Nhận diện Code Smells
```javascript
// Tìm TẤT CẢ code smells trong đoạn code này
class OrderManager {
  constructor() { this.orders = []; }

  doOrder(n, e, items, addr, city, zip, cc, exp, cvv) {
    // validate
    if (!n || !e || !items.length) return false;
    if (!e.includes('@')) return false;
    if (cc.length !== 16) return false;
    if (!exp.match(/\d{2}\/\d{2}/)) return false;

    // calc
    let t = 0;
    for (let i = 0; i < items.length; i++) {
      t += items[i].p * items[i].q;
    }
    if (t > 100) t = t * 0.9; // 10% off
    t = t * 1.1; // tax

    // save
    const o = { n, e, items, t, addr: `${addr}, ${city} ${zip}`, d: new Date() };
    this.orders.push(o);

    // notify
    console.log(`Order for ${n}: $${t}`);
    // sendEmail(e, 'Order confirmed', `Total: ${t}`);

    return true;
  }
}
```

### Bài 2: Refactor step by step
Lấy code ở Bài 1 và refactor:
1. Extract Method cho validate, calculate, save, notify
2. Introduce Parameter Object cho address và payment
3. Clean naming
4. Remove dead code
