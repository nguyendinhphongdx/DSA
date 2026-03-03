/**
 * BINARY SEARCH TREE (BST)
 * Tính chất: left < root < right
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  // Chèn node
  insert(val) {
    // TODO: Implement
  }

  // Tìm kiếm
  search(val) {
    // TODO: Implement
  }

  // Xóa node
  delete(val) {
    // TODO: Implement
  }

  // Tìm min
  findMin(node = this.root) {
    // TODO: Implement
  }

  // Tìm max
  findMax(node = this.root) {
    // TODO: Implement
  }

  // Inorder traversal (kết quả sẽ tăng dần)
  inorder() {
    // TODO: Implement
  }
}

// ==========================================
// Bài tập
// ==========================================

// 1. Validate BST
function isValidBST(root) {
  // TODO: Implement
}

// 2. Kth Smallest Element in BST
function kthSmallest(root, k) {
  // TODO: Implement
}

// ==========================================
// Test
// ==========================================
const bst = new BST();
// bst.insert(5);
// bst.insert(3);
// bst.insert(7);
// bst.insert(1);
// bst.insert(4);
// console.log(bst.inorder()); // [1, 3, 4, 5, 7]
