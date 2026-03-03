# Sliding Window

## Khái niệm
- Duy trì một "cửa sổ" trượt trên mảng/chuỗi
- Mở rộng bên phải, thu hẹp bên trái khi cần
- Time: O(n)

## Template
```javascript
function slidingWindow(s) {
  let left = 0;
  let result = 0;

  for (let right = 0; right < s.length; right++) {
    // Mở rộng window: thêm s[right]

    while (window không hợp lệ) {
      // Thu hẹp window: bỏ s[left]
      left++;
    }

    // Cập nhật result
    result = Math.max(result, right - left + 1);
  }
  return result;
}
```

## Bài tập gợi ý
- [ ] Best Time to Buy and Sell Stock
- [ ] Longest Substring Without Repeating Characters
- [ ] Longest Repeating Character Replacement
- [ ] Minimum Window Substring
- [ ] Sliding Window Maximum
- [ ] Permutation in String
