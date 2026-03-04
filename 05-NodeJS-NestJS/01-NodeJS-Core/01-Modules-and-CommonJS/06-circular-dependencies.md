# 6. Circular Dependencies

Circular dependency xảy ra khi module A require module B, và module B lại require module A.

## 6.1. Vấn đề

```js
// a.js
console.log('a.js bắt đầu load');
const b = require('./b');
console.log('Trong a.js, b.loaded =', b.loaded);

module.exports = {
  loaded: true,
  name: 'Module A',
};
console.log('a.js load xong');
```

```js
// b.js
console.log('b.js bắt đầu load');
const a = require('./a'); // Circular! a.js chưa load xong
console.log('Trong b.js, a.loaded =', a.loaded); // undefined!

module.exports = {
  loaded: true,
  name: 'Module B',
};
console.log('b.js load xong');
```

```js
// main.js
const a = require('./a');

// Output:
// a.js bắt đầu load
// b.js bắt đầu load
// Trong b.js, a.loaded = undefined    ← a.js chưa export xong!
// b.js load xong
// Trong a.js, b.loaded = true
// a.js load xong
```

**Giải thích:** Khi b.js `require('./a')`, Node.js trả về **phần module.exports đã được gán tại thời điểm đó** (incomplete exports). Vì a.js chưa chạy đến dòng `module.exports = {...}`, nên b.js nhận được object rỗng.

## 6.2. Cách xử lý

**Cách 1: Restructure - tách phần chung ra module riêng**

```js
// shared.js - Phần dùng chung
module.exports = {
  config: { /* ... */ },
  helpers: { /* ... */ },
};

// a.js
const shared = require('./shared');
// ...không cần require b.js

// b.js
const shared = require('./shared');
// ...không cần require a.js
```

**Cách 2: Lazy require (require trong function)**

```js
// a.js
module.exports = {
  loaded: true,
  doSomethingWithB() {
    const b = require('./b'); // Require khi cần, lúc này b.js đã load xong
    return b.name;
  },
};

// b.js
module.exports = {
  loaded: true,
  doSomethingWithA() {
    const a = require('./a'); // Require khi cần, lúc này a.js đã load xong
    return a.name;
  },
};
```

**Cách 3: Dependency Injection**

```js
// a.js
class ServiceA {
  setServiceB(serviceB) {
    this.serviceB = serviceB;
  }

  doWork() {
    return this.serviceB.getData();
  }
}
module.exports = new ServiceA();

// b.js
class ServiceB {
  setServiceA(serviceA) {
    this.serviceA = serviceA;
  }

  getData() {
    return 'data from B';
  }
}
module.exports = new ServiceB();

// main.js - Wire dependencies
const serviceA = require('./a');
const serviceB = require('./b');
serviceA.setServiceB(serviceB);
serviceB.setServiceA(serviceA);
```
