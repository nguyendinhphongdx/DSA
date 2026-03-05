# Strategy Pattern

## 1. Khái niệm

Định nghĩa family of algorithms, đóng gói từng cái, và cho phép **đổi thuật toán tại runtime**.

```
┌──────────┐      ┌──────────────┐
│ Context  │─────→│ «interface»  │
│          │      │  Strategy    │
└──────────┘      │ + execute()  │
                  └──────┬───────┘
                   ┌─────┼─────┐
                StratA StratB StratC
```

---

## 2. Bad vs Good

```javascript
// ❌ Bad: if/else chain
function calculateShipping(order, method) {
  if (method === 'standard') {
    return order.weight * 1000;
  } else if (method === 'express') {
    return order.weight * 2000 + 15000;
  } else if (method === 'overnight') {
    return order.weight * 3000 + 50000;
  }
}

// ✅ Good: Strategy pattern
const shippingStrategies = {
  standard: (order) => order.weight * 1000,
  express: (order) => order.weight * 2000 + 15000,
  overnight: (order) => order.weight * 3000 + 50000,
};

function calculateShipping(order, strategy) {
  return strategy(order);
}

// Dùng
const cost = calculateShipping(order, shippingStrategies.express);

// Thêm strategy mới? Không sửa gì cả!
shippingStrategies.drone = (order) => order.weight * 5000 + 100000;
```

---

## 3. Ví dụ: Sorting Strategies

```javascript
class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(data) {
    return this.strategy(data);
  }
}

// Strategies
const bubbleSort = (arr) => {
  const a = [...arr];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++)
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
  return a;
};

const quickSort = (arr) => {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x <= pivot);
  const right = arr.slice(1).filter(x => x > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
};

// Đổi strategy runtime
const sorter = new Sorter(bubbleSort);
sorter.sort([3, 1, 4, 1, 5]);

sorter.setStrategy(quickSort); // Đổi!
sorter.sort([3, 1, 4, 1, 5]);
```

---

## 4. Validation Strategies

```javascript
const validators = {
  required: (value) => value ? null : 'Field is required',
  email: (value) => /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email',
  minLength: (min) => (value) =>
    value.length >= min ? null : `Min ${min} characters`,
  maxLength: (max) => (value) =>
    value.length <= max ? null : `Max ${max} characters`,
};

function validate(value, rules) {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

// Compose validation rules
const emailRules = [
  validators.required,
  validators.email,
  validators.maxLength(255),
];

validate('', emailRules);             // 'Field is required'
validate('invalid', emailRules);      // 'Invalid email'
validate('test@mail.com', emailRules); // null (valid!)
```

---

## 5. Khi nào dùng

- Có nhiều thuật toán/cách xử lý cho cùng 1 vấn đề
- Muốn đổi algorithm tại runtime
- Thay thế if/else hoặc switch chains
- JS: functions as first-class citizens → natural strategy pattern

---

## 6. Bài tập

```javascript
// Tạo PricingStrategy cho e-commerce:
// - RegularPricing: giá gốc
// - MemberPricing: giảm 10%
// - VIPPricing: giảm 20% + free shipping
// - FlashSalePricing: giảm 50% (có time limit)
// ShoppingCart sử dụng strategy để tính giá
```
