/**
 * LINKED LIST - Cài đặt từ đầu
 */

// ==========================================
// Node class
// ==========================================
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// ==========================================
// Singly Linked List
// ==========================================
class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Thêm vào đầu
  prepend(val) {
    // TODO: Implement
  }

  // Thêm vào cuối
  append(val) {
    // TODO: Implement
  }

  // Xóa node có giá trị val
  delete(val) {
    // TODO: Implement
  }

  // Tìm node có giá trị val
  find(val) {
    // TODO: Implement
  }

  // In danh sách
  print() {
    let current = this.head;
    const result = [];
    while (current) {
      result.push(current.val);
      current = current.next;
    }
    console.log(result.join(" -> "));
  }
}

// ==========================================
// Các bài tập cơ bản
// ==========================================

// 1. Reverse Linked List
function reverseList(head) {
  // TODO: Implement
}

// 2. Detect Cycle
function hasCycle(head) {
  // TODO: Implement (Floyd's Cycle Detection)
}

// 3. Merge Two Sorted Lists
function mergeTwoLists(l1, l2) {
  // TODO: Implement
}

// 4. Find Middle Node
function findMiddle(head) {
  // TODO: Implement (Fast & Slow Pointers)
}

// ==========================================
// Test
// ==========================================
const list = new SinglyLinkedList();
// list.append(1);
// list.append(2);
// list.append(3);
// list.print(); // 1 -> 2 -> 3
