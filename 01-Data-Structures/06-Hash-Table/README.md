# Hash Table (Bảng băm)

## 1. Khái niệm

Hash Table lưu trữ dữ liệu dạng **key-value**, cho phép truy cập **trung bình O(1)**.

**Cách hoạt động:**
1. Nhận key → đưa qua **hash function** → ra index trong mảng
2. Lưu value tại index đó

```
Key: "apple" → hash("apple") → index 3
Key: "banana" → hash("banana") → index 7

Index:  0    1    2    3         4    5    6    7
      ┌────┬────┬────┬─────────┬────┬────┬────┬──────────┐
      │    │    │    │ "apple" │    │    │    │ "banana" │
      │    │    │    │  $1.50  │    │    │    │  $0.75   │
      └────┴────┴────┴─────────┴────┴────┴────┴──────────┘
```

**Ví dụ thực tế:**
- **Từ điển** (tra từ → nghĩa)
- **Database index** (tra nhanh record theo ID)
- **Cache** (Redis, Memcached)
- **Đếm tần suất** (đếm từ trong văn bản, đếm vote)

---

## 2. Hash Table trong JavaScript

JS cung cấp 3 cấu trúc hash-based:

### Object
```javascript
const prices = {};
prices["apple"] = 1.5;
prices["banana"] = 0.75;
console.log(prices["apple"]); // 1.5
console.log("apple" in prices); // true
delete prices["apple"];
```

### Map (khuyên dùng cho DSA)
```javascript
const map = new Map();
map.set("apple", 1.5);
map.set("banana", 0.75);

console.log(map.get("apple"));    // 1.5
console.log(map.has("banana"));   // true
console.log(map.size);            // 2
map.delete("apple");

// Duyệt
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
```

### Set (chỉ lưu key, không có value)
```javascript
const seen = new Set();
seen.add(1);
seen.add(2);
seen.add(1); // trùng → bỏ qua

console.log(seen.has(1));  // true
console.log(seen.size);    // 2

// Loại bỏ trùng lặp
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3]
```

### Khi nào dùng Object vs Map?

| Tiêu chí        | Object              | Map                    |
|------------------|---------------------|------------------------|
| Key type         | Chỉ string/symbol   | **Bất kỳ** (object, number...) |
| Thứ tự           | Không đảm bảo       | **Theo thứ tự chèn**  |
| Hiệu năng        | Tốt                 | **Tốt hơn** cho add/delete nhiều |
| Kích thước        | `Object.keys().length` | `map.size` O(1)      |

> **Tip:** Trong bài DSA, ưu tiên dùng **Map** và **Set**.

---

## 3. Collision (Xung đột)

Khi 2 key khác nhau cho ra **cùng index** → collision.

```
hash("apple")  → index 3  ┐
hash("cherry") → index 3  ┘  COLLISION!
```

### Cách xử lý:

**Chaining (phổ biến nhất):** Mỗi ô lưu một linked list.
```
Index 3: ["apple", $1.50] → ["cherry", $2.00]
```

**Open Addressing:** Tìm ô trống tiếp theo.

> Trong phỏng vấn, bạn không cần tự code hash table, nhưng cần **hiểu** collision và tại sao worst case là O(n).

---

## 4. Các pattern quan trọng

### 4.1 Frequency Counter (Đếm tần suất)

Pattern **phổ biến nhất** của Hash Table.

```javascript
// Đếm tần suất phần tử trong mảng
function frequency(arr) {
  const freq = new Map();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}

// Demo
console.log(frequency([1, 2, 2, 3, 3, 3]));
// Map { 1 => 1, 2 => 2, 3 => 3 }
```

**Ứng dụng: Top K Frequent Elements**

```
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1, 2]   ← 2 phần tử xuất hiện nhiều nhất
```

```javascript
function topKFrequent(nums, k) {
  // Bước 1: Đếm tần suất
  const freq = new Map();
  for (const n of nums) {
    freq.set(n, (freq.get(n) || 0) + 1);
  }

  // Bước 2: Bucket Sort - index = tần suất
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, count] of freq) {
    buckets[count].push(num);
  }

  // Bước 3: Lấy k phần tử từ bucket cao nhất
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }

  return result.slice(0, k);
}

// Demo
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]

// Trace:
// freq: {1: 3, 2: 2, 3: 1}
// buckets: [[], [3], [2], [1], [], [], []]
//           0    1    2    3   4   5   6
// Lấy từ cuối: bucket[3]=[1], bucket[2]=[2] → [1, 2]
```

---

### 4.2 Two Sum Pattern (Lưu complement)

Thay vì O(n²) brute force, dùng hash map lưu giá trị đã thấy.

```javascript
function twoSum(nums, target) {
  const seen = new Map(); // {value: index}

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }

    seen.set(nums[i], i);
  }

  return [];
}

// Demo
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]

// Trace:
// i=0: complement=9-2=7, seen chưa có 7, lưu {2:0}
// i=1: complement=9-7=2, seen CÓ 2 ở index 0 → [0, 1] ✓
```

---

### 4.3 Longest Consecutive Sequence

**Bài toán:** Tìm dãy số liên tiếp dài nhất (không cần theo thứ tự ban đầu).

```
Input:  [100, 4, 200, 1, 3, 2]
Output: 4  (dãy 1, 2, 3, 4)
```

**Ý tưởng:** Dùng Set. Chỉ bắt đầu đếm từ **đầu** dãy (không có `n-1` trong set).

```javascript
function longestConsecutive(nums) {
  const numSet = new Set(nums);
  let maxLength = 0;

  for (const n of numSet) {
    // Chỉ bắt đầu đếm nếu n là ĐẦU dãy
    if (!numSet.has(n - 1)) {
      let current = n;
      let length = 1;

      while (numSet.has(current + 1)) {
        current++;
        length++;
      }

      maxLength = Math.max(maxLength, length);
    }
  }

  return maxLength;
}

// Demo
console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4

// Trace:
// numSet = {100, 4, 200, 1, 3, 2}
// n=100: 99 không có → đầu dãy → đếm: 100 (101 không có) → length=1
// n=4:   3 CÓ → không phải đầu dãy → bỏ qua
// n=200: 199 không có → đầu dãy → đếm: 200 → length=1
// n=1:   0 không có → đầu dãy → đếm: 1,2,3,4 → length=4 ✓
// n=3:   2 CÓ → bỏ qua
// n=2:   1 CÓ → bỏ qua
// maxLength = 4
```

---

### 4.4 Subarray Sum Equals K

**Bài toán:** Đếm số subarray có tổng bằng k.

```
Input: nums = [1, 1, 1], k = 2
Output: 2  (subarray [1,1] xuất hiện 2 lần)
```

**Ý tưởng:** Dùng Prefix Sum + Hash Map.
Nếu `prefixSum[j] - prefixSum[i] = k` → subarray từ i+1 đến j có tổng k.

```javascript
function subarraySum(nums, k) {
  const prefixCount = new Map(); // {prefix_sum: số_lần_xuất_hiện}
  prefixCount.set(0, 1); // tổng 0 xuất hiện 1 lần (trước khi bắt đầu)

  let sum = 0;
  let count = 0;

  for (const num of nums) {
    sum += num;

    // Nếu (sum - k) đã xuất hiện trước đó → tồn tại subarray có tổng k
    if (prefixCount.has(sum - k)) {
      count += prefixCount.get(sum - k);
    }

    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }

  return count;
}

// Demo
console.log(subarraySum([1, 1, 1], 2));       // 2
console.log(subarraySum([1, 2, 3], 3));       // 2 ([1,2] và [3])

// Trace [1,1,1], k=2:
// prefixCount = {0: 1}
// num=1: sum=1, sum-k=-1 (không có), lưu {0:1, 1:1}
// num=1: sum=2, sum-k=0 (CÓ, count=1), lưu {0:1, 1:1, 2:1}
// num=1: sum=3, sum-k=1 (CÓ, count=1+1=2), lưu {0:1, 1:1, 2:1, 3:1}
// → count = 2 ✓
```

---

## 5. Độ phức tạp

| Thao tác            | Average  | Worst (nhiều collision) |
|---------------------|----------|------------------------|
| Insert (set)        | O(1)     | O(n)                   |
| Lookup (get/has)    | O(1)     | O(n)                   |
| Delete (delete)     | O(1)     | O(n)                   |
| Space               | O(n)     | O(n)                   |

---

## 6. Bài tập luyện tập

### Easy
- [ ] [Two Sum](https://leetcode.com/problems/two-sum/) - Hash Map
- [ ] [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) - Set
- [ ] [Valid Anagram](https://leetcode.com/problems/valid-anagram/) - Frequency Counter
- [ ] [Ransom Note](https://leetcode.com/problems/ransom-note/) - Frequency Counter

### Medium
- [ ] [Group Anagrams](https://leetcode.com/problems/group-anagrams/) - Hash Map + Sort key
- [ ] [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) - Frequency + Bucket Sort
- [ ] [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) - Set
- [ ] [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) - Prefix Sum + Map
- [ ] [Encode and Decode TinyURL](https://leetcode.com/problems/encode-and-decode-tinyurl/) - Hash Map

### Hard
- [ ] [LRU Cache](https://leetcode.com/problems/lru-cache/) - Hash Map + Doubly Linked List
- [ ] [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) - Hash Map + Sliding Window
