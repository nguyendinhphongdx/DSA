# 02 - Objects & Arrays

## 1. Objects

### Tạo Object
```js
// Object literal
const person = { name: 'Phong', age: 25 };

// Object.create()
const proto = { greet() { return `Hi ${this.name}`; } };
const obj = Object.create(proto);

// Constructor
function Person(name) { this.name = name; }
const p = new Person('Phong');
```

### Truy cập & Thao tác
```js
// Dot notation vs Bracket notation
person.name;
person['name'];

// Thêm/sửa/xóa
person.email = 'phong@email.com';
delete person.email;

// Kiểm tra property
'name' in person;           // true
person.hasOwnProperty('name'); // true
```

### Object Methods quan trọng
```js
Object.keys(obj);          // ['name', 'age']
Object.values(obj);        // ['Phong', 25]
Object.entries(obj);       // [['name', 'Phong'], ['age', 25]]
Object.assign(target, src); // Merge objects (shallow)
Object.freeze(obj);        // Không thể sửa
Object.seal(obj);           // Không thể thêm/xóa, chỉ sửa
Object.fromEntries(entries); // Entries → Object
```

### Shallow vs Deep Copy
```js
// Shallow copy
const copy1 = { ...obj };
const copy2 = Object.assign({}, obj);

// Deep copy
const deep = structuredClone(obj);
const deep2 = JSON.parse(JSON.stringify(obj)); // Hạn chế: mất function, Date...
```

## 2. Arrays

### Tạo Array
```js
const arr = [1, 2, 3];
const arr2 = Array.from('hello');       // ['h','e','l','l','o']
const arr3 = Array.from({ length: 5 }, (_, i) => i); // [0,1,2,3,4]
const arr4 = new Array(5).fill(0);      // [0,0,0,0,0]
```

### Mutating Methods (thay đổi mảng gốc)
```js
arr.push(4);        // Thêm cuối → [1,2,3,4]
arr.pop();          // Xóa cuối → [1,2,3]
arr.unshift(0);     // Thêm đầu → [0,1,2,3]
arr.shift();        // Xóa đầu → [1,2,3]
arr.splice(1, 1);   // Xóa 1 phần tử từ index 1
arr.sort();         // Sắp xếp (chú ý: sắp xếp theo string mặc định)
arr.reverse();      // Đảo ngược
```

### Non-mutating Methods (trả về mảng mới)
```js
arr.map(x => x * 2);           // [2, 4, 6]
arr.filter(x => x > 1);        // [2, 3]
arr.reduce((acc, x) => acc + x, 0); // 6
arr.find(x => x > 1);          // 2
arr.findIndex(x => x > 1);     // 1
arr.some(x => x > 2);          // true
arr.every(x => x > 0);         // true
arr.includes(2);                // true
arr.indexOf(2);                 // 1
arr.slice(1, 3);                // [2, 3]
arr.flat(Infinity);             // Làm phẳng nested arrays
arr.flatMap(x => [x, x * 2]);  // map + flat
arr.concat([4, 5]);             // [1,2,3,4,5]
```

## 3. Destructuring

```js
// Object destructuring
const { name, age, city = 'HCM' } = person;
const { name: fullName } = person; // Đổi tên

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
const [a, , c] = [1, 2, 3]; // Bỏ qua phần tử

// Nested destructuring
const { address: { street } } = person;

// Swap
[a, b] = [b, a];
```

## 4. Spread & Rest

```js
// Spread - trải ra
const merged = [...arr1, ...arr2];
const cloned = { ...obj };
Math.max(...numbers);

// Rest - gom lại
function sum(...nums) { return nums.reduce((a, b) => a + b); }
const { id, ...others } = obj;
```

## 5. Map, Set, WeakMap, WeakSet

```js
// Map - key có thể là bất kỳ kiểu nào
const map = new Map();
map.set(obj, 'value');
map.get(obj);
map.has(obj);
map.delete(obj);
map.size;

// Set - giá trị duy nhất
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}
set.add(4);
set.has(2);
set.delete(2);
[...new Set(arr)]; // Loại bỏ trùng lặp

// WeakMap/WeakSet - key/value phải là object, cho phép GC
const weakMap = new WeakMap();
const weakSet = new WeakSet();
```
