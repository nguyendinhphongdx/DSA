# Queue (Hàng đợi)

## 1. Khái niệm

Queue hoạt động theo nguyên tắc **FIFO** (First In, First Out) - phần tử vào **trước** ra **trước**.
Giống như xếp hàng mua vé: người đến trước được phục vụ trước.

```
Enqueue (thêm)                              Dequeue (lấy ra)
    ↓                                           ↓
┌─────┬─────┬─────┬─────┬─────┐
│  5  │  4  │  3  │  2  │  1  │  →  1 ra trước
└─────┴─────┴─────┴─────┴─────┘
 rear                    front
```

**Ví dụ thực tế:**
- Hàng đợi in ấn (print queue)
- Xử lý request trong web server
- BFS (duyệt đồ thị theo chiều rộng)
- Message Queue (RabbitMQ, Kafka)

---

## 2. Các loại Queue

### Queue thường (FIFO)
```javascript
// JS dùng Array (đơn giản nhưng shift() là O(n))
const queue = [];
queue.push(1);     // enqueue: [1]
queue.push(2);     // enqueue: [1, 2]
queue.push(3);     // enqueue: [1, 2, 3]
queue.shift();     // dequeue: 1 ← (O(n) vì phải dịch mảng!)
queue.shift();     // dequeue: 2
```

> **Cảnh báo:** `Array.shift()` là O(n). Nếu cần hiệu năng, tự cài Queue bằng Linked List hoặc dùng index pointer.

### Queue hiệu năng cao (dùng object)
```javascript
class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(val) {
    this.items[this.tail] = val;
    this.tail++;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const val = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return val;
  }

  peek() {
    return this.items[this.head];
  }

  isEmpty() {
    return this.tail === this.head;
  }

  size() {
    return this.tail - this.head;
  }
}

// Demo - tất cả O(1)
const q = new Queue();
q.enqueue("task1");
q.enqueue("task2");
q.enqueue("task3");
console.log(q.dequeue()); // "task1"
console.log(q.peek());    // "task2"
console.log(q.size());    // 2
```

### Deque (Double-Ended Queue)
Cho phép thêm/lấy từ **cả hai đầu**.

```
         ← push/pop front              push/pop back →
            ┌─────┬─────┬─────┬─────┐
            │  1  │  2  │  3  │  4  │
            └─────┴─────┴─────┴─────┘
```

```javascript
// JS Array đã hỗ trợ Deque
const deque = [];
deque.push(3);     // back:  [3]
deque.push(4);     // back:  [3, 4]
deque.unshift(2);  // front: [2, 3, 4]
deque.unshift(1);  // front: [1, 2, 3, 4]
deque.pop();       // back:  4, deque = [1, 2, 3]
deque.shift();     // front: 1, deque = [2, 3]
```

---

## 3. Các kỹ thuật quan trọng

### 3.1 BFS dùng Queue

Queue là **xương sống** của BFS (Breadth-First Search). Xem chi tiết ở phần Graph.

```
Duyệt cây theo tầng (Level Order):

        1
       / \
      2    3
     / \    \
    4   5    6

Queue: [1] → xử lý 1, thêm con 2,3
Queue: [2, 3] → xử lý 2, thêm con 4,5
Queue: [3, 4, 5] → xử lý 3, thêm con 6
Queue: [4, 5, 6] → xử lý 4,5,6

Kết quả: [[1], [2,3], [4,5,6]]
```

```javascript
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}
```

---

### 3.2 Implement Queue using Two Stacks

**Bài toán kinh điển:** Dùng 2 stack để giả lập queue.

**Ý tưởng:** Stack1 cho push, Stack2 cho pop. Khi pop mà stack2 rỗng → đổ hết stack1 sang stack2.

```
Push 1,2,3:         Pop:
  stack1: [1,2,3]   stack2 rỗng → đổ stack1 sang stack2
  stack2: []         stack1: []
                     stack2: [3,2,1] → pop → 1 (FIFO ✓)
```

```javascript
class QueueUsingStacks {
  constructor() {
    this.pushStack = [];
    this.popStack = [];
  }

  enqueue(val) {
    this.pushStack.push(val);
  }

  dequeue() {
    if (this.popStack.length === 0) {
      // Đổ hết từ pushStack sang popStack
      while (this.pushStack.length) {
        this.popStack.push(this.pushStack.pop());
      }
    }
    return this.popStack.pop();
  }

  peek() {
    if (this.popStack.length === 0) {
      while (this.pushStack.length) {
        this.popStack.push(this.pushStack.pop());
      }
    }
    return this.popStack[this.popStack.length - 1];
  }

  isEmpty() {
    return this.pushStack.length === 0 && this.popStack.length === 0;
  }
}

// Demo
const myQueue = new QueueUsingStacks();
myQueue.enqueue(1);
myQueue.enqueue(2);
myQueue.enqueue(3);
console.log(myQueue.dequeue()); // 1 (FIFO)
console.log(myQueue.dequeue()); // 2
myQueue.enqueue(4);
console.log(myQueue.dequeue()); // 3
console.log(myQueue.dequeue()); // 4
```

---

### 3.3 Sliding Window Maximum

**Bài toán:** Tìm giá trị lớn nhất trong mỗi cửa sổ kích thước k.

```
nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

Window [1, 3, -1]     → max = 3
Window [3, -1, -3]    → max = 3
Window [-1, -3, 5]    → max = 5
Window [-3, 5, 3]     → max = 5
Window [5, 3, 6]      → max = 6
Window [3, 6, 7]      → max = 7

Output: [3, 3, 5, 5, 6, 7]
```

Dùng **Deque** (Monotonic Deque) - luôn giữ phần tử giảm dần:

```javascript
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // lưu INDEX, giảm dần theo giá trị

  for (let i = 0; i < nums.length; i++) {
    // Xóa phần tử ngoài window
    while (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Xóa phần tử nhỏ hơn nums[i] (giữ deque giảm dần)
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // Từ khi window đủ kích thước k → lấy max
    if (i >= k - 1) {
      result.push(nums[deque[0]]); // đầu deque luôn là max
    }
  }

  return result;
}

// Demo
console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [3, 3, 5, 5, 6, 7]

// Trace:
// i=0 (1): deque=[0]
// i=1 (3): 3>1 → pop 0 → deque=[1]
// i=2 (-1): deque=[1,2] → window đủ → max=nums[1]=3
// i=3 (-3): deque=[1,2,3] → max=nums[1]=3
// i=4 (5): index 1 ngoài window → shift
//          5>-3, 5>-1 → pop hết → deque=[4] → max=5
// i=5 (3): deque=[4,5] → max=nums[4]=5
// i=6 (6): 6>3, 6>5 → pop hết → deque=[6] → max=6
// i=7 (7): 7>6 → pop → deque=[7] → max=7
```

---

## 4. Nhận diện bài dùng Queue

- Bài **BFS** (duyệt theo tầng, đường đi ngắn nhất)
- Bài mô phỏng **hàng đợi** (task scheduling, request handling)
- Bài **Sliding Window** cần biết min/max → Monotonic Deque
- Bài yêu cầu xử lý theo **thứ tự đến trước**

---

## 5. Bài tập luyện tập

### Easy
- [ ] [Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)
- [ ] [Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/)
- [ ] [Number of Recent Calls](https://leetcode.com/problems/number-of-recent-calls/)

### Medium
- [ ] [Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)
- [ ] [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) - BFS + Queue
- [ ] [Walls and Gates](https://leetcode.com/problems/walls-and-gates/) - Multi-source BFS

### Hard
- [ ] [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) - Monotonic Deque
