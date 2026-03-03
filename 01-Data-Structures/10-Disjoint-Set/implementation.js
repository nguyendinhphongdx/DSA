/**
 * DISJOINT SET (Union-Find)
 * Dùng cho: kết nối các nhóm, phát hiện cycle trong undirected graph, Kruskal's MST
 */

class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n; // số nhóm
  }

  // Tìm đại diện (root) của x - có Path Compression
  find(x) {
    // TODO: Implement
  }

  // Gộp 2 nhóm - có Union by Rank
  union(x, y) {
    // TODO: Implement
  }

  // Kiểm tra 2 phần tử cùng nhóm
  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  // Số nhóm hiện tại
  getCount() {
    return this.count;
  }
}

// ==========================================
// Test
// ==========================================
// const uf = new UnionFind(5);
// uf.union(0, 1);
// uf.union(2, 3);
// console.log(uf.connected(0, 1)); // true
// console.log(uf.connected(0, 2)); // false
// uf.union(1, 3);
// console.log(uf.connected(0, 2)); // true
// console.log(uf.getCount());       // 2
