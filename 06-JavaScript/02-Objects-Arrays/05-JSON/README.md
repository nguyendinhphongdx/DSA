# JSON (JavaScript Object Notation)

## JSON là gì?

JSON là một **định dạng dữ liệu dạng text** dùng để trao đổi dữ liệu giữa server và client, hoặc lưu trữ dữ liệu có cấu trúc. Mặc dù tên có "JavaScript", JSON là **ngôn ngữ độc lập** — hầu hết mọi ngôn ngữ lập trình đều hỗ trợ JSON.

JSON trông rất giống JavaScript object, nhưng có một số **quy tắc nghiêm ngặt hơn**.

---

## 1. Cú pháp JSON

### Quy tắc

- Key **phải** là string, bọc trong **dấu nháy kép** `""` (không được nháy đơn)
- Value có thể là: string, number, boolean, null, object, array
- **Không hỗ trợ**: `undefined`, `function`, `Symbol`, `NaN`, `Infinity`, comments, trailing comma

```json
{
  "name": "Phong",
  "age": 25,
  "isStudent": false,
  "address": {
    "city": "HCM",
    "country": "Vietnam"
  },
  "hobbies": ["coding", "reading"],
  "spouse": null
}
```

### So sánh JS Object vs JSON

| | JS Object | JSON |
|---|---|---|
| Key | Có hoặc không có quotes | **Bắt buộc** dấu nháy kép |
| String | Nháy đơn hoặc kép | **Chỉ** nháy kép |
| Function | Cho phép | **Không** |
| undefined | Cho phép | **Không** |
| Trailing comma | Cho phép | **Không** |
| Comments | Cho phép | **Không** |

---

## 2. JSON.stringify() — Object → JSON String

Chuyển đổi JavaScript value thành **chuỗi JSON**.

```js
const user = { name: 'Phong', age: 25 };

const json = JSON.stringify(user);
console.log(json);       // '{"name":"Phong","age":25}'
console.log(typeof json); // 'string'
```

### Formatting (Pretty print)

```js
// Tham số thứ 3: số space để indent
JSON.stringify(user, null, 2);
// {
//   "name": "Phong",
//   "age": 25
// }
```

### Replacer — Chọn lọc properties

```js
// Replacer dạng array: chỉ lấy các key được chỉ định
JSON.stringify(user, ['name']);
// '{"name":"Phong"}'

// Replacer dạng function: xử lý từng key-value
const data = { name: 'Phong', password: 'secret', age: 25 };
JSON.stringify(data, (key, value) => {
  if (key === 'password') return undefined; // Bỏ qua
  return value;
});
// '{"name":"Phong","age":25}'
```

### Những gì bị bỏ qua / chuyển đổi

```js
JSON.stringify({
  fn: function() {},     // ❌ Bị bỏ qua
  sym: Symbol('id'),     // ❌ Bị bỏ qua
  undef: undefined,      // ❌ Bị bỏ qua
  nan: NaN,              // ⚠️ → null
  inf: Infinity,         // ⚠️ → null
  date: new Date(),      // ⚠️ → ISO string
  regex: /abc/,          // ⚠️ → {}
});
// '{"nan":null,"inf":null,"date":"2024-01-01T...","regex":{}}'
```

### toJSON() — Tùy chỉnh serialization

```js
const user = {
  name: 'Phong',
  password: 'secret',
  toJSON() {
    return { name: this.name }; // Chỉ expose name
  },
};

JSON.stringify(user); // '{"name":"Phong"}'
```

---

## 3. JSON.parse() — JSON String → Object

Chuyển đổi chuỗi JSON thành JavaScript value.

```js
const json = '{"name":"Phong","age":25}';
const user = JSON.parse(json);

console.log(user.name);  // 'Phong'
console.log(typeof user); // 'object'
```

### Reviver — Xử lý khi parse

```js
// Chuyển date string thành Date object
const json = '{"name":"Phong","createdAt":"2024-01-15T10:30:00.000Z"}';

const data = JSON.parse(json, (key, value) => {
  if (key === 'createdAt') return new Date(value);
  return value;
});

console.log(data.createdAt instanceof Date); // true
```

### Xử lý lỗi parse

JSON.parse sẽ **throw SyntaxError** nếu chuỗi không phải JSON hợp lệ:

```js
// Luôn bọc trong try/catch
function safeParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON:', error.message);
    return null;
  }
}

safeParse('invalid json');   // null, log error
safeParse('{"name":"Phong"}'); // { name: 'Phong' }
```

---

## 4. Ứng dụng thực tế

### Lưu trữ localStorage

localStorage chỉ lưu được **string**, nên cần JSON để lưu object/array:

```js
// Lưu
const settings = { theme: 'dark', lang: 'vi' };
localStorage.setItem('settings', JSON.stringify(settings));

// Đọc
const saved = JSON.parse(localStorage.getItem('settings'));
```

### Deep Clone (cách đơn giản)

```js
const original = { a: 1, b: { c: 2 } };
const clone = JSON.parse(JSON.stringify(original));

clone.b.c = 99;
console.log(original.b.c); // 2 — không ảnh hưởng
```

**Hạn chế:** Mất `function`, `undefined`, `Symbol`, `Date` bị chuyển thành string, không xử lý circular reference. Dùng `structuredClone()` cho deep clone an toàn hơn.

### Gửi/nhận API

```js
// POST request
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Phong', age: 25 }),
});

// Parse response
const data = await response.json(); // Tự gọi JSON.parse
```
