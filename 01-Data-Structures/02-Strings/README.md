# Strings (Chuỗi)

## 1. Khái niệm

String là **chuỗi ký tự**, trong JavaScript string là **immutable** (không thể thay đổi trực tiếp).
Mỗi khi "thay đổi" string, thực chất JS tạo một string mới.

```javascript
let s = "hello";
s[0] = "H";       // KHÔNG hoạt động! String immutable
s = "H" + s.slice(1); // Phải tạo string mới → "Hello"
```

**Ví dụ thực tế:**
- Kiểm tra mật khẩu hợp lệ
- Tìm kiếm văn bản (search engine)
- Nén dữ liệu, mã hóa

---

## 2. Các thao tác phổ biến trong JS

```javascript
const s = "Hello World";

// Truy cập
s[0];              // "H"
s.charAt(4);       // "o"
s.length;          // 11

// Tìm kiếm
s.indexOf("World");   // 6
s.includes("Hello");  // true

// Cắt chuỗi
s.slice(0, 5);     // "Hello"
s.substring(6);    // "World"

// Biến đổi (tạo string mới)
s.toLowerCase();   // "hello world"
s.toUpperCase();   // "HELLO WORLD"
s.split(" ");      // ["Hello", "World"]
s.replace("World", "JS"); // "Hello JS"

// Chuyển đổi
[..."hello"];              // ['h', 'e', 'l', 'l', 'o']
"hello".split("").reverse().join(""); // "olleh"
```

> **Lưu ý:** Nối string bằng `+` trong vòng lặp có thể chậm O(n²).
> Dùng `Array.join()` hoặc template literal khi cần.

---

## 3. Các kỹ thuật quan trọng

### 3.1 Character Frequency (Đếm tần suất ký tự)

Đây là nền tảng cho rất nhiều bài string. Dùng **Map** hoặc **Object** để đếm.

```javascript
function charFrequency(s) {
  const freq = {};
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

// Demo
console.log(charFrequency("aabbbcc"));
// { a: 2, b: 3, c: 2 }
```

**Ứng dụng: Valid Anagram** - Kiểm tra 2 chuỗi là hoán vị của nhau.

```
"anagram" và "nagaram" → cùng tần suất ký tự → TRUE
"rat" và "car" → khác tần suất → FALSE
```

```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const freq = {};

  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of t) {
    if (!freq[ch]) return false;
    freq[ch]--;
  }

  return true;
}

// Demo
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));          // false

// Trace "anagram" vs "nagaram":
// Sau vòng 1: freq = {a:3, n:1, g:1, r:1, m:1}
// Vòng 2: n→0, a→2, g→0, a→1, r→0, a→0, m→0 → tất cả về 0 → true
```

---

### 3.2 Palindrome (Chuỗi đối xứng)

**Palindrome** đọc xuôi = đọc ngược: `"racecar"`, `"madam"`, `"121"`.

```
  r  a  c  e  c  a  r
  ↑                 ↑
  left            right   → r == r ✓
     ↑           ↑
     left      right      → a == a ✓
        ↑     ↑
       left  right        → c == c ✓
           ↑
        left=right        → DONE → là palindrome!
```

```javascript
function isPalindrome(s) {
  // Chỉ giữ chữ và số, bỏ ký tự đặc biệt
  s = s.toLowerCase().replace(/[^a-z0-9]/g, "");

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }

  return true;
}

// Demo
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false
```

---

### 3.3 Longest Substring Without Repeating Characters

**Bài toán:** Tìm chuỗi con dài nhất không có ký tự trùng lặp.

```
s = "abcabcbb"
     ───         abc     (length 3)
      ───        bca     (length 3)
       ───       cab     (length 3)
         ──      cb      (length 2)
     Kết quả: 3 ("abc")
```

Dùng **Sliding Window** + **Set**:

```javascript
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // Nếu ký tự đã tồn tại trong window → thu hẹp từ trái
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// Demo
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 → "abc"
console.log(lengthOfLongestSubstring("bbbbb"));     // 1 → "b"
console.log(lengthOfLongestSubstring("pwwkew"));    // 3 → "wke"

// Trace "abcabcbb":
// right=0: seen={a}, window="a", max=1
// right=1: seen={a,b}, window="ab", max=2
// right=2: seen={a,b,c}, window="abc", max=3
// right=3: 'a' trùng → xóa 'a', left=1 → seen={b,c,a}, window="bca", max=3
// right=4: 'b' trùng → xóa 'b', left=2 → seen={c,a,b}, window="cab", max=3
// ...
```

---

### 3.4 Group Anagrams

**Bài toán:** Nhóm các từ là anagram của nhau.

```
Input:  ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

**Ý tưởng:** Sắp xếp mỗi từ → các anagram sẽ cho cùng kết quả → dùng làm key.

```javascript
function groupAnagrams(strs) {
  const map = new Map();

  for (const s of strs) {
    // Sắp xếp ký tự → key chung cho các anagram
    const key = s.split("").sort().join("");
    // "eat" → "aet", "tea" → "aet", "ate" → "aet"

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }

  return [...map.values()];
}

// Demo
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]

// Trace:
// "eat" → key "aet" → map: {"aet": ["eat"]}
// "tea" → key "aet" → map: {"aet": ["eat", "tea"]}
// "tan" → key "ant" → map: {"aet": ["eat","tea"], "ant": ["tan"]}
// "ate" → key "aet" → map: {"aet": ["eat","tea","ate"], "ant": ["tan"]}
// "nat" → key "ant" → map: {... "ant": ["tan","nat"]}
// "bat" → key "abt" → map: {... "abt": ["bat"]}
```

---

### 3.5 String Compression (Nén chuỗi - Run-Length Encoding)

**Ví dụ thực tế** trong nén dữ liệu:

```
"aabbbcccc" → "a2b3c4"
"abc"       → "abc" (không nén ngắn hơn thì giữ nguyên)
```

```javascript
function compress(s) {
  let result = "";
  let count = 1;

  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i - 1]) {
      count++;
    } else {
      result += s[i - 1];
      if (count > 1) result += count;
      count = 1;
    }
  }

  return result.length < s.length ? result : s;
}

// Demo
console.log(compress("aabbbcccc")); // "a2b3c4"
console.log(compress("abc"));       // "abc" (giữ nguyên)
console.log(compress("aabb"));      // "aabb" (a2b2 không ngắn hơn)
```

---

## 4. Bài tập luyện tập

### Easy
- [ ] [Valid Anagram](https://leetcode.com/problems/valid-anagram/) - Frequency Counter
- [ ] [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) - Two Pointers
- [ ] [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) - Vertical scan
- [ ] [Reverse String](https://leetcode.com/problems/reverse-string/) - Two Pointers

### Medium
- [ ] [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) - Sliding Window
- [ ] [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) - Expand from center
- [ ] [Group Anagrams](https://leetcode.com/problems/group-anagrams/) - Hash Map + Sort
- [ ] [String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi/) - Simulation
- [ ] [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) - Sliding Window

### Hard
- [ ] [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) - Sliding Window
