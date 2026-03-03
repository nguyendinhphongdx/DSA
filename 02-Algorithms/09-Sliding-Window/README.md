# Sliding Window (Cửa sổ trượt)

## 1. Khái niệm

Sliding Window duy trì một **"cửa sổ"** (subarray/substring) trượt qua mảng/chuỗi. Thay vì duyệt mọi subarray O(n²), ta mở rộng/thu hẹp cửa sổ trong **O(n)**.

```
Array: [1, 3, 2, 6, -1, 4, 1, 8, 2]
Window size k=5:

[1, 3, 2, 6, -1] 4, 1, 8, 2    sum=11
 1 [3, 2, 6, -1, 4] 1, 8, 2    sum=14 (= 11 - 1 + 4)
 1, 3 [2, 6, -1, 4, 1] 8, 2    sum=12 (= 14 - 3 + 1)
    ↑ trượt sang phải: bỏ trái, thêm phải
```

**Ví dụ thực tế:**
- Tính **trung bình di động** (moving average) của giá cổ phiếu
- Phát hiện **burst traffic** trong network monitoring
- **Rate limiting** (đếm request trong cửa sổ thời gian)

---

## 2. Hai loại Sliding Window

### Fixed Window (kích thước cố định)
→ Window luôn có kích thước k

### Variable Window (kích thước thay đổi)
→ Mở rộng phải, thu hẹp trái khi cần

---

## 3. Template

### Fixed Window
```javascript
function fixedWindow(arr, k) {
  // Tính window đầu tiên
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  let maxSum = windowSum;

  // Trượt window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i];     // thêm phần tử mới (phải)
    windowSum -= arr[i - k]; // bỏ phần tử cũ (trái)
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

### Variable Window
```javascript
function variableWindow(s) {
  let left = 0;
  let result = 0;
  // ... state (map, set, count...)

  for (let right = 0; right < s.length; right++) {
    // Bước 1: Mở rộng - thêm s[right] vào window

    // Bước 2: Thu hẹp - khi window không hợp lệ
    while (/* window invalid */) {
      // Bỏ s[left] khỏi window
      left++;
    }

    // Bước 3: Cập nhật kết quả
    result = Math.max(result, right - left + 1);
  }

  return result;
}
```

---

## 4. Các bài kinh điển

### 4.1 Maximum Average Subarray (Fixed Window)

**Bài toán:** Tìm subarray kích thước k có trung bình lớn nhất.

```
nums = [1, 12, -5, -6, 50, 3], k = 4
→ max average = (12 + -5 + -6 + 50) / 4 = 12.75
```

```javascript
function findMaxAverage(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let maxSum = sum;

  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k]; // trượt: +phải -trái
    maxSum = Math.max(maxSum, sum);
  }

  return maxSum / k;
}

console.log(findMaxAverage([1, 12, -5, -6, 50, 3], 4)); // 12.75

// Trace:
// Window [1,12,-5,-6]: sum=2
// Trượt: +50 -1 → [12,-5,-6,50]: sum=51 ← MAX
// Trượt: +3 -12 → [-5,-6,50,3]: sum=42
// maxSum/k = 51/4 = 12.75 ✓
```

### 4.2 Longest Substring Without Repeating Characters (Variable Window)

**Bài toán:** Tìm chuỗi con dài nhất không có ký tự lặp.

```
s = "abcabcbb"
     ───        "abc" (3)
         ───    "abc" (3)
     Kết quả: 3
```

```javascript
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // Thu hẹp khi gặp ký tự trùng
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("pwwkew"));    // 3 ("wke")

// Trace "abcabcbb":
// r=0 'a': seen={a}, window="a", max=1
// r=1 'b': seen={a,b}, window="ab", max=2
// r=2 'c': seen={a,b,c}, window="abc", max=3
// r=3 'a': trùng! xóa 'a', left=1 → seen={b,c,a}, window="bca", max=3
// r=4 'b': trùng! xóa 'b', left=2 → seen={c,a,b}, window="cab", max=3
// r=5 'c': trùng! xóa 'c', left=3 → seen={a,b,c}, window="abc", max=3
// r=6 'b': trùng! xóa 'a','b', left=5 → seen={c,b}, window="cb", max=3
// r=7 'b': trùng! xóa 'c','b', left=7 → seen={b}, window="b", max=3
```

### 4.3 Longest Repeating Character Replacement

**Bài toán:** Cho phép thay đổi tối đa k ký tự. Tìm chuỗi con dài nhất chứa cùng 1 ký tự.

```
s = "AABABBA", k = 1
→ 4 ("AABA" → đổi B thành A → "AAAA")
```

**Ý tưởng:** Window hợp lệ khi `window_size - max_freq <= k` (số ký tự cần thay <= k).

```javascript
function characterReplacement(s, k) {
  const count = {};
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]);

    // Số ký tự cần thay = window size - ký tự phổ biến nhất
    const windowSize = right - left + 1;
    if (windowSize - maxFreq > k) {
      // Window không hợp lệ → thu hẹp
      count[s[left]]--;
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

console.log(characterReplacement("AABABBA", 1)); // 4

// Trace:
// r=0 'A': count={A:1}, maxFreq=1, size=1, replace=0<=1 ✓, max=1
// r=1 'A': count={A:2}, maxFreq=2, size=2, replace=0<=1 ✓, max=2
// r=2 'B': count={A:2,B:1}, maxFreq=2, size=3, replace=1<=1 ✓, max=3
// r=3 'A': count={A:3,B:1}, maxFreq=3, size=4, replace=1<=1 ✓, max=4
// r=4 'B': count={A:3,B:2}, maxFreq=3, size=5, replace=2>1 ✗ → left++
//          count={A:2,B:2}, left=1, size=4, max=4
// ...
```

### 4.4 Minimum Window Substring (Hard)

**Bài toán:** Tìm chuỗi con ngắn nhất của s chứa tất cả ký tự của t.

```
s = "ADOBECODEBANC", t = "ABC"
→ "BANC" (chứa A, B, C)
```

```javascript
function minWindow(s, t) {
  if (t.length > s.length) return "";

  // Đếm ký tự cần tìm
  const need = {};
  for (const ch of t) need[ch] = (need[ch] || 0) + 1;

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;
  let matched = 0;            // số ký tự đã thỏa mãn
  const required = Object.keys(need).length; // số ký tự unique cần tìm
  const windowCount = {};

  for (let right = 0; right < s.length; right++) {
    // Mở rộng
    const ch = s[right];
    windowCount[ch] = (windowCount[ch] || 0) + 1;

    if (need[ch] && windowCount[ch] === need[ch]) {
      matched++;
    }

    // Thu hẹp khi đã chứa đủ
    while (matched === required) {
      const windowSize = right - left + 1;
      if (windowSize < minLen) {
        minLen = windowSize;
        minStart = left;
      }

      const leftCh = s[left];
      windowCount[leftCh]--;
      if (need[leftCh] && windowCount[leftCh] < need[leftCh]) {
        matched--;
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}

console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
```

---

## 5. Nhận diện bài Sliding Window

| Dấu hiệu | Ví dụ |
|-----------|-------|
| Tìm **subarray/substring** thỏa điều kiện | Longest substring, Min window |
| **Contiguous** (liên tiếp) | Sum of subarray, Average |
| Tối ưu **max length / min length** | Max window size, Min operations |
| Keyword: "consecutive", "contiguous", "window" | |

---

## 6. Bài tập luyện tập

### Easy
- [ ] [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
- [ ] [Maximum Average Subarray I](https://leetcode.com/problems/maximum-average-subarray-i/)

### Medium
- [ ] [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [ ] [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/)
- [ ] [Permutation in String](https://leetcode.com/problems/permutation-in-string/)
- [ ] [Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
- [ ] [Fruit Into Baskets](https://leetcode.com/problems/fruit-into-baskets/)
- [ ] [Maximum Number of Vowels in a Substring](https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/)

### Hard
- [ ] [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- [ ] [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)
- [ ] [Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)
