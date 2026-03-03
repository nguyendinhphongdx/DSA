# Greedy (Tham lam)

## 1. Khái niệm

Greedy luôn chọn **phương án tốt nhất tại thời điểm hiện tại**, hy vọng dẫn đến kết quả tối ưu toàn cục.

**Ví dụ đời thường:**
- Đổi tiền: Luôn chọn tờ lớn nhất trước. Đổi 36,000₫ → 20k + 10k + 5k + 1k
- Xếp lịch: Luôn chọn công việc kết thúc sớm nhất trước

**Khác với DP:**
- DP: thử tất cả khả năng → tối ưu toàn cục (chắc chắn đúng)
- Greedy: chọn tối ưu cục bộ → **hy vọng** tối ưu toàn cục (không phải lúc nào cũng đúng)

> **Cẩn thận:** Greedy chỉ đúng khi bài toán có **greedy choice property**. Nếu không chắc, dùng DP an toàn hơn.

---

## 2. Khi nào dùng Greedy?

**Dấu hiệu:**
- Bài toán yêu cầu tối ưu (min/max)
- Có thể **chứng minh** lựa chọn cục bộ tốt nhất → kết quả toàn cục tốt nhất
- Thường liên quan đến **sắp xếp** trước khi xử lý

---

## 3. Các bài kinh điển

### 3.1 Jump Game

**Bài toán:** Mảng số, mỗi phần tử = số bước nhảy tối đa. Có thể đến cuối mảng?

```
[2, 3, 1, 1, 4] → true
 ↑  →→ ↑  → ↑  ← nhảy 2 bước đến index 2, rồi nhảy tiếp

[3, 2, 1, 0, 4] → false
          ↑ bị kẹt tại index 3 (0 bước)
```

**Ý tưởng Greedy:** Theo dõi vị trí **xa nhất** có thể đến.

```javascript
function canJump(nums) {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // không thể đến vị trí i
    maxReach = Math.max(maxReach, i + nums[i]);
  }

  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false

// Trace [2, 3, 1, 1, 4]:
// i=0: maxReach = max(0, 0+2) = 2
// i=1: 1 <= 2 ✓, maxReach = max(2, 1+3) = 4
// i=2: 2 <= 4 ✓, maxReach = max(4, 2+1) = 4
// i=3: 3 <= 4 ✓, maxReach = max(4, 3+1) = 4
// i=4: 4 <= 4 ✓ → return true ✓

// Trace [3, 2, 1, 0, 4]:
// i=0: maxReach = 3
// i=1: maxReach = max(3, 3) = 3
// i=2: maxReach = max(3, 3) = 3
// i=3: maxReach = max(3, 3) = 3
// i=4: 4 > 3 → return false ✓
```

### 3.2 Gas Station

**Bài toán:** Có n trạm xăng trên đường tròn. Trạm i có `gas[i]` xăng, tốn `cost[i]` để đến trạm tiếp. Tìm trạm xuất phát để đi hết vòng.

```
gas  = [1, 2, 3, 4, 5]
cost = [3, 4, 5, 1, 2]
Kết quả: 3 (xuất phát từ trạm 3)
```

```javascript
function canCompleteCircuit(gas, cost) {
  let totalTank = 0;
  let currentTank = 0;
  let startStation = 0;

  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    totalTank += diff;
    currentTank += diff;

    // Nếu tank < 0 → không thể xuất phát từ startStation
    // → thử xuất phát từ trạm tiếp theo
    if (currentTank < 0) {
      startStation = i + 1;
      currentTank = 0;
    }
  }

  // Nếu tổng gas >= tổng cost → chắc chắn có lời giải
  return totalTank >= 0 ? startStation : -1;
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])); // 3

// Trace:
// i=0: diff=1-3=-2, current=-2 < 0 → start=1, current=0
// i=1: diff=2-4=-2, current=-2 < 0 → start=2, current=0
// i=2: diff=3-5=-2, current=-2 < 0 → start=3, current=0
// i=3: diff=4-1=3, current=3
// i=4: diff=5-2=3, current=6
// totalTank = -2-2-2+3+3 = 0 >= 0 → return 3 ✓
```

### 3.3 Non-overlapping Intervals (Interval Scheduling)

**Bài toán:** Xóa ít interval nhất để không có chồng chéo.

```
Input:  [[1,2], [2,3], [3,4], [1,3]]
Output: 1 (xóa [1,3])
```

**Greedy:** Sắp xếp theo **end time**, luôn chọn interval kết thúc sớm nhất.

```javascript
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0;

  // Sắp xếp theo end time
  intervals.sort((a, b) => a[1] - b[1]);

  let count = 0;
  let prevEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < prevEnd) {
      // Chồng chéo → xóa interval hiện tại (vì end sau)
      count++;
    } else {
      // Không chồng → cập nhật prevEnd
      prevEnd = intervals[i][1];
    }
  }

  return count;
}

console.log(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])); // 1

// Sorted by end: [[1,2], [2,3], [1,3], [3,4]]
// prevEnd=2
// [2,3]: 2 >= 2 → ok, prevEnd=3
// [1,3]: 1 < 3 → chồng! count=1
// [3,4]: 3 >= 3 → ok, prevEnd=4
// → xóa 1 interval ✓
```

### 3.4 Meeting Rooms II (Minimum Rooms)

**Bài toán:** Cần ít nhất bao nhiêu phòng họp?

```
meetings = [[0,30], [5,10], [15,20]]
→ 2 phòng (meeting 0-30 chồng với 5-10 và 15-20)
```

```javascript
function minMeetingRooms(intervals) {
  // Tách start và end, sắp xếp riêng
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0;
  let maxRooms = 0;
  let s = 0, e = 0;

  while (s < starts.length) {
    if (starts[s] < ends[e]) {
      rooms++;    // cần thêm phòng
      s++;
    } else {
      rooms--;    // 1 meeting kết thúc, giải phóng phòng
      e++;
    }
    maxRooms = Math.max(maxRooms, rooms);
  }

  return maxRooms;
}

console.log(minMeetingRooms([[0,30],[5,10],[15,20]])); // 2

// starts: [0, 5, 15]
// ends:   [10, 20, 30]
// s=0,e=0: 0<10 → rooms=1, max=1
// s=1,e=0: 5<10 → rooms=2, max=2
// s=2,e=0: 15>=10 → rooms=1
// s=2,e=1: 15<20 → rooms=2, max=2
// → 2 phòng ✓
```

---

## 4. Greedy vs DP

| | Greedy | DP |
|--|--------|------|
| Cách giải | Chọn tối ưu cục bộ | Thử tất cả |
| Tốc độ | Thường nhanh hơn | Chậm hơn |
| Đúng | Chỉ khi có greedy property | Luôn đúng |
| Ví dụ đúng | Đổi tiền (tờ 1,5,10,20,50,100k) | Đổi tiền (coin bất kỳ) |
| Ví dụ sai | Coins [1,3,4], amount=6: greedy chọn 4+1+1=3 xu, nhưng 3+3=2 xu tối ưu hơn! | |

---

## 5. Bài tập luyện tập

### Medium
- [ ] [Jump Game](https://leetcode.com/problems/jump-game/)
- [ ] [Jump Game II](https://leetcode.com/problems/jump-game-ii/)
- [ ] [Gas Station](https://leetcode.com/problems/gas-station/)
- [ ] [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)
- [ ] [Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [ ] [Partition Labels](https://leetcode.com/problems/partition-labels/)
- [ ] [Task Scheduler](https://leetcode.com/problems/task-scheduler/)
- [ ] [Hand of Straights](https://leetcode.com/problems/hand-of-straights/)
