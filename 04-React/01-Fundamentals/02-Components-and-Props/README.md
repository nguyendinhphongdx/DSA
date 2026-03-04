# Components & Props

## 1. Component là gì?

Component là **khối xây dựng cơ bản** của React. Mỗi component là một **hàm** trả về JSX — giống như một "custom HTML tag" có thể tái sử dụng.

```jsx
// Component = Hàm trả về JSX
function Button() {
  return <button>Click me</button>;
}

// Sử dụng component (giống HTML tag)
function App() {
  return (
    <div>
      <Button />
      <Button />
      <Button />
    </div>
  );
}
```

**Ví dụ thực tế:** Trang web = ghép từ nhiều components:
```
┌─────────────────────────────────────┐
│            <Navbar />               │
├──────────┬──────────────────────────┤
│          │  <PostCard />            │
│ <Sidebar>│  <PostCard />            │
│          │  <PostCard />            │
│          │──────────────────────────│
│          │  <Pagination />          │
├──────────┴──────────────────────────┤
│            <Footer />               │
└─────────────────────────────────────┘
```

---

## 2. Props (Properties)

Props là cách **truyền dữ liệu từ parent → child**. Props là **read-only** (không được thay đổi).

```jsx
// Parent truyền props
<UserCard name="Phong" age={25} isAdmin={true} />

// Child nhận props (destructuring)
function UserCard({ name, age, isAdmin }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {isAdmin && <span className="badge">Admin</span>}
    </div>
  );
}

// Hoặc nhận cả object props
function UserCard(props) {
  return <h2>{props.name}</h2>;
}
```

### Default Props

```jsx
function Button({ text = "Click me", color = "blue", size = "md" }) {
  return (
    <button className={`btn btn-${color} btn-${size}`}>
      {text}
    </button>
  );
}

// Sử dụng
<Button />                         // "Click me", blue, md
<Button text="Submit" />           // "Submit", blue, md
<Button text="Delete" color="red" /> // "Delete", red, md
```

---

## 3. Children Prop

`children` là prop **đặc biệt** — nội dung giữa opening và closing tag.

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">
        {children}  {/* nội dung bất kỳ */}
      </div>
    </div>
  );
}

// Sử dụng
<Card title="Profile">
  <img src="/avatar.jpg" />
  <p>Hello, I'm Phong</p>
  <Button text="Follow" />
</Card>

// children = <img> + <p> + <Button>
```

**Ví dụ thực tế — Layout Component:**

```jsx
function PageLayout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}

// Mỗi trang dùng chung layout
function HomePage() {
  return (
    <PageLayout>
      <h1>Home</h1>
      <PostList />
    </PageLayout>
  );
}

function AboutPage() {
  return (
    <PageLayout>
      <h1>About</h1>
      <p>About us...</p>
    </PageLayout>
  );
}
```

---

## 4. Component Composition

Thay vì 1 component khổng lồ, **chia nhỏ** thành nhiều component con.

```jsx
// ❌ Component quá lớn
function ProductPage() {
  return (
    <div>
      <img src={product.image} />
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <div>{product.reviews.map(r => <div>{r.text}</div>)}</div>
      {/* ... 200 dòng nữa */}
    </div>
  );
}

// ✅ Chia nhỏ thành components
function ProductPage({ product }) {
  return (
    <div className="product-page">
      <ProductImage src={product.image} />
      <ProductInfo name={product.name} price={product.price} />
      <ReviewList reviews={product.reviews} />
      <AddToCartButton productId={product.id} />
    </div>
  );
}

function ProductImage({ src }) {
  return <img className="product-img" src={src} alt="Product" />;
}

function ProductInfo({ name, price }) {
  return (
    <div className="product-info">
      <h1>{name}</h1>
      <p className="price">${price}</p>
    </div>
  );
}

function ReviewList({ reviews }) {
  return (
    <div className="reviews">
      <h3>{reviews.length} Reviews</h3>
      {reviews.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
```

---

## 5. Truyền Function qua Props (Callback Props)

Parent truyền **hàm** cho child → child gọi hàm đó để **giao tiếp ngược lên parent**.

```jsx
function Parent() {
  const handleDelete = (id) => {
    console.log(`Deleting item ${id}`);
    // xóa item...
  };

  return <Child onDelete={handleDelete} />;
}

function Child({ onDelete }) {
  return (
    <button onClick={() => onDelete(42)}>
      Delete
    </button>
  );
}

// Flow:
// 1. Parent tạo hàm handleDelete
// 2. Truyền xuống Child qua prop onDelete
// 3. Child gọi onDelete(42) khi click
// 4. Parent nhận id=42 và xử lý
```

---

## 6. Spread Props

```jsx
// Truyền nhiều props cùng lúc
const buttonProps = {
  className: "btn-primary",
  disabled: false,
  onClick: handleClick,
};

<Button {...buttonProps} text="Submit" />
// Tương đương:
<Button className="btn-primary" disabled={false} onClick={handleClick} text="Submit" />

// Forwarding props (truyền tiếp)
function CustomInput({ label, ...inputProps }) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

<CustomInput label="Email" type="email" placeholder="Enter email" required />
// label → component xử lý
// type, placeholder, required → forward xuống <input>
```

---

## 7. Common Mistakes

```jsx
// ❌ Mutate props
function Child({ list }) {
  list.push("new item"); // KHÔNG ĐƯỢC thay đổi props!
}

// ❌ Tên component không viết hoa
function myButton() { ... }  // React coi đây là HTML tag
<myButton />                  // render <mybutton> thay vì component

function MyButton() { ... }  // ✅ PascalCase
<MyButton />                  // ✅

// ❌ Truyền object/array mới mỗi lần render
<Child style={{ color: "red" }} />  // tạo object MỚI mỗi render → child re-render
// ✅ Tạo bên ngoài hoặc dùng useMemo
const style = { color: "red" };
<Child style={style} />
```

---

## 8. Bài tập

1. Tạo component `Avatar` nhận `src`, `size` (sm/md/lg), `alt`
2. Tạo component `Alert` nhận `type` (success/warning/error), `children`
3. Tạo `Layout` component với `Navbar`, `Sidebar`, `children`, `Footer`
4. Tạo `TodoItem` nhận `todo` object và callback `onToggle`, `onDelete`
