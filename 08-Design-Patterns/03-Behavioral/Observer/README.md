# Observer Pattern

## 1. Khái niệm

Khi **Subject** thay đổi state, tất cả **Observer** đã đăng ký sẽ được **tự động thông báo**.

```
Subject (Publisher)
  │
  ├── notify() ──→ Observer A: update()
  ├── notify() ──→ Observer B: update()
  └── notify() ──→ Observer C: update()
```

---

## 2. Implementation

```javascript
class EventEmitter {
  #listeners = new Map();

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(callback);
    return this; // chainable
  }

  off(event, callback) {
    const callbacks = this.#listeners.get(event);
    if (callbacks) {
      this.#listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
    return this;
  }

  emit(event, ...args) {
    const callbacks = this.#listeners.get(event) || [];
    callbacks.forEach(cb => cb(...args));
    return this;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Sử dụng
const store = new EventEmitter();

store.on('userLogin', (user) => console.log(`Welcome ${user.name}!`));
store.on('userLogin', (user) => analytics.track('login', user.id));
store.on('userLogout', () => console.log('Goodbye!'));

store.emit('userLogin', { name: 'Phong', id: 1 });
// Welcome Phong!
// analytics tracked
```

---

## 3. Ví dụ: Store (giống Redux đơn giản)

```javascript
class Store {
  #state;
  #subscribers = [];

  constructor(initialState) {
    this.#state = initialState;
  }

  getState() { return { ...this.#state }; }

  setState(updater) {
    const newState = typeof updater === 'function'
      ? updater(this.#state)
      : { ...this.#state, ...updater };
    this.#state = newState;
    this.#notify();
  }

  subscribe(callback) {
    this.#subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.#subscribers = this.#subscribers.filter(s => s !== callback);
    };
  }

  #notify() {
    this.#subscribers.forEach(cb => cb(this.#state));
  }
}

const store = new Store({ count: 0, user: null });

const unsubscribe = store.subscribe(state => {
  console.log('State changed:', state);
});

store.setState({ count: 1 });       // State changed: { count: 1, user: null }
store.setState(s => ({ count: s.count + 1 })); // State changed: { count: 2, user: null }

unsubscribe(); // Hủy đăng ký
store.setState({ count: 3 }); // Không log gì
```

---

## 4. Observer trong thực tế

```javascript
// DOM Events = Observer pattern
document.addEventListener('click', handleClick);     // subscribe
document.removeEventListener('click', handleClick);  // unsubscribe

// Node.js EventEmitter
const server = http.createServer();
server.on('request', handleRequest);                  // subscribe

// RxJS Observables
const obs = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});
obs.subscribe(value => console.log(value));
```

---

## 5. Bài tập

```javascript
// Tạo NewsAgency (publisher) và NewsChannel (subscriber):
// - NewsAgency: addBreakingNews(news) → notify tất cả channels
// - NewsChannel: receive(news) → hiển thị tin
// - Có thể subscribe/unsubscribe
```
