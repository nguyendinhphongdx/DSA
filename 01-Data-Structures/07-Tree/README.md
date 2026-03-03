# Tree (Cây)

## 1. Khái niệm

Tree là cấu trúc dữ liệu **phi tuyến tính**, dạng phân cấp. Gồm các **node** kết nối theo quan hệ **cha-con**.

```
          1           ← root (gốc)
        /   \
       2     3        ← children of 1
      / \     \
     4   5     6      ← leaf nodes (lá - không có con)

Thuật ngữ:
- Root: node gốc (1)
- Parent: node cha (2 là cha của 4, 5)
- Child: node con (4, 5 là con của 2)
- Leaf: node lá, không có con (4, 5, 6)
- Height: chiều cao = đường dài nhất từ root đến leaf = 2
- Depth: độ sâu của node = khoảng cách từ root (root depth = 0)
```

**Ví dụ thực tế:**
- **File system** (thư mục chứa thư mục con và file)
- **DOM** trong HTML (thẻ cha chứa thẻ con)
- **Cây gia phả**, tổ chức công ty
- **Biểu thức toán học**: `(2 + 3) * 4`

---

## 2. Binary Tree (Cây nhị phân)

Mỗi node có **tối đa 2 con**: left và right.

```javascript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Tạo cây:      1
//              /   \
//             2     3
//            / \
//           4   5
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);
```

---

## 3. Duyệt cây (Tree Traversal)

Đây là **kỹ năng nền tảng** - hầu hết bài Tree đều cần.

```
        1
       / \
      2    3
     / \
    4   5
```

### 3.1 DFS - Depth First Search (duyệt sâu)

#### Inorder (Left → Root → Right)
```
Thứ tự: 4, 2, 5, 1, 3
Ứng dụng: BST → cho kết quả TĂNG DẦN
```

```javascript
function inorder(root) {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

// Hoặc dùng biến result (hiệu quả hơn)
function inorderIterative(root) {
  const result = [];
  const stack = [];
  let current = root;

  while (current || stack.length) {
    // Đi sâu bên trái hết mức
    while (current) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    result.push(current.val);  // xử lý node
    current = current.right;    // chuyển sang phải
  }

  return result;
}

console.log(inorder(root)); // [4, 2, 5, 1, 3]
```

#### Preorder (Root → Left → Right)
```
Thứ tự: 1, 2, 4, 5, 3
Ứng dụng: copy cây, serialize cây
```

```javascript
function preorder(root) {
  if (!root) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

console.log(preorder(root)); // [1, 2, 4, 5, 3]
```

#### Postorder (Left → Right → Root)
```
Thứ tự: 4, 5, 2, 3, 1
Ứng dụng: xóa cây, tính kích thước cây
```

```javascript
function postorder(root) {
  if (!root) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}

console.log(postorder(root)); // [4, 5, 2, 3, 1]
```

### 3.2 BFS - Level Order (duyệt theo tầng)

```
Thứ tự: [[1], [2, 3], [4, 5]]
Dùng Queue!
```

```javascript
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

console.log(levelOrder(root)); // [[1], [2, 3], [4, 5]]
```

---

## 4. Các bài kinh điển

### 4.1 Maximum Depth (Chiều cao cây)

```javascript
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Demo:     3
//          / \
//         9   20
//            /  \
//           15   7
// maxDepth = 3

// Trace:
// maxDepth(3) = 1 + max(maxDepth(9), maxDepth(20))
// maxDepth(9) = 1 + max(0, 0) = 1
// maxDepth(20) = 1 + max(maxDepth(15), maxDepth(7))
// maxDepth(15) = 1, maxDepth(7) = 1
// maxDepth(20) = 1 + max(1, 1) = 2
// maxDepth(3) = 1 + max(1, 2) = 3 ✓
```

### 4.2 Invert Binary Tree

```
Trước:       4           Sau:       4
           /   \                  /   \
          2     7                7     2
         / \   / \              / \   / \
        1   3 6   9            9   6 3   1
```

```javascript
function invertTree(root) {
  if (!root) return null;

  // Swap left và right
  [root.left, root.right] = [root.right, root.left];

  // Đệ quy cho cả hai nhánh
  invertTree(root.left);
  invertTree(root.right);

  return root;
}
```

### 4.3 Lowest Common Ancestor (LCA)

**Bài toán:** Tìm tổ tiên chung gần nhất của 2 node.

```
          3
        /   \
       5     1
      / \   / \
     6   2 0   8
        / \
       7   4

LCA(5, 1) = 3
LCA(5, 4) = 5  (5 là tổ tiên của chính nó)
```

```javascript
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // Nếu tìm thấy ở cả hai bên → root là LCA
  if (left && right) return root;

  // Nếu chỉ tìm thấy 1 bên → trả về bên đó
  return left || right;
}

// Trace LCA(5, 1) trên cây trên:
// root=3: left=LCA(5,p,q) tìm thấy 5 ở bên trái
//         right=LCA(1,p,q) tìm thấy 1 ở bên phải
//         cả 2 đều khác null → return 3 ✓
```

---

## 5. Binary Search Tree (BST)

**Tính chất:** Với mọi node, `left < node < right`.

```
          8
        /   \
       3     10
      / \      \
     1   6      14
        / \    /
       4   7  13

Inorder: 1, 3, 4, 6, 7, 8, 10, 13, 14 ← TĂNG DẦN!
```

### Validate BST

```javascript
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;

  if (root.val <= min || root.val >= max) return false;

  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}

// Trace:
// root=8: 8 > -∞ && 8 < ∞ ✓
//   left=3: 3 > -∞ && 3 < 8 ✓
//     left=1: 1 > -∞ && 1 < 3 ✓
//     right=6: 6 > 3 && 6 < 8 ✓
//   right=10: 10 > 8 && 10 < ∞ ✓
//     ...
```

### Kth Smallest in BST

**Ý tưởng:** Inorder traversal của BST cho thứ tự tăng dần → phần tử thứ k.

```javascript
function kthSmallest(root, k) {
  const stack = [];
  let current = root;
  let count = 0;

  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }

    current = stack.pop();
    count++;
    if (count === k) return current.val;
    current = current.right;
  }
}

// BST: [3, 1, 4, null, 2], k=1
//       3
//      / \
//     1   4
//      \
//       2
// Inorder: 1, 2, 3, 4
// k=1 → return 1
```

---

## 6. Trie (Prefix Tree)

Chuyên dùng cho **tìm kiếm chuỗi**: autocomplete, spell check.

```
Chèn: "apple", "app", "bat"

        root
       /    \
      a      b
      |      |
      p      a
      |      |
      p      t*
     / \
    l   *    (* = end of word)
    |
    e*
```

```javascript
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}

// Demo
const trie = new Trie();
trie.insert("apple");
trie.insert("app");
console.log(trie.search("apple"));    // true
console.log(trie.search("app"));      // true
console.log(trie.search("ap"));       // false (chưa end)
console.log(trie.startsWith("ap"));   // true
```

---

## 7. Bài tập luyện tập

### Easy
- [ ] [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)
- [ ] [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- [ ] [Same Tree](https://leetcode.com/problems/same-tree/)
- [ ] [Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree/)
- [ ] [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/)

### Medium
- [ ] [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
- [ ] [Validate BST](https://leetcode.com/problems/validate-binary-search-tree/)
- [ ] [Kth Smallest Element in BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)
- [ ] [Lowest Common Ancestor](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)
- [ ] [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/)
- [ ] [Construct Binary Tree from Preorder and Inorder](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)
- [ ] [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/)

### Hard
- [ ] [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
- [ ] [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/)
- [ ] [Word Search II](https://leetcode.com/problems/word-search-ii/) - Trie + Backtracking
