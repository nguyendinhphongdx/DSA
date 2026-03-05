# Decorator Pattern

## 1. Khái niệm

Thêm behavior mới cho object **tại runtime** mà không sửa code gốc. Wrap object bằng decorator.

```
┌─────────────────────────────────────┐
│ CacheDecorator                      │
│  ┌──────────────────────────────┐   │
│  │ LogDecorator                 │   │
│  │  ┌────────────────────────┐  │   │
│  │  │ OriginalService        │  │   │
│  │  │ + getData()            │  │   │
│  │  └────────────────────────┘  │   │
│  │  + getData() → log + call    │   │
│  └──────────────────────────────┘   │
│  + getData() → cache + call         │
└─────────────────────────────────────┘
```

---

## 2. Ví dụ

### Class-based Decorator

```javascript
class DataService {
  getData(id) {
    console.log(`Fetching data ${id} from DB...`);
    return { id, name: 'Product', price: 100 };
  }
}

class LoggingDecorator {
  constructor(service) {
    this.service = service;
  }

  getData(id) {
    console.log(`[LOG] getData called with id: ${id}`);
    const start = Date.now();
    const result = this.service.getData(id);
    console.log(`[LOG] getData took ${Date.now() - start}ms`);
    return result;
  }
}

class CachingDecorator {
  constructor(service) {
    this.service = service;
    this.cache = new Map();
  }

  getData(id) {
    if (this.cache.has(id)) {
      console.log(`[CACHE HIT] ${id}`);
      return this.cache.get(id);
    }
    const result = this.service.getData(id);
    this.cache.set(id, result);
    return result;
  }
}

// Stack decorators
let service = new DataService();
service = new LoggingDecorator(service);
service = new CachingDecorator(service);

service.getData(1); // Fetch + Log
service.getData(1); // Cache hit!
```

### Function Decorators (HOF)

```javascript
// Higher-Order Function = decorator trong JS
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

function withRetry(fn, maxRetries = 3) {
  return async function (...args) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        console.log(`Retry ${i + 1}/${maxRetries}...`);
      }
    }
  };
}

function withCache(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Compose decorators
const fetchUser = withCache(withLogging(withRetry(async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
})));
```

### TC39 Decorators (Stage 3)

```javascript
// TypeScript / NestJS decorators
function Log(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args) {
    console.log(`${name} called with`, args);
    return original.apply(this, args);
  };
}

class UserService {
  @Log
  getUser(id) {
    return { id, name: 'Phong' };
  }
}
```

---

## 3. Khi nào dùng

- Thêm logging, caching, authentication, retry logic
- Middleware pattern (Express, NestJS)
- Khi không muốn sửa class gốc

---

## 4. Bài tập

```javascript
// Tạo các function decorators:
// 1. withTiming(fn) - đo thời gian thực thi
// 2. withValidation(fn, validator) - validate input trước khi gọi
// 3. withThrottle(fn, delayMs) - giới hạn tần suất gọi
// Compose chúng lại
```
