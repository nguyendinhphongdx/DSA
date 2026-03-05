# Open/Closed Principle (OCP)

## 1. Khái niệm

> "Software entities should be **open for extension**, but **closed for modification**."
> — Bertrand Meyer

Khi cần thêm tính năng mới, **mở rộng** (extend) code hiện tại thay vì **sửa đổi** (modify) code đã hoạt động.

```
❌ Vi phạm OCP:                    ✅ Tuân thủ OCP:
┌──────────────────┐               ┌──────────────────┐
│ PaymentProcessor │               │  «interface»     │
├──────────────────┤               │ PaymentMethod    │
│ + process(type)  │               ├──────────────────┤
│   if credit...   │               │ + process()      │
│   if paypal...   │               └────────┬─────────┘
│   if crypto...   │                  ┌─────┼─────┐
│   // Phải sửa    │                  │     │     │
│   // mỗi lần     │               Credit Paypal Crypto
│   // thêm mới!   │               (extend, không sửa!)
└──────────────────┘
```

---

## 2. Ví dụ Bad vs Good

### Bad: Dùng if/else chain

```javascript
// Mỗi lần thêm loại discount mới → phải SỬA function này
function calculateDiscount(order, type) {
  if (type === 'percentage') {
    return order.total * (order.discountValue / 100);
  } else if (type === 'fixed') {
    return order.discountValue;
  } else if (type === 'buy1get1') {
    return order.total / 2;
  }
  // Thêm loại mới? Phải sửa function này!
  // else if (type === 'seasonal') { ... }
  return 0;
}
```

### Good: Dùng polymorphism

```javascript
// Strategy interface
class DiscountStrategy {
  calculate(order) {
    throw new Error('Must implement calculate()');
  }
}

class PercentageDiscount extends DiscountStrategy {
  constructor(percent) {
    super();
    this.percent = percent;
  }
  calculate(order) {
    return order.total * (this.percent / 100);
  }
}

class FixedDiscount extends DiscountStrategy {
  constructor(amount) {
    super();
    this.amount = amount;
  }
  calculate(order) {
    return this.amount;
  }
}

class Buy1Get1Discount extends DiscountStrategy {
  calculate(order) {
    return order.total / 2;
  }
}

// Thêm discount mới? Chỉ cần TẠO class mới, KHÔNG sửa code cũ!
class SeasonalDiscount extends DiscountStrategy {
  constructor(percent, season) {
    super();
    this.percent = percent;
    this.season = season;
  }
  calculate(order) {
    const currentMonth = new Date().getMonth();
    const isInSeason = this.season === 'summer' && currentMonth >= 5 && currentMonth <= 7;
    return isInSeason ? order.total * (this.percent / 100) : 0;
  }
}

// Calculator KHÔNG BAO GIỜ cần sửa
function calculateDiscount(order, strategy) {
  return strategy.calculate(order);
}

// Sử dụng
const discount = calculateDiscount(order, new PercentageDiscount(20));
```

---

## 3. Ví dụ thực tế: Notification System

### Bad
```javascript
class NotificationService {
  send(message, channel) {
    switch (channel) {
      case 'email':
        // gửi email...
        console.log(`Email: ${message}`);
        break;
      case 'sms':
        // gửi SMS...
        console.log(`SMS: ${message}`);
        break;
      case 'push':
        // gửi push notification...
        console.log(`Push: ${message}`);
        break;
      // Thêm Slack? Telegram? Phải sửa class này!
    }
  }
}
```

### Good
```javascript
// Mỗi channel là 1 class riêng
class EmailNotifier {
  send(message) {
    console.log(`Email: ${message}`);
  }
}

class SMSNotifier {
  send(message) {
    console.log(`SMS: ${message}`);
  }
}

class PushNotifier {
  send(message) {
    console.log(`Push: ${message}`);
  }
}

// Thêm Slack? Tạo class mới, không sửa gì cả!
class SlackNotifier {
  send(message) {
    console.log(`Slack: ${message}`);
  }
}

// Service KHÔNG cần sửa khi thêm channel mới
class NotificationService {
  constructor() {
    this.notifiers = [];
  }

  addNotifier(notifier) {
    this.notifiers.push(notifier);
  }

  notify(message) {
    this.notifiers.forEach(n => n.send(message));
  }
}

// Sử dụng
const service = new NotificationService();
service.addNotifier(new EmailNotifier());
service.addNotifier(new SlackNotifier());
service.notify('Hello!');
```

---

## 4. OCP với Functions (Higher-Order Functions)

```javascript
// ❌ Bad: Function cứng, phải sửa khi thêm filter mới
function filterProducts(products, filterType) {
  if (filterType === 'cheap') {
    return products.filter(p => p.price < 100);
  } else if (filterType === 'inStock') {
    return products.filter(p => p.stock > 0);
  } else if (filterType === 'popular') {
    return products.filter(p => p.rating >= 4);
  }
}

// ✅ Good: Truyền filter function vào → open for extension
function filterProducts(products, predicate) {
  return products.filter(predicate);
}

// Dùng
const cheap = filterProducts(products, p => p.price < 100);
const inStock = filterProducts(products, p => p.stock > 0);
const popular = filterProducts(products, p => p.rating >= 4);

// Thêm filter mới? Không sửa gì cả!
const newArrivals = filterProducts(products, p => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return p.createdAt > weekAgo;
});
```

---

## 5. OCP với Plugin System

```javascript
class FormValidator {
  constructor() {
    this.rules = new Map();
  }

  // Đăng ký rule mới (extension point)
  addRule(name, validatorFn) {
    this.rules.set(name, validatorFn);
  }

  validate(data, ruleNames) {
    const errors = [];
    for (const ruleName of ruleNames) {
      const rule = this.rules.get(ruleName);
      if (rule) {
        const error = rule(data);
        if (error) errors.push(error);
      }
    }
    return errors;
  }
}

// Đăng ký rules - mở rộng KHÔNG cần sửa FormValidator
const validator = new FormValidator();

validator.addRule('required', (data) => {
  if (!data.value) return 'Field is required';
});

validator.addRule('email', (data) => {
  if (!data.value?.includes('@')) return 'Invalid email';
});

validator.addRule('minLength', (data) => {
  if (data.value?.length < data.min) return `Min ${data.min} characters`;
});

// Thêm rule mới bất cứ lúc nào!
validator.addRule('phoneVN', (data) => {
  if (!/^0\d{9}$/.test(data.value)) return 'Invalid VN phone number';
});
```

---

## 6. Kỹ thuật đạt OCP

| Kỹ thuật | Mô tả |
|----------|--------|
| Polymorphism | Dùng inheritance/interface để mở rộng |
| Strategy Pattern | Truyền algorithm qua constructor/parameter |
| Higher-Order Functions | Truyền function làm tham số |
| Plugin System | Đăng ký extensions qua registry |
| Middleware | Chain of handlers (Express, NestJS) |
| Event System | Pub/Sub cho extensibility |

---

## 7. Bài tập

### Bài 1: Refactor Shape Area
```javascript
// Refactor để tuân thủ OCP
function calculateArea(shape) {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    // Thêm shape mới phải sửa ở đây...
  }
}
```

### Bài 2: Refactor Payment System
```javascript
// Refactor để dễ dàng thêm payment method mới
function processPayment(amount, method) {
  if (method === 'credit') {
    console.log(`Charged $${amount} to credit card`);
    // credit card logic
  } else if (method === 'paypal') {
    console.log(`Sent $${amount} via PayPal`);
    // paypal logic
  } else if (method === 'crypto') {
    console.log(`Transferred $${amount} in crypto`);
    // crypto logic
  }
}
```

### Bài 3: Tạo Sortable System
```javascript
// Tạo hệ thống sort có thể mở rộng dễ dàng
// - SortByPrice, SortByName, SortByRating
// - Dễ dàng thêm SortByDate, SortByPopularity
```
