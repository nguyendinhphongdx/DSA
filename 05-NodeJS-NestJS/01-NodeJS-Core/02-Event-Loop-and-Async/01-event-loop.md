# 1. Tong quan ve Non-blocking I/O

## Tai sao Node.js dung single thread?

Node.js chay tren **mot thread duy nhat** (main thread) de xu ly JavaScript code. Thay vi tao thread moi cho moi request (nhu Java, PHP truyen thong), Node.js su dung mo hinh **event-driven, non-blocking I/O**.

```
=== Mo hinh truyen thong (Multi-threaded) ===

Request 1 ──→ Thread 1 ──→ Doc DB (3s) ──→ Tra ve
Request 2 ──→ Thread 2 ──→ Doc file (2s) ──→ Tra ve
Request 3 ──→ Thread 3 ──→ Goi API (5s) ──→ Tra ve
→ Can 3 threads, moi thread block khi cho I/O

=== Mo hinh Node.js (Single-threaded + Event Loop) ===

Request 1 ──→ Main Thread: Gui lenh doc DB ──→ Tiep tuc nhan request khac
Request 2 ──→ Main Thread: Gui lenh doc file ──→ Tiep tuc nhan request khac
Request 3 ──→ Main Thread: Gui lenh goi API ──→ Tiep tuc nhan request khac

DB tra loi    ──→ Callback xu ly Request 1
File san sang ──→ Callback xu ly Request 2
API tra loi   ──→ Callback xu ly Request 3
→ Chi 1 thread, khong bao gio block
```

## Blocking vs Non-blocking

```js
// === BLOCKING (dong bo) ===
const fs = require('fs');

console.log('Bat dau');
const data = fs.readFileSync('/file-lon.txt', 'utf8'); // BLOCK o day cho den khi doc xong
console.log('Doc xong file'); // Chi chay SAU khi doc xong
console.log('Ket thuc');
// Output: Bat dau → Doc xong file → Ket thuc

// === NON-BLOCKING (bat dong bo) ===
console.log('Bat dau');
fs.readFile('/file-lon.txt', 'utf8', (err, data) => {
  console.log('Doc xong file'); // Chay khi file doc xong (callback)
});
console.log('Ket thuc'); // Chay NGAY LAP TUC, khong doi
// Output: Bat dau → Ket thuc → Doc xong file
```

---

# 2. Event Loop chi tiet

## Event Loop la gi?

Event Loop la co che cho phep Node.js thuc hien cac thao tac I/O bat dong bo mac du JavaScript chi co mot thread. No lien tuc kiem tra xem co callback nao can thuc thi hay khong.

## Cac phase (giai doan) cua Event Loop

```
   ┌───────────────────────────┐
┌─→│         timers             │  ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks      │  ← I/O callbacks bi hoan lai (system errors)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare        │  ← Su dung noi bo boi Node.js
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll             │  ← Lay I/O events moi, thuc thi I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check            │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──│      close callbacks       │  ← socket.on('close', ...) callbacks
   └───────────────────────────┘
```

## Chi tiet tung phase

### Phase 1: Timers

Thuc thi callback cua `setTimeout()` va `setInterval()` khi thoi gian da het.

```js
// setTimeout - thuc thi SAU it nhat N milliseconds
setTimeout(() => {
  console.log('Timer 1: sau 100ms');
}, 100);

setTimeout(() => {
  console.log('Timer 2: sau 0ms');
}, 0);

// Luu y: setTimeout(fn, 0) KHONG co nghia la thuc thi ngay lap tuc
// No van phai doi den phase timers cua Event Loop
```

**Luu y quan trong:** Thoi gian trong `setTimeout` la thoi gian **toi thieu**, khong phai chinh xac. Neu main thread dang ban, callback se bi tre.

```js
// Minh hoa do tre cua setTimeout
const start = Date.now();

setTimeout(() => {
  const delay = Date.now() - start;
  console.log(`setTimeout(100) thuc te: ${delay}ms`); // Co the > 100ms
}, 100);

// Gia lap main thread ban 200ms
let i = 0;
while (Date.now() - start < 200) {
  i++; // Block main thread 200ms
}
console.log(`Vong lap chay ${i} lan`);
// Output:
// Vong lap chay XXXXX lan
// setTimeout(100) thuc te: ~200ms (bi tre vi main thread bi block)
```

### Phase 2: Pending Callbacks

Thuc thi cac I/O callback bi hoan tu vong lap truoc (vd: loi TCP, ECONNREFUSED).

### Phase 3: Idle, Prepare

Su dung noi bo boi Node.js. Lap trinh vien khong tuong tac truc tiep voi phase nay.

### Phase 4: Poll

Day la phase **quan trong nhat**. No thuc hien hai viec:

1. Tinh thoi gian can block va cho I/O
2. Xu ly cac events trong poll queue

```js
// Khi event loop den phase poll:
// 1. Neu poll queue KHONG rong: thuc thi tung callback cho den khi het
// 2. Neu poll queue rong:
//    a. Neu co setImmediate() → chuyen sang phase check
//    b. Neu khong → doi tai day cho callbacks moi (I/O)
//    c. Kiem tra xem co timer nao het han → quay lai phase timers
```

### Phase 5: Check

Thuc thi callback cua `setImmediate()`.

```js
setImmediate(() => {
  console.log('setImmediate callback');
});
```

### Phase 6: Close Callbacks

Thuc thi callback close, vi du `socket.on('close', callback)`.

```js
const net = require('net');
const server = net.createServer();

server.on('close', () => {
  console.log('Server da dong'); // Chay trong phase close callbacks
});
```

## Minh hoa thu tu thuc thi

```js
console.log('1. Synchronous - bat dau');

setTimeout(() => {
  console.log('5. setTimeout (timers phase)');
}, 0);

setImmediate(() => {
  console.log('6. setImmediate (check phase)');
});

Promise.resolve().then(() => {
  console.log('3. Promise.then (microtask)');
});

process.nextTick(() => {
  console.log('2. process.nextTick (microtask - uu tien cao nhat)');
});

console.log('4. Synchronous - ket thuc');

// Output (dam bao):
// 1. Synchronous - bat dau
// 4. Synchronous - ket thuc
// 2. process.nextTick (microtask - uu tien cao nhat)
// 3. Promise.then (microtask)
// 5. setTimeout (timers phase) hoac 6
// 6. setImmediate (check phase) hoac 5
// (Thu tu 5 va 6 khong dam bao khi o main module)
```
