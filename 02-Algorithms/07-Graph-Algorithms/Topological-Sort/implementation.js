/**
 * TOPOLOGICAL SORT
 * Sắp xếp các đỉnh trong DAG (Directed Acyclic Graph)
 * sao cho mọi cạnh u->v, u đứng trước v
 * Ứng dụng: Course Schedule, Build Order, Task Dependencies
 */

// ==========================================
// Kahn's Algorithm (BFS - dùng in-degree)
// ==========================================
function topologicalSortBFS(numNodes, edges) {
  // TODO: Implement
}

// ==========================================
// DFS-based Topological Sort
// ==========================================
function topologicalSortDFS(numNodes, edges) {
  // TODO: Implement
}

// ==========================================
// Course Schedule (can finish all courses?)
// ==========================================
function canFinish(numCourses, prerequisites) {
  // TODO: Implement
}

// ==========================================
// Test
// ==========================================
// console.log(topologicalSortBFS(6, [[5,2],[5,0],[4,0],[4,1],[2,3],[3,1]]));
// console.log(canFinish(2, [[1,0]]));       // true
// console.log(canFinish(2, [[1,0],[0,1]])); // false (cycle)
