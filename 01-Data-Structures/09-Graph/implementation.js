/**
 * GRAPH - Cài đặt & thuật toán cơ bản
 */

// ==========================================
// Graph (Adjacency List)
// ==========================================
class Graph {
  constructor(isDirected = false) {
    this.adjacencyList = new Map();
    this.isDirected = isDirected;
  }

  addVertex(vertex) {
    // TODO: Implement
  }

  addEdge(v1, v2, weight = 1) {
    // TODO: Implement
  }

  removeEdge(v1, v2) {
    // TODO: Implement
  }

  // BFS
  bfs(start) {
    // TODO: Implement
  }

  // DFS
  dfs(start) {
    // TODO: Implement
  }

  // Detect Cycle
  hasCycle() {
    // TODO: Implement
  }

  print() {
    for (const [vertex, edges] of this.adjacencyList) {
      console.log(`${vertex} -> ${edges.join(", ")}`);
    }
  }
}

// ==========================================
// Bài tập
// ==========================================

// 1. Number of Islands (dùng DFS/BFS trên grid)
function numIslands(grid) {
  // TODO: Implement
}

// 2. Clone Graph
function cloneGraph(node) {
  // TODO: Implement
}

// ==========================================
// Test
// ==========================================
const g = new Graph();
// g.addVertex("A");
// g.addVertex("B");
// g.addVertex("C");
// g.addEdge("A", "B");
// g.addEdge("A", "C");
// g.addEdge("B", "C");
// g.print();
// console.log("BFS:", g.bfs("A"));
// console.log("DFS:", g.dfs("A"));
