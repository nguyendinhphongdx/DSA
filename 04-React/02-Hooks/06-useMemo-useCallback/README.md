# useMemo & useCallback - Tối ưu hiệu năng

## 1. Vấn đề: Tính toán lại không cần thiết

Mỗi khi component **re-render**, toàn bộ code trong function body **chạy lại**:

```jsx
function ProductList({ products, taxRate }) {
  // ❌ Tính lại mỗi lần render (dù products không đổi, chỉ đổi UI khác)
  const total = products.reduce((sum, p) => sum + p.price, 0);
  const withTax = total * (1 + taxRate);

  // ❌ Tạo function MỚI mỗi render → child nhận prop mới → child re-render
  const handleSort = () => {
    console.log("Sorting...");
  };

  return <ExpensiveChild total={withTax} onSort={handleSort} />;
}
```

---

## 2. useMemo - Cache giá trị tính toán

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
//                              ↑ function tính toán           ↑ dependencies
// Chỉ tính lại khi a hoặc b thay đổi
```

### Ví dụ:

```jsx
function ProductList({ products, taxRate }) {
  const [sortOrder, setSortOrder] = useState("asc");

  // ✅ Chỉ tính lại khi products hoặc taxRate thay đổi
  const totalWithTax = useMemo(() => {
    console.log("Calculating..."); // chỉ log khi dependency đổi
    const total = products.reduce((sum, p) => sum + p.price, 0);
    return total * (1 + taxRate);
  }, [products, taxRate]);

  // ✅ Sort chỉ khi products hoặc sortOrder đổi
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }, [products, sortOrder]);

  return (
    <div>
      <p>Total: ${totalWithTax.toFixed(2)}</p>
      <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}>
        Sort {sortOrder}
      </button>
      {sortedProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## 3. useCallback - Cache function reference

```jsx
const memoizedFn = useCallback(() => { doSomething(a, b); }, [a, b]);
// Trả về CÙNG function reference nếu dependencies không đổi
```

**Tại sao cần?** Trong JS, `() => {}` !== `() => {}` (khác reference). Mỗi render tạo function mới → child nhận prop mới → child re-render.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // ❌ Tạo mới mỗi render → ExpensiveChild re-render khi đổi text
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // ✅ Giữ nguyên reference → ExpensiveChild KHÔNG re-render khi đổi text
  const handleClickMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []); // dependencies: không phụ thuộc gì bên ngoài

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ExpensiveChild onClick={handleClickMemo} count={count} />
    </div>
  );
}

// Child wrap React.memo → chỉ re-render khi props thay đổi
const ExpensiveChild = React.memo(function ExpensiveChild({ onClick, count }) {
  console.log("ExpensiveChild rendered");
  return <button onClick={onClick}>Count: {count}</button>;
});
```

---

## 4. React.memo - Memoize component

```jsx
// React.memo: skip re-render nếu props GIỐNG (shallow comparison)
const MemoizedComponent = React.memo(function MyComponent({ data, onClick }) {
  console.log("Rendered!");
  return <div onClick={onClick}>{data}</div>;
});

// Chỉ re-render khi data hoặc onClick thay đổi (reference)
// → Kết hợp với useCallback để onClick giữ nguyên reference
```

---

## 5. Khi nào dùng / KHÔNG dùng

### ✅ Dùng khi:
```jsx
// 1. Tính toán nặng
const sorted = useMemo(() => hugeArray.sort(...), [hugeArray]);

// 2. Reference equality cho useEffect dependency
const options = useMemo(() => ({ url, method }), [url, method]);
useEffect(() => { fetch(options) }, [options]);

// 3. Truyền callback cho React.memo child
const handleClick = useCallback(() => { ... }, [dep]);
<MemoizedChild onClick={handleClick} />
```

### ❌ KHÔNG dùng khi:
```jsx
// 1. Tính toán đơn giản (overhead của memo > tính toán)
const double = useMemo(() => count * 2, [count]); // ❌ overkill
const double = count * 2; // ✅ đủ nhanh

// 2. Primitive props (React tự so sánh được)
<Child count={count} />  // number → tự so sánh
// Không cần useMemo cho count

// 3. Component render nhanh, ít children
// React.memo có overhead, đừng wrap mọi thứ

// 4. Premature optimization
// Đo trước, tối ưu sau. Đừng memo mọi thứ "phòng xa"
```

---

## 6. Bảng so sánh

| | useMemo | useCallback |
|--|---------|------------|
| Return | **Giá trị** (any) | **Function** |
| Cache | Kết quả tính toán | Function reference |
| Dùng khi | Tính toán nặng | Truyền callback cho memo child |
| Equivalent | `useMemo(() => fn, [dep])` | `useCallback(fn, [dep])` |

```jsx
// Hai dòng này TƯƠNG ĐƯƠNG:
const memoizedFn = useCallback(fn, [dep]);
const memoizedFn = useMemo(() => fn, [dep]);
```

---

## 7. Anti-patterns

```jsx
// ❌ useMemo/useCallback MỌI THỨ
function App() {
  const value = useMemo(() => 5 + 3, []);        // ❌ quá đơn giản
  const handler = useCallback(() => {}, []);       // ❌ không ai dùng reference
  const style = useMemo(() => ({ color: "red" }), []); // ❌ nếu không truyền cho memo child
}

// ❌ Dependencies sai
const handleClick = useCallback(() => {
  console.log(count); // stale closure! count luôn = 0
}, []); // thiếu count trong deps

const handleClick = useCallback(() => {
  console.log(count); // ✅ luôn đúng
}, [count]);
```

---

## 8. Bài tập

1. Tạo list 10,000 items với filter + sort, dùng useMemo tối ưu
2. Tạo Parent + 5 Child components, dùng React.memo + useCallback để chỉ re-render child liên quan
3. Tạo search box với debounce dùng useCallback
4. Profile performance: so sánh với/không có memo (React DevTools Profiler)
