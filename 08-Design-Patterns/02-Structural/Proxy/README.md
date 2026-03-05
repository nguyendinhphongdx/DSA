# Proxy Pattern

## 1. Khái niệm

Cung cấp **đại diện** cho object khác để kiểm soát truy cập đến object đó.

```
Client ──→ Proxy ──→ RealSubject
           (kiểm soát truy cập)
```

---

## 2. Các loại Proxy

### Virtual Proxy (Lazy Loading)

```javascript
class HeavyImage {
  constructor(url) {
    this.url = url;
    this.data = this.#loadFromDisk(); // Nặng!
  }

  #loadFromDisk() {
    console.log(`Loading ${this.url}...`); // 2-3 giây
    return `[Image data of ${this.url}]`;
  }

  display() { console.log(`Displaying: ${this.data}`); }
}

// Proxy - chỉ load khi thực sự cần
class ImageProxy {
  constructor(url) {
    this.url = url;
    this.realImage = null;
  }

  display() {
    if (!this.realImage) {
      this.realImage = new HeavyImage(this.url); // Lazy load!
    }
    this.realImage.display();
  }
}

const images = [
  new ImageProxy('photo1.jpg'),
  new ImageProxy('photo2.jpg'),
  new ImageProxy('photo3.jpg'),
];
// Chưa load gì cả!
images[0].display(); // Load photo1.jpg rồi display
```

### Protection Proxy (Access Control)

```javascript
class BankAccount {
  constructor(balance) { this.balance = balance; }
  withdraw(amount) { this.balance -= amount; return this.balance; }
  getBalance() { return this.balance; }
}

class BankAccountProxy {
  constructor(account, user) {
    this.account = account;
    this.user = user;
  }

  withdraw(amount) {
    if (this.user.role !== 'admin' && amount > 10000) {
      throw new Error('Need admin approval for large withdrawals');
    }
    return this.account.withdraw(amount);
  }

  getBalance() {
    if (!this.user.isAuthenticated) {
      throw new Error('Must be logged in');
    }
    return this.account.getBalance();
  }
}
```

### Caching Proxy

```javascript
class APIService {
  async fetchData(url) {
    const res = await fetch(url);
    return res.json();
  }
}

class CachingProxy {
  constructor(service, ttl = 60000) {
    this.service = service;
    this.cache = new Map();
    this.ttl = ttl;
  }

  async fetchData(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log('[CACHE HIT]');
      return cached.data;
    }

    const data = await this.service.fetchData(url);
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }
}
```

---

## 3. JavaScript Proxy (ES6)

```javascript
// Built-in Proxy object
const user = { name: 'Phong', age: 25, _password: 'secret' };

const protectedUser = new Proxy(user, {
  get(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error(`Cannot access private property: ${prop}`);
    }
    return target[prop];
  },

  set(target, prop, value) {
    if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
      throw new Error('Age must be a positive number');
    }
    target[prop] = value;
    return true;
  }
});

protectedUser.name;       // 'Phong' ✓
protectedUser._password;  // Error! ✗
protectedUser.age = -5;   // Error! ✗
```

---

## 4. Bài tập

```javascript
// Tạo RateLimiterProxy:
// - Giới hạn N lần gọi trong M giây
// - Nếu vượt quá → throw Error hoặc queue
// Wrap bất kỳ API service nào
```
