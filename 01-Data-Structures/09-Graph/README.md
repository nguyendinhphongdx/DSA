# Graph (Đồ thị)

## 1. Khái niệm

Graph gồm tập hợp **đỉnh (vertices/nodes)** và **cạnh (edges)** nối các đỉnh.

```
Undirected Graph:          Directed Graph (có hướng):
    A --- B                    A → B
    |   / |                    ↑   ↓
    |  /  |                    D ← C
    C --- D

Weighted Graph (có trọng số):
    A --5-- B
    |       |
    3       2
    |       |
    C --1-- D
```

**Ví dụ thực tế:**
- **Mạng xã hội** (user = đỉnh, kết bạn = cạnh)
- **Google Maps** (địa điểm = đỉnh, đường = cạnh có trọng số)
- **Internet** (máy tính = đỉnh, kết nối = cạnh)
- **Môn học** (prerequisite: phải học A trước B)

---

## 2. Phân loại

| Loại | Mô tả | Ví dụ |
|------|--------|-------|
| Directed | Cạnh có hướng (A→B ≠ B→A) | Follow trên Twitter |
| Undirected | Cạnh 2 chiều (A-B = B-A) | Kết bạn Facebook |
| Weighted | Cạnh có trọng số | Khoảng cách giữa 2 thành phố |
| Unweighted | Cạnh không có trọng số | Mạng kết bạn |
| Cyclic | Có vòng lặp | Đường giao thông |
| Acyclic | Không có vòng | DAG - chuỗi tasks |

---

## 3. Biểu diễn Graph

### 3.1 Adjacency List (phổ biến nhất trong phỏng vấn)

Mỗi đỉnh lưu danh sách các đỉnh kề.

```
    A --- B
    |   / |
    |  /  |
    C --- D

adjacencyList = {
  A: [B, C],
  B: [A, C, D],
  C: [A, B, D],
  D: [B, C]
}
```

```javascript
// Cách 1: Object
const graph = {
  A: ["B", "C"],
  B: ["A", "C", "D"],
  C: ["A", "B", "D"],
  D: ["B", "C"]
};

// Cách 2: Map (linh hoạt hơn)
const graph2 = new Map();
graph2.set("A", ["B", "C"]);
graph2.set("B", ["A", "C", "D"]);

// Cách 3: Dùng index (cho graph có n node 0..n-1)
const n = 4;
const adjList = Array.from({ length: n }, () => []);
adjList[0].push(1, 2);    // 0 → 1, 2
adjList[1].push(0, 2, 3); // 1 → 0, 2, 3
```

### 3.2 Adjacency Matrix

```
    A  B  C  D
A [ 0, 1, 1, 0 ]
B [ 1, 0, 1, 1 ]
C [ 1, 1, 0, 1 ]
D [ 0, 1, 1, 0 ]

matrix[i][j] = 1 nếu có cạnh từ i đến j
```

| So sánh | Adjacency List | Adjacency Matrix |
|---------|---------------|-----------------|
| Space | O(V + E) | O(V²) |
| Kiểm tra cạnh | O(degree) | **O(1)** |
| Duyệt neighbor | O(degree) | O(V) |
| Thêm cạnh | O(1) | O(1) |
| **Khi nào dùng** | **Graph thưa** (ít cạnh) | Graph dày (nhiều cạnh) |

---

## 4. BFS (Breadth-First Search)

Duyệt **theo tầng**, dùng **Queue**. Tìm đường đi ngắn nhất trên unweighted graph.

```
Bắt đầu từ A:

Bước 0: Queue=[A], visited={A}
Bước 1: Xử lý A, thêm B,C → Queue=[B,C], visited={A,B,C}
Bước 2: Xử lý B, thêm D   → Queue=[C,D], visited={A,B,C,D}
Bước 3: Xử lý C (neighbor đã visited) → Queue=[D]
Bước 4: Xử lý D → Queue=[] → DONE

Thứ tự duyệt: A → B → C → D
```

```javascript
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];

  visited.add(start);

  while (queue.length) {
    const node = queue.shift();
    result.push(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

// Demo
const graph = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C"]
};
console.log(bfs(graph, "A")); // ["A", "B", "C", "D"]
```

---

## 5. DFS (Depth-First Search)

Duyệt **theo chiều sâu**, dùng **Stack** hoặc **đệ quy**.

```
Bắt đầu từ A:

A → B → D → (quay lại) → C
                          ↑ đã visited, skip

Thứ tự duyệt: A → B → D → C
```

```javascript
// Cách 1: Đệ quy
function dfsRecursive(graph, start, visited = new Set()) {
  visited.add(start);
  const result = [start];

  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      result.push(...dfsRecursive(graph, neighbor, visited));
    }
  }

  return result;
}

// Cách 2: Iterative (dùng Stack)
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];

  while (stack.length) {
    const node = stack.pop();

    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);

    // Thêm neighbor vào stack (ngược thứ tự để duyệt đúng)
    for (const neighbor of graph[node].reverse()) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return result;
}

console.log(dfsRecursive(graph, "A")); // ["A", "B", "D", "C"]
```

---

## 6. Các bài kinh điển

### 6.1 Number of Islands (BFS/DFS trên Grid)

**Bài toán:** Đếm số "đảo" (nhóm ô '1' liền kề).

```
Grid:
  1 1 0 0 0
  1 1 0 0 0
  0 0 1 0 0
  0 0 0 1 1

→ 3 đảo
```

```javascript
function numIslands(grid) {
  if (!grid.length) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r, c) {
    // Out of bounds hoặc là nước
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === "0") {
      return;
    }

    grid[r][c] = "0"; // đánh dấu đã thăm (sink the island)

    // Duyệt 4 hướng
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        dfs(r, c); // "nhấn chìm" toàn bộ đảo
      }
    }
  }

  return islands;
}

// Demo
const grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
];
console.log(numIslands(grid)); // 3
```

### 6.2 Course Schedule (Cycle Detection)

**Bài toán:** Có n môn học, mỗi môn có prerequisite. Hỏi có thể hoàn thành tất cả?
→ Kiểm tra có **cycle** trong directed graph không.

```
numCourses = 4
prerequisites = [[1,0], [2,0], [3,1], [3,2]]

    0 → 1 → 3
    ↓       ↑
    2 ──────┘    → Không có cycle → CÓ THỂ hoàn thành ✓

prerequisites = [[1,0], [0,1]]
    0 → 1 → 0 → ...  → Có cycle → KHÔNG THỂ ✗
```

```javascript
function canFinish(numCourses, prerequisites) {
  // Xây graph + đếm in-degree
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }

  // BFS: bắt đầu từ các node có in-degree = 0
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let completed = 0;
  while (queue.length) {
    const course = queue.shift();
    completed++;

    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return completed === numCourses; // tất cả đã xử lý = không có cycle
}

// Demo
console.log(canFinish(4, [[1,0],[2,0],[3,1],[3,2]])); // true
console.log(canFinish(2, [[1,0],[0,1]]));               // false (cycle)
```

---

## 7. BFS vs DFS

| Tiêu chí | BFS | DFS |
|-----------|-----|-----|
| Cấu trúc | Queue | Stack / Đệ quy |
| Thứ tự duyệt | Theo tầng | Theo chiều sâu |
| Đường đi ngắn nhất | **Có** (unweighted) | Không |
| Bộ nhớ | O(width) | O(height) |
| Dùng khi | Tìm shortest path, level order | Detect cycle, topological sort, path finding |

---

## 8. Bài tập luyện tập

### Easy/Medium
- [ ] [Number of Islands](https://leetcode.com/problems/number-of-islands/) - DFS/BFS trên Grid
- [ ] [Clone Graph](https://leetcode.com/problems/clone-graph/) - BFS/DFS + Hash Map
- [ ] [Flood Fill](https://leetcode.com/problems/flood-fill/) - DFS
- [ ] [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) - Multi-source BFS

### Medium
- [ ] [Course Schedule](https://leetcode.com/problems/course-schedule/) - Topological Sort
- [ ] [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) - Topological Sort
- [ ] [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) - DFS từ biên
- [ ] [Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/) - Union Find / DFS
- [ ] [Number of Connected Components](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) - Union Find

### Hard
- [ ] [Word Ladder](https://leetcode.com/problems/word-ladder/) - BFS
- [ ] [Alien Dictionary](https://leetcode.com/problems/alien-dictionary/) - Topological Sort
