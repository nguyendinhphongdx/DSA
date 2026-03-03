# Stack (Ngăn xếp)

## 1. Khái niệm

Stack hoạt động theo nguyên tắc **LIFO** (Last In, First Out) - phần tử vào **sau** ra **trước**.
Giống như một chồng đĩa: đĩa đặt cuối cùng sẽ được lấy ra đầu tiên.

```
        ┌─────┐
Push →  │  4  │  ← Top (peek)   ← Pop
        ├─────┤
        │  3  │
        ├─────┤
        │  2  │
        ├─────┤
        │  1  │
        └─────┘
```

**Ví dụ thực tế:**
- Nút **Undo** (Ctrl+Z) trong editor - thao tác cuối cùng bị hoàn tác trước
- **Call Stack** trong JavaScript - hàm gọi sau return trước
- Nút **Back** của browser - trang mở cuối cùng quay lại trước

```javascript
// JS đã hỗ trợ stack qua Array
const stack = [];

stack.push(1);    // [1]
stack.push(2);    // [1, 2]
stack.push(3);    // [1, 2, 3]

stack.pop();      // 3 ← lấy ra cuối cùng
stack.pop();      // 2

stack[stack.length - 1]; // 1 ← peek (xem top mà không xóa)
```

---

## 2. Độ phức tạp

| Thao tác | Time | Giải thích              |
|----------|------|-------------------------|
| Push     | O(1) | Thêm vào đỉnh           |
| Pop      | O(1) | Lấy ra từ đỉnh          |
| Peek     | O(1) | Xem phần tử đỉnh        |
| isEmpty  | O(1) | Kiểm tra rỗng           |
| Search   | O(n) | Phải duyệt từ đỉnh xuống |

---

## 3. Các kỹ thuật quan trọng

### 3.1 Valid Parentheses (Kiểm tra ngoặc hợp lệ)

**Bài toán:** Cho chuỗi gồm `()[]{}`, kiểm tra có hợp lệ không.

```
"()[]{}" → true
"(]"    → false
"([)]"  → false
"{[]}"  → true
```

**Ý tưởng:** Gặp ngoặc mở → push. Gặp ngoặc đóng → pop và kiểm tra khớp.

```javascript
function isValid(s) {
  const stack = [];
  const pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
  };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch); // ngoặc mở → push
    } else {
      // ngoặc đóng → kiểm tra top stack
      if (stack.pop() !== pairs[ch]) return false;
    }
  }

  return stack.length === 0; // stack rỗng = hợp lệ
}

// Demo
console.log(isValid("()[]{}"));  // true
console.log(isValid("([)]"));    // false
console.log(isValid("{[]}"));    // true

// Trace "{[]}":
// '{' → push → stack: ['{']
// '[' → push → stack: ['{', '[']
// ']' → pop '[', khớp với pairs[']'] = '[' ✓ → stack: ['{']
// '}' → pop '{', khớp với pairs['}'] = '{' ✓ → stack: []
// stack rỗng → true ✓
```

---

### 3.2 Min Stack

**Bài toán:** Implement stack hỗ trợ `getMin()` trong O(1).

**Ý tưởng:** Dùng stack phụ lưu giá trị min tại mỗi thời điểm.

```
push 5:  stack=[5],     minStack=[5]      min=5
push 3:  stack=[5,3],   minStack=[5,3]    min=3
push 7:  stack=[5,3,7], minStack=[5,3,3]  min=3
pop:     stack=[5,3],   minStack=[5,3]    min=3
pop:     stack=[5],     minStack=[5]      min=5
```

```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = []; // theo dõi min tại mỗi vị trí
  }

  push(val) {
    this.stack.push(val);
    // Min mới = min(val hiện tại, min cũ)
    const currentMin = this.minStack.length === 0
      ? val
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(currentMin);
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

// Demo
const ms = new MinStack();
ms.push(5);  // min = 5
ms.push(3);  // min = 3
ms.push(7);  // min = 3 (vẫn là 3)
console.log(ms.getMin()); // 3
ms.pop();    // bỏ 7
console.log(ms.getMin()); // 3
ms.pop();    // bỏ 3
console.log(ms.getMin()); // 5
```

---

### 3.3 Monotonic Stack (Stack đơn điệu)

**Khái niệm:** Stack luôn duy trì thứ tự tăng hoặc giảm. Rất mạnh cho bài tìm **phần tử lớn/nhỏ hơn tiếp theo**.

#### Bài toán: Daily Temperatures

Cho mảng nhiệt độ, tìm số ngày phải chờ để gặp ngày nóng hơn.

```
Input:  [73, 74, 75, 71, 69, 72, 76, 73]
Output: [ 1,  1,  4,  2,  1,  1,  0,  0]

Giải thích: Ngày 0 (73°) → chờ 1 ngày gặp 74°
            Ngày 2 (75°) → chờ 4 ngày gặp 76°
            Ngày 6 (76°) → không có ngày nào nóng hơn → 0
```

**Ý tưởng:** Dùng stack lưu **index** của những ngày chưa tìm thấy ngày nóng hơn.

```javascript
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = []; // lưu index, giảm dần theo nhiệt độ

  for (let i = 0; i < n; i++) {
    // Nếu nhiệt độ hôm nay > top stack → đã tìm thấy ngày nóng hơn
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevDay = stack.pop();
      result[prevDay] = i - prevDay;
    }
    stack.push(i);
  }

  return result;
}

// Demo
console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [1, 1, 4, 2, 1, 1, 0, 0]

// Trace:
// i=0 (73): stack=[0]
// i=1 (74): 74>73 → pop 0, result[0]=1-0=1 → stack=[1]
// i=2 (75): 75>74 → pop 1, result[1]=2-1=1 → stack=[2]
// i=3 (71): 71<75 → stack=[2,3]
// i=4 (69): 69<71 → stack=[2,3,4]
// i=5 (72): 72>69 → pop 4, result[4]=5-4=1
//           72>71 → pop 3, result[3]=5-3=2 → stack=[2,5]
// i=6 (76): 76>72 → pop 5, result[5]=6-5=1
//           76>75 → pop 2, result[2]=6-2=4 → stack=[6]
// i=7 (73): 73<76 → stack=[6,7]
// Còn lại trong stack: result[6]=0, result[7]=0
```

---

### 3.4 Evaluate Reverse Polish Notation (Biểu thức hậu tố)

```
Input: ["2","1","+","3","*"]
Tương đương: (2 + 1) * 3 = 9
```

**Ý tưởng:** Gặp số → push. Gặp phép toán → pop 2 số, tính, push kết quả.

```javascript
function evalRPN(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (["+", "-", "*", "/"].includes(token)) {
      const b = stack.pop(); // số sau
      const a = stack.pop(); // số trước
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}

// Demo
console.log(evalRPN(["2", "1", "+", "3", "*"])); // 9
console.log(evalRPN(["4", "13", "5", "/", "+"])); // 6

// Trace ["2","1","+","3","*"]:
// "2" → stack: [2]
// "1" → stack: [2, 1]
// "+" → pop 1, pop 2 → 2+1=3 → stack: [3]
// "3" → stack: [3, 3]
// "*" → pop 3, pop 3 → 3*3=9 → stack: [9]
```

---

## 4. Nhận diện bài dùng Stack

Khi nào nghĩ đến Stack?
- Bài có tính chất **"matching"** (ngoặc, thẻ HTML, ...)
- Bài tìm phần tử **lớn/nhỏ hơn tiếp theo** → Monotonic Stack
- Bài xử lý **biểu thức toán học**
- Bài có thao tác **undo** (quay lại trạng thái trước)
- Bài liên quan đến **DFS** (duyệt sâu)

---

## 5. Bài tập luyện tập

### Easy
- [ ] [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) - Stack cơ bản
- [ ] [Min Stack](https://leetcode.com/problems/min-stack/) - Stack phụ
- [ ] [Baseball Game](https://leetcode.com/problems/baseball-game/) - Simulation

### Medium
- [ ] [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) - Stack
- [ ] [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) - Monotonic Stack
- [ ] [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) - Backtracking + Stack
- [ ] [Decode String](https://leetcode.com/problems/decode-string/) - Stack
- [ ] [Car Fleet](https://leetcode.com/problems/car-fleet/) - Monotonic Stack

### Hard
- [ ] [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) - Monotonic Stack
- [ ] [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) - Stack / Two Pointers
