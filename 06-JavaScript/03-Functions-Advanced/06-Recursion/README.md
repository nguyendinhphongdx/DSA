# Recursion (Đệ quy)

## Đệ quy là gì?

Đệ quy là kỹ thuật một hàm **gọi chính nó** để giải quyết bài toán bằng cách chia nhỏ thành các bài toán con tương tự nhưng **nhỏ hơn**, cho đến khi gặp **trường hợp cơ sở** (base case) — điểm dừng.

Mỗi hàm đệ quy phải có:
1. **Base case** (điều kiện dừng): Trường hợp đơn giản nhất, trả về kết quả trực tiếp
2. **Recursive case**: Gọi lại chính nó với input nhỏ hơn, tiến gần về base case

---

## 1. Ví dụ kinh điển

### Factorial (Giai thừa)

```
5! = 5 × 4 × 3 × 2 × 1 = 120
n! = n × (n-1)!
0! = 1  ← base case
```

```js
function factorial(n) {
  // Base case
  if (n <= 1) return 1;
  // Recursive case
  return n * factorial(n - 1);
}

factorial(5); // 120
```

**Quá trình thực thi:**
```
factorial(5)
  = 5 * factorial(4)
  = 5 * 4 * factorial(3)
  = 5 * 4 * 3 * factorial(2)
  = 5 * 4 * 3 * 2 * factorial(1)
  = 5 * 4 * 3 * 2 * 1
  = 120
```

### Fibonacci

```
fib(0) = 0, fib(1) = 1  ← base cases
fib(n) = fib(n-1) + fib(n-2)
```

```js
// Cách đơn giản (chậm — O(2^n))
function fib(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

// Cách tối ưu với memoization (nhanh — O(n))
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 0) return 0;
  if (n === 1) return 1;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

fibMemo(50); // 12586269025 — tính rất nhanh
```

---

## 2. Đệ quy với cấu trúc dữ liệu

### Duyệt cây (Tree Traversal)

Đệ quy là cách **tự nhiên nhất** để xử lý cấu trúc cây — vì mỗi nhánh con cũng là một cây.

```js
const fileSystem = {
  name: 'root',
  children: [
    {
      name: 'src',
      children: [
        { name: 'index.js', children: [] },
        { name: 'App.js', children: [] },
        {
          name: 'components',
          children: [
            { name: 'Header.js', children: [] },
            { name: 'Footer.js', children: [] },
          ],
        },
      ],
    },
    { name: 'package.json', children: [] },
  ],
};

// Liệt kê tất cả files
function getAllFiles(node, path = '') {
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.children.length === 0) {
    return [currentPath]; // Base case: leaf node (file)
  }

  // Recursive case: duyệt từng child
  return node.children.flatMap(child => getAllFiles(child, currentPath));
}

getAllFiles(fileSystem);
// ['root/src/index.js', 'root/src/App.js', 'root/src/components/Header.js', ...]
```

### Flatten nested object/array

```js
// Làm phẳng mảng lồng nhau (tự viết flat)
function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // Đệ quy cho mảng con
    } else {
      result.push(item);              // Base case: không phải mảng
    }
  }
  return result;
}

flatten([1, [2, [3, [4]], 5], 6]); // [1, 2, 3, 4, 5, 6]
```

### Deep clone

```js
function deepClone(obj) {
  // Base cases
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  // Recursive case
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}
```

---

## 3. Call Stack và giới hạn

Mỗi lần gọi hàm (kể cả đệ quy), JavaScript thêm một **stack frame** vào **Call Stack**. Call Stack có giới hạn kích thước — nếu đệ quy quá sâu sẽ gây **Stack Overflow**.

```js
// ❌ Stack Overflow
function infinite() {
  return infinite(); // Không có base case!
}
// infinite(); // RangeError: Maximum call stack size exceeded

// ❌ Input quá lớn
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
// factorial(100000); // Stack Overflow — quá nhiều stack frames
```

**Giới hạn thường gặp:** Khoảng 10,000-25,000 stack frames tùy engine/browser.

---

## 4. Đệ quy vs Vòng lặp

Mọi đệ quy đều có thể viết lại bằng vòng lặp (iteration) và ngược lại. Tuy nhiên, mỗi cách phù hợp với tình huống khác nhau.

```js
// Đệ quy — tự nhiên cho bài toán phân chia
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Vòng lặp — hiệu quả hơn về bộ nhớ
function factorialLoop(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

| | Đệ quy | Vòng lặp |
|---|---|---|
| Đọc hiểu | Tự nhiên cho bài toán phân chia | Đơn giản cho lặp tuyến tính |
| Bộ nhớ | Tốn nhiều (call stack) | Ít |
| Stack Overflow | Có thể | Không |
| Phù hợp | Cây, đồ thị, phân chia | Duyệt tuyến tính |

**Quy tắc:**
- **Dùng đệ quy** khi: cấu trúc dữ liệu đệ quy (cây, đồ thị), bài toán chia để trị, code đệ quy dễ hiểu hơn nhiều
- **Dùng vòng lặp** khi: bài toán tuyến tính, performance quan trọng, input có thể rất lớn

---

## 5. Tail Recursion (Đệ quy đuôi)

Đệ quy đuôi là khi lời gọi đệ quy là **thao tác cuối cùng** trong hàm — không có tính toán nào sau lời gọi đệ quy. Một số engine có thể tối ưu (Tail Call Optimization - TCO) để không tốn thêm stack frame.

```js
// ❌ Không phải tail recursion
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // Sau khi gọi đệ quy, còn nhân với n
}

// ✅ Tail recursion — dùng accumulator
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, acc * n); // Lời gọi đệ quy là thao tác CUỐI CÙNG
}
```

**Lưu ý:** Hiện tại chỉ **Safari** hỗ trợ TCO. Chrome/Firefox/Node.js không hỗ trợ. Nếu cần xử lý input lớn, dùng vòng lặp thay vì phụ thuộc vào TCO.
