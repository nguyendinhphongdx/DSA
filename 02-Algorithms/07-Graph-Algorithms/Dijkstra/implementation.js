/**
 * DIJKSTRA'S ALGORITHM
 * Tìm đường đi ngắn nhất từ 1 đỉnh đến tất cả đỉnh khác (weighted, non-negative)
 * Time: O((V + E) log V) với Min Heap
 */

function dijkstra(graph, start) {
  // TODO: Implement
  // graph: { node: [[neighbor, weight], ...] }
}

// ==========================================
// Test
// ==========================================
// const graph = {
//   A: [["B", 4], ["C", 2]],
//   B: [["A", 4], ["C", 1], ["D", 5]],
//   C: [["A", 2], ["B", 1], ["D", 8]],
//   D: [["B", 5], ["C", 8]]
// };
// console.log(dijkstra(graph, "A"));
// Expected: { A: 0, B: 3, C: 2, D: 8 }
