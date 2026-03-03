# Heap / Priority Queue

## 1. Khái niệm

Heap là **cây nhị phân hoàn chỉnh** thỏa mãn tính chất heap:
- **Min Heap:** parent luôn **nhỏ hơn hoặc bằng** children → root là MIN
- **Max Heap:** parent luôn **lớn hơn hoặc bằng** children → root là MAX

```
Min Heap:           Max Heap:
      1                   9
    /   \               /   \
   3     5             7     5
  / \   /             / \   /
 7   8 9             3   4 2

Root = giá trị nhỏ nhất    Root = giá trị lớn nhất
```

**Ví dụ thực tế:**
- **Priority Queue** (hàng đợi ưu tiên) - bệnh viện: bệnh nhân nặng khám trước
- **Task Scheduler** - process ưu tiên cao chạy trước
- **Top K** problems - tìm K phần tử lớn/nhỏ nhất
- **Merge K sorted lists** - luôn lấy phần tử nhỏ nhất

> **Lưu ý:** JavaScript **KHÔNG CÓ** built-in Priority Queue. Phải tự cài đặt!

---

## 2. Biểu diễn bằng Array

Heap được lưu trong **array** (không cần tạo node/pointer):

```
Min Heap:      1
             /   \
            3     5
           / \
          7   8

Array: [1, 3, 5, 7, 8]
Index:  0  1  2  3  4

Công thức:
- Parent of i    = Math.floor((i - 1) / 2)
- Left child     = 2 * i + 1
- Right child    = 2 * i + 2

Ví dụ: node index 1 (val=3)
  Parent = (1-1)/2 = 0 (val=1) ✓
  Left   = 2*1+1 = 3 (val=7) ✓
  Right  = 2*1+2 = 4 (val=8) ✓
```

---

## 3. Các thao tác cơ bản

### 3.1 Insert (Thêm phần tử)

1. Thêm vào **cuối** array
2. **Bubble Up**: so sánh với parent, swap nếu nhỏ hơn → lặp lại

```
Insert 2 vào Min Heap [1, 3, 5, 7, 8]:

Bước 1: Thêm cuối → [1, 3, 5, 7, 8, 2]
                                       ↑
Bước 2: Bubble up
  parent of index 5 = index 2 (val=5)
  2 < 5 → swap → [1, 3, 2, 7, 8, 5]
                          ↑
  parent of index 2 = index 0 (val=1)
  2 > 1 → STOP → [1, 3, 2, 7, 8, 5] ✓
```

### 3.2 Extract Min/Max (Lấy phần tử ưu tiên nhất)

1. Lấy root (phần tử đầu)
2. Đưa phần tử **cuối** lên root
3. **Bubble Down**: so sánh với children, swap với child nhỏ hơn → lặp lại

```
Extract Min từ [1, 3, 2, 7, 8, 5]:

Bước 1: Lấy root = 1
Bước 2: Đưa cuối lên root → [5, 3, 2, 7, 8]
                               ↑
Bước 3: Bubble down
  children: left=3, right=2 → min child = 2 (index 2)
  5 > 2 → swap → [2, 3, 5, 7, 8]
                         ↑
  children: left=7, right=8 → min child = 7
  5 < 7 → STOP → [2, 3, 5, 7, 8] ✓
```

---

## 4. Cài đặt Min Heap

```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Helpers
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i) { return 2 * i + 1; }
  _right(i) { return 2 * i + 2; }
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert: thêm cuối + bubble up - O(log n)
  insert(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  _bubbleUp(i) {
    while (i > 0 && this.heap[i] < this.heap[this._parent(i)]) {
      this._swap(i, this._parent(i));
      i = this._parent(i);
    }
  }

  // Extract Min: lấy root + bubble down - O(log n)
  extractMin() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop(); // đưa cuối lên đầu
    this._bubbleDown(0);
    return min;
  }

  _bubbleDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = this._left(i);
      const right = this._right(i);

      if (left < n && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < n && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }

      if (smallest === i) break;
      this._swap(i, smallest);
      i = smallest;
    }
  }

  // Peek: xem min - O(1)
  peek() {
    return this.heap[0];
  }

  size() {
    return this.heap.length;
  }
}

// Demo
const heap = new MinHeap();
heap.insert(5);
heap.insert(3);
heap.insert(8);
heap.insert(1);
heap.insert(2);
console.log(heap.peek());       // 1 (nhỏ nhất)
console.log(heap.extractMin()); // 1
console.log(heap.extractMin()); // 2
console.log(heap.extractMin()); // 3
console.log(heap.peek());       // 5
```

---

## 5. Các bài kinh điển

### 5.1 Kth Largest Element

**Bài toán:** Tìm phần tử lớn thứ k.

```
nums = [3, 2, 1, 5, 6, 4], k = 2
Kết quả: 5 (phần tử lớn thứ 2)
```

**Ý tưởng:** Dùng Min Heap kích thước k. Khi heap đủ k phần tử, root chính là kth largest.

```javascript
function findKthLargest(nums, k) {
  const heap = new MinHeap();

  for (const num of nums) {
    heap.insert(num);

    // Chỉ giữ k phần tử lớn nhất
    if (heap.size() > k) {
      heap.extractMin(); // loại phần tử nhỏ nhất
    }
  }

  return heap.peek(); // root = phần tử nhỏ nhất trong k phần tử lớn nhất
}

// Trace: nums=[3,2,1,5,6,4], k=2
// 3: heap=[3]
// 2: heap=[2,3]       size=2=k
// 1: heap=[1,2,3]     size>k → extract 1 → heap=[2,3]
// 5: heap=[2,3,5]     size>k → extract 2 → heap=[3,5]
// 6: heap=[3,5,6]     size>k → extract 3 → heap=[5,6]
// 4: heap=[4,5,6]     size>k → extract 4 → heap=[5,6]
// peek = 5 ✓ (phần tử lớn thứ 2)
```

### 5.2 Merge K Sorted Lists

**Bài toán:** Gộp k danh sách đã sắp xếp thành 1 danh sách.

```
Input:  [[1,4,5], [1,3,4], [2,6]]
Output: [1, 1, 2, 3, 4, 4, 5, 6]
```

**Ý tưởng:** Dùng Min Heap chứa phần tử đầu tiên của mỗi list. Luôn lấy min, rồi thêm phần tử tiếp theo từ list đó.

```javascript
// Giả sử đã có MinHeap hỗ trợ compare function
function mergeKLists(lists) {
  const heap = new MinHeap(); // heap chứa {val, listIndex, elementIndex}
  const result = [];

  // Đưa phần tử đầu tiên của mỗi list vào heap
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      heap.insert({ val: lists[i][0], li: i, ei: 0 });
    }
  }

  while (heap.size() > 0) {
    const { val, li, ei } = heap.extractMin();
    result.push(val);

    // Thêm phần tử tiếp theo từ cùng list
    if (ei + 1 < lists[li].length) {
      heap.insert({ val: lists[li][ei + 1], li, ei: ei + 1 });
    }
  }

  return result;
}

// Trace:
// Heap: [{1,list0}, {1,list1}, {2,list2}]
// Extract 1 (list0) → thêm 4 (list0) → result=[1]
// Extract 1 (list1) → thêm 3 (list1) → result=[1,1]
// Extract 2 (list2) → thêm 6 (list2) → result=[1,1,2]
// Extract 3 (list1) → thêm 4 (list1) → result=[1,1,2,3]
// ...
```

---

## 6. Độ phức tạp

| Thao tác            | Time     | Giải thích                        |
|---------------------|----------|-----------------------------------|
| Insert              | O(log n) | Bubble up tối đa log n tầng      |
| Extract Min/Max     | O(log n) | Bubble down tối đa log n tầng    |
| Peek                | O(1)     | Chỉ xem root                     |
| Build Heap (heapify)| O(n)     | Bottom-up approach                |
| Space               | O(n)     | Lưu n phần tử                    |

---

## 7. Bài tập luyện tập

### Easy
- [ ] [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) - Max Heap
- [ ] [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)

### Medium
- [ ] [Kth Largest Element in Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) - Min Heap size k
- [ ] [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) - Heap + Frequency
- [ ] [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)
- [ ] [Task Scheduler](https://leetcode.com/problems/task-scheduler/) - Max Heap + Greedy
- [ ] [Design Twitter](https://leetcode.com/problems/design-twitter/) - Heap + Merge

### Hard
- [ ] [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) - 2 Heaps
- [ ] [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) - Min Heap
- [ ] [Sliding Window Median](https://leetcode.com/problems/sliding-window-median/) - 2 Heaps
