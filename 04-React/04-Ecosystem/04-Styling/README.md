# Styling trong React

## 1. Tổng quan các phương pháp

```
CSS thông thường        → file .css import trực tiếp
CSS Modules             → scoped CSS, tránh conflict tên class
Tailwind CSS            → utility-first, viết class trực tiếp trong JSX
CSS-in-JS               → styled-components, Emotion
Inline styles           → style={{ }} trực tiếp
```

---

## 2. CSS thông thường

```css
/* styles.css */
.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
}

.card--active {
  border-color: blue;
}
```

```jsx
import "./styles.css";

function Card({ title, isActive }) {
  return (
    <div className={`card ${isActive ? "card--active" : ""}`}>
      <h2 className="card-title">{title}</h2>
    </div>
  );
}
```

**Vấn đề:** Class names là **global** → dễ conflict khi app lớn.

### clsx / classnames library

```bash
npm install clsx
```

```jsx
import clsx from "clsx";

function Button({ variant, size, disabled, className }) {
  return (
    <button
      className={clsx(
        "btn",                          // Luôn có
        `btn--${variant}`,              // btn--primary, btn--secondary
        `btn--${size}`,                 // btn--sm, btn--lg
        { "btn--disabled": disabled },  // Conditional
        className                       // Cho phép override từ parent
      )}
    >
      Click me
    </button>
  );
}

// Kết quả: class="btn btn--primary btn--lg btn--disabled"
```

---

## 3. CSS Modules

CSS Modules tự động **scope** class names → không bao giờ conflict.

```css
/* Card.module.css */
.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.active {
  border-color: blue;
}
```

```jsx
import styles from "./Card.module.css";
import clsx from "clsx";

function Card({ title, isActive }) {
  return (
    <div className={clsx(styles.card, { [styles.active]: isActive })}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}

// Rendered HTML:
// <div class="Card_card_x7Ks Card_active_a2Bx">
//   <h2 class="Card_title_q9Zp">...</h2>
// </div>
// → Class names unique, không conflict!
```

### Compose (kế thừa)

```css
/* base.module.css */
.text {
  font-family: sans-serif;
  line-height: 1.5;
}

/* Card.module.css */
.title {
  composes: text from "./base.module.css";
  font-size: 20px;
  font-weight: bold;
}
```

---

## 4. Tailwind CSS

### Cài đặt (Vite)

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

### Sử dụng

```jsx
function Card({ title, description, isActive }) {
  return (
    <div
      className={clsx(
        "p-4 border rounded-lg shadow-sm transition-colors",
        isActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
      )}
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Button({ children, variant = "primary", size = "md" }) {
  const baseStyles = "font-semibold rounded-lg transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], sizes[size])}>
      {children}
    </button>
  );
}
```

### Responsive

```jsx
function Layout() {
  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile: stack dọc, Desktop: ngang */}
      <aside className="w-full md:w-64 bg-gray-100 p-4">
        Sidebar
      </aside>
      <main className="flex-1 p-4">
        Content
      </main>
    </div>
  );
}

// Breakpoints mặc định:
// sm:  640px
// md:  768px
// lg:  1024px
// xl:  1280px
// 2xl: 1536px
```

### Dark Mode

```jsx
function ThemeCard({ title }) {
  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded">
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

// Toggle dark mode bằng class trên <html>
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}
```

---

## 5. styled-components (CSS-in-JS)

```bash
npm install styled-components
```

```jsx
import styled from "styled-components";

// Tạo styled component
const Card = styled.div`
  padding: 16px;
  border: 1px solid ${props => props.$active ? "blue" : "#ddd"};
  border-radius: 8px;
  background: ${props => props.$active ? "#f0f0ff" : "white"};
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => {
    switch (props.$variant) {
      case "primary": return "#3b82f6";
      case "danger": return "#ef4444";
      default: return "#e5e7eb";
    }
  }};
  color: ${props => props.$variant ? "white" : "#333"};

  &:hover {
    opacity: 0.9;
  }
`;

// Sử dụng
function ProductCard({ product }) {
  return (
    <Card $active={product.featured}>
      <Title>{product.name}</Title>
      <p>{product.price}</p>
      <Button $variant="primary">Add to Cart</Button>
      <Button $variant="danger">Remove</Button>
    </Card>
  );
}
```

### Extending styles

```jsx
const BaseButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const PrimaryButton = styled(BaseButton)`
  background: blue;
  color: white;
`;

const OutlineButton = styled(BaseButton)`
  background: transparent;
  border: 2px solid blue;
  color: blue;
`;
```

### Theme

```jsx
import { ThemeProvider } from "styled-components";

const lightTheme = {
  colors: { primary: "#3b82f6", bg: "#fff", text: "#333" },
  spacing: { sm: "8px", md: "16px", lg: "24px" },
};

const darkTheme = {
  colors: { primary: "#60a5fa", bg: "#1a1a1a", text: "#eee" },
  spacing: { sm: "8px", md: "16px", lg: "24px" },
};

const Card = styled.div`
  background: ${props => props.theme.colors.bg};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.md};
`;

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <Card>Themed content</Card>
      <button onClick={() => setIsDark(!isDark)}>Toggle</button>
    </ThemeProvider>
  );
}
```

---

## 6. So sánh

| Feature | CSS thuần | CSS Modules | Tailwind | styled-components |
|---------|----------|-------------|----------|-------------------|
| Scoping | Global | Local | Utility | Local |
| Bundle size | Nhỏ | Nhỏ | Nhỏ (purge) | Lớn hơn (~12kb) |
| Learning curve | Thấp | Thấp | Trung bình | Trung bình |
| Dynamic styles | Hạn chế | Hạn chế | clsx | Props dễ dàng |
| DX (Developer Experience) | Bình thường | Tốt | Rất tốt | Tốt |
| Performance | Tốt nhất | Tốt | Tốt | Runtime overhead |
| TypeScript | Không | Không tốt | Plugin | Tốt |

### Recommendation

```
Dự án mới, muốn nhanh?
  → Tailwind CSS ✅

Thích CSS truyền thống, cần scoping?
  → CSS Modules ✅

Cần dynamic themes phức tạp?
  → styled-components ✅

Dự án nhỏ, đơn giản?
  → CSS thuần ✅
```

---

## 7. Bài tập

1. Tạo responsive navbar với CSS Modules + clsx
2. Tạo component library (Button, Card, Input) với Tailwind CSS
3. Build theme switcher (light/dark) với styled-components ThemeProvider
4. Tạo responsive grid layout với Tailwind (1 col mobile → 3 cols desktop)
