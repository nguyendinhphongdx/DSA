# Recursion (Đệ quy)

## 1. Khái niệm

Đệ quy là khi **hàm gọi chính nó** với input nhỏ hơn cho đến khi đạt **base case** (điều kiện dừng).

```
Ví dụ: Tính giai thừa 5!

factorial(5)
  → 5 * factorial(4)
      → 4 * factorial(3)
          → 3 * factorial(2)
              → 2 * factorial(1)
                  → 1  ← BASE CASE
              ← 2 * 1 = 2
          ← 3 * 2 = 6
      ← 4 * 6 = 24
  ← 5 * 24 = 120
```

**2 phần bắt buộc:**
1. **Base case:** Điều kiện dừng, trả về kết quả trực tiếp
2. **Recursive case:** Gọi lại chính nó với input nhỏ hơn

> **Không có base case = stack overflow!** (vòng lặp vô hạn)

**Ví dụ thực tế:**
- Cấu trúc thư mục (thư mục chứa thư mục con)
- Matryoshka (búp bê Nga lồng nhau)
- Fractals (hình tự đồng dạng)

---

## 2. Ví dụ cơ bản

### 2.1 Factorial (Giai thừa)

```javascript
function factorial(n) {
  // Base case
  if (n <= 1) return 1;

  // Recursive case
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
console.log(factorial(0)); // 1
```

### 2.2 Fibonacci

```
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2)

F(6): 0, 1, 1, 2, 3, 5, 8
```

```javascript
// Cách 1: Đệ quy thuần - O(2^n) ← RẤT CHẬM!
function fibSlow(n) {
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}

// Tại sao chậm? Vì tính lại nhiều lần:
//          fib(5)
//         /      \
//      fib(4)    fib(3)      ← fib(3) tính 2 lần!
//      /    \    /    \
//   fib(3) fib(2) fib(2) fib(1)  ← fib(2) tính 3 lần!

// Cách 2: Memoization (cache) - O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;

  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// Cách 3: Iterative (Bottom-Up) - O(n), O(1) space
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(fib(10)); // 55
console.log(fib(20)); // 6765
```

---

## 3. Cách tư duy đệ quy

### Bước 1: Xác định base case
### Bước 2: Giả sử hàm đệ quy đã hoạt động đúng cho input nhỏ hơn
### Bước 3: Dùng kết quả đó để giải bài toán hiện tại

**Ví dụ: Tính lũy thừa**

```javascript
// Bài toán: tính x^n
function power(x, n) {
  // Base case
  if (n === 0) return 1;

  // Tối ưu: x^n = (x^(n/2))^2
  if (n % 2 === 0) {
    const half = power(x, n / 2);
    return half * half;
  }

  return x * power(x, n - 1);
}

console.log(power(2, 10)); // 1024
console.log(power(3, 4));  // 81

// Trace power(2, 10):
// power(2,10) = power(2,5)²
// power(2,5)  = 2 * power(2,4)
// power(2,4)  = power(2,2)²
// power(2,2)  = power(2,1)²
// power(2,1)  = 2 * power(2,0) = 2 * 1 = 2
// power(2,2)  = 2² = 4
// power(2,4)  = 4² = 16
// power(2,5)  = 2 * 16 = 32
// power(2,10) = 32² = 1024
// Chỉ log₂(n) bước thay vì n bước!
```

---

## 4. Các dạng đệ quy phổ biến

### 4.1 Climbing Stairs

**Bài toán:** Có n bậc cầu thang, mỗi bước đi 1 hoặc 2 bậc. Có bao nhiêu cách lên?

```
n=1: [1]                         → 1 cách
n=2: [1,1] [2]                   → 2 cách
n=3: [1,1,1] [1,2] [2,1]        → 3 cách
n=4: [1,1,1,1] [1,1,2] [1,2,1] [2,1,1] [2,2] → 5 cách

Nhận ra: f(n) = f(n-1) + f(n-2) → giống Fibonacci!
```

```javascript
function climbStairs(n) {
  if (n <= 2) return n;
  let prev = 1, curr = 2;
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(climbStairs(4)); // 5
console.log(climbStairs(5)); // 8
```

### 4.2 Generate Parentheses

**Bài toán:** Sinh tất cả tổ hợp n cặp ngoặc hợp lệ.

```
n = 3 → ["((()))", "(()())", "(())()", "()(())", "()()()"]
```

```javascript
function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    // Base case: đủ 2n ký tự
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }

    // Có thể thêm '(' nếu chưa dùng hết
    if (open < n) {
      backtrack(current + "(", open + 1, close);
    }

    // Có thể thêm ')' nếu close < open (đảm bảo hợp lệ)
    if (close < open) {
      backtrack(current + ")", open, close + 1);
    }
  }

  backtrack("", 0, 0);
  return result;
}

console.log(generateParenthesis(3));
// ["((()))", "(()())", "(())()", "()(())", "()()()"]

// Trace n=2:
//                    ""
//                   /
//                 "("
//               /      \
//            "(("       "()"
//           /             \
//         "(()"          "()(""
//          |               |
//        "(())"          "()()"
// Result: ["(())", "()()"]
```

### 4.3 Subsets (Tập con)

**Bài toán:** Tìm tất cả tập con của mảng.

```
[1, 2, 3] → [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

**Ý tưởng:** Với mỗi phần tử, có 2 lựa chọn: **lấy** hoặc **không lấy**.

```javascript
function subsets(nums) {
  const result = [];

  function backtrack(index, current) {
    // Base case: đã xét hết tất cả phần tử
    if (index === nums.length) {
      result.push([...current]);
      return;
    }

    // Không lấy nums[index]
    backtrack(index + 1, current);

    // Lấy nums[index]
    current.push(nums[index]);
    backtrack(index + 1, current);
    current.pop(); // backtrack
  }

  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));
// [[], [3], [2], [2,3], [1], [1,3], [1,2], [1,2,3]]

// Cây quyết định:
//                       []
//               /               \
//        không lấy 1          lấy 1
//            []                 [1]
//          /     \            /     \
//     không 2   lấy 2   không 2   lấy 2
//       []       [2]      [1]     [1,2]
//      / \      / \      / \      / \
//    [] [3]  [2] [2,3] [1] [1,3] [1,2] [1,2,3]
```

---

## 5. Đệ quy vs Iteration

| Tiêu chí | Đệ quy | Iteration |
|-----------|---------|-----------|
| Đọc code | Dễ hiểu hơn | Phức tạp hơn |
| Hiệu năng | Chậm hơn (call stack) | Nhanh hơn |
| Bộ nhớ | O(n) stack space | O(1) |
| Stack overflow | Có thể | Không |

> **Quy tắc:** Mọi đệ quy đều có thể chuyển thành iteration (dùng stack tường minh).
> Trong phỏng vấn, viết đệ quy trước → tối ưu thành iteration nếu cần.

---

## 6. Bài tập luyện tập

### Easy
- [ ] [Fibonacci Number](https://leetcode.com/problems/fibonacci-number/)
- [ ] [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
- [ ] [Power of Two](https://leetcode.com/problems/power-of-two/)
- [ ] [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) - Recursive

### Medium
- [ ] [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)
- [ ] [Subsets](https://leetcode.com/problems/subsets/)
- [ ] [Permutations](https://leetcode.com/problems/permutations/)
- [ ] [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
- [ ] [Pow(x, n)](https://leetcode.com/problems/powx-n/)
