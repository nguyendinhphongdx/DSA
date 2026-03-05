# DRY, KISS, YAGNI

## 1. DRY - Don't Repeat Yourself

> "Every piece of knowledge must have a single, unambiguous representation."

### Bad: Code lặp lại

```javascript
// ❌ Copy-paste logic tính giá
function calculateProductPrice(product) {
  let price = product.basePrice;
  if (product.discount > 0) {
    price = price - (price * product.discount / 100);
  }
  price = price * 1.1; // VAT 10%
  return Math.round(price * 100) / 100;
}

function calculateServicePrice(service) {
  let price = service.basePrice;
  if (service.discount > 0) {
    price = price - (price * service.discount / 100);  // ← Lặp lại!
  }
  price = price * 1.1; // VAT 10%                      // ← Lặp lại!
  return Math.round(price * 100) / 100;                 // ← Lặp lại!
}
```

### Good: Extract common logic

```javascript
// ✅ Extract logic dùng chung
function applyDiscount(price, discountPercent) {
  return discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
}

function applyVAT(price, rate = 0.1) {
  return price * (1 + rate);
}

function roundPrice(price) {
  return Math.round(price * 100) / 100;
}

function calculatePrice(item) {
  return roundPrice(applyVAT(applyDiscount(item.basePrice, item.discount)));
}
```

### Chú ý: DRY không chỉ về code

```javascript
// DRY cũng áp dụng cho:
// 1. Constants
const TAX_RATE = 0.1;           // Thay vì hardcode 0.1 nhiều nơi
const MAX_LOGIN_ATTEMPTS = 5;

// 2. Config
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// 3. Validation rules
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

---

## 2. KISS - Keep It Simple, Stupid

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

### Bad: Over-engineering

```javascript
// ❌ Over-engineered: Check số chẵn
class NumberAnalyzer {
  constructor(config = {}) {
    this.config = {
      strategy: config.strategy || 'modulo',
      cache: config.cache || new Map(),
      logger: config.logger || console,
    };
  }

  analyze(number) {
    if (this.config.cache.has(number)) {
      return this.config.cache.get(number);
    }

    let result;
    switch (this.config.strategy) {
      case 'modulo':
        result = number % 2 === 0;
        break;
      case 'bitwise':
        result = (number & 1) === 0;
        break;
      default:
        throw new Error('Unknown strategy');
    }

    this.config.cache.set(number, result);
    this.config.logger.log(`Analyzed ${number}: ${result}`);
    return result;
  }
}

const analyzer = new NumberAnalyzer({ strategy: 'modulo' });
analyzer.analyze(4); // true
```

### Good: Simple and clear

```javascript
// ✅ Simple
function isEven(number) {
  return number % 2 === 0;
}

isEven(4); // true
```

### Bad: Quá "clever"

```javascript
// ❌ Clever but unreadable
const r = a.reduce((p,c,i)=>i?{...p,[c]:a[i-1]}:p,{});

// ✅ Readable
function createPairsObject(arr) {
  const result = {};
  for (let i = 1; i < arr.length; i++) {
    result[arr[i]] = arr[i - 1];
  }
  return result;
}
```

### Bad: Premature abstraction

```javascript
// ❌ Tạo abstract layer khi chỉ có 1 implementation
class DatabaseAdapterFactory {
  static create(type) {
    switch (type) {
      case 'postgres': return new PostgresAdapter();
      // Chưa bao giờ cần adapter khác...
    }
  }
}

// ✅ Dùng trực tiếp (refactor khi CẦN)
const db = new PostgresDB();
```

---

## 3. YAGNI - You Aren't Gonna Need It

> "Always implement things when you actually need them,
> never when you just foresee that you need them."

### Bad: Code cho tương lai

```javascript
// ❌ Thiết kế cho "tương lai" mà chưa ai yêu cầu
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.phone = null;          // "Có thể cần sau"
    this.address = null;        // "Có thể cần sau"
    this.avatar = null;         // "Có thể cần sau"
    this.preferences = {};      // "Có thể cần sau"
    this.socialLinks = {};      // "Có thể cần sau"
    this.twoFactorEnabled = false; // "Có thể cần sau"
  }

  // Methods cho tính năng chưa ai yêu cầu
  exportToCSV() { /* ... */ }
  exportToXML() { /* ... */ }
  exportToPDF() { /* ... */ }
  importFromExternalProvider() { /* ... */ }
  syncWithThirdParty() { /* ... */ }
}
```

### Good: Chỉ làm cái cần

```javascript
// ✅ Chỉ những gì CẦN NGAY BÂY GIỜ
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}
// Khi nào cần thêm field/method → thêm lúc đó!
```

---

## 4. Cân bằng giữa các nguyên tắc

```
DRY quá mức → Abstraction phức tạp, vi phạm KISS
KISS quá mức → Code lặp lại, vi phạm DRY
YAGNI quá mức → Thiếu kiến trúc, khó mở rộng sau

→ Cần CÂN BẰNG!
```

### Rule of Three

```javascript
// Lần 1: Viết code
function formatUserName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

// Lần 2: Có chỗ khác cũng format tên → OK, chưa extract
function formatAdminName(admin) {
  return `${admin.firstName} ${admin.lastName}`.trim();
}

// Lần 3: Lặp lần 3 → BÂY GIỜ mới extract!
function formatFullName(person) {
  return `${person.firstName} ${person.lastName}`.trim();
}
```

---

## 5. Tóm tắt

| Nguyên tắc | Ý nghĩa | Anti-pattern |
|-----------|---------|-------------|
| **DRY** | Không lặp logic | Copy-paste code |
| **KISS** | Giữ đơn giản | Over-engineering |
| **YAGNI** | Chỉ làm cái cần | Gold plating |

---

## 6. Bài tập

### Bài 1: Áp dụng DRY
```javascript
// Tìm code lặp và extract
function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Invalid email format';
  if (email.length > 255) return 'Email too long';
  return null;
}

function validateUsername(username) {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username too short';
  if (username.length > 50) return 'Username too long';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password too short';
  if (password.length > 128) return 'Password too long';
  return null;
}
```

### Bài 2: Áp dụng KISS
```javascript
// Đơn giản hóa code này
function getMaxValue(arr) {
  return arr.reduce((acc, val) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(val > acc ? val : acc);
      }, 0);
    }).then(result => result);
  }, -Infinity);
}
```
