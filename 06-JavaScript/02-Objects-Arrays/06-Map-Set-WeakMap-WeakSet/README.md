# Map, Set, WeakMap, WeakSet

## Tại sao cần chúng?

JavaScript Object và Array đã có sẵn từ đầu, nhưng chúng có **hạn chế**:
- **Object**: key chỉ là string/Symbol, không có `.size`, khó duyệt theo thứ tự chèn
- **Array**: không đảm bảo tính duy nhất, tìm kiếm `includes()` chậm (O(n))

ES6 giới thiệu 4 cấu trúc dữ liệu mới để giải quyết những hạn chế này.

---

## 1. Map

Map lưu trữ cặp key-value, nhưng **key có thể là BẤT KỲ kiểu dữ liệu nào** (object, function, number...), không chỉ string như Object.

### Tạo và thao tác

```js
const map = new Map();

// Set — thêm cặp key-value
map.set('name', 'Phong');
map.set(42, 'answer');
map.set(true, 'yes');

const objKey = { id: 1 };
map.set(objKey, 'object as key!');

// Get — truy cập value
map.get('name');     // 'Phong'
map.get(42);         // 'answer'
map.get(objKey);     // 'object as key!'

// Kiểm tra & xóa
map.has('name');     // true
map.delete('name');  // true
map.size;            // 3
map.clear();         // Xóa tất cả
```

### Khởi tạo từ array of pairs

```js
const map = new Map([
  ['name', 'Phong'],
  ['age', 25],
  ['city', 'HCM'],
]);
```

### Duyệt Map

Map duy trì **thứ tự chèn** (insertion order):

```js
// for...of
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// forEach
map.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// Lấy keys, values, entries
map.keys();    // MapIterator {'name', 'age', 'city'}
map.values();  // MapIterator {'Phong', 25, 'HCM'}
map.entries(); // MapIterator {['name','Phong'], ['age',25], ['city','HCM']}
```

### Map vs Object — Khi nào dùng gì?

| Tiêu chí | Map | Object |
|----------|-----|--------|
| Key types | Bất kỳ | String/Symbol |
| Thứ tự | Đảm bảo insertion order | Phức tạp hơn |
| Size | `map.size` | `Object.keys(obj).length` |
| Performance | Tốt cho add/delete thường xuyên | Tốt cho truy cập tĩnh |
| JSON | Không serialize trực tiếp | `JSON.stringify` |
| Destructuring | Không | Có |

**Dùng Map khi:** Key không phải string, cần size, add/delete thường xuyên, duyệt theo thứ tự.

**Dùng Object khi:** Key là string, cần JSON, cần destructuring, là record/struct đơn giản.

---

## 2. Set

Set lưu trữ **tập hợp giá trị duy nhất** — mỗi giá trị chỉ xuất hiện **một lần**. Kiểm tra tồn tại rất nhanh (O(1)) so với `Array.includes()` (O(n)).

### Tạo và thao tác

```js
const set = new Set();

// Add
set.add(1);
set.add(2);
set.add(2);    // Bị bỏ qua — đã tồn tại
set.add('hello');

console.log(set); // Set(3) {1, 2, 'hello'}
console.log(set.size); // 3

// Kiểm tra & xóa
set.has(2);      // true — O(1), rất nhanh!
set.delete(2);   // true
set.has(2);      // false
set.clear();     // Xóa tất cả
```

### Khởi tạo từ iterable

```js
const set = new Set([1, 2, 2, 3, 3, 3]);
console.log(set); // Set(3) {1, 2, 3}

const charSet = new Set('hello');
console.log(charSet); // Set(4) {'h', 'e', 'l', 'o'}
```

### Loại bỏ trùng lặp — Use case phổ biến nhất

```js
const arr = [1, 2, 2, 3, 3, 4, 4, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// Với string
const uniqueChars = [...new Set('abracadabra')].join('');
// 'abrcd'
```

### Phép toán tập hợp

```js
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Hợp (Union)
const union = new Set([...setA, ...setB]);
// {1, 2, 3, 4, 5, 6}

// Giao (Intersection)
const intersection = new Set([...setA].filter(x => setB.has(x)));
// {3, 4}

// Hiệu (Difference) — A \ B
const difference = new Set([...setA].filter(x => !setB.has(x)));
// {1, 2}
```

---

## 3. WeakMap

WeakMap giống Map nhưng có 2 điểm khác biệt quan trọng:
1. **Key phải là object** (không phải primitive)
2. **Weak reference** — nếu object key không còn reference nào khác, nó sẽ bị **Garbage Collector thu hồi** tự động

### Tại sao cần WeakMap?

Map thường giữ **strong reference** đến key — ngay cả khi bạn không cần key đó nữa, Map vẫn giữ nó trong bộ nhớ → memory leak.

```js
// Memory leak với Map
const cache = new Map();
let user = { name: 'Phong' };
cache.set(user, 'cached data');
user = null; // user không còn dùng, NHƯNG Map vẫn giữ reference → không được GC

// WeakMap giải quyết vấn đề này
const weakCache = new WeakMap();
let user2 = { name: 'Phong' };
weakCache.set(user2, 'cached data');
user2 = null; // Không còn reference → object được GC, entry trong WeakMap cũng biến mất
```

### Hạn chế của WeakMap

- **Không có** `.size`, `.keys()`, `.values()`, `.entries()`
- **Không iterable** — không dùng `for...of` được
- Chỉ có: `.get()`, `.set()`, `.has()`, `.delete()`

### Ứng dụng

```js
// 1. Private data cho object
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }

  checkPassword(pwd) {
    return privateData.get(this).password === pwd;
  }
}
// Khi User instance bị GC → private data cũng tự xóa

// 2. Cache tính toán tốn kém
const computeCache = new WeakMap();

function expensiveOperation(obj) {
  if (computeCache.has(obj)) return computeCache.get(obj);
  const result = /* tính toán nặng */ obj.value * 1000;
  computeCache.set(obj, result);
  return result;
}
```

---

## 4. WeakSet

Tương tự Set nhưng:
1. **Chỉ chứa object** (không phải primitive)
2. **Weak reference** — object bị GC khi không còn reference khác

```js
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) return; // Đã xử lý rồi
  visited.add(node);
  // ... xử lý node
}
// Khi node bị GC → tự xóa khỏi WeakSet, không cần cleanup thủ công
```

### Ứng dụng: Đánh dấu object

```js
// Đánh dấu object đã qua xác thực
const validated = new WeakSet();

function validate(user) {
  // ... kiểm tra
  validated.add(user);
}

function isValidated(user) {
  return validated.has(user);
}
```

---

## 5. Tổng kết

| | Map | Set | WeakMap | WeakSet |
|---|---|---|---|---|
| Lưu trữ | key-value | value duy nhất | key-value | value duy nhất |
| Key type | Bất kỳ | - | Object only | Object only |
| Reference | Strong | Strong | Weak | Weak |
| Iterable | Có | Có | Không | Không |
| .size | Có | Có | Không | Không |
| GC key/value | Không | Không | Có | Có |
| Use case | Từ điển linh hoạt | Tập hợp duy nhất | Cache, private data | Đánh dấu object |
