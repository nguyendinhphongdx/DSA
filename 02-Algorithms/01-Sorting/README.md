# Sorting Algorithms (Thuật toán sắp xếp)

## 1. Tổng quan

Sắp xếp là bài toán **cơ bản nhất** trong CS. Hiểu sorting giúp hiểu các khái niệm quan trọng: chia để trị, đệ quy, stability, in-place...

### Bảng so sánh

| Thuật toán      | Best     | Average  | Worst    | Space  | Stable | In-place |
|-----------------|----------|----------|----------|--------|--------|----------|
| Bubble Sort     | O(n)     | O(n²)   | O(n²)   | O(1)   | Yes    | Yes      |
| Selection Sort  | O(n²)   | O(n²)   | O(n²)   | O(1)   | No     | Yes      |
| Insertion Sort  | O(n)     | O(n²)   | O(n²)   | O(1)   | Yes    | Yes      |
| Merge Sort      | O(nlogn) | O(nlogn) | O(nlogn) | O(n)   | Yes    | No       |
| Quick Sort      | O(nlogn) | O(nlogn) | O(n²)   | O(logn)| No     | Yes      |
| Counting Sort   | O(n+k)  | O(n+k)  | O(n+k)  | O(k)   | Yes    | No       |

> **Stable sort:** giữ nguyên thứ tự tương đối của các phần tử bằng nhau.
> **In-place:** không cần bộ nhớ phụ đáng kể.

---

## 2. Bubble Sort - O(n²)

**Ý tưởng:** So sánh từng cặp liền kề, đẩy phần tử lớn về cuối (như bong bóng nổi lên).

```
[5, 3, 8, 1, 2]

Lượt 1: so sánh từng cặp, đẩy MAX về cuối
  [5,3] → swap → [3, 5, 8, 1, 2]
  [5,8] → ok   → [3, 5, 8, 1, 2]
  [8,1] → swap → [3, 5, 1, 8, 2]
  [8,2] → swap → [3, 5, 1, 2, 8]  ← 8 đã đúng vị trí

Lượt 2: [3, 5, 1, 2, | 8]
  [3,5] → ok
  [5,1] → swap → [3, 1, 5, 2, 8]
  [5,2] → swap → [3, 1, 2, 5, 8]  ← 5 đúng vị trí

... tiếp tục → [1, 2, 3, 5, 8] ✓
```

```javascript
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    // Tối ưu: nếu không swap lần nào → đã sắp xếp xong
    if (!swapped) break;
  }

  return arr;
}

console.log(bubbleSort([5, 3, 8, 1, 2])); // [1, 2, 3, 5, 8]
```

---

## 3. Insertion Sort - O(n²)

**Ý tưởng:** Giống xếp bài trên tay - lấy từng lá bài và chèn vào đúng vị trí trong phần đã sắp xếp.

```
[5, 3, 8, 1, 2]

Bước 1: Lấy 3, chèn vào [5]     → [3, 5, | 8, 1, 2]
Bước 2: Lấy 8, chèn vào [3,5]   → [3, 5, 8, | 1, 2]
Bước 3: Lấy 1, chèn vào [3,5,8] → [1, 3, 5, 8, | 2]
Bước 4: Lấy 2, chèn vào [1,3,5,8] → [1, 2, 3, 5, 8] ✓
```

```javascript
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    // Dịch các phần tử lớn hơn key sang phải
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
  }

  return arr;
}

console.log(insertionSort([5, 3, 8, 1, 2])); // [1, 2, 3, 5, 8]
```

> **Best case O(n):** Khi mảng đã gần sắp xếp → rất ít swap. Vì vậy Insertion Sort phù hợp cho dữ liệu nhỏ hoặc gần sorted.

---

## 4. Merge Sort - O(n log n) ★

**Ý tưởng (Divide & Conquer):**
1. **Chia** mảng thành 2 nửa
2. **Sort** từng nửa (đệ quy)
3. **Merge** 2 nửa đã sort thành 1 mảng

```
          [38, 27, 43, 3, 9, 82, 10]
                    /         \
          [38, 27, 43]    [3, 9, 82, 10]
           /      \          /       \
        [38]  [27, 43]   [3, 9]  [82, 10]
               /    \     /   \    /    \
            [27]  [43]  [3]  [9] [82]  [10]

              Merge ngược lại:
            [27]  [43] → [27, 43]
        [38]  [27, 43] → [27, 38, 43]
              [3]  [9] → [3, 9]
            [82]  [10] → [10, 82]
          [3, 9] [10, 82] → [3, 9, 10, 82]
    [27, 38, 43] [3, 9, 10, 82] → [3, 9, 10, 27, 38, 43, 82] ✓
```

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  // Nối phần còn lại
  return [...result, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

> **Tại sao dùng Merge Sort?** Luôn O(n log n), stable. Phù hợp khi cần stable sort hoặc sort linked list.

---

## 5. Quick Sort - O(n log n) avg ★

**Ý tưởng:**
1. Chọn **pivot** (thường là phần tử cuối)
2. **Partition**: chia mảng thành 2 phần (< pivot | > pivot)
3. Đệ quy sort 2 phần

```
[8, 3, 1, 7, 0, 10, 2]  pivot = 2

Partition: [< 2] [2] [> 2]
           [1, 0] [2] [8, 3, 7, 10]

Đệ quy:   [0, 1] [2] [3, 7, 8, 10]
→ [0, 1, 2, 3, 7, 8, 10] ✓
```

```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // chọn phần tử cuối làm pivot
  let i = low - 1;         // pointer cho vùng < pivot

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Đặt pivot vào đúng vị trí
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Demo
const arr = [8, 3, 1, 7, 0, 10, 2];
console.log(quickSort(arr)); // [0, 1, 2, 3, 7, 8, 10]

// Trace partition [8,3,1,7,0,10,2], pivot=2:
// j=0: 8>2 → skip
// j=1: 3>2 → skip
// j=2: 1<2 → i=0, swap arr[0],arr[2] → [1,3,8,7,0,10,2]
// j=3: 7>2 → skip
// j=4: 0<2 → i=1, swap arr[1],arr[4] → [1,0,8,7,3,10,2]
// j=5: 10>2 → skip
// Đặt pivot: swap arr[2],arr[6] → [1,0,2,7,3,10,8]
// return 2 (pivot ở index 2)
```

> **Tại sao Quick Sort phổ biến?** Trung bình O(n log n) với constant factor nhỏ, in-place (ít tốn bộ nhớ).
> **Worst case O(n²):** Khi pivot luôn là min hoặc max. Fix bằng random pivot.

---

## 6. Counting Sort - O(n + k)

**Ý tưởng:** Đếm tần suất mỗi giá trị, rồi xây lại mảng. Chỉ dùng cho **số nguyên trong range nhỏ**.

```
arr = [4, 2, 2, 8, 3, 3, 1]
range: 1 đến 8

Bước 1: Đếm tần suất
  count[1]=1, count[2]=2, count[3]=2, count[4]=1, count[8]=1

Bước 2: Xây lại mảng
  [1, 2, 2, 3, 3, 4, 8]
```

```javascript
function countingSort(arr) {
  if (arr.length === 0) return arr;

  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);

  // Đếm
  for (const num of arr) count[num]++;

  // Xây lại
  const result = [];
  for (let i = 0; i < count.length; i++) {
    for (let j = 0; j < count[i]; j++) {
      result.push(i);
    }
  }

  return result;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1]));
// [1, 2, 2, 3, 3, 4, 8]
```

---

## 7. Khi nào dùng thuật toán nào?

| Tình huống | Thuật toán | Lý do |
|------------|-----------|-------|
| Dữ liệu nhỏ (n < 50) | Insertion Sort | Đơn giản, overhead thấp |
| Dữ liệu gần sorted | Insertion Sort | Best case O(n) |
| Cần stable sort | Merge Sort | Luôn O(n log n) + stable |
| Hiệu năng chung tốt nhất | Quick Sort | Trung bình nhanh nhất, in-place |
| Sort linked list | Merge Sort | Không cần random access |
| Số nguyên, range nhỏ | Counting Sort | O(n + k), nhanh hơn comparison sort |
| JS built-in | `Array.sort()` | TimSort (hybrid merge + insertion) |

```javascript
// JS built-in sort
const arr = [3, 1, 4, 1, 5, 9];

// ⚠️ Mặc định sort theo STRING!
arr.sort();  // [1, 1, 3, 4, 5, 9] ← may mắn đúng
[10, 9, 1].sort(); // [1, 10, 9] ← SAI! vì "10" < "9" theo string

// ✓ Luôn truyền compare function cho số
arr.sort((a, b) => a - b); // tăng dần
arr.sort((a, b) => b - a); // giảm dần
```

---

## 8. Bài tập luyện tập

### Easy
- [ ] [Sort an Array](https://leetcode.com/problems/sort-an-array/) - Implement Merge/Quick Sort
- [ ] [Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/) - Two Pointers

### Medium
- [ ] [Sort Colors](https://leetcode.com/problems/sort-colors/) - Dutch National Flag (3-way partition)
- [ ] [Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/) - Quick Select
- [ ] [Merge Intervals](https://leetcode.com/problems/merge-intervals/) - Sort + Merge
- [ ] [Sort List](https://leetcode.com/problems/sort-list/) - Merge Sort on Linked List
- [ ] [Largest Number](https://leetcode.com/problems/largest-number/) - Custom comparator
