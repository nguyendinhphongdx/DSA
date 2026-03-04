# Event Loop

## Tại sao cần Event Loop?

JavaScript là ngôn ngữ **single-threaded** — chỉ có **một luồng** thực thi code. Điều này có nghĩa tại bất kỳ thời điểm nào, chỉ có **một đoạn code** đang chạy.

Nhưng web apps cần xử lý nhiều tác vụ đồng thời: fetch API, đọc file, setTimeout, user interactions... Nếu phải chờ từng tác vụ hoàn thành mới làm tiếp → app bị **đóng băng** (blocking).

**Event Loop** là cơ chế cho phép JS xử lý **bất đồng bộ** mà chỉ dùng **một luồng** — bằng cách **ủy quyền** tác vụ nặng cho môi trường (browser/Node.js) và xử lý kết quả khi sẵn sàng.

---

## 1. Kiến trúc Runtime

```
┌───────────────────────────────────────────┐
│                  JS Engine                 │
│  ┌─────────────┐  ┌────────────────────┐  │
│  │  Call Stack  │  │    Memory Heap     │  │
│  │             │  │   (lưu objects)    │  │
│  │  ┌───────┐  │  │                    │  │
│  │  │ fn()  │  │  │                    │  │
│  │  ├───────┤  │  │                    │  │
│  │  │ main  │  │  │                    │  │
│  │  └───────┘  │  └────────────────────┘  │
│  └─────────────┘                           │
└───────────────────────────────────────────┘
         ↕                    ↕
┌────────────────────────────────────────────┐
│        Web APIs / Node.js APIs             │
│  setTimeout, fetch, DOM events, I/O...     │
└────────────────────────────────────────────┘
         ↓                    ↓
┌────────────────────┐ ┌─────────────────────┐
│  Microtask Queue   │ │  Macrotask Queue    │
│  (ưu tiên CAO)     │ │  (ưu tiên THẤP)    │
│                    │ │                     │
│  • Promise.then()  │ │  • setTimeout()     │
│  • queueMicrotask()│ │  • setInterval()    │
│  • MutationObserver│ │  • I/O callbacks    │
│                    │ │  • UI rendering     │
└────────────────────┘ └─────────────────────┘
         ↑                    ↑
         └────── Event Loop ──┘
              (kiểm tra liên tục)
```

---

## 2. Các thành phần

### Call Stack

Nơi JS engine thực thi code. Hoạt động theo **LIFO** (Last In, First Out). Mỗi lần gọi hàm → push frame lên stack. Hàm return → pop frame ra.

```js
function multiply(a, b) { return a * b; }
function square(n) { return multiply(n, n); }
function printSquare(n) { console.log(square(n)); }

printSquare(5);
```

```
Stack:
1. [printSquare(5)]
2. [printSquare(5), square(5)]
3. [printSquare(5), square(5), multiply(5,5)]
4. [printSquare(5), square(5)]  ← multiply returns 25
5. [printSquare(5)]              ← square returns 25
6. [printSquare(5), console.log(25)]
7. [printSquare(5)]              ← console.log done
8. []                            ← printSquare done
```

### Web APIs / Node.js APIs

Các tác vụ bất đồng bộ **không chạy trên call stack** — chúng được ủy quyền cho môi trường:
- Browser: Web APIs (setTimeout, fetch, DOM events, XMLHttpRequest...)
- Node.js: libuv (file I/O, network, timers...)

### Task Queues

Khi tác vụ async hoàn thành, callback được đẩy vào **queue** (hàng đợi). Event Loop kiểm tra queue và đưa callback vào Call Stack khi stack rỗng.

---

## 3. Microtask vs Macrotask

Đây là điểm **quan trọng nhất** cần hiểu. Event Loop có 2 loại queue với **độ ưu tiên khác nhau**.

### Microtask Queue (ưu tiên CAO)
- `Promise.then()`, `.catch()`, `.finally()`
- `queueMicrotask()`
- `MutationObserver`
- `process.nextTick()` (Node.js)

### Macrotask Queue (ưu tiên THẤP)
- `setTimeout()` / `setInterval()`
- `setImmediate()` (Node.js)
- I/O callbacks
- UI rendering events

### Quy tắc Event Loop

1. Thực thi **tất cả code đồng bộ** trên Call Stack
2. Call Stack rỗng → xử lý **TẤT CẢ microtasks** (cho đến khi microtask queue rỗng)
3. Xử lý **MỘT macrotask**
4. Quay lại bước 2

**Microtask luôn được xử lý trước macrotask tiếp theo.**

---

## 4. Ví dụ từng bước

### Ví dụ 1: Cơ bản

```js
console.log('1');                          // Sync

setTimeout(() => console.log('2'), 0);     // Macrotask

Promise.resolve().then(() => console.log('3')); // Microtask

console.log('4');                          // Sync
```

**Phân tích:**
1. `console.log('1')` → Sync → in `1`
2. `setTimeout` → đăng ký macrotask → chờ
3. `Promise.then` → đăng ký microtask → chờ
4. `console.log('4')` → Sync → in `4`
5. Call Stack rỗng → xử lý microtask → in `3`
6. Xử lý macrotask → in `2`

**Output: `1, 4, 3, 2`**

### Ví dụ 2: Microtask lồng nhau

```js
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => console.log('Promise inside timeout'));
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
  queueMicrotask(() => console.log('Microtask inside promise'));
});

setTimeout(() => console.log('Timeout 2'), 0);

console.log('End');
```

**Output:**
```
Start
End
Promise 1
Microtask inside promise
Timeout 1
Promise inside timeout
Timeout 2
```

**Giải thích:**
1. Sync: `Start`, `End`
2. Microtask queue: `Promise 1` → tạo thêm microtask → `Microtask inside promise`
3. Macrotask 1: `Timeout 1` → tạo microtask → xử lý ngay: `Promise inside timeout`
4. Macrotask 2: `Timeout 2`

### Ví dụ 3: async/await

```js
async function foo() {
  console.log('foo start');
  await bar();                    // Tạm dừng foo, phần sau thành microtask
  console.log('foo end');          // Microtask!
}

async function bar() {
  console.log('bar');
}

console.log('script start');
foo();
console.log('script end');
```

**Output:**
```
script start
foo start
bar
script end
foo end
```

`await` hoạt động giống `Promise.then` — code sau `await` trở thành microtask.

---

## 5. setTimeout(fn, 0) không phải "chạy ngay"

`setTimeout(fn, 0)` có nghĩa: đặt callback vào **macrotask queue** sau tối thiểu 0ms. Nhưng nó vẫn phải **chờ**:
1. Call Stack rỗng
2. Tất cả microtasks hoàn thành

```js
const start = Date.now();

setTimeout(() => {
  console.log(`Timeout after ${Date.now() - start}ms`);
}, 0);

// Blocking sync code
for (let i = 0; i < 1000000000; i++) {} // Mất ~1 giây

// Output: "Timeout after ~1000ms" — KHÔNG phải 0ms!
```

---

## 6. Blocking vs Non-Blocking

### Blocking (Đồng bộ — chặn Call Stack)

```js
// ❌ Đóng băng UI
const data = fs.readFileSync('huge-file.txt'); // Chờ đến khi đọc xong
// Trong khi chờ: KHÔNG xử lý click, scroll, render...
```

### Non-Blocking (Bất đồng bộ — không chặn)

```js
// ✅ UI vẫn responsive
fs.readFile('huge-file.txt', (err, data) => {
  // Xử lý khi đọc xong
});
// Code tiếp tục chạy, không phải chờ
```

---

## 7. Tóm tắt

| Khái niệm | Vai trò |
|-----------|---------|
| Call Stack | Thực thi code đồng bộ (LIFO) |
| Web APIs | Xử lý tác vụ async (timer, network, DOM) |
| Microtask Queue | Promise callbacks, queueMicrotask (ưu tiên cao) |
| Macrotask Queue | setTimeout, setInterval, I/O (ưu tiên thấp) |
| Event Loop | Điều phối: stack rỗng → micro → 1 macro → lặp lại |
