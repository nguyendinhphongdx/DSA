# Closures (Bao đóng)

## Closure là gì?

Closure là một hàm **"nhớ"** được các biến từ scope nơi nó được **tạo ra** (lexical scope), ngay cả khi hàm đó được thực thi ở một scope khác hoàn toàn.

Nói cách khác: khi một hàm được tạo bên trong hàm khác, hàm bên trong **giữ reference** đến các biến của hàm bên ngoài, kể cả sau khi hàm bên ngoài đã return.

---

## 1. Hiểu Closure qua ví dụ

### Ví dụ cơ bản

```js
function outer() {
  const message = 'Hello from outer!';

  function inner() {
    console.log(message); // inner "nhớ" biến message
  }

  return inner;
}

const myFunc = outer(); // outer() chạy xong, return inner
myFunc(); // 'Hello from outer!' — vẫn truy cập được message!
```

**Tại sao điều này đặc biệt?**

Thông thường, khi một hàm chạy xong, các biến cục bộ của nó sẽ bị xóa khỏi bộ nhớ. Nhưng ở đây, `outer()` đã chạy xong mà `message` vẫn tồn tại — vì `inner` vẫn **giữ reference** đến nó. JavaScript engine biết rằng `message` vẫn cần thiết nên **không** garbage collect nó.

### Closure với biến thay đổi

Closure giữ **reference** đến biến, không phải **copy giá trị**. Nếu biến thay đổi, closure sẽ thấy giá trị mới.

```js
function counter() {
  let count = 0; // Biến private

  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; },
  };
}

const c = counter();
c.increment();
c.increment();
c.increment();
c.decrement();
c.getCount(); // 2

// count không thể truy cập trực tiếp từ bên ngoài
// console.log(count); // ReferenceError
```

Ba method `increment`, `decrement`, `getCount` **cùng chia sẻ** một biến `count` — chúng là closure cùng scope.

---

## 2. Ứng dụng thực tế

### Data Privacy (Ẩn dữ liệu)

JavaScript không có `private` keyword (trước khi có `#privateField`). Closure là cách truyền thống để tạo dữ liệu private.

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private — không ai truy cập được từ ngoài
  const transactions = [];       // Private

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error('Amount must be positive');
      balance += amount;
      transactions.push({ type: 'deposit', amount, date: new Date() });
      return balance;
    },

    withdraw(amount) {
      if (amount > balance) throw new Error('Insufficient funds');
      balance -= amount;
      transactions.push({ type: 'withdraw', amount, date: new Date() });
      return balance;
    },

    getBalance() {
      return balance;
    },

    getStatement() {
      return [...transactions]; // Trả về copy, không phải reference
    },
  };
}

const account = createBankAccount(1000);
account.deposit(500);    // 1500
account.withdraw(200);   // 1300
account.getBalance();    // 1300
// account.balance;      // undefined — không thể truy cập trực tiếp
```

### Function Factory

Tạo các hàm chuyên biệt từ một hàm tổng quát.

```js
function createMultiplier(factor) {
  return (number) => number * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const toPercent = createMultiplier(100);

double(5);     // 10
triple(5);     // 15
toPercent(0.75); // 75

// Mỗi hàm "nhớ" factor riêng của nó
```

### Event Handlers

```js
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);
  let clickCount = 0;

  button.addEventListener('click', () => {
    clickCount++;
    console.log(`${message} (clicked ${clickCount} times)`);
    // Closure nhớ cả message và clickCount
  });
}

setupButton('btn1', 'Hello!');
setupButton('btn2', 'Goodbye!');
// Mỗi button có clickCount riêng biệt
```

### Debounce & Throttle

Closure là cốt lõi của debounce/throttle — giữ trạng thái `timer` giữa các lần gọi.

```js
function debounce(fn, delay) {
  let timer; // Closure giữ timer giữa các lần gọi

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);

// Gọi liên tục, nhưng chỉ thực thi lần cuối sau 300ms ngừng gọi
handleSearch('h');
handleSearch('he');
handleSearch('hel');
handleSearch('hell');
handleSearch('hello'); // Chỉ lần này được thực thi
```

---

## 3. Lỗi phổ biến với Closure

### Closure trong vòng lặp với var

Đây là **bài phỏng vấn kinh điển** về closure.

```js
// BUG: Tất cả đều in ra 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// Tại sao? Vì var là function-scoped, chỉ có MỘT biến i.
// Khi setTimeout callback chạy (sau 100ms), vòng lặp đã kết thúc, i = 3.
// Tất cả 3 closure cùng reference đến MỘT biến i (= 3).
```

**Fix 1: Dùng let** (đơn giản nhất)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
// let tạo biến MỚI cho mỗi iteration → mỗi closure giữ biến riêng
```

**Fix 2: Dùng IIFE** (cách cũ, khi chưa có let)

```js
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// IIFE tạo scope mới, copy giá trị i vào j cho mỗi iteration
```

### Memory Leak từ Closure

Closure giữ reference đến scope bên ngoài → biến không được GC. Nếu closure tồn tại lâu và giữ reference đến object lớn → memory leak.

```js
// Có thể gây memory leak
function processData() {
  const hugeData = new Array(1000000).fill('x'); // 1 triệu items

  return function summary() {
    return hugeData.length; // Closure giữ reference đến hugeData
  };
}

// Fix: chỉ giữ những gì cần
function processData() {
  const hugeData = new Array(1000000).fill('x');
  const length = hugeData.length; // Chỉ lưu giá trị cần thiết

  return function summary() {
    return length; // Không giữ reference đến hugeData
  };
}
```

---

## 4. Closure vs Block Scope

Với `let`/`const`, bạn có thể đạt được một số hiệu ứng tương tự closure mà không cần hàm lồng nhau:

```js
// Block scope (đơn giản hơn cho nhiều trường hợp)
{
  let privateVar = 'secret';
  // chỉ truy cập được trong block này
}

// Closure (mạnh hơn — tạo được interface)
function createModule() {
  let privateVar = 'secret';
  return {
    getSecret: () => privateVar,
    setSecret: (val) => { privateVar = val; },
  };
}
```

Closure vẫn cần thiết khi bạn muốn **expose một API** để tương tác với dữ liệu private — block scope chỉ **ẩn** dữ liệu mà không tạo ra cách truy cập có kiểm soát.
