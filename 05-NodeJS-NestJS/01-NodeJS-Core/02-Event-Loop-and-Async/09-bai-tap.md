# 11. Cac loi thuong gap

## Loi 1: Khong xu ly Promise rejection

```js
// SAI - Promise rejection khong duoc catch
async function loadData() {
  const data = await fetchData(); // Neu loi → UnhandledPromiseRejection
  return data;
}
loadData(); // Khong .catch()!

// DUNG
loadData().catch((err) => console.error(err));
// hoac
try {
  await loadData();
} catch (err) {
  console.error(err);
}
```

## Loi 2: Tao Promise khong can thiet

```js
// SAI - Promise constructor anti-pattern
function getData() {
  return new Promise((resolve, reject) => {
    fetchData()
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

// DUNG - tra ve Promise truc tiep
function getData() {
  return fetchData();
}
```

## Loi 3: await trong vong lap khong can thiet

```js
// SAI - chay tuan tu (cham)
async function processItems(items) {
  for (const item of items) {
    await processItem(item); // Doi tung cai mot
  }
}

// DUNG - chay song song (nhanh) khi cac item doc lap
async function processItems(items) {
  await Promise.all(items.map((item) => processItem(item)));
}
```

## Loi 4: Block Event Loop

```js
// SAI - tinh toan nang tren main thread
app.get('/heavy', (req, res) => {
  // BLOCK Event Loop, moi request khac phai doi!
  let result = 0;
  for (let i = 0; i < 10000000000; i++) {
    result += i;
  }
  res.json({ result });
});

// DUNG - chuyen sang Worker Thread
app.get('/heavy', async (req, res) => {
  const result = await runInWorker(heavyComputation);
  res.json({ result });
});
```

## Loi 5: Quen await

```js
// SAI - quen await → nhan duoc Promise thay vi gia tri
async function getUser() {
  const user = fetchUser(1); // Thieu await!
  console.log(user); // Promise { <pending> }
  console.log(user.name); // undefined
}

// DUNG
async function getUser() {
  const user = await fetchUser(1);
  console.log(user); // { id: 1, name: 'Phong' }
  console.log(user.name); // 'Phong'
}
```

---

# 12. Bai tap

## Bai tap 1: Hieu Event Loop

Hay du doan output cua doan code sau (khong chay code, suy nghi truoc):

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => {
  console.log('3');
  setTimeout(() => console.log('4'), 0);
  Promise.resolve().then(() => console.log('5'));
});

setImmediate(() => console.log('6'));

process.nextTick(() => {
  console.log('7');
  process.nextTick(() => console.log('8'));
});

console.log('9');
```

Sau khi suy nghi, chay code de kiem tra ket qua.

## Bai tap 2: Viet ham fetchWithRetry

Viet mot ham `fetchWithRetry(url, options)` voi cac yeu cau:
- Retry toi da N lan (mac dinh 3)
- Exponential backoff (1s, 2s, 4s, ...)
- Timeout cho moi request (mac dinh 5s)
- Tra ve ket qua khi thanh cong, throw loi khi het retry
- Log trang thai moi lan retry

## Bai tap 3: Task Queue voi gioi han dong thoi

Viet class `TaskQueue` cho phep:
- Them task (async function) vao queue
- Gioi han so task chay dong thoi (concurrency limit)
- Event: `task:start`, `task:complete`, `task:error`, `queue:empty`

```js
const queue = new TaskQueue({ concurrency: 3 });

queue.on('task:complete', (result) => console.log('Done:', result));
queue.on('queue:empty', () => console.log('Tat ca task da xong'));

// Them 10 tasks nhung chi chay 3 cai mot luc
for (let i = 0; i < 10; i++) {
  queue.add(async () => {
    await delay(1000);
    return `Task ${i} hoan thanh`;
  });
}
```

## Bai tap 4: EventEmitter - Chat Room

Xay dung mot he thong Chat Room don gian su dung EventEmitter:
- Class `ChatRoom` ke thua EventEmitter
- Methods: join(username), leave(username), sendMessage(username, message)
- Events: `user:joined`, `user:left`, `message`, `error`
- Luu tru lich su tin nhan
- Gioi han so nguoi toi da trong phong

## Bai tap 5: Promise Pool

Viet ham `promisePool(tasks, poolSize)`:
- Nhan vao mang cac async functions va kich thuoc pool
- Chay toi da `poolSize` tasks dong thoi
- Khi 1 task xong, tu dong lay task tiep theo tu queue
- Tra ve mang ket qua theo dung thu tu input

```js
const tasks = urls.map((url) => () => fetch(url));
const results = await promisePool(tasks, 5); // Toi da 5 request dong thoi
```

## Bai tap 6: Implement EventEmitter tu dau

Viet lai class `MyEventEmitter` voi cac method:
- `on(event, listener)` - dang ky listener
- `off(event, listener)` - go listener
- `once(event, listener)` - listener chi chay 1 lan
- `emit(event, ...args)` - phat event
- `listenerCount(event)` - dem listener
- `removeAllListeners(event?)` - go tat ca listener

---

## Tham khao

- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick)
- [MDN: Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- [Node.js Events Documentation](https://nodejs.org/api/events.html)
