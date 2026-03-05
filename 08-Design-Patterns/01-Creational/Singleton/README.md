# Singleton Pattern

## 1. Khái niệm

Đảm bảo một class chỉ có **MỘT instance duy nhất** và cung cấp **global access point** đến instance đó.

```
┌─────────────────────────────┐
│         Singleton            │
├─────────────────────────────┤
│ - static instance: Singleton │
│ - constructor() [private]    │
├─────────────────────────────┤
│ + static getInstance()       │
└─────────────────────────────┘

Client A ──→ getInstance() ──→ ┌──────────┐
                                │ instance │ (chỉ 1!)
Client B ──→ getInstance() ──→ └──────────┘
```

---

## 2. Implementation

### Cách 1: Class-based

```javascript
class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Use Database.getInstance()');
    }
    this.connection = null;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  connect(url) {
    this.connection = url;
    console.log(`Connected to ${url}`);
  }

  query(sql) {
    console.log(`[${this.connection}] ${sql}`);
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true - cùng 1 instance!
```

### Cách 2: Closure

```javascript
const createLogger = (() => {
  let instance = null;

  return () => {
    if (!instance) {
      instance = {
        logs: [],
        log(msg) {
          const entry = `[${new Date().toISOString()}] ${msg}`;
          this.logs.push(entry);
          console.log(entry);
        },
        getLogs() {
          return this.logs;
        }
      };
    }
    return instance;
  };
})();

const logger1 = createLogger();
const logger2 = createLogger();
console.log(logger1 === logger2); // true
```

### Cách 3: ES Module (tự nhiên là Singleton!)

```javascript
// config.js - Module scope = singleton
class Config {
  constructor() {
    this.settings = {};
  }

  set(key, value) { this.settings[key] = value; }
  get(key) { return this.settings[key]; }
}

export default new Config(); // Luôn trả về cùng 1 instance

// app.js
import config from './config.js';
config.set('theme', 'dark');

// other.js
import config from './config.js';
config.get('theme'); // 'dark' - cùng instance!
```

---

## 3. Use Cases thực tế

```javascript
// 1. Database Connection Pool
class ConnectionPool {
  static #instance;
  #pool = [];

  static getInstance() {
    if (!ConnectionPool.#instance) {
      ConnectionPool.#instance = new ConnectionPool();
    }
    return ConnectionPool.#instance;
  }

  getConnection() {
    return this.#pool.pop() || this.#createConnection();
  }

  #createConnection() {
    return { id: Math.random(), query: (sql) => console.log(sql) };
  }
}

// 2. Application State Store
class Store {
  static #instance;
  #state = {};
  #listeners = [];

  static getInstance() {
    if (!Store.#instance) Store.#instance = new Store();
    return Store.#instance;
  }

  getState() { return { ...this.#state }; }

  setState(newState) {
    this.#state = { ...this.#state, ...newState };
    this.#listeners.forEach(fn => fn(this.#state));
  }

  subscribe(fn) {
    this.#listeners.push(fn);
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== fn);
    };
  }
}
```

---

## 4. Ưu / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Đảm bảo chỉ 1 instance | Khó unit test (global state) |
| Global access point | Hidden dependencies |
| Lazy initialization | Vi phạm SRP (quản lý lifecycle + logic) |
| Tiết kiệm tài nguyên | Khó extend/override |

---

## 5. Khi nào dùng

- Database connections
- Logger
- Configuration manager
- Cache manager
- Thread pool

**Khi nào KHÔNG dùng:** Khi cần nhiều instance hoặc cần test dễ dàng → dùng Dependency Injection thay thế.

---

## 6. Bài tập

```javascript
// Tạo EventBus singleton
// - on(event, callback): đăng ký listener
// - emit(event, data): phát sự kiện
// - off(event, callback): hủy đăng ký
// Đảm bảo chỉ có 1 EventBus trong toàn app
```
