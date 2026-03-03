# Arrays (Mảng)

## 1. Khái niệm

Array là cấu trúc dữ liệu **cơ bản nhất**, lưu trữ các phần tử **liên tiếp trong bộ nhớ**.
Mỗi phần tử được truy cập qua **index** (bắt đầu từ 0).

```
Index:    0     1     2     3     4
        ┌─────┬─────┬─────┬─────┬─────┐
Array:  │  10 │  20 │  30 │  40 │  50 │
        └─────┴─────┴─────┴─────┴─────┘
```

**Ví dụ thực tế:**
- Danh sách điểm thi của sinh viên
- Giá cổ phiếu theo ngày
- Pixel của ảnh (mảng 2D)

```javascript
// Khai báo
const scores = [85, 92, 78, 95, 88];

// Truy cập phần tử - O(1)
console.log(scores[0]); // 85 (phần tử đầu)
console.log(scores[4]); // 88 (phần tử cuối)

// Các thao tác cơ bản
scores.push(90);       // Thêm cuối: [85, 92, 78, 95, 88, 90]
scores.pop();          // Xóa cuối:  [85, 92, 78, 95, 88]
scores.unshift(100);   // Thêm đầu:  [100, 85, 92, 78, 95, 88]  ← Chậm! O(n)
scores.shift();        // Xóa đầu:   [85, 92, 78, 95, 88]        ← Chậm! O(n)
scores.splice(2, 1);   // Xóa index 2: [85, 92, 95, 88]          ← Chậm! O(n)
```

> **Tại sao thêm/xóa đầu chậm?** Vì tất cả phần tử phía sau phải dịch chuyển.

---

## 2. Độ phức tạp

| Thao tác              | Time   | Giải thích                              |
|-----------------------|--------|-----------------------------------------|
| Truy cập (index)      | O(1)   | Nhảy thẳng đến vị trí trong bộ nhớ     |
| Tìm kiếm (value)      | O(n)   | Phải duyệt từng phần tử                |
| Thêm/Xóa cuối (push/pop) | O(1) | Không ảnh hưởng phần tử khác          |
| Thêm/Xóa đầu (shift/unshift) | O(n) | Phải dịch chuyển toàn bộ phần tử  |
| Thêm/Xóa giữa (splice) | O(n) | Phải dịch chuyển các phần tử sau       |

---

## 3. Các kỹ thuật quan trọng

### 3.1 Prefix Sum (Tổng tiền tố)

**Bài toán:** Tính tổng các phần tử từ index `l` đến `r` nhiều lần.

```
Mảng gốc:     [1,  2,  3,  4,  5]
Prefix Sum:   [1,  3,  6, 10, 15]
                │   │   │   │   │
                1  1+2 1+2+3 ...

Tổng từ index 1 đến 3 = prefix[3] - prefix[0] = 10 - 1 = 9
Kiểm tra: 2 + 3 + 4 = 9 ✓
```

```javascript
// Xây dựng prefix sum
function buildPrefixSum(arr) {
  const prefix = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    prefix[i] = prefix[i - 1] + arr[i];
  }
  return prefix;
}

// Tính tổng từ index l đến r
function rangeSum(prefix, l, r) {
  if (l === 0) return prefix[r];
  return prefix[r] - prefix[l - 1];
}

// Demo
const arr = [1, 2, 3, 4, 5];
const prefix = buildPrefixSum(arr); // [1, 3, 6, 10, 15]
console.log(rangeSum(prefix, 1, 3)); // 9 (= 2 + 3 + 4)
console.log(rangeSum(prefix, 0, 4)); // 15 (= 1 + 2 + 3 + 4 + 5)
console.log(rangeSum(prefix, 2, 2)); // 3
```

**Khi nào dùng:** Cần tính tổng đoạn con nhiều lần → thay vì O(n) mỗi lần, chỉ cần O(1).

---

### 3.2 Kadane's Algorithm (Maximum Subarray)

**Bài toán:** Tìm đoạn con liên tiếp có tổng lớn nhất.

```
arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
                  ╰──────────────╯
                  max subarray = 4 + (-1) + 2 + 1 = 6
```

**Ý tưởng:** Tại mỗi vị trí, quyết định: **tiếp tục đoạn cũ** hay **bắt đầu đoạn mới**?

```javascript
function maxSubarraySum(arr) {
  let currentSum = arr[0];
  let maxSum = arr[0];

  for (let i = 1; i < arr.length; i++) {
    // Nếu tổng hiện tại + arr[i] < arr[i] → bắt đầu lại từ arr[i]
    currentSum = Math.max(arr[i], currentSum + arr[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Demo
console.log(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubarraySum([1]));          // 1
console.log(maxSubarraySum([-1, -2, -3])); // -1 (phần tử lớn nhất)

// Trace từng bước:
// i=0: current=-2, max=-2
// i=1: current=max(1, -2+1)=1, max=1
// i=2: current=max(-3, 1-3)=-2, max=1
// i=3: current=max(4, -2+4)=4, max=4
// i=4: current=max(-1, 4-1)=3, max=4
// i=5: current=max(2, 3+2)=5, max=5
// i=6: current=max(1, 5+1)=6, max=6    ← kết quả
// i=7: current=max(-5, 6-5)=1, max=6
// i=8: current=max(4, 1+4)=5, max=6
```

---

### 3.3 Two Sum (dùng Hash Map)

**Bài toán:** Tìm 2 phần tử trong mảng có tổng bằng target.

```javascript
// Cách brute force: O(n²) - duyệt 2 vòng lặp
// Cách tối ưu: O(n) - dùng Hash Map

function twoSum(nums, target) {
  const map = new Map(); // lưu {giá_trị: index}

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Demo
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1] vì 2 + 7 = 9

// Trace:
// i=0: complement = 9-2 = 7, map chưa có 7 → lưu {2: 0}
// i=1: complement = 9-7 = 2, map CÓ 2 ở index 0 → return [0, 1] ✓
```

---

### 3.4 Dutch National Flag (Sort 0, 1, 2)

**Bài toán:** Sắp xếp mảng chỉ chứa 0, 1, 2 trong O(n) với O(1) space.

```
Trước: [2, 0, 2, 1, 1, 0]
Sau:   [0, 0, 1, 1, 2, 2]
```

```javascript
function sortColors(nums) {
  let low = 0;              // biên trái (vùng 0)
  let mid = 0;              // con trỏ duyệt
  let high = nums.length - 1; // biên phải (vùng 2)

  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else { // nums[mid] === 2
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
      // không tăng mid vì phần tử swap về chưa xét
    }
  }

  return nums;
}

// Demo
console.log(sortColors([2, 0, 2, 1, 1, 0])); // [0, 0, 1, 1, 2, 2]
console.log(sortColors([2, 0, 1]));            // [0, 1, 2]
```

---

### 3.5 Merge Intervals

**Bài toán:** Gộp các khoảng chồng chéo.

```
Input:  [[1,3], [2,6], [8,10], [15,18]]
         ├──┤
           ├─────┤         → gộp thành [1,6]
                    ├──┤   → giữ nguyên [8,10]
                              ├────┤ → giữ nguyên [15,18]
Output: [[1,6], [8,10], [15,18]]
```

```javascript
function mergeIntervals(intervals) {
  // Bước 1: sắp xếp theo điểm bắt đầu
  intervals.sort((a, b) => a[0] - b[0]);

  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];

    if (current[0] <= last[1]) {
      // Chồng chéo → mở rộng
      last[1] = Math.max(last[1], current[1]);
    } else {
      // Không chồng → thêm mới
      result.push(current);
    }
  }

  return result;
}

// Demo
console.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));
// [[1,6],[8,10],[15,18]]

console.log(mergeIntervals([[1,4],[4,5]]));
// [[1,5]]
```

---

## 4. Bài tập luyện tập

### Easy
- [ ] [Two Sum](https://leetcode.com/problems/two-sum/) - Hash Map
- [ ] [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) - Greedy / Kadane
- [ ] [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) - Set
- [ ] [Move Zeroes](https://leetcode.com/problems/move-zeroes/) - Two Pointers
- [ ] [Rotate Array](https://leetcode.com/problems/rotate-array/) - Reverse trick

### Medium
- [ ] [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) - Prefix/Suffix
- [ ] [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) - Kadane
- [ ] [Merge Intervals](https://leetcode.com/problems/merge-intervals/) - Sorting + Greedy
- [ ] [3Sum](https://leetcode.com/problems/3sum/) - Sort + Two Pointers
- [ ] [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) - Two Pointers

### Hard
- [ ] [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) - Two Pointers / Stack
- [ ] [First Missing Positive](https://leetcode.com/problems/first-missing-positive/) - Index marking
