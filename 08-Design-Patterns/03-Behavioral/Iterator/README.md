# Iterator Pattern

## 1. Khái niệm

Cung cấp cách **duyệt qua collection** mà không cần biết cấu trúc bên trong.

---

## 2. JavaScript Built-in Iterator Protocol

```javascript
// Mọi object có Symbol.iterator đều iterable
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { value: undefined, done: true }

// for...of dùng iterator protocol
for (const item of arr) {
  console.log(item);
}
```

---

## 3. Custom Iterator

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;

    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Dùng với for...of
for (const n of new Range(1, 10, 2)) {
  console.log(n); // 1, 3, 5, 7, 9
}

// Dùng với spread
const numbers = [...new Range(1, 5)]; // [1, 2, 3, 4, 5]
```

---

## 4. Generators (Cách dễ hơn)

```javascript
// Generator function = easy iterator
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

for (const n of range(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}

// Infinite iterator
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Lấy 10 số fibonacci đầu tiên
const fib = fibonacci();
const first10 = Array.from({ length: 10 }, () => fib.next().value);
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## 5. Tree Traversal Iterator

```javascript
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }

  // DFS iterator
  *[Symbol.iterator]() {
    yield this.value;
    for (const child of this.children) {
      yield* child; // Delegate to child's iterator
    }
  }
}

const tree = new TreeNode('root', [
  new TreeNode('A', [new TreeNode('A1'), new TreeNode('A2')]),
  new TreeNode('B', [new TreeNode('B1')]),
]);

for (const value of tree) {
  console.log(value); // root, A, A1, A2, B, B1
}
```

---

## 6. Bài tập

```javascript
// Tạo LinkedList class với custom iterator:
// - Có thể dùng for...of để duyệt
// - Có thể dùng spread [...list]
// - Có thể dùng destructuring [first, second] = list
```
