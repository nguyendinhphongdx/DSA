# 07 - ES6+ Features

## 1. let & const
```js
// let: block-scoped, có thể reassign
let count = 0;
count = 1; // OK

// const: block-scoped, không thể reassign (nhưng object/array vẫn mutable)
const obj = { a: 1 };
obj.a = 2;    // OK (mutate)
// obj = {};  // Error (reassign)
```

## 2. Arrow Functions
```js
const add = (a, b) => a + b;
const square = x => x * x;
const getObj = () => ({ key: 'value' }); // Return object literal

// Khác biệt với regular function:
// - Không có this riêng (lexical this)
// - Không có arguments object
// - Không thể dùng làm constructor (new)
// - Không có prototype
```

## 3. Template Literals
```js
const name = 'World';
const greeting = `Hello ${name}!`;

// Multi-line
const html = `
  <div>
    <p>${greeting}</p>
  </div>
`;

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '');
  }, '');
}
const msg = highlight`Hello ${name}, you have ${count} items`;
```

## 4. Modules (import/export)
```js
// Named export
export const PI = 3.14;
export function add(a, b) { return a + b; }

// Default export
export default class Calculator { }

// Import
import Calculator, { PI, add } from './math.js';
import * as math from './math.js';

// Dynamic import
const module = await import('./heavy-module.js');
```

## 5. Symbols
```js
const id = Symbol('id');
const obj = { [id]: 123, name: 'Phong' };
obj[id]; // 123

// Symbol không xuất hiện trong for...in, Object.keys
// Dùng cho: unique keys, tránh xung đột property names

// Well-known Symbols
class MyArray {
  [Symbol.iterator]() { /* custom iterator */ }
  [Symbol.toPrimitive](hint) { /* custom type conversion */ }
}
```

## 6. Proxy & Reflect
```js
const handler = {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    return Reflect.set(target, prop, value);
  },
};

const proxy = new Proxy({}, handler);
proxy.name = 'Phong'; // "Setting name = Phong"
proxy.name;            // "Getting name" → 'Phong'

// Ứng dụng: validation, logging, default values
const validated = new Proxy({}, {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    return Reflect.set(target, prop, value);
  },
});
```

## 7. Optional Chaining (?.)
```js
const user = { address: { street: '123 Main' } };

// Thay vì: user && user.address && user.address.street
user?.address?.street;     // '123 Main'
user?.phone?.number;       // undefined (không throw error)

// Với method
user?.getAddress?.();

// Với array
users?.[0]?.name;
```

## 8. Nullish Coalescing (??)
```js
// ?? chỉ check null và undefined
const value = 0 ?? 'default';     // 0
const value2 = '' ?? 'default';   // ''
const value3 = null ?? 'default'; // 'default'
const value4 = undefined ?? 'default'; // 'default'

// So sánh với ||
const value5 = 0 || 'default';   // 'default' (vì 0 là falsy)
const value6 = '' || 'default';  // 'default' (vì '' là falsy)

// Logical assignment
let a = null;
a ??= 'default'; // a = 'default'
a ||= 'fallback';
a &&= 'update';
```

## 9. Các tính năng ES2020+
```js
// Numeric separators
const billion = 1_000_000_000;

// globalThis
globalThis.setTimeout; // Hoạt động ở mọi environment

// Promise.allSettled (ES2020)
// Promise.any (ES2021)
// String.replaceAll (ES2021)
'hello'.replaceAll('l', 'r'); // 'herro'

// Object.hasOwn (ES2022) - thay cho hasOwnProperty
Object.hasOwn(obj, 'key');

// Array.at (ES2022)
[1, 2, 3].at(-1); // 3

// structuredClone (2022)
const deep = structuredClone(obj);

// Array grouping (ES2024)
const grouped = Object.groupBy(items, item => item.category);
```
