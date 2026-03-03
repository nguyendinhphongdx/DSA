# Bit Manipulation

## Các phép toán cơ bản
| Phép toán | Ký hiệu | Ý nghĩa              |
|-----------|----------|-----------------------|
| AND       | &        | 1 & 1 = 1, còn lại 0 |
| OR        | \|       | 0 \| 0 = 0, còn lại 1|
| XOR       | ^        | khác nhau = 1         |
| NOT       | ~        | đảo bit               |
| Left Shift| <<       | nhân 2                |
| Right Shift| >>      | chia 2                |

## Trick hay dùng
- `n & (n - 1)`: xóa bit 1 thấp nhất
- `n & (-n)`: lấy bit 1 thấp nhất
- `n ^ n = 0`: XOR với chính nó = 0
- `n ^ 0 = n`: XOR với 0 = chính nó

## Bài tập gợi ý
- [ ] Single Number
- [ ] Number of 1 Bits
- [ ] Counting Bits
- [ ] Reverse Bits
- [ ] Missing Number
- [ ] Sum of Two Integers (không dùng +/-)
