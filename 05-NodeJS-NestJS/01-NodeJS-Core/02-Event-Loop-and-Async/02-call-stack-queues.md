# 3. Call Stack, Web APIs, Callback Queue, Microtask Queue

## Call Stack

Call Stack la co cau du lieu LIFO (Last In, First Out) luu tru cac function dang duoc thuc thi.

```js
function multiply(a, b) {
  return a * b; // 3. multiply() duoc push vao stack, thuc thi, pop ra
}

function square(n) {
  return multiply(n, n); // 2. square() duoc push vao stack
}

function printSquare(n) {
  const result = square(n); // 1. printSquare() duoc push vao stack
  console.log(result);
}

printSquare(5);

// Call Stack visualization:
// Buoc 1: [printSquare]
// Buoc 2: [printSquare, square]
// Buoc 3: [printSquare, square, multiply]
// Buoc 4: [printSquare, square]          ← multiply() return, pop
// Buoc 5: [printSquare]                  ← square() return, pop
// Buoc 6: [printSquare, console.log]
// Buoc 7: [printSquare]                  ← console.log() xong, pop
// Buoc 8: []                             ← printSquare() xong, pop
```

## Callback Queue (Task Queue / Macrotask Queue)

Chua cac callback tu: setTimeout, setInterval, setImmediate, I/O operations.

## Microtask Queue

Co **do uu tien cao hon** Callback Queue. Chua cac callback tu: `Promise.then/catch/finally`, `process.nextTick`, `queueMicrotask`.

**Thu tu xu ly:** Sau moi macrotask (hoac khi Call Stack trong), Event Loop xu ly **TAT CA** microtasks truoc khi chuyen sang macrotask tiep theo.

```js
// Minh hoa do uu tien

console.log('Script bat dau'); // 1. Synchronous

setTimeout(() => console.log('setTimeout 1'), 0); // Macrotask queue
setTimeout(() => console.log('setTimeout 2'), 0); // Macrotask queue

Promise.resolve()
  .then(() => {
    console.log('Promise 1'); // Microtask queue
    // Them microtask trong microtask
    Promise.resolve().then(() => console.log('Promise nesting'));
  })
  .then(() => console.log('Promise 2')); // Microtask queue

process.nextTick(() => console.log('nextTick 1')); // Microtask (uu tien nhat)
process.nextTick(() => console.log('nextTick 2')); // Microtask (uu tien nhat)

queueMicrotask(() => console.log('queueMicrotask 1')); // Microtask

console.log('Script ket thuc'); // 2. Synchronous

// Output:
// Script bat dau
// Script ket thuc
// nextTick 1                ← process.nextTick uu tien trong microtask
// nextTick 2
// Promise 1                 ← Promise microtask
// queueMicrotask 1          ← queueMicrotask
// Promise nesting           ← Microtask sinh ra trong microtask cung duoc xu ly
// Promise 2
// setTimeout 1              ← Macrotask (chi sau khi het microtask)
// setTimeout 2
```

## Visualization day du

```
                        Node.js Runtime
┌──────────────────────────────────────────────────┐
│                                                  │
│   ┌──────────────┐    ┌────────────────────────┐ │
│   │  Call Stack   │    │    Node.js APIs        │ │
│   │              │    │  (libuv thread pool)   │ │
│   │  function()  │───→│                        │ │
│   │  function()  │    │  - fs operations       │ │
│   │  main()      │    │  - network I/O         │ │
│   └──────────────┘    │  - timers              │ │
│         ↑              │  - crypto              │ │
│         │              └──────────┬─────────────┘ │
│         │                         │               │
│         │              ┌──────────↓─────────────┐ │
│         │              │   Microtask Queue       │ │
│         │ XU LY        │  [nextTick] [Promise]   │ │
│         │ TRUOC        └──────────┬──────────────┘ │
│         │                         │               │
│         │              ┌──────────↓─────────────┐ │
│         │              │   Macrotask Queue       │ │
│         └──────────────│ [setTimeout][I/O][...]  │ │
│              XU LY SAU └─────────────────────────┘ │
│                                                  │
│         ◄──── EVENT LOOP (kiem tra lien tuc) ────►│
└──────────────────────────────────────────────────┘
```
