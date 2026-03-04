# Next.js

## 1. Next.js là gì?

Next.js là **React framework** cho production. Nó bổ sung những gì React thiếu: routing, SSR, SSG, API routes, optimization...

```
React thuần (SPA):
- Client-side rendering (CSR)
- 1 file HTML trống
- JS tải về → render trên trình duyệt
- SEO kém, load chậm lần đầu

Next.js:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- File-based routing (không cần React Router)
- API routes (backend trong cùng project)
- Image optimization, font optimization
- Built-in performance optimization
```

### Khi nào dùng Next.js?

```
✓ SEO quan trọng (blog, e-commerce, landing page)
✓ Performance lần đầu load
✓ Full-stack app (frontend + API)
✓ Static sites (blog, docs)

Không cần nếu:
✗ Dashboard/admin (không cần SEO)
✗ App nội bộ (SPA đủ rồi)
```

---

## 2. Setup

```bash
npx create-next-app@latest my-app
# Chọn: TypeScript, Tailwind, App Router, src/

cd my-app
npm run dev  # http://localhost:3000
```

### Cấu trúc thư mục (App Router)

```
my-app/
├── src/
│   └── app/
│       ├── layout.js       ← Root layout (bọc toàn app)
│       ├── page.js          ← Trang chủ (/)
│       ├── globals.css
│       │
│       ├── about/
│       │   └── page.js      ← /about
│       │
│       ├── blog/
│       │   ├── page.js      ← /blog
│       │   └── [slug]/
│       │       └── page.js  ← /blog/my-post (dynamic)
│       │
│       └── api/
│           └── users/
│               └── route.js ← API: /api/users
│
├── public/                  ← Static files
├── next.config.js
└── package.json
```

---

## 3. File-based Routing

```
Tạo file          →  URL
app/page.js       →  /
app/about/page.js →  /about
app/blog/page.js  →  /blog
app/blog/[slug]/page.js → /blog/any-slug
app/shop/[...slug]/page.js → /shop/a/b/c (catch-all)
```

### Layout

```jsx
// app/layout.js - Root layout (BẮT BUỘC)
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </nav>
        <main>{children}</main>
        <footer>© 2024</footer>
      </body>
    </html>
  );
}

// app/blog/layout.js - Nested layout cho /blog/*
export default function BlogLayout({ children }) {
  return (
    <div className="blog-container">
      <aside>Blog Sidebar</aside>
      <article>{children}</article>
    </div>
  );
}
```

### Dynamic Routes

```jsx
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  const { slug } = params;
  // URL: /blog/hello-world → slug = "hello-world"

  return <h1>Post: {slug}</h1>;
}

// app/shop/[...slug]/page.js (Catch-all)
export default function ShopPage({ params }) {
  const { slug } = params;
  // URL: /shop/clothes/shirts/blue → slug = ["clothes", "shirts", "blue"]

  return <p>Path: {slug.join(" > ")}</p>;
}
```

---

## 4. Server Components vs Client Components

```
Mặc định trong App Router: TẤT CẢ components là Server Components

Server Components:
✓ Chạy trên server
✓ Có thể fetch data trực tiếp (không cần useEffect)
✓ Có thể truy cập database, file system
✓ Không gửi JS xuống client → bundle nhỏ hơn
✗ KHÔNG dùng được useState, useEffect, event handlers

Client Components:
✓ Chạy trên browser
✓ Dùng được hooks, event handlers, browser APIs
✗ Cần đánh dấu "use client" ở đầu file
```

### Server Component (mặc định)

```jsx
// app/users/page.js - Server Component
// Không cần "use client", không cần useState, useEffect

export default async function UsersPage() {
  // Fetch trực tiếp trong component!
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
// → HTML render trên server, gửi xuống client
// → Không gửi JS cho component này
// → SEO tốt, load nhanh
```

### Client Component

```jsx
// components/Counter.js
"use client"; // ← Đánh dấu Client Component

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
```

### Kết hợp Server + Client

```jsx
// app/dashboard/page.js - Server Component
import Counter from "@/components/Counter"; // Client Component

export default async function Dashboard() {
  // Server: fetch data
  const stats = await fetch("/api/stats").then(r => r.json());

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total users: {stats.users}</p>  {/* Server rendered */}
      <Counter />                         {/* Client interactive */}
    </div>
  );
}
```

---

## 5. Data Fetching

### Server Component (async component)

```jsx
// Mặc định: cache + revalidate
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 3600 }, // Revalidate mỗi 1 giờ
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Static vs Dynamic

```jsx
// STATIC (SSG) - Build time
// Mặc định nếu không có dynamic data
export default function AboutPage() {
  return <h1>About Us</h1>;
}

// DYNAMIC (SSR) - Mỗi request
// Tự động khi dùng cookies, headers, searchParams
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const user = await fetchUser(token);

  return <h1>Hello, {user.name}</h1>;
}

// Force dynamic
export const dynamic = "force-dynamic"; // Luôn SSR
export const revalidate = 60;            // ISR: revalidate mỗi 60s
```

### generateStaticParams (Static Generation cho dynamic routes)

```jsx
// app/blog/[slug]/page.js

// Build time: Next.js generate HTML cho mỗi slug
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then(r => r.json());

  return posts.map(post => ({
    slug: post.slug,
  }));
  // → /blog/hello-world, /blog/react-tips, ...
}

export default async function BlogPost({ params }) {
  const { slug } = params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

---

## 6. API Routes

```jsx
// app/api/users/route.js

import { NextResponse } from "next/server";

// GET /api/users
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  // Có thể query database trực tiếp!
  const users = await db.user.findMany({
    where: role ? { role } : undefined,
  });

  return NextResponse.json(users);
}

// POST /api/users
export async function POST(request) {
  const body = await request.json();

  const user = await db.user.create({
    data: body,
  });

  return NextResponse.json(user, { status: 201 });
}

// app/api/users/[id]/route.js
// GET /api/users/123
export async function GET(request, { params }) {
  const user = await db.user.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

---

## 7. Navigation

```jsx
import Link from "next/link";
import { useRouter } from "next/navigation";

// Declarative
function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href={`/blog/${post.slug}`}>Read more</Link>
      <Link href="/dashboard" prefetch={false}>Dashboard</Link>
    </nav>
  );
}

// Programmatic (Client Component only)
"use client";
function LoginForm() {
  const router = useRouter();

  const handleLogin = async () => {
    await login();
    router.push("/dashboard");
    // router.replace("/dashboard"); // Không lưu history
    // router.back();                // Quay lại
    // router.refresh();             // Refresh server data
  };
}
```

---

## 8. Metadata (SEO)

```jsx
// app/page.js - Static metadata
export const metadata = {
  title: "My App - Home",
  description: "Welcome to my app",
  openGraph: {
    title: "My App",
    description: "Welcome",
    images: ["/og-image.png"],
  },
};

// app/blog/[slug]/page.js - Dynamic metadata
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
```

---

## 9. Loading & Error UI

```jsx
// app/blog/loading.js - Loading UI (tự động wrap trong Suspense)
export default function Loading() {
  return <div className="skeleton">Loading posts...</div>;
}

// app/blog/error.js - Error UI (tự động wrap trong Error Boundary)
"use client"; // Error components phải là Client Component

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/not-found.js - 404 page
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link href="/">Go home</Link>
    </div>
  );
}
```

---

## 10. Server Actions (React 19+)

```jsx
// app/actions.js
"use server";

export async function createPost(formData) {
  const title = formData.get("title");
  const content = formData.get("content");

  const post = await db.post.create({
    data: { title, content },
  });

  revalidatePath("/blog");
  return post;
}

// app/blog/new/page.js
import { createPost } from "../actions";

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
// → Form submit gọi server action trực tiếp
// → Không cần API route riêng!
```

---

## 11. Tổng hợp Rendering Strategies

| Strategy | Khi nào | Ví dụ |
|----------|---------|-------|
| **SSG** (Static) | Content không đổi | Blog post, docs, landing |
| **ISR** (Incremental) | Content đổi ít | Product page (revalidate 1h) |
| **SSR** (Dynamic) | Content theo user | Dashboard, profile |
| **CSR** (Client) | Interactive UI | Charts, forms, real-time |

---

## 12. Bài tập

1. Tạo blog app với Next.js: home page (list posts) + dynamic route (post detail)
2. Implement SSG cho blog với `generateStaticParams`
3. Tạo API routes cho CRUD todo list
4. Build dashboard với Server + Client Components kết hợp
5. Implement authentication flow (login page → protected routes → middleware)
