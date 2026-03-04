# Practice - Thực hành React

## Mini Exercises

Bài tập nhỏ cho từng concept, làm trong 15-30 phút.

### Fundamentals
| # | Bài tập | Concepts | Độ khó |
|---|---------|----------|--------|
| 1 | Counter (increment, decrement, reset, even/odd) | useState, events | ⭐ |
| 2 | Toggle visibility (show/hide text) | useState, conditional rendering | ⭐ |
| 3 | Color picker (click button → đổi background) | useState, inline styles | ⭐ |
| 4 | Character counter (input + remaining chars) | useState, controlled input | ⭐ |
| 5 | Todo List (add, delete, toggle complete) | useState, array state, map, filter | ⭐⭐ |
| 6 | Accordion (click header → expand/collapse content) | useState, conditional rendering | ⭐⭐ |
| 7 | Star Rating (click star → highlight) | useState, map, events | ⭐⭐ |
| 8 | Tab Component (click tab → show content) | useState, props, composition | ⭐⭐ |

### Hooks
| # | Bài tập | Concepts | Độ khó |
|---|---------|----------|--------|
| 9 | Digital Clock (auto update mỗi giây) | useEffect, cleanup, setInterval | ⭐ |
| 10 | Window Size Tracker | useEffect, event listener, cleanup | ⭐ |
| 11 | Fetch & Display Users | useEffect, useState, fetch, loading/error | ⭐⭐ |
| 12 | Debounced Search | useState, useEffect, custom hook | ⭐⭐ |
| 13 | Auto-focus Input | useRef, useEffect | ⭐ |
| 14 | Stopwatch (start, stop, reset, lap) | useRef, useState, setInterval | ⭐⭐ |
| 15 | Theme Context (light/dark toggle) | useContext, createContext | ⭐⭐ |
| 16 | Shopping Cart (useReducer) | useReducer, dispatch, actions | ⭐⭐⭐ |

### Advanced
| # | Bài tập | Concepts | Độ khó |
|---|---------|----------|--------|
| 17 | Infinite Scroll | useEffect, useRef, IntersectionObserver | ⭐⭐⭐ |
| 18 | Drag & Drop list | useRef, events, state management | ⭐⭐⭐ |
| 19 | Form with validation | Custom hook, error handling | ⭐⭐⭐ |
| 20 | Modal with Portal | createPortal, useRef, click outside | ⭐⭐⭐ |

---

## Projects

Dự án lớn hơn, kết hợp nhiều concepts.

### Project 1: Todo App (Beginner)
**Tech:** React + useState + CSS Modules

**Features:**
- Add/edit/delete todos
- Toggle complete
- Filter (All / Active / Completed)
- Counter: "X items left"
- LocalStorage persistence
- Clear completed

**Concepts luyện:** useState, array methods, conditional rendering, CSS Modules, localStorage

---

### Project 2: Weather App (Beginner-Intermediate)
**Tech:** React + useEffect + Fetch API

**Features:**
- Search city
- Display current weather (temperature, humidity, wind)
- 5-day forecast
- Geolocation (current location)
- Loading & error states

**API:** OpenWeatherMap (free tier)

**Concepts luyện:** useEffect, fetch, async/await, conditional rendering, error handling

---

### Project 3: E-commerce Product Page (Intermediate)
**Tech:** React + useReducer + Context + React Router

**Features:**
- Product listing với filter/sort
- Product detail page
- Shopping cart (add, remove, update quantity)
- Cart sidebar/page
- Checkout form

**Concepts luyện:** useReducer, Context API, React Router, form handling, component composition

---

### Project 4: Blog Platform (Intermediate)
**Tech:** React + React Router + TanStack Query (hoặc fetch)

**Features:**
- Post list với pagination
- Post detail
- Create/edit post (Markdown editor)
- Categories/Tags filter
- Search
- Author profile

**Concepts luyện:** React Router (nested routes, params), data fetching, pagination, search/filter

---

### Project 5: Dashboard App (Advanced)
**Tech:** React + TypeScript + Zustand + TanStack Query + Tailwind

**Features:**
- Authentication (login/register/logout)
- Protected routes
- Dashboard với charts/statistics
- CRUD cho resources (users, products, orders)
- Table với sort, filter, pagination
- Dark/light mode
- Responsive layout

**Concepts luyện:** Tất cả concepts đã học, TypeScript, state management, data fetching, routing, styling

---

### Project 6: Real-time Chat App (Advanced)
**Tech:** Next.js + WebSocket + Zustand

**Features:**
- User authentication
- Chat rooms
- Real-time messages
- Online status
- File/image sharing
- Message search
- Responsive (mobile-first)

**Concepts luyện:** Next.js, Server Components, real-time data, WebSocket, advanced state management

---

## Cách tiếp cận

1. **Đọc requirements** → Hiểu rõ features cần làm
2. **Phác thảo UI** → Vẽ wireframe đơn giản
3. **Chia components** → Component tree
4. **Xác định state** → State nào, ở đâu
5. **Code từng feature** → Từ đơn giản → phức tạp
6. **Style** → CSS cuối cùng
7. **Test** → Viết tests cho critical features
8. **Refactor** → Clean code, extract hooks/components

---

## Tips

- Bắt đầu từ Project 1, lên dần
- Mỗi project nên mất 1-3 ngày
- Không cần hoàn hảo, focus vào concepts
- Dùng fake data / mock API nếu chưa có backend
- Commit thường xuyên, mỗi feature 1 commit
