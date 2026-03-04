# 03 - Functions Advanced

## 1. Closures (Bao đóng)

Closure là hàm có thể truy cập biến từ scope bên ngoài, ngay cả khi hàm bên ngoài đã return.

```js
function counter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const c = counter();
c.increment(); // 1
c.increment(); // 2
c.getCount();  // 2
```

### Ứng dụng
```js
// Data privacy
function createUser(name) {
  let _password = '';
  return {
    setPassword(pwd) { _password = pwd; },
    login(pwd) { return pwd === _password; },
    getName() { return name; },
  };
}

// Function factory
function multiply(factor) {
  return (number) => number * factor;
}
const double = multiply(2);
const triple = multiply(3);
```

### Lỗi phổ biến với closure
```js
// Vấn đề với var trong loop
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// Fix: dùng let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}

// Fix: dùng IIFE
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i); // 0, 1, 2
}
```

## 2. Higher-Order Functions

Hàm nhận hàm làm tham số hoặc trả về hàm.

```js
// Nhận hàm làm tham số
function applyOperation(arr, operation) {
  return arr.map(operation);
}
applyOperation([1, 2, 3], x => x * 2); // [2, 4, 6]

// Trả về hàm
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}
```

## 3. this keyword

```js
// Trong object method: this = object chứa method
const obj = {
  name: 'Phong',
  greet() { return this.name; }, // 'Phong'
};

// Arrow function: this từ scope bên ngoài (lexical this)
const obj2 = {
  name: 'Phong',
  greet: () => this.name, // undefined (this = global/window)
};

// call, apply, bind
function greet(greeting) { return `${greeting}, ${this.name}`; }
greet.call(obj, 'Hi');       // 'Hi, Phong'
greet.apply(obj, ['Hi']);    // 'Hi, Phong'
const bound = greet.bind(obj);
bound('Hi');                  // 'Hi, Phong'
```

## 4. Currying & Partial Application

```js
// Currying: f(a, b, c) → f(a)(b)(c)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3);    // 6
add(1, 2)(3);    // 6
add(1)(2, 3);    // 6

// Partial Application
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}
const addTen = partial(add, 10);
addTen(5); // 15
```

## 5. Memoization

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
fibonacci(50); // Tính rất nhanh nhờ cache
```

## 6. IIFE (Immediately Invoked Function Expression)

```js
// Tạo scope riêng, tránh ô nhiễm global
(function() {
  const privateVar = 'secret';
  // code here
})();

// Với arrow function
(() => {
  // code here
})();

// Module pattern
const module = (function() {
  let _private = 0;
  return {
    increment() { _private++; },
    getValue() { return _private; },
  };
})();
```
