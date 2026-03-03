# Backtracking (Quay lui)

## 1. Khái niệm

Backtracking là kỹ thuật **thử tất cả khả năng** và **quay lại** khi gặp ngõ cụt. Nó là DFS trên **cây quyết định** với **pruning** (cắt tỉa nhánh không hợp lệ).

```
Ví dụ: Tìm đường ra mê cung
  → Thử rẽ phải → bế tắc → QUAY LẠI
  → Thử rẽ trái → bế tắc → QUAY LẠI
  → Thử đi thẳng → tìm được lối ra ✓
```

**Ví dụ thực tế:**
- Giải Sudoku
- Xếp N quân hậu
- Tìm tất cả tổ hợp, hoán vị
- Auto-complete / word suggestion

---

## 2. Template chuẩn

```javascript
function backtrack(candidates, startIndex, path, result) {
  // 1. Base case: tìm được lời giải
  if (thỏa điều kiện) {
    result.push([...path]); // PHẢI copy path!
    return;
  }

  // 2. Duyệt các lựa chọn
  for (let i = startIndex; i < candidates.length; i++) {
    // 3. Pruning (cắt tỉa)
    if (!isValid(candidates[i])) continue;

    // 4. Chọn
    path.push(candidates[i]);

    // 5. Đệ quy (explore)
    backtrack(candidates, i + 1, path, result);

    // 6. Bỏ chọn (backtrack)
    path.pop();
  }
}
```

> **Tại sao `[...path]`?** Vì path thay đổi liên tục. Nếu push trực tiếp `path`, tất cả result sẽ trỏ đến cùng array rỗng cuối cùng.

---

## 3. Các bài kinh điển

### 3.1 Subsets (Tập con)

**Bài toán:** Tìm tất cả tập con.

```
[1, 2, 3] → [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

```javascript
function subsets(nums) {
  const result = [];

  function backtrack(start, path) {
    result.push([...path]); // mỗi path đều là tập con hợp lệ

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path); // i+1: không lặp lại phần tử
      path.pop();
    }
  }

  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));

// Cây quyết định:
//                []
//        /       |       \
//      [1]      [2]      [3]
//     /   \      |
//   [1,2] [1,3] [2,3]
//    |
//  [1,2,3]
```

### 3.2 Permutations (Hoán vị)

**Bài toán:** Tìm tất cả hoán vị.

```
[1, 2, 3] → [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

```javascript
function permute(nums) {
  const result = [];

  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue; // đã dùng → bỏ qua

      path.push(nums[i]);
      used[i] = true;

      backtrack(path, used);

      path.pop();
      used[i] = false; // backtrack
    }
  }

  backtrack([], new Array(nums.length).fill(false));
  return result;
}

console.log(permute([1, 2, 3]));

// Trace:
// path=[], chọn 1 → [1]
//   path=[1], chọn 2 → [1,2]
//     path=[1,2], chọn 3 → [1,2,3] ✓ FOUND
//     backtrack → [1,2]
//   backtrack → [1]
//   path=[1], chọn 3 → [1,3]
//     path=[1,3], chọn 2 → [1,3,2] ✓ FOUND
// ...
```

### 3.3 Combination Sum

**Bài toán:** Tìm tất cả tổ hợp có tổng bằng target. Có thể dùng lại phần tử.

```
candidates = [2, 3, 6, 7], target = 7
→ [[2,2,3], [7]]
```

```javascript
function combinationSum(candidates, target) {
  const result = [];

  function backtrack(start, path, remaining) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    if (remaining < 0) return; // pruning

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, remaining - candidates[i]); // i (không phải i+1) vì được dùng lại
      path.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}

console.log(combinationSum([2, 3, 6, 7], 7));
// [[2,2,3], [7]]

// Trace:
// start=0, path=[], remaining=7
//   chọn 2 → [2], remaining=5
//     chọn 2 → [2,2], remaining=3
//       chọn 2 → [2,2,2], remaining=1
//         chọn 2 → remaining=-1 → PRUNE
//         chọn 3 → remaining=-2 → PRUNE
//       chọn 3 → [2,2,3], remaining=0 → FOUND ✓
//     chọn 3 → [2,3], remaining=2
//       chọn 2 → remaining=0... nhưng kết quả giống → xử lý bởi start
//   chọn 7 → [7], remaining=0 → FOUND ✓
```

### 3.4 N-Queens

**Bài toán:** Đặt n quân hậu trên bàn cờ n×n sao cho không quân nào tấn công nhau.

```
n = 4:
. Q . .     . . Q .
. . . Q     Q . . .
Q . . .     . . . Q
. . Q .     . Q . .
```

```javascript
function solveNQueens(n) {
  const result = [];
  const board = Array.from({ length: n }, () => ".".repeat(n));

  // 3 set để kiểm tra nhanh O(1)
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col

  function backtrack(row) {
    if (row === n) {
      result.push([...board]);
      return;
    }

    for (let col = 0; col < n; col++) {
      // Pruning: kiểm tra cột và 2 đường chéo
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue;
      }

      // Đặt quân hậu
      board[row] = board[row].substring(0, col) + "Q" + board[row].substring(col + 1);
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      backtrack(row + 1);

      // Bỏ quân hậu (backtrack)
      board[row] = board[row].substring(0, col) + "." + board[row].substring(col + 1);
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }

  backtrack(0);
  return result;
}

console.log(solveNQueens(4).length); // 2 lời giải
```

---

## 4. Subsets vs Permutations vs Combination

| Bài | Thứ tự | Lặp lại | Start index |
|-----|--------|---------|-------------|
| Subsets | Không quan trọng | Không | `i + 1` |
| Permutations | Quan trọng | Không | `0` + `used[]` |
| Combination Sum | Không quan trọng | Có | `i` (giữ nguyên) |

---

## 5. Bài tập luyện tập

### Medium
- [ ] [Subsets](https://leetcode.com/problems/subsets/)
- [ ] [Subsets II](https://leetcode.com/problems/subsets-ii/) - có duplicate
- [ ] [Permutations](https://leetcode.com/problems/permutations/)
- [ ] [Permutations II](https://leetcode.com/problems/permutations-ii/) - có duplicate
- [ ] [Combination Sum](https://leetcode.com/problems/combination-sum/)
- [ ] [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)
- [ ] [Word Search](https://leetcode.com/problems/word-search/) - Grid backtracking
- [ ] [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/)
- [ ] [Letter Combinations of Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)

### Hard
- [ ] [N-Queens](https://leetcode.com/problems/n-queens/)
- [ ] [Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)
- [ ] [Word Search II](https://leetcode.com/problems/word-search-ii/) - Trie + Backtracking
