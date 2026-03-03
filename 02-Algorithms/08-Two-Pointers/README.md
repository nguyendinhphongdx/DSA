# Two Pointers (Hai con trỏ)

## 1. Khái niệm

Dùng **2 con trỏ** di chuyển trên mảng/chuỗi để giải bài toán trong **O(n)** thay vì O(n²).

```
Pattern 1: Opposite Direction (đối đầu)
  ┌─────────────────────────┐
  │  1  2  3  4  5  6  7  8│
  │  ↑                    ↑ │
  │ left                right│
  └─────────────────────────┘
  → Di chuyển vào giữa

Pattern 2: Same Direction (cùng chiều)
  ┌─────────────────────────┐
  │  1  2  3  4  5  6  7  8│
  │  ↑  ↑                   │
  │ slow fast               │
  └─────────────────────────┘
  → Di chuyển cùng hướng (fast nhanh hơn slow)
```

---

## 2. Pattern 1: Opposite Direction

### 2.1 Two Sum II (Sorted Array)

**Bài toán:** Mảng đã sắp xếp, tìm 2 số có tổng = target.

```
numbers = [2, 7, 11, 15], target = 9
             ↑               ↑
            left            right
            2 + 15 = 17 > 9 → right--
            2 + 11 = 13 > 9 → right--
            2 + 7 = 9 = target → FOUND! ✓
```

```javascript
function twoSum(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;  // tổng nhỏ quá → tăng left
    } else {
      right--; // tổng lớn quá → giảm right
    }
  }

  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [1, 2]
```

> **Tại sao hoạt động?** Mảng đã sort. Nếu tổng nhỏ → cần số lớn hơn → tăng left. Nếu tổng lớn → cần số nhỏ hơn → giảm right.

### 2.2 3Sum

**Bài toán:** Tìm tất cả bộ 3 có tổng = 0.

```
nums = [-1, 0, 1, 2, -1, -4]
→ [[-1, -1, 2], [-1, 0, 1]]
```

**Ý tưởng:** Sort + Fix 1 số + Two Sum cho 2 số còn lại.

```javascript
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // Bỏ qua duplicate cho số đầu tiên
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    // Pruning: nếu nums[i] > 0 thì không thể có tổng = 0
    if (nums[i] > 0) break;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // Bỏ qua duplicate
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4]));
// [[-1, -1, 2], [-1, 0, 1]]

// Sorted: [-4, -1, -1, 0, 1, 2]
// i=0 (-4): left=-1, right=2 → sum=-3 < 0, left++ ... không tìm thấy
// i=1 (-1): left=-1, right=2 → sum=0 ✓ → [-1,-1,2]
//           left=0, right=1 → sum=0 ✓ → [-1,0,1]
// i=2 (-1): trùng i=1 → skip
```

### 2.3 Container With Most Water

**Bài toán:** Tìm 2 đường thẳng chứa được nhiều nước nhất.

```
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

  8 |   █               █
  7 |   █           █   █   █
  6 |   █   █       █   █   █
  5 |   █   █   █   █   █   █
  4 |   █   █   █   █   █   █
  3 |   █   █   █   █   █ █ █
  2 |   █   █ █ █   █   █ █ █
  1 | █ █   █ █ █   █   █ █ █
    └─┴─┴─┴─┴─┴─┴─┴─┴─┴─
      0 1 2 3 4 5 6 7 8

Max area = min(8, 7) * (8 - 1) = 49
```

```javascript
function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let max = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    max = Math.max(max, width * h);

    // Di chuyển cột THẤP hơn (vì di chuyển cột cao không thể tăng diện tích)
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return max;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
```

---

## 3. Pattern 2: Same Direction

### 3.1 Remove Duplicates from Sorted Array

**Bài toán:** Xóa duplicate in-place, trả về length.

```
[1, 1, 2, 2, 3] → [1, 2, 3, _, _] return 3

slow: vị trí sẽ ghi giá trị unique tiếp theo
fast: duyệt qua toàn bộ mảng
```

```javascript
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1;
}

const arr = [1, 1, 2, 2, 3];
console.log(removeDuplicates(arr)); // 3
console.log(arr.slice(0, 3));       // [1, 2, 3]

// Trace:
// slow=0, fast=1: 1===1 → skip
// slow=0, fast=2: 2!==1 → slow=1, nums[1]=2 → [1,2,2,2,3]
// slow=1, fast=3: 2===2 → skip
// slow=1, fast=4: 3!==2 → slow=2, nums[2]=3 → [1,2,3,2,3]
// return 3 ✓
```

### 3.2 Move Zeroes

**Bài toán:** Đẩy tất cả 0 về cuối mảng, giữ nguyên thứ tự phần tử khác.

```
[0, 1, 0, 3, 12] → [1, 3, 12, 0, 0]
```

```javascript
function moveZeroes(nums) {
  let slow = 0; // vị trí sẽ ghi giá trị khác 0 tiếp theo

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;
    }
  }

  return nums;
}

console.log(moveZeroes([0, 1, 0, 3, 12])); // [1, 3, 12, 0, 0]

// Trace:
// fast=0 (0): skip
// fast=1 (1): swap nums[0],nums[1] → [1,0,0,3,12], slow=1
// fast=2 (0): skip
// fast=3 (3): swap nums[1],nums[3] → [1,3,0,0,12], slow=2
// fast=4 (12): swap nums[2],nums[4] → [1,3,12,0,0], slow=3
```

---

## 4. Nhận diện bài Two Pointers

| Dấu hiệu | Pattern |
|-----------|---------|
| Mảng **đã sort** + tìm pair | Opposite direction |
| Tìm **subarray/substring** | Same direction (Sliding Window) |
| **In-place** modify array | Same direction (slow/fast) |
| **Palindrome** check | Opposite direction |
| **Linked List** cycle/middle | Fast & Slow |

---

## 5. Bài tập luyện tập

### Easy
- [ ] [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [ ] [Move Zeroes](https://leetcode.com/problems/move-zeroes/)
- [ ] [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [ ] [Squares of a Sorted Array](https://leetcode.com/problems/squares-of-a-sorted-array/)

### Medium
- [ ] [Two Sum II](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [ ] [3Sum](https://leetcode.com/problems/3sum/)
- [ ] [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [ ] [Sort Colors](https://leetcode.com/problems/sort-colors/) - Dutch National Flag

### Hard
- [ ] [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
