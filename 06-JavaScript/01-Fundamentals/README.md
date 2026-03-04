# 01 - JavaScript Fundamentals

## 1. Variables & Data Types

### Khai báo biến
```js
var name = 'Phong';    // function-scoped, có hoisting
let age = 25;          // block-scoped, không hoisting giá trị
const PI = 3.14;       // block-scoped, không thể reassign
```

### Kiểu dữ liệu nguyên thủy (Primitive)
| Kiểu | Ví dụ | typeof |
|------|-------|--------|
| Number | `42`, `3.14`, `NaN`, `Infinity` | `"number"` |
| String | `'hello'`, `"world"`, `` `template` `` | `"string"` |
| Boolean | `true`, `false` | `"boolean"` |
| Undefined | `undefined` | `"undefined"` |
| Null | `null` | `"object"` (bug lịch sử) |
| Symbol | `Symbol('id')` | `"symbol"` |
| BigInt | `9007199254740991n` | `"bigint"` |

### Kiểu tham chiếu (Reference)
- Object: `{ key: value }`
- Array: `[1, 2, 3]`
- Function: `function() {}`
- Date, RegExp, Map, Set...

### Kiểm tra kiểu
```js
typeof 42;              // "number"
typeof 'hello';         // "string"
Array.isArray([1,2]);   // true
obj instanceof Object;  // true
```

## 2. Operators

### Toán tử so sánh
```js
// == (loose equality) - có ép kiểu
'5' == 5;    // true
null == undefined; // true

// === (strict equality) - không ép kiểu
'5' === 5;   // false
null === undefined; // false
```

### Toán tử logic
```js
// && - AND (trả về giá trị falsy đầu tiên hoặc giá trị cuối)
'hello' && 42;    // 42
0 && 'hello';     // 0

// || - OR (trả về giá trị truthy đầu tiên hoặc giá trị cuối)
'' || 'default';  // 'default'
'hello' || 42;    // 'hello'

// ?? - Nullish Coalescing (chỉ check null/undefined)
0 ?? 'default';   // 0
null ?? 'default'; // 'default'
```

## 3. Control Flow

### Conditional
```js
// if/else
if (condition) { } else if (other) { } else { }

// Ternary
const result = condition ? valueA : valueB;

// Switch
switch (value) {
  case 'a': break;
  case 'b': break;
  default: break;
}
```

### Loops
```js
// for
for (let i = 0; i < 10; i++) { }

// for...of (iterable: array, string, map, set)
for (const item of array) { }

// for...in (enumerable properties of object)
for (const key in object) { }

// while / do...while
while (condition) { }
do { } while (condition);
```

## 4. Functions

```js
// Function Declaration (có hoisting)
function add(a, b) { return a + b; }

// Function Expression
const add = function(a, b) { return a + b; };

// Arrow Function
const add = (a, b) => a + b;

// Default Parameters
function greet(name = 'World') { return `Hello ${name}`; }

// Rest Parameters
function sum(...numbers) { return numbers.reduce((a, b) => a + b, 0); }
```

## 5. Scope & Hoisting

### Scope
```js
// Global scope
var globalVar = 'global';

function outer() {
  // Function scope
  var functionVar = 'function';

  if (true) {
    // Block scope
    let blockVar = 'block';
    const alsoBlock = 'block';
    var notBlock = 'function'; // var không có block scope!
  }
}
```

### Hoisting
```js
// var được hoisting (khai báo, không phải giá trị)
console.log(x); // undefined
var x = 5;

// let/const có hoisting nhưng ở Temporal Dead Zone
console.log(y); // ReferenceError
let y = 5;

// Function declaration được hoisting toàn bộ
sayHi(); // "Hi!" - hoạt động!
function sayHi() { console.log('Hi!'); }
```

## 6. Type Coercion

```js
// Ép kiểu ngầm
'5' + 3;      // '53' (number → string)
'5' - 3;      // 2 (string → number)
true + 1;     // 2
false + 1;    // 1
'' + 0;       // '0'

// Falsy values
// false, 0, -0, 0n, '', null, undefined, NaN

// Ép kiểu tường minh
Number('42');      // 42
String(42);        // '42'
Boolean(1);        // true
parseInt('42px');   // 42
parseFloat('3.14'); // 3.14
```
