# Destructuring (Phân rã)

## Destructuring là gì?

Destructuring là cú pháp ES6 cho phép **"mở gói"** giá trị từ array hoặc property từ object và gán vào các biến riêng biệt. Nó giúp code ngắn gọn và dễ đọc hơn rất nhiều.

---

## 1. Object Destructuring

### Cơ bản

Tên biến **phải trùng** với tên property:

```js
const user = { name: 'Phong', age: 25, city: 'HCM' };

// Cách cũ
const name = user.name;
const age = user.age;

// Destructuring
const { name, age, city } = user;
console.log(name); // 'Phong'
console.log(age);  // 25
```

### Đổi tên biến (Aliasing)

Khi tên property trùng với biến đã có, hoặc muốn đặt tên khác:

```js
const user = { name: 'Phong', age: 25 };

const { name: fullName, age: userAge } = user;
console.log(fullName); // 'Phong'
console.log(userAge);  // 25
// console.log(name);  // ReferenceError — name không được tạo
```

### Giá trị mặc định

Nếu property không tồn tại hoặc là `undefined`, giá trị mặc định sẽ được sử dụng:

```js
const user = { name: 'Phong' };

const { name, age = 18, city = 'Unknown' } = user;
console.log(age);  // 18 (dùng default vì user không có age)
console.log(city); // 'Unknown'

// Kết hợp đổi tên + default
const { name: fullName = 'Anonymous' } = {};
console.log(fullName); // 'Anonymous'
```

**Lưu ý:** Default chỉ áp dụng khi giá trị là `undefined`, không phải `null`:

```js
const { value = 10 } = { value: null };
console.log(value); // null (KHÔNG dùng default)
```

### Nested destructuring

```js
const user = {
  name: 'Phong',
  address: {
    city: 'HCM',
    district: 'Q1',
    geo: { lat: 10.7, lng: 106.6 },
  },
};

const {
  name,
  address: {
    city,
    geo: { lat, lng },
  },
} = user;

console.log(city); // 'HCM'
console.log(lat);  // 10.7
// console.log(address); // ReferenceError — address không được tạo
//                         vì nó chỉ là đường dẫn, không phải biến
```

### Rest trong destructuring

Gom các property **còn lại** vào một object mới:

```js
const user = { name: 'Phong', age: 25, city: 'HCM', role: 'admin' };

const { name, ...rest } = user;
console.log(name); // 'Phong'
console.log(rest); // { age: 25, city: 'HCM', role: 'admin' }

// Rất hữu ích để loại bỏ property
const { password, ...safeUser } = userWithPassword;
// safeUser không chứa password
```

---

## 2. Array Destructuring

### Cơ bản

Gán theo **thứ tự vị trí** (index), không theo tên:

```js
const colors = ['red', 'green', 'blue'];

const [first, second, third] = colors;
console.log(first);  // 'red'
console.log(second); // 'green'
console.log(third);  // 'blue'
```

### Bỏ qua phần tử

```js
const [first, , third] = ['a', 'b', 'c'];
console.log(first); // 'a'
console.log(third); // 'c' (bỏ qua 'b')

const [, , last] = [1, 2, 3];
console.log(last); // 3
```

### Giá trị mặc định

```js
const [a = 1, b = 2, c = 3] = [10, 20];
console.log(a); // 10
console.log(b); // 20
console.log(c); // 3 (dùng default)
```

### Rest trong array

```js
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]
```

### Swap (Hoán đổi giá trị)

Không cần biến tạm:

```js
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a); // 2
console.log(b); // 1
```

---

## 3. Destructuring trong Function Parameters

Đây là use case **phổ biến nhất** của destructuring — giúp function API rõ ràng hơn.

### Object parameter

```js
// Thay vì nhớ thứ tự parameters:
// function createUser(name, age, city, role) { }
// createUser('Phong', 25, 'HCM', 'admin'); — thứ tự 4 tham số?

// Dùng destructuring:
function createUser({ name, age, city = 'HCM', role = 'user' }) {
  return { name, age, city, role };
}

createUser({ name: 'Phong', age: 25 });
// { name: 'Phong', age: 25, city: 'HCM', role: 'user' }
// → Không cần nhớ thứ tự, có default values
```

### Array parameter

```js
// Kết hợp với entries
const scores = new Map([['math', 90], ['english', 85]]);

for (const [subject, score] of scores) {
  console.log(`${subject}: ${score}`);
}
```

### Return nhiều giá trị

```js
function getMinMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}

const [min, max] = getMinMax([3, 1, 4, 1, 5]);
console.log(min, max); // 1, 5
```

---

## 4. Các pattern thực tế

### Import/Export (React, Node.js)

```js
// Destructuring từ module
const { useState, useEffect } = require('react');
// hoặc
import { useState, useEffect } from 'react';
```

### API Response

```js
const { data, status, headers } = await axios.get('/api/users');
const { users, total, page } = data;
```

### Xử lý Promise

```js
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
]);
```

### Try-catch pattern

```js
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    return [await res.json(), null];
  } catch (err) {
    return [null, err];
  }
}

const [data, error] = await safeFetch('/api/data');
if (error) console.error(error);
```
