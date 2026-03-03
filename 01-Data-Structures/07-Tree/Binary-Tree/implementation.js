/**
 * BINARY TREE - Cài đặt & duyệt cây
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// ==========================================
// Duyệt cây (Traversal)
// ==========================================

// Inorder: Left -> Root -> Right
function inorder(root) {
  // TODO: Implement (cả recursive và iterative)
}

// Preorder: Root -> Left -> Right
function preorder(root) {
  // TODO: Implement
}

// Postorder: Left -> Right -> Root
function postorder(root) {
  // TODO: Implement
}

// Level Order (BFS)
function levelOrder(root) {
  // TODO: Implement
}

// ==========================================
// Bài tập
// ==========================================

// 1. Maximum Depth
function maxDepth(root) {
  // TODO: Implement
}

// 2. Invert Binary Tree
function invertTree(root) {
  // TODO: Implement
}

// 3. Lowest Common Ancestor
function lowestCommonAncestor(root, p, q) {
  // TODO: Implement
}

// ==========================================
// Helper: tạo cây từ array (level order)
// ==========================================
function buildTree(arr) {
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

// ==========================================
// Test
// ==========================================
const tree = buildTree([3, 9, 20, null, null, 15, 7]);
// console.log(inorder(tree));    // [9, 3, 15, 20, 7]
// console.log(maxDepth(tree));   // 3
