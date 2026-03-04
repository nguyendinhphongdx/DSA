# 6. Promises

Promise la object dai dien cho ket qua (hoac loi) cua mot thao tac bat dong bo trong tuong lai.

## 6.1. Trang thai cua Promise

```
                    ┌──────────────┐
                    │   PENDING    │  (dang cho ket qua)
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
     ┌────────────────┐       ┌─────────────────┐
     │   FULFILLED    │       │    REJECTED      │
     │  (thanh cong)  │       │  (that bai)      │
     └────────────────┘       └─────────────────┘
     .then(value => {})       .catch(error => {})
```

## 6.2. Tao va su dung Promise

```js
// Tao Promise
function readFilePromise(filePath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err); // Chuyen sang trang thai REJECTED
      } else {
        resolve(data); // Chuyen sang trang thai FULFILLED
      }
    });
  });
}

// Su dung Promise
readFilePromise('./data.txt')
  .then((data) => {
    console.log('Noi dung:', data);
  })
  .catch((err) => {
    console.error('Loi:', err.message);
  })
  .finally(() => {
    console.log('Da xu ly xong (du thanh cong hay that bai)');
  });

// Gia lap cac tinh huong
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error('ID khong hop le'));
        return;
      }

      const users = {
        1: { id: 1, name: 'Phong', role: 'admin' },
        2: { id: 2, name: 'Lan', role: 'user' },
        3: { id: 3, name: 'Minh', role: 'user' },
      };

      const user = users[id];
      if (!user) {
        reject(new Error(`Khong tim thay user id=${id}`));
      } else {
        resolve(user);
      }
    }, 500);
  });
}
```

## 6.3. Promise Chaining

```js
// Moi .then() tra ve mot Promise moi → co the chain
fetchUser(1)
  .then((user) => {
    console.log('User:', user.name);
    return fetchUserPosts(user.id); // Tra ve Promise moi
  })
  .then((posts) => {
    console.log('So bai viet:', posts.length);
    return fetchComments(posts[0].id); // Tra ve Promise moi
  })
  .then((comments) => {
    console.log('Comments:', comments);
  })
  .catch((err) => {
    // Bat LOI o BAT KY buoc nao trong chain
    console.error('Co loi xay ra:', err.message);
  });

// Vi du thuc te: Pipeline xu ly du lieu
function processData(rawData) {
  return Promise.resolve(rawData)
    .then(validate) // Buoc 1: Validate
    .then(transform) // Buoc 2: Transform
    .then(enrich) // Buoc 3: Enrich data
    .then(save); // Buoc 4: Save to DB
}

function validate(data) {
  if (!data || !data.name) {
    throw new Error('Data khong hop le: thieu name');
  }
  return { ...data, validated: true };
}

function transform(data) {
  return {
    ...data,
    name: data.name.trim().toLowerCase(),
    transformed: true,
  };
}

function enrich(data) {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    enriched: true,
  };
}

function save(data) {
  console.log('Luu du lieu:', data);
  return { ...data, id: Date.now(), saved: true };
}

processData({ name: '  PHONG  ' })
  .then((result) => console.log('Thanh cong:', result))
  .catch((err) => console.error('Loi:', err.message));
```

## 6.4. Promise.all()

Chay nhieu Promise **dong thoi**, doi **TAT CA** hoan thanh. Neu **mot** Promise reject → tat ca reject.

```js
// Lay du lieu tu nhieu nguon cung luc
async function getDashboardData(userId) {
  try {
    const [user, posts, notifications, settings] = await Promise.all([
      fetchUser(userId),
      fetchPosts(userId),
      fetchNotifications(userId),
      fetchSettings(userId),
    ]);
    // Tat ca deu thanh cong moi vao day

    return { user, posts, notifications, settings };
  } catch (err) {
    // Neu BAT KY request nao loi → vao day ngay lap tuc
    console.error('Loi lay du lieu dashboard:', err.message);
    throw err;
  }
}

// Vi du voi timing
const promise1 = new Promise((resolve) => setTimeout(() => resolve('A'), 1000));
const promise2 = new Promise((resolve) => setTimeout(() => resolve('B'), 2000));
const promise3 = new Promise((resolve) => setTimeout(() => resolve('C'), 1500));

const start = Date.now();
Promise.all([promise1, promise2, promise3]).then((results) => {
  console.log(results); // ['A', 'B', 'C']
  console.log(`Mat ${Date.now() - start}ms`); // ~2000ms (khong phai 4500ms!)
});

// Khi mot promise reject
const promiseOK = Promise.resolve('OK');
const promiseFail = Promise.reject(new Error('FAIL'));

Promise.all([promiseOK, promiseFail])
  .then((results) => console.log(results)) // Khong vao day
  .catch((err) => console.error(err.message)); // FAIL
```

## 6.5. Promise.allSettled()

Chay nhieu Promise dong thoi, doi **TAT CA** hoan thanh (ke ca reject). Tra ve trang thai cua tung Promise.

```js
const promises = [
  fetchUser(1), // Thanh cong
  fetchUser(999), // That bai (khong tim thay)
  fetchUser(2), // Thanh cong
];

const results = await Promise.allSettled(promises);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Promise ${index}: Thanh cong -`, result.value);
  } else {
    console.log(`Promise ${index}: That bai -`, result.reason.message);
  }
});

// Output:
// Promise 0: Thanh cong - { id: 1, name: 'Phong', ... }
// Promise 1: That bai - Khong tim thay user id=999
// Promise 2: Thanh cong - { id: 2, name: 'Lan', ... }

// Ung dung thuc te: gui email hang loat
async function sendBulkEmails(emails) {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  console.log(`Gui thanh cong: ${succeeded.length}/${emails.length}`);
  console.log(`Gui that bai: ${failed.length}/${emails.length}`);

  // Log chi tiet loi
  failed.forEach((r) => console.error('Loi:', r.reason.message));
}
```

## 6.6. Promise.race()

Tra ve ket qua cua Promise **NHANH NHAT** (du thanh cong hay that bai).

```js
// Ung dung 1: Timeout cho request
function fetchWithTimeout(url, timeoutMs = 5000) {
  const fetchPromise = fetch(url);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout!')), timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Ung dung 2: Chon server nhanh nhat
async function fetchFromFastestServer(servers) {
  const racePromises = servers.map(async (server) => {
    const response = await fetch(`${server}/api/data`);
    return { server, data: await response.json() };
  });

  const fastest = await Promise.race(racePromises);
  console.log(`Server nhanh nhat: ${fastest.server}`);
  return fastest.data;
}

// Vi du
const fast = new Promise((resolve) => setTimeout(() => resolve('NHANH'), 100));
const slow = new Promise((resolve) => setTimeout(() => resolve('CHAM'), 2000));

Promise.race([fast, slow]).then((result) => {
  console.log(result); // 'NHANH' (sau ~100ms)
});
```

## 6.7. Promise.any()

Tra ve ket qua cua Promise thanh cong **DAU TIEN**. Chi reject khi **TAT CA** deu reject.

```js
// Promise.any - chi can 1 thanh cong la du
const promises = [
  new Promise((_, reject) => setTimeout(() => reject('Loi 1'), 100)),
  new Promise((resolve) => setTimeout(() => resolve('Thanh cong!'), 200)),
  new Promise((_, reject) => setTimeout(() => reject('Loi 2'), 300)),
];

Promise.any(promises)
  .then((result) => console.log(result)) // 'Thanh cong!'
  .catch((err) => console.error(err)); // AggregateError (chi khi TAT CA reject)

// Ung dung: Thu nhieu endpoint, lay cai nao thanh cong dau tien
async function fetchFromAnyMirror(mirrors, path) {
  try {
    const data = await Promise.any(
      mirrors.map((mirror) =>
        fetch(`${mirror}${path}`).then((res) => {
          if (!res.ok) throw new Error(`${mirror} tra ve ${res.status}`);
          return res.json();
        })
      )
    );
    return data;
  } catch (err) {
    // AggregateError - tat ca mirrors deu loi
    console.error('Tat ca mirrors deu that bai:');
    err.errors.forEach((e) => console.error(' -', e.message));
    throw err;
  }
}
```
