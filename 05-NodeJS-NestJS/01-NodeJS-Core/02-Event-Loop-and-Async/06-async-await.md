# 7. async/await

`async/await` la syntactic sugar cho Promises, giup viet code bat dong bo nhu code dong bo.

## 7.1. Co ban

```js
// async function LUON tra ve Promise
async function greet(name) {
  return `Xin chao, ${name}!`;
}

greet('Phong').then(console.log); // Xin chao, Phong!

// await TAM DUNG thuc thi cho den khi Promise resolve
async function getUserData(userId) {
  console.log('Bat dau lay du lieu...');

  // await TAM DUNG o day, KHONG block Event Loop
  const user = await fetchUser(userId);
  console.log('Da lay user:', user.name);

  const posts = await fetchPosts(user.id);
  console.log('Da lay posts:', posts.length);

  const comments = await fetchComments(posts[0].id);
  console.log('Da lay comments:', comments.length);

  return { user, posts, comments };
}

// Goi async function
getUserData(1)
  .then((data) => console.log('Ket qua:', data))
  .catch((err) => console.error('Loi:', err.message));
```

## 7.2. Xu ly song song voi async/await

```js
// SAI: Chay TUAN TU (cham)
async function getDataSequential() {
  const start = Date.now();

  const users = await fetchUsers(); // Doi 2s
  const products = await fetchProducts(); // Doi 2s
  const orders = await fetchOrders(); // Doi 2s

  console.log(`Tong: ${Date.now() - start}ms`); // ~6000ms
  return { users, products, orders };
}

// DUNG: Chay SONG SONG (nhanh)
async function getDataParallel() {
  const start = Date.now();

  const [users, products, orders] = await Promise.all([
    fetchUsers(), // Bat dau ngay
    fetchProducts(), // Bat dau ngay
    fetchOrders(), // Bat dau ngay
  ]);

  console.log(`Tong: ${Date.now() - start}ms`); // ~2000ms (max cua 3 cai)
  return { users, products, orders };
}

// KET HOP: Mot so song song, mot so tuan tu
async function getOrderDetails(orderId) {
  // Buoc 1: Lay order truoc (can co order moi biet userId va productIds)
  const order = await fetchOrder(orderId);

  // Buoc 2: Lay user va products SONG SONG (khong phu thuoc nhau)
  const [user, products] = await Promise.all([
    fetchUser(order.userId),
    Promise.all(order.productIds.map((id) => fetchProduct(id))),
  ]);

  return { order, user, products };
}
```

## 7.3. async/await voi vong lap

```js
// SAI: forEach KHONG doi await
const ids = [1, 2, 3, 4, 5];

ids.forEach(async (id) => {
  const user = await fetchUser(id);
  console.log(user); // Chay khong theo thu tu!
});
console.log('Xong!'); // In TRUOC khi cac fetchUser xong

// DUNG 1: for...of (tuan tu - moi lan 1 request)
async function fetchUsersSequentially(ids) {
  const users = [];
  for (const id of ids) {
    const user = await fetchUser(id); // Doi tung cai
    users.push(user);
    console.log(`Da lay user ${id}`);
  }
  return users;
}

// DUNG 2: Promise.all + map (song song - tat ca cung luc)
async function fetchUsersInParallel(ids) {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users;
}

// DUNG 3: Batch processing (song song theo nhom, tranh qua tai)
async function fetchUsersInBatches(ids, batchSize = 3) {
  const results = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    console.log(`Dang xu ly batch ${i / batchSize + 1}:`, batch);

    const batchResults = await Promise.all(batch.map((id) => fetchUser(id)));
    results.push(...batchResults);
  }

  return results;
}

// Su dung
const allUsers = await fetchUsersInBatches([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
// Batch 1: [1, 2, 3] → song song
// Batch 2: [4, 5, 6] → song song
// Batch 3: [7, 8, 9] → song song
// Batch 4: [10]       → song song
```

## 7.4. for await...of (Async Iterators)

```js
// Duyet qua async iterable
async function* generateNumbers() {
  for (let i = 1; i <= 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    yield i;
  }
}

async function processNumbers() {
  for await (const num of generateNumbers()) {
    console.log(`Nhan duoc so: ${num}`);
  }
  console.log('Xong!');
}

processNumbers();
// (sau 500ms) Nhan duoc so: 1
// (sau 500ms) Nhan duoc so: 2
// ...
// (sau 500ms) Nhan duoc so: 5
// Xong!

// Ung dung: Doc file theo dong
const fs = require('fs');
const readline = require('readline');

async function processFileLines(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    console.log(`Dong ${lineNumber}: ${line}`);
  }

  console.log(`Tong cong: ${lineNumber} dong`);
}
```
