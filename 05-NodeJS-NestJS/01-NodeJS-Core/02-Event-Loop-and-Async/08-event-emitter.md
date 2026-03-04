# 9. EventEmitter Pattern

EventEmitter la mot trong nhung pattern quan trong nhat trong Node.js. Nhieu module built-in (http, fs, stream) deu ke thua tu EventEmitter.

## 9.1. Co ban

```js
const EventEmitter = require('events');

// Tao emitter
const emitter = new EventEmitter();

// Dang ky listener (on = addListener)
emitter.on('greeting', (name) => {
  console.log(`Xin chao, ${name}!`);
});

emitter.on('greeting', (name) => {
  console.log(`Welcome, ${name}!`);
});

// Emit event
emitter.emit('greeting', 'Phong');
// Output:
// Xin chao, Phong!
// Welcome, Phong!
```

## 9.2. Cac method quan trong

```js
const emitter = new EventEmitter();

// on() - Dang ky listener (goi nhieu lan)
emitter.on('data', (msg) => console.log('on:', msg));

// once() - Listener chi chay MOT LAN
emitter.once('connect', () => console.log('Da ket noi (chi 1 lan)'));

emitter.emit('connect'); // Da ket noi (chi 1 lan)
emitter.emit('connect'); // Khong in gi (da bi go)

// prepend - Them listener vao DAU danh sach
emitter.prependListener('data', (msg) => console.log('prepend:', msg));

emitter.emit('data', 'test');
// prepend: test   ← chay truoc
// on: test

// off() / removeListener() - Go listener
function myListener(msg) {
  console.log('myListener:', msg);
}
emitter.on('event', myListener);
emitter.off('event', myListener); // Go

// removeAllListeners() - Go tat ca listener cua event
emitter.removeAllListeners('data');

// listenerCount() - Dem so listener
console.log(emitter.listenerCount('data')); // 0

// eventNames() - Lay danh sach event co listener
console.log(emitter.eventNames()); // ['event', ...]

// setMaxListeners() - Thay doi gioi han listener (mac dinh: 10)
emitter.setMaxListeners(20);
```

## 9.3. Error event

```js
const emitter = new EventEmitter();

// QUAN TRONG: Phai co listener cho event 'error'
// Neu khong, Node.js se throw exception va crash!
emitter.on('error', (err) => {
  console.error('Co loi xay ra:', err.message);
});

emitter.emit('error', new Error('Something went wrong'));
// Co loi xay ra: Something went wrong

// Neu KHONG co error listener:
// emitter.emit('error', new Error('No handler'));
// → Throw: Error: No handler → CRASH!
```

## 9.4. Ung dung thuc te: Order Processing System

```js
const EventEmitter = require('events');

class OrderSystem extends EventEmitter {
  constructor() {
    super();
    this.orders = [];
  }

  createOrder(orderData) {
    const order = {
      id: Date.now(),
      ...orderData,
      status: 'created',
      createdAt: new Date(),
    };

    this.orders.push(order);
    this.emit('order:created', order);
    return order;
  }

  processPayment(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      this.emit('error', new Error(`Order ${orderId} khong ton tai`));
      return;
    }

    // Gia lap xu ly thanh toan
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% thanh cong
        order.status = 'paid';
        this.emit('payment:success', order);
      } else {
        order.status = 'payment_failed';
        this.emit('payment:failed', order, new Error('Thanh toan that bai'));
      }
    }, 1000);
  }

  shipOrder(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = 'shipped';
    this.emit('order:shipped', order);
  }
}

// Su dung
const orderSystem = new OrderSystem();

// Dang ky cac handler
orderSystem.on('order:created', (order) => {
  console.log(`[Email] Don hang #${order.id} da duoc tao`);
  console.log(`  San pham: ${order.product}, So luong: ${order.quantity}`);
});

orderSystem.on('order:created', (order) => {
  console.log(`[Inventory] Dat truoc ${order.quantity} x ${order.product}`);
});

orderSystem.on('payment:success', (order) => {
  console.log(`[Payment] Don hang #${order.id} da thanh toan thanh cong`);
  orderSystem.shipOrder(order.id);
});

orderSystem.on('payment:failed', (order, err) => {
  console.error(`[Payment] Don hang #${order.id}: ${err.message}`);
});

orderSystem.on('order:shipped', (order) => {
  console.log(`[Shipping] Don hang #${order.id} da duoc gui di`);
});

orderSystem.on('error', (err) => {
  console.error('[System Error]', err.message);
});

// Test
const order = orderSystem.createOrder({
  product: 'iPhone 15',
  quantity: 2,
  totalAmount: 40000000,
});

orderSystem.processPayment(order.id);
```

## 9.5. Async Events voi once() tra ve Promise

```js
const { once } = require('events');
const { createReadStream } = require('fs');

// once() tra ve Promise trong Node.js 11.13+
async function waitForEvent() {
  const emitter = new EventEmitter();

  // Hen emit sau 2s
  setTimeout(() => emitter.emit('ready', 'data san sang'), 2000);

  // await event
  const [result] = await once(emitter, 'ready');
  console.log(result); // 'data san sang'
}

// Ung dung: Doi stream open
async function readFirstLine(filePath) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });

  // Doi stream san sang
  await once(stream, 'open');
  console.log('File da mo');

  // Doc du lieu
  const [chunk] = await once(stream, 'data');
  stream.destroy(); // Dong stream

  const firstLine = chunk.split('\n')[0];
  return firstLine;
}
```

---

# 10. Concurrency vs Parallelism

## Khai niem

```
=== CONCURRENCY (Dong thoi) ===
Nhieu task LUAN PHIEN nhau tren MOT CPU core.
Giong nhu 1 dau bep nau nhieu mon: dang cho nuoc soi thi di cat rau.

   Task A: ████░░░░████░░░░████
   Task B: ░░░░████░░░░████░░░░
   ──────────────────────────────→ Thoi gian
           1 CPU Core

=== PARALLELISM (Song song) ===
Nhieu task chay DONG THOI tren NHIEU CPU cores.
Giong nhu nhieu dau bep, moi nguoi nau 1 mon.

   Core 1: ████████████████████  Task A
   Core 2: ████████████████████  Task B
   Core 3: ████████████████████  Task C
   ──────────────────────────────→ Thoi gian
```

## Node.js va Concurrency

```js
// Node.js su dung CONCURRENCY cho I/O (single-threaded event loop)
// Va co the dung PARALLELISM cho CPU-intensive tasks (Worker Threads / Cluster)

// === Concurrency voi async I/O ===
const https = require('https');

async function fetchMultipleAPIs() {
  const start = Date.now();

  // 5 requests chay DONG THOI (concurrent) tren 1 thread
  const results = await Promise.all([
    fetch('https://api.example.com/users'),
    fetch('https://api.example.com/products'),
    fetch('https://api.example.com/orders'),
    fetch('https://api.example.com/categories'),
    fetch('https://api.example.com/reviews'),
  ]);

  console.log(`5 requests trong ${Date.now() - start}ms`);
  // Mac du chi 1 thread, 5 requests chay "song song" vi la I/O
  // Event loop khong block khi doi network response
}

// === Parallelism voi Worker Threads ===
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');

if (isMainThread) {
  // Main thread - tao workers
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }

  async function main() {
    const start = Date.now();

    // Chay 4 tinh toan SONG SONG tren 4 CPU cores
    const results = await Promise.all([
      runWorker({ start: 0, end: 25000000 }),
      runWorker({ start: 25000000, end: 50000000 }),
      runWorker({ start: 50000000, end: 75000000 }),
      runWorker({ start: 75000000, end: 100000000 }),
    ]);

    const total = results.reduce((sum, r) => sum + r, 0);
    console.log(`Tong: ${total}, Mat: ${Date.now() - start}ms`);
  }

  main();
} else {
  // Worker thread - tinh toan nang
  const { start, end } = workerData;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += i;
  }
  parentPort.postMessage(sum);
}
```

## Khi nao dung gi?

```
┌─────────────────────────────────────────────────────────────┐
│                   CHON CACH XU LY                           │
├────────────────────────┬────────────────────────────────────┤
│ I/O-bound tasks        │ → async/await + Promise.all       │
│ (DB, HTTP, File I/O)   │   (Concurrency - 1 thread)        │
├────────────────────────┼────────────────────────────────────┤
│ CPU-bound tasks        │ → Worker Threads                  │
│ (Crypto, Image process)│   (Parallelism - nhieu threads)   │
├────────────────────────┼────────────────────────────────────┤
│ Scale across CPUs      │ → Cluster module                  │
│ (HTTP server)          │   (Nhieu processes)                │
└────────────────────────┴────────────────────────────────────┘
```
