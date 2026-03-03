# Dynamic Programming (Quy hoạch động)

## 1. Khái niệm

DP là kỹ thuật giải bài toán bằng cách chia thành **bài toán con chồng chéo**, rồi **lưu kết quả** để không tính lại.

**Khác với Divide & Conquer:** D&C chia bài toán con **độc lập** (Merge Sort), DP chia bài toán con **chồng chéo** (Fibonacci).

```
Fibonacci - bài toán con CHỒNG CHÉO:
          fib(5)
         /      \
      fib(4)    fib(3)       ← fib(3) tính 2 lần
      /    \    /    \
   fib(3) fib(2) fib(2) fib(1)  ← fib(2) tính 3 lần

Không dùng DP: O(2^n) vì tính lại nhiều lần
Dùng DP:       O(n) vì mỗi bài toán con chỉ tính 1 lần
```

---

## 2. Nhận diện bài DP

Bài toán **có thể dùng DP** khi thỏa 2 điều kiện:

1. **Optimal Substructure:** Lời giải tối ưu chứa lời giải tối ưu của bài toán con.
2. **Overlapping Subproblems:** Các bài toán con được giải lại nhiều lần.

**Dấu hiệu nhận biết:**
- Đề bài hỏi: "**tối thiểu**", "**tối đa**", "**đếm số cách**", "**có thể hay không**"
- Bạn có thể mô tả lời giải bằng công thức: `dp[i] = f(dp[i-1], dp[i-2], ...)`

---

## 3. Hai cách tiếp cận

### Top-Down (Memoization) - Đệ quy + Cache

```javascript
// Fibonacci - Top Down
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]; // đã tính rồi → trả về luôn
  if (n <= 1) return n;          // base case

  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}
```

### Bottom-Up (Tabulation) - Xây bảng từ base case lên

```javascript
// Fibonacci - Bottom Up
function fibTab(n) {
  if (n <= 1) return n;

  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Tối ưu space: chỉ cần 2 biến
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
```

| So sánh | Top-Down | Bottom-Up |
|---------|----------|-----------|
| Cách viết | Đệ quy | Vòng lặp |
| Dễ nghĩ ra | Dễ hơn | Khó hơn |
| Hiệu năng | Chậm hơn (call stack) | Nhanh hơn |
| Bộ nhớ | O(n) stack | Có thể tối ưu |

---

## 4. Quy trình giải bài DP

### Bước 1: Xác định **state** (trạng thái)
→ `dp[i]` đại diện cho gì?

### Bước 2: Tìm **transition** (công thức chuyển)
→ `dp[i]` tính từ các `dp[j]` nào? (j < i)

### Bước 3: Xác định **base case**
→ `dp[0]`, `dp[1]` = bao nhiêu?

### Bước 4: Xác định **kết quả**
→ Trả về `dp[n]` hay `dp[n-1]`?

---

## 5. Các dạng phổ biến

### 5.1 House Robber (1D DP)

**Bài toán:** Trộm nhà liền kề sẽ bị bắt. Tìm tổng tiền tối đa.

```
nums = [1, 2, 3, 1]

Không được cướp 2 nhà liền kề:
  Cướp nhà 0,2: 1+3 = 4 ✓ (max)
  Cướp nhà 1,3: 2+1 = 3
  Cướp nhà 0,3: 1+1 = 2
```

```javascript
// dp[i] = max tiền cướp được từ nhà 0 đến i
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
//         ↑ không cướp i  ↑ cướp i (bỏ i-1)

function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let prev2 = 0;        // dp[i-2]
  let prev1 = 0;        // dp[i-1]

  for (const num of nums) {
    const current = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

console.log(rob([1, 2, 3, 1])); // 4
console.log(rob([2, 7, 9, 3, 1])); // 12 (2+9+1)

// Trace [2, 7, 9, 3, 1]:
// num=2: current=max(0, 0+2)=2, prev2=0, prev1=2
// num=7: current=max(2, 0+7)=7, prev2=2, prev1=7
// num=9: current=max(7, 2+9)=11, prev2=7, prev1=11
// num=3: current=max(11, 7+3)=11, prev2=11, prev1=11
// num=1: current=max(11, 11+1)=12, prev2=11, prev1=12
// → 12 ✓
```

### 5.2 Coin Change (Classic DP)

**Bài toán:** Dùng ít đồng xu nhất để đạt amount.

```
coins = [1, 2, 5], amount = 11
→ 3 đồng xu (5 + 5 + 1)
```

```javascript
// dp[i] = số xu ít nhất để đạt amount = i
// dp[i] = min(dp[i - coin] + 1) với mọi coin

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 xu để đạt amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11)); // 3 (5+5+1)
console.log(coinChange([2], 3));          // -1 (không thể)

// Trace coins=[1,2,5], amount=11:
// dp[0]=0
// dp[1]=min(dp[0]+1)=1          (1)
// dp[2]=min(dp[1]+1, dp[0]+1)=1 (2)
// dp[3]=min(dp[2]+1, dp[1]+1)=2 (2+1)
// dp[4]=min(dp[3]+1, dp[2]+1)=2 (2+2)
// dp[5]=min(dp[4]+1, dp[3]+1, dp[0]+1)=1 (5)
// dp[6]=min(dp[5]+1, dp[4]+1, dp[1]+1)=2 (5+1)
// ...
// dp[10]=min(dp[9]+1, dp[8]+1, dp[5]+1)=2 (5+5)
// dp[11]=min(dp[10]+1, dp[9]+1, dp[6]+1)=3 (5+5+1) ✓
```

### 5.3 Longest Increasing Subsequence (LIS)

**Bài toán:** Tìm dãy con tăng dần dài nhất.

```
nums = [10, 9, 2, 5, 3, 7, 101, 18]
LIS = [2, 3, 7, 101] hoặc [2, 5, 7, 101] → length = 4
```

```javascript
// dp[i] = độ dài LIS kết thúc tại index i
// dp[i] = max(dp[j] + 1) với j < i và nums[j] < nums[i]

function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1); // mỗi phần tử tự nó là LIS length 1

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4

// dp: [1, 1, 1, 2, 2, 3, 4, 4]
//      10  9  2  5  3  7 101 18
// dp[3]=2: 2<5 → dp[2]+1=2
// dp[5]=3: 2<7, 5<7, 3<7 → max(dp[2]+1, dp[3]+1, dp[4]+1)=3
// dp[6]=4: tất cả < 101 → max = dp[5]+1 = 4
```

### 5.4 Unique Paths (2D DP)

**Bài toán:** Robot ở góc trên-trái, chỉ đi xuống hoặc phải. Đếm số đường đến góc dưới-phải.

```
Grid 3x3:
┌───┬───┬───┐
│ 1 │ 1 │ 1 │
├───┼───┼───┤
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 1 │ 3 │ 6 │  ← 6 đường
└───┴───┴───┘

dp[i][j] = dp[i-1][j] + dp[i][j-1]
(đến từ trên + đến từ trái)
```

```javascript
function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}

console.log(uniquePaths(3, 3)); // 6
console.log(uniquePaths(3, 7)); // 28
```

### 5.5 Longest Common Subsequence (2D DP)

```
text1 = "abcde", text2 = "ace"
LCS = "ace" → length = 3
```

```javascript
// dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]

function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // match!
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // skip 1 char
      }
    }
  }

  return dp[m][n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3

//     ""  a  c  e
// ""   0  0  0  0
//  a   0  1  1  1
//  b   0  1  1  1
//  c   0  1  2  2
//  d   0  1  2  2
//  e   0  1  2  3  ← kết quả
```

---

## 6. Tóm tắt các dạng

| Dạng | Ví dụ | State |
|------|-------|-------|
| 1D DP | Climbing Stairs, House Robber | dp[i] |
| 2D DP | Unique Paths, Edit Distance | dp[i][j] |
| Knapsack | Coin Change, Partition Equal Subset | dp[amount] |
| LCS/LIS | Longest Common Subsequence | dp[i][j] / dp[i] |
| Interval DP | Burst Balloons | dp[i][j] = range |
| Bitmask DP | Traveling Salesman | dp[mask][i] |

---

## 7. Bài tập luyện tập

### Easy
- [ ] [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) - Fibonacci variant
- [ ] [Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/)

### Medium (làm theo thứ tự)
- [ ] [House Robber](https://leetcode.com/problems/house-robber/) - 1D DP cơ bản
- [ ] [House Robber II](https://leetcode.com/problems/house-robber-ii/) - Circular
- [ ] [Coin Change](https://leetcode.com/problems/coin-change/) - Unbounded Knapsack
- [ ] [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)
- [ ] [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/)
- [ ] [Word Break](https://leetcode.com/problems/word-break/)
- [ ] [Unique Paths](https://leetcode.com/problems/unique-paths/)
- [ ] [Decode Ways](https://leetcode.com/problems/decode-ways/)
- [ ] [Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) - 0/1 Knapsack
- [ ] [Target Sum](https://leetcode.com/problems/target-sum/)

### Hard
- [ ] [Edit Distance](https://leetcode.com/problems/edit-distance/) - 2D DP
- [ ] [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/)
- [ ] [Burst Balloons](https://leetcode.com/problems/burst-balloons/) - Interval DP
