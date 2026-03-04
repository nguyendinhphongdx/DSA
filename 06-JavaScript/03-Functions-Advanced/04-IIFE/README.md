# IIFE (Immediately Invoked Function Expression)

## IIFE là gì?

IIFE (đọc là "iffy") là một hàm được **định nghĩa và gọi ngay lập tức**, không cần lưu vào biến hay đặt tên. Tên đầy đủ: **Immediately Invoked Function Expression** — Biểu thức hàm được gọi ngay.

```js
// Cú pháp cơ bản
(function() {
  console.log('Chạy ngay lập tức!');
})();

// Arrow function IIFE
(() => {
  console.log('Arrow IIFE!');
})();

// Có tham số
((name) => {
  console.log(`Hello, ${name}!`);
})('Phong');
```

**Tại sao cần dấu ngoặc bọc?**

Nếu không có dấu ngoặc `()` bọc ngoài, JavaScript sẽ hiểu `function` là **function declaration** (không phải expression) và sẽ báo lỗi cú pháp vì declaration cần có tên.

```js
// ❌ SyntaxError
// function() { console.log('hello'); }();

// ✅ Bọc trong () biến nó thành expression
(function() { console.log('hello'); })();
```

---

## 1. Mục đích chính: Tạo Scope riêng

Trước ES6 (chưa có `let`/`const` và modules), IIFE là cách **duy nhất** để tạo scope riêng biệt, tránh ô nhiễm global scope.

```js
// Không có IIFE: biến lọt vào global
var count = 0;       // Global
var name = 'Phong';  // Global — có thể xung đột với code khác!

// Có IIFE: biến bị giới hạn trong IIFE scope
(function() {
  var count = 0;       // Local
  var name = 'Phong';  // Local — không ảnh hưởng global
  // ... code
})();

// console.log(count); // ReferenceError (nếu không có var count ở global)
```

---

## 2. Module Pattern

Trước khi có ES6 modules (`import`/`export`), IIFE + closure là cách tiêu chuẩn để tạo **module** với data private.

```js
const Calculator = (function() {
  // Private variables & functions
  let history = [];

  function addToHistory(operation) {
    history.push({ ...operation, timestamp: Date.now() });
  }

  // Public API (returned object)
  return {
    add(a, b) {
      const result = a + b;
      addToHistory({ type: 'add', a, b, result });
      return result;
    },

    subtract(a, b) {
      const result = a - b;
      addToHistory({ type: 'subtract', a, b, result });
      return result;
    },

    getHistory() {
      return [...history]; // Trả về copy, không lộ reference
    },

    clearHistory() {
      history = [];
    },
  };
})();

Calculator.add(5, 3);        // 8
Calculator.subtract(10, 4);  // 6
Calculator.getHistory();     // [{type:'add',...}, {type:'subtract',...}]
// Calculator.history;       // undefined — private!
// Calculator.addToHistory;  // undefined — private!
```

---

## 3. Các use cases khác

### Tránh xung đột thư viện

Khi nhiều thư viện dùng cùng tên biến global (ví dụ `$` của jQuery):

```js
(function($) {
  // Trong đây, $ chắc chắn là jQuery
  // Không bị xung đột với thư viện khác cũng dùng $
  $('.button').click(function() { /* ... */ });
})(jQuery);
```

### Khởi tạo một lần

```js
const config = (function() {
  // Logic khởi tạo phức tạp, chỉ chạy 1 lần
  const env = process.env.NODE_ENV || 'development';
  const apiBase = env === 'production' ? 'https://api.example.com' : 'http://localhost:3000';

  return Object.freeze({
    env,
    apiBase,
    debug: env !== 'production',
  });
})();

// config đã sẵn sàng, logic khởi tạo không lặp lại
```

### Async IIFE

Trước khi có top-level await (ES2022), IIFE là cách dùng `await` ở top level:

```js
(async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
})();
```

---

## 4. IIFE trong thời hiện đại

Với ES6+ (`let`, `const`, block scope, modules), IIFE **ít cần thiết hơn** nhưng vẫn hữu ích:

| Nhu cầu | Trước ES6 | Sau ES6 |
|---------|----------|---------|
| Scope riêng | IIFE | `{ let/const }` block scope |
| Module | IIFE + closure | `import`/`export` |
| Private data | IIFE | `#privateField` |
| Top-level await | async IIFE | Top-level await |
| Tránh xung đột | IIFE wrapper | ES modules |

**Khi nào vẫn dùng IIFE:**
- Trong code legacy (ES5)
- Khi cần chạy async code ở top level mà không có ES modules
- Inline initialization phức tạp
- Scripts chạy trực tiếp trong browser (không qua bundler)
