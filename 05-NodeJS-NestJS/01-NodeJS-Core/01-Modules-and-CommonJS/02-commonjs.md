# 2. CommonJS (CJS)

CommonJS là hệ thống module **mặc định** của Node.js, được sử dụng từ những ngày đầu.

## 2.1. module.exports

`module.exports` là object mặc định mà một module trả về khi được `require()`.

```js
// math.js - Export một object chứa nhiều hàm
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) throw new Error('Không thể chia cho 0');
  return a / b;
}

// Cách 1: Gán object cho module.exports
module.exports = {
  add,
  subtract,
  multiply,
  divide,
};
```

```js
// Cách 2: Export từng property một
module.exports.add = function (a, b) {
  return a + b;
};

module.exports.subtract = function (a, b) {
  return a - b;
};
```

```js
// Cách 3: Export một giá trị duy nhất (class, function, ...)
// logger.js
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  log(message) {
    console.log(`[${this.prefix}] ${new Date().toISOString()} - ${message}`);
  }

  error(message) {
    console.error(`[${this.prefix}] ERROR: ${message}`);
  }

  warn(message) {
    console.warn(`[${this.prefix}] WARN: ${message}`);
  }
}

module.exports = Logger; // Export class trực tiếp
```

## 2.2. exports (shorthand)

`exports` là **tham chiếu (reference)** đến `module.exports`. Ban đầu, `exports === module.exports` là `true`.

```js
// user.js - Dùng exports shorthand
exports.createUser = function (name, email) {
  return { id: Date.now(), name, email, createdAt: new Date() };
};

exports.validateEmail = function (email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

exports.DEFAULT_ROLE = 'user';
```

### Cạm bẫy với exports

```js
// SAI - Gán trực tiếp cho exports sẽ phá vỡ tham chiếu
exports = {
  add: (a, b) => a + b,
};
// Lúc này exports không còn trỏ đến module.exports nữa
// require() sẽ nhận được {} (object rỗng)

// ĐÚNG - Phải dùng module.exports khi muốn gán lại toàn bộ
module.exports = {
  add: (a, b) => a + b,
};
```

**Giải thích cơ chế:**

```js
// Node.js wrap mỗi module trong một function như sau:
(function (exports, require, module, __filename, __dirname) {
  // Code của module nằm ở đây
  // exports ban đầu = module.exports = {}
  // Khi bạn gán: exports = {...}
  //   => chỉ thay đổi biến local exports, module.exports vẫn là {}
  // Khi bạn gán: module.exports = {...}
  //   => thay đổi chính object mà require() trả về
});
```

## 2.3. require()

```js
// app.js
// Require module tự viết (đường dẫn tương đối)
const math = require('./math');
const Logger = require('./logger');
const { createUser, validateEmail } = require('./user'); // Destructuring

// Require built-in module (không cần đường dẫn)
const fs = require('fs');
const path = require('path');

// Require module từ node_modules (không cần đường dẫn)
const express = require('express');

// Sử dụng
console.log(math.add(2, 3)); // 5
console.log(math.multiply(4, 5)); // 20

const logger = new Logger('APP');
logger.log('Ứng dụng đã khởi động');

const user = createUser('Phong', 'phong@example.com');
console.log(user);
console.log(validateEmail('phong@example.com')); // true
```

## 2.4. Module Caching

Node.js **cache module sau lần require đầu tiên**. Các lần require sau sẽ nhận được cùng một object (singleton pattern).

```js
// counter.js
let count = 0;

module.exports = {
  increment() {
    count++;
  },
  getCount() {
    return count;
  },
};
```

```js
// fileA.js
const counter = require('./counter');
counter.increment();
counter.increment();
console.log('File A - count:', counter.getCount()); // 2
```

```js
// fileB.js
const counter = require('./counter');
console.log('File B - count:', counter.getCount()); // 2 (không phải 0!)
// Vì counter.js đã được cache từ lần require ở fileA
```

```js
// main.js
require('./fileA'); // count = 2
require('./fileB'); // count vẫn = 2 (cùng một instance)

// Kiểm tra cache
console.log(require.cache);
// {
//   '/path/to/counter.js': Module { ... },
//   '/path/to/fileA.js': Module { ... },
//   '/path/to/fileB.js': Module { ... },
// }

// Xóa cache (dùng trong testing hoặc hot-reload)
delete require.cache[require.resolve('./counter')];
const freshCounter = require('./counter');
console.log(freshCounter.getCount()); // 0 (instance mới)
```

## 2.5. Conditional require

Một ưu điểm của CommonJS là có thể require có điều kiện (dynamic):

```js
// Require theo điều kiện
if (process.env.NODE_ENV === 'development') {
  const devTools = require('./dev-tools');
  devTools.enableDebugMode();
}

// Require trong try/catch (xử lý module không tồn tại)
let optionalModule;
try {
  optionalModule = require('optional-dependency');
} catch (err) {
  console.warn('optional-dependency chưa được cài đặt, bỏ qua.');
  optionalModule = null;
}

// Require trong function (lazy loading)
function processImage(imagePath) {
  const sharp = require('sharp'); // Chỉ load khi cần
  return sharp(imagePath).resize(200, 200).toBuffer();
}
```
