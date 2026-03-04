# Design Patterns trong JavaScript

## Design Pattern là gì?

Design Patterns là các **giải pháp đã được chứng minh** cho các vấn đề thiết kế phần mềm thường gặp. Chúng không phải code cụ thể, mà là **bản mẫu** (template) có thể áp dụng vào nhiều tình huống.

---

## 1. Singleton

Đảm bảo một class chỉ có **duy nhất một instance** trong toàn bộ ứng dụng.

**Dùng khi:** Database connection, app config, logger, cache.

```js
class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.connection = 'connected';
    this.queries = [];
    Database.#instance = this;
  }

  query(sql) {
    this.queries.push(sql);
    return `Executing: ${sql}`;
  }

  static getInstance() {
    if (!Database.#instance) {
      new Database();
    }
    return Database.#instance;
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
db1 === db2; // true — cùng một instance
```

**Cách đơn giản hơn trong JS** — dùng module (mỗi module chỉ execute 1 lần):

```js
// database.js
class Database { /* ... */ }
export const db = new Database(); // Singleton tự nhiên!

// Mọi nơi import đều nhận cùng instance
import { db } from './database.js';
```

---

## 2. Factory

Tạo objects mà **không expose logic khởi tạo** cho code gọi. Code gọi chỉ cần mô tả "muốn gì", factory lo việc tạo.

**Dùng khi:** Tạo objects phức tạp, tạo objects dựa trên điều kiện runtime.

```js
class Notification {
  send(message) { throw new Error('Must implement send()'); }
}

class EmailNotification extends Notification {
  constructor(to) { super(); this.to = to; }
  send(message) { return `Email to ${this.to}: ${message}`; }
}

class SMSNotification extends Notification {
  constructor(phone) { super(); this.phone = phone; }
  send(message) { return `SMS to ${this.phone}: ${message}`; }
}

class PushNotification extends Notification {
  constructor(deviceId) { super(); this.deviceId = deviceId; }
  send(message) { return `Push to ${this.deviceId}: ${message}`; }
}

// Factory
class NotificationFactory {
  static create(type, target) {
    switch (type) {
      case 'email': return new EmailNotification(target);
      case 'sms': return new SMSNotification(target);
      case 'push': return new PushNotification(target);
      default: throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// Sử dụng — không cần biết class cụ thể
const notification = NotificationFactory.create('email', 'phong@mail.com');
notification.send('Hello!');
```

---

## 3. Observer (Publish-Subscribe)

Khi một object (subject) thay đổi, tất cả objects "theo dõi" nó (observers) được **tự động thông báo**.

**Dùng khi:** Event systems, state management, real-time updates.

```js
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) {
      this.#events.set(event, []);
    }
    this.#events.get(event).push(listener);
    return this; // Method chaining
  }

  off(event, listener) {
    const listeners = this.#events.get(event);
    if (listeners) {
      this.#events.set(event, listeners.filter(l => l !== listener));
    }
    return this;
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Sử dụng
const store = new EventEmitter();

store.on('userLogin', (user) => {
  console.log(`${user.name} logged in`);
});

store.on('userLogin', (user) => {
  console.log(`Sending welcome email to ${user.email}`);
});

store.emit('userLogin', { name: 'Phong', email: 'phong@mail.com' });
// "Phong logged in"
// "Sending welcome email to phong@mail.com"
```

---

## 4. Module Pattern

Đóng gói code liên quan vào một đơn vị với **public API** và **private data**.

**Dùng khi:** Tổ chức code, tạo namespace, ẩn implementation details.

```js
const ShoppingCart = (function() {
  // Private
  const items = [];
  const TAX_RATE = 0.1;

  function calculateSubtotal() {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // Public API
  return {
    addItem(name, price, qty = 1) {
      items.push({ name, price, qty });
    },

    removeItem(name) {
      const index = items.findIndex(item => item.name === name);
      if (index > -1) items.splice(index, 1);
    },

    getTotal() {
      const subtotal = calculateSubtotal();
      return subtotal + subtotal * TAX_RATE;
    },

    getItems() {
      return [...items]; // Copy
    },
  };
})();

ShoppingCart.addItem('Book', 100, 2);
ShoppingCart.getTotal(); // 220
// ShoppingCart.items;   // undefined — private!
```

---

## 5. Strategy Pattern

Định nghĩa một **nhóm thuật toán**, đóng gói từng cái, và cho phép **thay đổi** thuật toán runtime.

**Dùng khi:** Nhiều cách xử lý cho cùng một tác vụ (sort, validate, format, pricing...).

```js
// Strategies
const validationStrategies = {
  required: (value) => value !== '' && value != null,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min) => (value) => value.length >= min,
  maxLength: (max) => (value) => value.length <= max,
  pattern: (regex) => (value) => regex.test(value),
};

// Validator sử dụng strategies
class FormValidator {
  #rules = new Map();

  addRule(field, strategyName, ...args) {
    if (!this.#rules.has(field)) {
      this.#rules.set(field, []);
    }

    const strategy = typeof validationStrategies[strategyName] === 'function'
      ? validationStrategies[strategyName](...args)
      : validationStrategies[strategyName];

    this.#rules.get(field).push({ name: strategyName, validate: strategy });
    return this;
  }

  validate(data) {
    const errors = {};
    for (const [field, rules] of this.#rules) {
      for (const rule of rules) {
        if (!rule.validate(data[field])) {
          errors[field] = errors[field] || [];
          errors[field].push(`Failed: ${rule.name}`);
        }
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }
}

const validator = new FormValidator();
validator
  .addRule('email', 'required')
  .addRule('email', 'email')
  .addRule('password', 'required')
  .addRule('password', 'minLength', 8);

validator.validate({ email: 'test@mail.com', password: '12345678' });
// { valid: true, errors: {} }
```

---

## 6. Decorator Pattern

**Thêm chức năng** cho object/function mà không sửa đổi code gốc.

```js
// Function decorator
function withRetry(fn, maxRetries = 3) {
  return async function(...args) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
  };
}

function withCache(fn, ttl = 60000) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < ttl) return cached.value;
    const result = fn.apply(this, args);
    cache.set(key, { value: result, time: Date.now() });
    return result;
  };
}

// Kết hợp decorators
const fetchUser = withCache(withRetry(async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}));
```

---

## Khi nào dùng Pattern nào?

| Pattern | Dùng khi |
|---------|---------|
| **Singleton** | Cần đúng 1 instance (config, DB, logger) |
| **Factory** | Tạo object phức tạp, nhiều loại khác nhau |
| **Observer** | Thông báo nhiều nơi khi có thay đổi |
| **Module** | Tổ chức code, ẩn implementation |
| **Strategy** | Nhiều cách xử lý cho cùng 1 việc |
| **Decorator** | Thêm chức năng mà không sửa code gốc |
