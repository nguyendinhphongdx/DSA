# Objects

## Object là gì?

Object là **cấu trúc dữ liệu quan trọng nhất** trong JavaScript. Nó lưu trữ dữ liệu dưới dạng các cặp **key-value** (khóa-giá trị), trong đó key là string (hoặc Symbol) và value có thể là bất kỳ kiểu dữ liệu nào.

Gần như mọi thứ trong JS đều là object hoặc hoạt động như object (kể cả array, function, Date, RegExp...).

---

## 1. Tạo Object

### Object Literal (phổ biến nhất)

```js
const person = {
  name: 'Phong',            // String value
  age: 25,                   // Number value
  isStudent: false,          // Boolean value
  hobbies: ['code', 'read'], // Array value
  address: {                 // Nested object
    city: 'HCM',
    country: 'Vietnam',
  },
  greet() {                  // Method (function trong object)
    return `Hi, I'm ${this.name}`;
  },
};
```

### Shorthand properties (ES6)

Khi tên biến trùng với tên key, có thể viết tắt:

```js
const name = 'Phong';
const age = 25;

// Cách cũ
const user1 = { name: name, age: age };

// ES6 shorthand
const user2 = { name, age };
// Tương đương: { name: 'Phong', age: 25 }
```

### Computed property names (ES6)

Key có thể là biểu thức, bọc trong `[]`:

```js
const field = 'email';
const user = {
  [field]: 'phong@email.com',       // key = 'email'
  [`${field}Verified`]: true,        // key = 'emailVerified'
};
```

### Object.create()

Tạo object với prototype chỉ định. Hữu ích cho kế thừa.

```js
const animal = {
  speak() { return `${this.name} makes a sound`; },
};

const dog = Object.create(animal);
dog.name = 'Rex';
dog.speak(); // 'Rex makes a sound'
```

### Constructor function / Class

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
const p = new Person('Phong', 25);
```

---

## 2. Truy cập Properties

### Dot notation

```js
person.name;     // 'Phong'
person.address.city; // 'HCM'
```

### Bracket notation

Bắt buộc dùng khi key chứa ký tự đặc biệt, dấu cách, hoặc là biến:

```js
person['name'];          // 'Phong'
person['full name'];      // Key có dấu cách
person['123'];            // Key bắt đầu bằng số

const key = 'age';
person[key];              // 25 — key là biến
```

### Optional chaining (?.)

Tránh lỗi khi truy cập property của `null`/`undefined`:

```js
const user = { address: null };

// Không có ?.
// user.address.city; // TypeError: Cannot read property 'city' of null

// Có ?.
user.address?.city;   // undefined (không lỗi!)
user.phone?.number;   // undefined
```

---

## 3. Thao tác với Properties

### Thêm / Sửa

```js
const car = { brand: 'Toyota' };
car.color = 'Red';        // Thêm property mới
car.brand = 'Honda';      // Sửa giá trị
car['year'] = 2024;       // Thêm bằng bracket notation
```

### Xóa

```js
delete car.color;         // true — xóa thành công
console.log(car.color);   // undefined
```

**Lưu ý:** `delete` chỉ xóa **own property** của object, không xóa property kế thừa từ prototype. Hiệu suất của `delete` cũng không tốt — nếu muốn "xóa", có thể gán `undefined` hoặc dùng destructuring.

### Kiểm tra property tồn tại

```js
const user = { name: 'Phong', age: 25 };

// in — kiểm tra cả prototype chain
'name' in user;              // true
'toString' in user;          // true (từ Object.prototype)

// hasOwnProperty — chỉ kiểm tra own property
user.hasOwnProperty('name');     // true
user.hasOwnProperty('toString'); // false

// Object.hasOwn (ES2022) — cách hiện đại, an toàn hơn
Object.hasOwn(user, 'name');     // true

// Kiểm tra bằng undefined (KHÔNG nên — property có thể tồn tại với giá trị undefined)
user.email === undefined;        // true, nhưng không rõ ràng
```

---

## 4. Duyệt Object

### for...in

Duyệt qua tất cả **enumerable** own properties VÀ prototype properties:

```js
for (const key in user) {
  if (Object.hasOwn(user, key)) { // Lọc chỉ own properties
    console.log(`${key}: ${user[key]}`);
  }
}
```

### Object.keys / values / entries

```js
const user = { name: 'Phong', age: 25, city: 'HCM' };

Object.keys(user);    // ['name', 'age', 'city']
Object.values(user);  // ['Phong', 25, 'HCM']
Object.entries(user); // [['name', 'Phong'], ['age', 25], ['city', 'HCM']]

// Duyệt bằng forEach
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
```

---

## 5. Object Methods quan trọng

### Object.assign() — Merge objects (shallow)

```js
const defaults = { theme: 'light', lang: 'vi' };
const userPrefs = { theme: 'dark' };

const settings = Object.assign({}, defaults, userPrefs);
// { theme: 'dark', lang: 'vi' }
// Object sau ghi đè property trùng tên
```

### Object.freeze() — Đóng băng hoàn toàn

Không thể thêm, sửa, hoặc xóa property. Nhưng chỉ **shallow freeze** — nested object vẫn có thể thay đổi.

```js
const config = Object.freeze({ api: 'https://...', debug: false });
config.debug = true;  // Im lặng, không có hiệu lực (strict mode: TypeError)
config.newProp = 1;   // Không có hiệu lực
```

### Object.seal() — Bọc kín

Không thể thêm/xóa property, nhưng **có thể sửa** giá trị property hiện có.

```js
const user = Object.seal({ name: 'Phong', age: 25 });
user.name = 'Minh';  // OK — sửa giá trị
user.email = 'a@b';  // Không có hiệu lực — không thể thêm
delete user.name;     // Không có hiệu lực — không thể xóa
```

### Object.fromEntries() — Entries → Object

Ngược lại với `Object.entries()`:

```js
const entries = [['name', 'Phong'], ['age', 25]];
const obj = Object.fromEntries(entries);
// { name: 'Phong', age: 25 }

// Hữu ích khi kết hợp với Map
const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
const obj2 = Object.fromEntries(map);
```

---

## 6. Shallow Copy vs Deep Copy

Đây là khái niệm rất quan trọng khi làm việc với object.

### Shallow Copy (Sao chép nông)

Chỉ copy **level 1** — nested objects vẫn **chia sẻ reference**.

```js
const original = {
  name: 'Phong',
  address: { city: 'HCM' },
};

// Cách 1: Spread operator
const copy1 = { ...original };

// Cách 2: Object.assign
const copy2 = Object.assign({}, original);

// Level 1: độc lập
copy1.name = 'Minh';
console.log(original.name); // 'Phong' — không ảnh hưởng

// Nested object: CHIA SẺ reference!
copy1.address.city = 'HN';
console.log(original.address.city); // 'HN' — BỊ ẢNH HƯỞNG!
```

### Deep Copy (Sao chép sâu)

Copy **toàn bộ**, nested objects cũng được tạo bản sao mới.

```js
// Cách 1: structuredClone (hiện đại, khuyên dùng)
const deep1 = structuredClone(original);

// Cách 2: JSON (cách cũ, có hạn chế)
const deep2 = JSON.parse(JSON.stringify(original));
// ⚠️ Hạn chế: mất function, undefined, Symbol, Date → string, RegExp → {},
// không xử lý được circular reference
```

### Khi nào cần deep copy?

- Khi object có **nested objects** và bạn muốn sửa bản copy mà không ảnh hưởng bản gốc
- Trong React/Redux khi cần tạo state mới (immutability)
- Khi clone dữ liệu từ API để xử lý cục bộ
