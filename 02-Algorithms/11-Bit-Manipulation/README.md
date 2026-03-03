# Bit Manipulation (Thao tác bit)

## 1. Khái niệm

Máy tính lưu trữ mọi thứ dưới dạng **bit** (0 và 1). Thao tác bit cực nhanh vì xử lý trực tiếp ở mức phần cứng.

```
Số 13 trong binary:
13 = 8 + 4 + 1 = 2³ + 2² + 2⁰
13 → 1101

   bit 3  bit 2  bit 1  bit 0
    1       1      0      1     = 13
    8       4      2      1
```

```javascript
// Chuyển đổi
(13).toString(2);     // "1101" (số → binary string)
parseInt("1101", 2);  // 13    (binary string → số)
```

---

## 2. Các phép toán cơ bản

### Bảng chân trị

```
AND (&)   OR (|)    XOR (^)   NOT (~)
0 & 0 = 0  0 | 0 = 0  0 ^ 0 = 0  ~0 = 1
0 & 1 = 0  0 | 1 = 1  0 ^ 1 = 1  ~1 = 0
1 & 0 = 0  1 | 0 = 1  1 ^ 0 = 1
1 & 1 = 1  1 | 1 = 1  1 ^ 1 = 0
```

```javascript
// AND: cả 2 bit đều 1 → 1
12 & 10  // 1100 & 1010 = 1000 = 8

// OR: ít nhất 1 bit là 1 → 1
12 | 10  // 1100 | 1010 = 1110 = 14

// XOR: 2 bit khác nhau → 1
12 ^ 10  // 1100 ^ 1010 = 0110 = 6

// NOT: đảo tất cả bit
~12      // ~00001100 = 11110011 = -13 (two's complement)

// Left Shift: nhân 2
5 << 1   // 101 → 1010 = 10 (5 * 2)
5 << 3   // 101 → 101000 = 40 (5 * 8)

// Right Shift: chia 2
20 >> 1  // 10100 → 1010 = 10 (20 / 2)
20 >> 2  // 10100 → 101 = 5 (20 / 4)
```

---

## 3. Các trick quan trọng

### 3.1 Kiểm tra chẵn/lẻ
```javascript
// Bit cuối cùng: 0 = chẵn, 1 = lẻ
function isEven(n) {
  return (n & 1) === 0;
}

console.log(isEven(4));  // true  (100 & 001 = 000)
console.log(isEven(7));  // false (111 & 001 = 001)
```

### 3.2 XOR tricks
```javascript
// a ^ a = 0  (XOR chính nó = 0)
// a ^ 0 = a  (XOR với 0 = giữ nguyên)
// XOR có tính giao hoán: a ^ b = b ^ a

5 ^ 5     // 0
5 ^ 0     // 5
3 ^ 5 ^ 3 // (3 ^ 3) ^ 5 = 0 ^ 5 = 5

// Swap không dùng biến tạm
let a = 5, b = 3;
a = a ^ b;  // a = 5^3
b = a ^ b;  // b = 5^3^3 = 5
a = a ^ b;  // a = 5^3^5 = 3
// a = 3, b = 5
```

### 3.3 Kiểm tra power of 2
```javascript
// Power of 2 chỉ có 1 bit 1:
// 1=1, 2=10, 4=100, 8=1000, 16=10000

// n & (n-1) xóa bit 1 thấp nhất
//   8: 1000
//   7: 0111
//   &: 0000  → là power of 2!

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(16)); // true  (10000 & 01111 = 0)
console.log(isPowerOfTwo(6));  // false (110 & 101 = 100 ≠ 0)
```

### 3.4 Đếm số bit 1 (Hamming Weight)
```javascript
function hammingWeight(n) {
  let count = 0;
  while (n) {
    n &= (n - 1); // xóa bit 1 thấp nhất
    count++;
  }
  return count;
}

console.log(hammingWeight(11)); // 3 (1011 có 3 bit 1)
console.log(hammingWeight(7));  // 3 (111)

// Trace n=11 (1011):
// 1011 & 1010 = 1010, count=1
// 1010 & 1001 = 1000, count=2
// 1000 & 0111 = 0000, count=3
// n=0 → return 3 ✓
```

---

## 4. Các bài kinh điển

### 4.1 Single Number

**Bài toán:** Mỗi phần tử xuất hiện 2 lần, chỉ 1 phần tử xuất hiện 1 lần. Tìm nó.

```
[2, 2, 1] → 1
[4, 1, 2, 1, 2] → 4
```

**Ý tưởng:** XOR tất cả → các cặp tự triệt tiêu (a^a=0), còn lại phần tử lẻ.

```javascript
function singleNumber(nums) {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4

// Trace:
// 0 ^ 4 = 4
// 4 ^ 1 = 5
// 5 ^ 2 = 7
// 7 ^ 1 = 6  (1 triệt tiêu)
// 6 ^ 2 = 4  (2 triệt tiêu) → 4 ✓
```

### 4.2 Missing Number

**Bài toán:** Mảng 0..n thiếu 1 số. Tìm số thiếu.

```
[3, 0, 1] → 2 (thiếu 2)
```

**Ý tưởng:** XOR tất cả số trong mảng với 0..n. Các cặp triệt tiêu, còn lại số thiếu.

```javascript
function missingNumber(nums) {
  let result = nums.length; // bắt đầu với n

  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i];
  }

  return result;
}

console.log(missingNumber([3, 0, 1])); // 2

// n=3, XOR: 3 ^ (0^3) ^ (1^0) ^ (2^1)
//         = 3 ^ 3 ^ 0 ^ 0 ^ 1 ^ 1 ^ 2
//         = 0 ^ 0 ^ 0 ^ 2
//         = 2 ✓

// Cách khác (dễ hiểu hơn):
function missingNumber2(nums) {
  const n = nums.length;
  const expectedSum = n * (n + 1) / 2;
  const actualSum = nums.reduce((a, b) => a + b, 0);
  return expectedSum - actualSum;
}
```

### 4.3 Counting Bits

**Bài toán:** Đếm số bit 1 của mỗi số từ 0 đến n.

```
n = 5 → [0, 1, 1, 2, 1, 2]
0: 0000 → 0
1: 0001 → 1
2: 0010 → 1
3: 0011 → 2
4: 0100 → 1
5: 0101 → 2
```

```javascript
function countBits(n) {
  const dp = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    // dp[i] = dp[i >> 1] + (i & 1)
    // i >> 1: bỏ bit cuối
    // i & 1: bit cuối là 0 hay 1
    dp[i] = dp[i >> 1] + (i & 1);
  }

  return dp;
}

console.log(countBits(5)); // [0, 1, 1, 2, 1, 2]

// dp[1] = dp[0] + 1 = 1    (1 = 0 shifted left + 1)
// dp[2] = dp[1] + 0 = 1    (10 = 1 shifted left + 0)
// dp[3] = dp[1] + 1 = 2    (11 = 1 shifted left + 1)
// dp[4] = dp[2] + 0 = 1    (100 = 10 shifted left + 0)
// dp[5] = dp[2] + 1 = 2    (101 = 10 shifted left + 1)
```

### 4.4 Sum of Two Integers (không dùng + -)

```javascript
function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1; // carry = AND rồi shift left
    a = a ^ b;                   // sum without carry = XOR
    b = carry;
  }
  return a;
}

console.log(getSum(5, 3)); // 8

// Trace 5 + 3:
//   101 (5)
// ^ 011 (3)
// = 110 (6)  ← XOR = sum without carry
//   101
// & 011
// = 001 → 010 (carry shifted)

// Tiếp:
//   110
// ^ 010
// = 100 (4)  ← XOR
//   110
// & 010
// = 010 → 100 (carry)

// Tiếp:
//   100
// ^ 100
// = 000  ← XOR
//   100
// & 100
// = 100 → 1000 (carry)

// Tiếp:
//   000
// ^ 1000
// = 1000 = 8, carry = 0 → DONE ✓
```

---

## 5. Cheat Sheet

| Trick | Code | Ý nghĩa |
|-------|------|---------|
| Kiểm tra bit thứ k | `(n >> k) & 1` | Bit k là 0 hay 1 |
| Set bit thứ k = 1 | `n \| (1 << k)` | Bật bit k |
| Set bit thứ k = 0 | `n & ~(1 << k)` | Tắt bit k |
| Toggle bit thứ k | `n ^ (1 << k)` | Đảo bit k |
| Xóa bit 1 thấp nhất | `n & (n - 1)` | Đếm bit 1, check power of 2 |
| Lấy bit 1 thấp nhất | `n & (-n)` | Isolate lowest set bit |
| Kiểm tra chẵn | `(n & 1) === 0` | Nhanh hơn n % 2 |
| Nhân/Chia 2 | `n << 1` / `n >> 1` | Shift operations |

---

## 6. Bài tập luyện tập

### Easy
- [ ] [Single Number](https://leetcode.com/problems/single-number/) - XOR
- [ ] [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) - n & (n-1)
- [ ] [Counting Bits](https://leetcode.com/problems/counting-bits/) - DP + Bit
- [ ] [Missing Number](https://leetcode.com/problems/missing-number/) - XOR
- [ ] [Reverse Bits](https://leetcode.com/problems/reverse-bits/)
- [ ] [Power of Two](https://leetcode.com/problems/power-of-two/)

### Medium
- [ ] [Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/) - Bit manipulation
- [ ] [Subsets](https://leetcode.com/problems/subsets/) - Bitmask approach
- [ ] [Single Number II](https://leetcode.com/problems/single-number-ii/) - Bit counting
