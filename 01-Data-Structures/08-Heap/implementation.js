/**
 * MIN HEAP - Cài đặt từ đầu
 * JS không có built-in Priority Queue, cần tự implement
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Helper methods
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i) { return 2 * i + 1; }
  _right(i) { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Bubble up (sau khi insert)
  _heapifyUp(i) {
    // TODO: Implement
  }

  // Bubble down (sau khi extract)
  _heapifyDown(i) {
    // TODO: Implement
  }

  // Thêm phần tử
  insert(val) {
    // TODO: Implement
  }

  // Lấy phần tử nhỏ nhất
  extractMin() {
    // TODO: Implement
  }

  // Xem phần tử nhỏ nhất
  peek() {
    // TODO: Implement
  }

  size() {
    return this.heap.length;
  }
}

// ==========================================
// Bài tập: Kth Largest Element
// ==========================================
function findKthLargest(nums, k) {
  // TODO: Implement dùng MinHeap
}

// ==========================================
// Test
// ==========================================
const heap = new MinHeap();
// heap.insert(5);
// heap.insert(3);
// heap.insert(8);
// heap.insert(1);
// console.log(heap.extractMin()); // 1
// console.log(heap.peek());       // 3
