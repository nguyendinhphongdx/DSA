# Spread & Rest Operators (...)

## Cùng cú pháp, khác mục đích

Toán tử `...` (ba chấm) có 2 tên gọi tùy theo cách sử dụng:

- **Spread** (trải ra): "Mở gói" một iterable thành các phần tử riêng lẻ
- **Rest** (gom lại): Gom nhiều phần tử thành một array/object

Cách phân biệt đơn giản: nếu `...` ở **bên phải** dấu `=` hoặc trong argument → **Spread**. Nếu ở **bên trái** dấu `=` hoặc trong parameter → **Rest**.

---

## 1. Spread Operator

### Spread Array

```js
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// Nối mảng (thay Array.concat)
const merged = [...arr1, ...arr2];         // [1, 2, 3, 4, 5, 6]
const withMiddle = [...arr1, 99, ...arr2]; // [1, 2, 3, 99, 4, 5, 6]

// Clone mảng (shallow copy)
const clone = [...arr1];
clone.push(4);
console.log(arr1); // [1, 2, 3] — bản gốc không đổi

// Truyền array làm arguments cho function
const numbers = [3, 1, 4, 1, 5];
Math.max(...numbers);   // 5 — tương đương Math.max(3, 1, 4, 1, 5)

// Chuyển string thành array ký tự
[...'hello']; // ['h', 'e', 'l', 'l', 'o']

// Chuyển Set thành Array
[...new Set([1, 2, 2, 3])]; // [1, 2, 3]
```

### Spread Object

```js
const defaults = { theme: 'light', lang: 'vi', fontSize: 14 };
const userPrefs = { theme: 'dark', fontSize: 16 };

// Merge objects — property sau ghi đè property trước (nếu trùng key)
const settings = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'vi', fontSize: 16 }

// Thêm/ghi đè property
const user = { name: 'Phong', age: 25 };
const updatedUser = { ...user, age: 26, city: 'HCM' };
// { name: 'Phong', age: 26, city: 'HCM' }

// Clone object (shallow)
const clone = { ...user };
```

**Lưu ý quan trọng:** Spread chỉ **shallow copy** — nested objects vẫn chia sẻ reference:

```js
const original = { name: 'Phong', address: { city: 'HCM' } };
const copy = { ...original };

copy.address.city = 'HN';
console.log(original.address.city); // 'HN' — bị ảnh hưởng!
```

---

## 2. Rest Operator

### Rest trong Function Parameters

Gom **tất cả arguments còn lại** vào một array. Phải là parameter **cuối cùng**.

```js
function sum(first, second, ...rest) {
  console.log(first); // 1
  console.log(second); // 2
  console.log(rest);   // [3, 4, 5]
  return [first, second, ...rest].reduce((a, b) => a + b);
}

sum(1, 2, 3, 4, 5); // 15
```

So sánh với `arguments` (cách cũ):

```js
// arguments: array-like, không dùng được array methods
function oldWay() {
  console.log(arguments); // { '0': 1, '1': 2, '2': 3 }
  // arguments.map(...) // TypeError!
}

// rest: array thật, dùng được mọi array methods
function newWay(...args) {
  return args.map(x => x * 2); // Hoạt động!
}
```

### Rest trong Destructuring

```js
// Object destructuring
const { name, ...others } = { name: 'Phong', age: 25, city: 'HCM' };
// name = 'Phong'
// others = { age: 25, city: 'HCM' }

// Array destructuring
const [first, ...rest] = [1, 2, 3, 4, 5];
// first = 1
// rest = [2, 3, 4, 5]
```

---

## 3. Ứng dụng thực tế

### Loại bỏ property khỏi object (Immutable)

```js
const user = { id: 1, name: 'Phong', password: 'secret', role: 'admin' };

// Loại bỏ password trước khi gửi cho client
const { password, ...safeUser } = user;
// safeUser = { id: 1, name: 'Phong', role: 'admin' }
```

### Cập nhật state trong React (Immutable)

```js
// Thêm item vào mảng
setItems(prev => [...prev, newItem]);

// Xóa item
setItems(prev => prev.filter(item => item.id !== idToDelete));

// Update object
setUser(prev => ({ ...prev, name: 'New Name' }));

// Update nested object
setUser(prev => ({
  ...prev,
  address: { ...prev.address, city: 'HN' },
}));
```

### Merge configs

```js
function createConfig(overrides) {
  const defaults = {
    timeout: 5000,
    retries: 3,
    baseURL: '/api',
  };
  return { ...defaults, ...overrides };
}

createConfig({ timeout: 10000 });
// { timeout: 10000, retries: 3, baseURL: '/api' }
```

### Conditional spread

```js
const user = {
  name: 'Phong',
  ...(isAdmin && { role: 'admin' }),       // Thêm role nếu isAdmin
  ...(email && { email }),                  // Thêm email nếu có
};
```
