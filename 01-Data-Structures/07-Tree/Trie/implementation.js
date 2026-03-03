/**
 * TRIE (Prefix Tree)
 * Dùng cho: autocomplete, spell check, tìm kiếm chuỗi
 */

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Chèn từ
  insert(word) {
    // TODO: Implement
  }

  // Tìm kiếm từ (chính xác)
  search(word) {
    // TODO: Implement
  }

  // Kiểm tra có từ bắt đầu bằng prefix không
  startsWith(prefix) {
    // TODO: Implement
  }

  // Xóa từ
  delete(word) {
    // TODO: Implement
  }
}

// ==========================================
// Test
// ==========================================
const trie = new Trie();
// trie.insert("apple");
// console.log(trie.search("apple"));     // true
// console.log(trie.search("app"));       // false
// console.log(trie.startsWith("app"));   // true
