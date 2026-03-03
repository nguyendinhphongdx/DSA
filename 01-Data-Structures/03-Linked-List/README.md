# Linked List (Danh sách liên kết)

## 1. Khái niệm

Linked List là cấu trúc dữ liệu gồm các **node** liên kết với nhau. Mỗi node chứa **data** và **con trỏ** đến node tiếp theo.

Khác với Array (phần tử liên tiếp trong bộ nhớ), Linked List các node **nằm rải rác** và kết nối qua con trỏ.

```
Array:
┌────┬────┬────┬────┐
│ 10 │ 20 │ 30 │ 40 │   ← liên tiếp trong bộ nhớ
└────┴────┴────┴────┘

Singly Linked List:
┌────┬───┐    ┌────┬───┐    ┌────┬───┐    ┌────┬──────┐
│ 10 │ ──┼───→│ 20 │ ──┼───→│ 30 │ ──┼───→│ 40 │ null │
└────┴───┘    └────┴───┘    └────┴───┘    └────┴──────┘
  head                                        tail

Doubly Linked List:
       ┌────┬───┐    ┌───┬────┬───┐    ┌───┬────┬──────┐
null ←─┤ 10 │ ──┼───→│←──│ 20 │ ──┼───→│←──│ 30 │ null │
       └────┴───┘    └───┴────┴───┘    └───┴────┴──────┘
```

**Ví dụ thực tế:**
- Playlist nhạc (bài trước ← bài hiện tại → bài sau)
- Undo/Redo trong text editor
- Browser history (back/forward)

---

## 2. So sánh Array vs Linked List

| Tiêu chí          | Array  | Linked List |
|--------------------|--------|-------------|
| Truy cập index     | O(1)   | O(n)        |
| Thêm/Xóa đầu      | O(n)   | **O(1)**    |
| Thêm/Xóa cuối      | O(1)   | O(n)*       |
| Thêm/Xóa giữa      | O(n)   | **O(1)**    |
| Bộ nhớ             | Liên tiếp | Rải rác + overhead con trỏ |

> *O(1) nếu có tham chiếu đến tail node.
> Linked List thêm/xóa giữa O(1) **nếu đã biết vị trí node**, nhưng tìm node đó mất O(n).

**Khi nào dùng Linked List?**
- Thêm/xóa đầu danh sách thường xuyên
- Không cần truy cập ngẫu nhiên (random access)
- Không biết trước kích thước dữ liệu

---

## 3. Cài đặt cơ bản

```javascript
// Định nghĩa Node
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Tạo linked list: 1 → 2 → 3
const head = new ListNode(1);
head.next = new ListNode(2);
head.next.next = new ListNode(3);

// Duyệt linked list
function printList(head) {
  let current = head;
  const result = [];
  while (current) {
    result.push(current.val);
    current = current.next;
  }
  console.log(result.join(" → "));
}

printList(head); // 1 → 2 → 3
```

---

## 4. Các kỹ thuật quan trọng

### 4.1 Reverse Linked List

**Bài toán kinh điển nhất** của Linked List. Đảo ngược chiều liên kết.

```
Trước:  1 → 2 → 3 → 4 → null
Sau:    4 → 3 → 2 → 1 → null
```

**Ý tưởng:** Duyệt từng node, đổi hướng con trỏ `next` về phía ngược lại.

```javascript
function reverseList(head) {
  let prev = null;
  let current = head;

  while (current) {
    const next = current.next; // lưu node tiếp theo
    current.next = prev;       // đảo ngược liên kết
    prev = current;            // tiến prev lên
    current = next;            // tiến current lên
  }

  return prev; // prev giờ là head mới
}

// Trace: 1 → 2 → 3 → null
// Bước 1: prev=null, curr=1
//         1.next = null    → null ← 1   2 → 3
//         prev=1, curr=2
// Bước 2: prev=1, curr=2
//         2.next = 1       → null ← 1 ← 2   3
//         prev=2, curr=3
// Bước 3: prev=2, curr=3
//         3.next = 2       → null ← 1 ← 2 ← 3
//         prev=3, curr=null
// Return prev=3 → 3 → 2 → 1 → null ✓
```

---

### 4.2 Fast & Slow Pointers (Floyd's Algorithm)

Dùng 2 con trỏ: **slow** đi 1 bước, **fast** đi 2 bước.

#### Tìm điểm giữa Linked List

```
1 → 2 → 3 → 4 → 5
s   f                 bước 0
    s       f         bước 1
        s           f bước 2 → slow ở giữa!

1 → 2 → 3 → 4 → 5 → 6
s   f
    s       f
        s           f     → slow ở node 3 (giữa trái)
```

```javascript
function findMiddle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  return slow; // slow đang ở giữa
}
```

#### Phát hiện vòng lặp (Cycle Detection)

```
1 → 2 → 3 → 4 → 5
            ↑         │
            └─────────┘   ← có cycle!
```

Nếu có cycle, fast sẽ **đuổi kịp** slow (giống 2 người chạy trên đường tròn).

```javascript
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) return true; // gặp nhau → có cycle
  }

  return false; // fast chạy hết list → không có cycle
}

// Demo
const node1 = new ListNode(1);
const node2 = new ListNode(2);
const node3 = new ListNode(3);
node1.next = node2;
node2.next = node3;
node3.next = node2; // tạo cycle: 3 → 2

console.log(hasCycle(node1)); // true
```

---

### 4.3 Dummy Head Node

**Trick quan trọng:** Dùng node giả ở đầu để đơn giản hóa code, tránh xử lý edge case khi head thay đổi.

```javascript
// BÀI TOÁN: Merge Two Sorted Lists
// l1: 1 → 2 → 4
// l2: 1 → 3 → 4
// Kết quả: 1 → 1 → 2 → 3 → 4 → 4

function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(-1); // node giả
  let tail = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }

  // Nối phần còn lại
  tail.next = l1 || l2;

  return dummy.next; // bỏ qua node giả, trả head thật
}

// Trace:
// dummy → ?
// l1=1, l2=1: 1<=1 → chọn l1 → dummy → 1, l1=2
// l1=2, l2=1: 1<2  → chọn l2 → dummy → 1 → 1, l2=3
// l1=2, l2=3: 2<3  → chọn l1 → dummy → 1 → 1 → 2, l1=4
// l1=4, l2=3: 3<4  → chọn l2 → dummy → 1 → 1 → 2 → 3, l2=4
// l1=4, l2=4: 4<=4 → chọn l1 → dummy → 1 → 1 → 2 → 3 → 4, l1=null
// Nối l2=4 → dummy → 1 → 1 → 2 → 3 → 4 → 4 ✓
```

---

### 4.4 Remove Nth Node From End

**Bài toán:** Xóa node thứ n tính từ cuối.

**Trick:** Dùng 2 con trỏ cách nhau n bước. Khi fast đến cuối, slow ở đúng vị trí cần xóa.

```
Xóa node thứ 2 từ cuối:
1 → 2 → 3 → 4 → 5

Bước 1: fast đi trước n=2 bước
        s               f
        1 → 2 → 3 → 4 → 5

Bước 2: cả 2 cùng đi đến khi fast ở cuối
                    s         f
        1 → 2 → 3 → 4 → 5

Bước 3: slow.next = slow.next.next (xóa node 4)
        1 → 2 → 3 → 5
```

```javascript
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;

  // Fast đi trước n+1 bước
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }

  // Cả 2 đi cùng nhau
  while (fast) {
    slow = slow.next;
    fast = fast.next;
  }

  // Xóa node
  slow.next = slow.next.next;

  return dummy.next;
}
```

---

## 5. Bài tập luyện tập

### Easy
- [ ] [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) - Iterative & Recursive
- [ ] [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) - Dummy Head
- [ ] [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) - Fast & Slow
- [ ] [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/) - Fast & Slow
- [ ] [Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)

### Medium
- [ ] [Remove Nth Node From End](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) - Two Pointers
- [ ] [Reorder List](https://leetcode.com/problems/reorder-list/) - Find middle + Reverse + Merge
- [ ] [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) - Simulation
- [ ] [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) - Hash Map
- [ ] [Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii/) - Floyd's (tìm điểm vào cycle)

### Hard
- [ ] [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) - Heap / Divide & Conquer
- [ ] [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/)
- [ ] [LRU Cache](https://leetcode.com/problems/lru-cache/) - Doubly Linked List + Hash Map
