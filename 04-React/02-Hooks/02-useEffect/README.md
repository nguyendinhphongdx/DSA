# useEffect Hook

## Mục lục

1. [Khái niệm - Side Effects là gì?](#1-khái-niệm---side-effects-là-gì)
2. [Cú pháp 3 dạng của useEffect](#2-cú-pháp-3-dạng-của-useeffect)
3. [Cleanup Function](#3-cleanup-function)
4. [Ví dụ thực tế](#4-ví-dụ-thực-tế)
5. [AbortController - Xử lý Race Condition](#5-abortcontroller---xử-lý-race-condition)
6. [Dependency Array Deep Dive](#6-dependency-array-deep-dive)
7. [useEffect vs useLayoutEffect](#7-useeffect-vs-uselayouteffect)
8. [Common Mistakes](#8-common-mistakes)
9. [Best Practices](#9-best-practices)
10. [Bài tập](#10-bài-tập)

---

## 1. Khái niệm - Side Effects là gì?

### Pure Function vs Side Effect

Trong lập trình, một **pure function** là hàm mà với cùng input luôn trả về cùng output, và **không gây ra tác dụng phụ** nào ra bên ngoài phạm vi của nó.

**Side effect** (tác dụng phụ) là bất kỳ thao tác nào **tương tác với thế giới bên ngoài** component:

- Gọi API (fetch data)
- Thao tác trực tiếp với DOM (`document.title`, `addEventListener`)
- Đặt timer (`setTimeout`, `setInterval`)
- Đọc/ghi localStorage
- Đăng ký subscription (WebSocket, event bus)

### Tại sao cần useEffect?

React component về bản chất là một **pure function**: nhận props, trả về JSX. Nếu ta gọi API hay thao tác DOM trực tiếp trong thân hàm component, nó sẽ chạy **mỗi lần render**, gây ra vấn đề nghiêm trọng về performance và logic.

`useEffect` cho phép ta **tách biệt** side effect ra khỏi quá trình render, đồng thời kiểm soát **khi nào** effect được thực thi thông qua dependency array.

```jsx
import { useEffect } from "react";

// SAI - side effect chạy mỗi lần render, chặn UI
function BadComponent() {
  // Dòng này chạy TRONG quá trình render, chặn paint
  document.title = "Hello"; // side effect trực tiếp
  fetch("/api/data"); // gọi API mỗi render, không kiểm soát được
  return <div>Bad</div>;
}

// ĐÚNG - side effect được quản lý bởi useEffect
function GoodComponent() {
  useEffect(() => {
    document.title = "Hello"; // chạy SAU khi render xong
  }, []);

  return <div>Good</div>;
}
```

> **Lưu ý quan trọng:** `useEffect` chạy **sau khi** browser đã paint xong giao diện. Điều này đảm bảo side effect không chặn (block) quá trình render UI.

---

## 2. Cú pháp 3 dạng của useEffect

### Dạng 1: Không có dependency array - Chạy sau MỖI lần render

```jsx
useEffect(() => {
  console.log("Chạy sau MỖI lần render (mount + mỗi lần re-render)");
});
```

Component render lại vì bất kỳ lý do gì (state thay đổi, props thay đổi, parent re-render) thì effect này đều chạy. **Rất hiếm khi dùng** vì dễ gây vấn đề performance.

```jsx
function LoggerComponent({ count }) {
  useEffect(() => {
    // Mỗi lần component render, dòng này đều chạy
    console.log("Component vừa render. Count hiện tại:", count);
  });

  return <p>Count: {count}</p>;
}
```

### Dạng 2: Dependency array rỗng `[]` - Chạy 1 lần khi mount

```jsx
useEffect(() => {
  console.log("Chỉ chạy 1 lần duy nhất khi component mount");
}, []); // <-- mảng rỗng
```

Tương đương `componentDidMount` trong class component. Dùng khi muốn:

- Fetch data ban đầu
- Đăng ký event listener một lần
- Khởi tạo thư viện bên thứ ba

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Chỉ fetch 1 lần khi component xuất hiện lần đầu
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

> **Cảnh báo:** Ví dụ trên có bug nếu `userId` thay đổi! Effect không re-run vì dependency array rỗng. Xem dạng 3 để xử lý đúng.

### Dạng 3: Dependency array có giá trị `[dep1, dep2]` - Chạy khi dependency thay đổi

```jsx
useEffect(() => {
  console.log("Chạy khi dep1 hoặc dep2 thay đổi");
}, [dep1, dep2]);
```

React so sánh giá trị hiện tại với giá trị trước đó bằng `Object.is()`. Nếu **bất kỳ** dependency nào thay đổi, effect sẽ chạy lại.

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]); // Re-fetch mỗi khi userId thay đổi

  if (loading) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

### Tổng hợp 3 dạng

```jsx
function Demo({ propA }) {
  const [stateB, setStateB] = useState(0);

  // Dạng 1: Chạy sau mỗi render
  useEffect(() => {
    console.log("[1] Mỗi render");
  });

  // Dạng 2: Chạy 1 lần khi mount
  useEffect(() => {
    console.log("[2] Mount lần đầu");
  }, []);

  // Dạng 3: Chạy khi propA hoặc stateB thay đổi
  useEffect(() => {
    console.log("[3] propA hoặc stateB thay đổi:", propA, stateB);
  }, [propA, stateB]);

  return <button onClick={() => setStateB((b) => b + 1)}>Click</button>;
}
// Lần mount đầu: cả 3 effect đều chạy [1], [2], [3]
// Click button:   chỉ [1] và [3] chạy (stateB thay đổi)
```

---

## 3. Cleanup Function

### Tại sao cần cleanup?

Khi component bị unmount hoặc effect sắp chạy lại, ta cần **dọn dẹp** side effect cũ để tránh **memory leak** và **hành vi không mong muốn**.

`useEffect` cho phép return một **cleanup function**. Hàm này sẽ chạy:

- **Trước khi** effect chạy lại (nếu dependency thay đổi)
- **Khi** component unmount

```jsx
useEffect(() => {
  // Setup: đăng ký side effect
  console.log("Effect chạy");

  return () => {
    // Cleanup: dọn dẹp side effect cũ
    console.log("Cleanup chạy");
  };
}, [dependency]);
```

### Vòng đời cleanup

```
Mount:          Setup A chạy
Dep thay đổi:   Cleanup A chạy -> Setup B chạy
Dep thay đổi:   Cleanup B chạy -> Setup C chạy
Unmount:        Cleanup C chạy
```

### Ví dụ: Event Listener

```jsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Đăng ký event
    window.addEventListener("resize", handleResize);

    // Cleanup: hủy đăng ký khi unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Chỉ đăng ký 1 lần

  return (
    <p>
      {size.width} x {size.height}
    </p>
  );
}
```

> **Nếu không cleanup:** mỗi lần component mount lại, một listener MỚI được thêm vào mà listener CŨ vẫn còn. Sau 10 lần mount/unmount, có 10 listener chạy song song -- đó là memory leak.

---

## 4. Ví dụ thực tế

### 4.1 Fetch Data

```jsx
function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchPosts() {
      try {
        setLoading(true);
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!isCancelled) {
          setPosts(data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      isCancelled = true; // Ngăn setState sau khi unmount
    };
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 4.2 Event Listener - Keyboard Shortcut

```jsx
function KeyboardShortcut() {
  const [lastKey, setLastKey] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K mở search
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setLastKey("Ctrl+K");
        console.log("Mở thanh search!");
      }

      // Escape đóng modal
      if (e.key === "Escape") {
        setLastKey("Escape");
        console.log("Đóng modal!");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <p>Phím vừa nhấn: {lastKey || "Chưa nhấn phím nào"}</p>;
}
```

### 4.3 Timer - Countdown

```jsx
function Countdown({ seconds }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    // Reset khi props `seconds` thay đổi
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) return; // Không đặt interval nếu đã hết giờ

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup: xóa interval khi unmount hoặc timeLeft thay đổi
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return (
    <div>
      <h2>{timeLeft > 0 ? `Còn lại: ${timeLeft}s` : "Hết giờ!"}</h2>
    </div>
  );
}
```

### 4.4 Document Title

```jsx
function PageTitle({ title }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    // Khôi phục title cũ khi unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return <h1>{title}</h1>;
}

// Sử dụng:
// <PageTitle title="Trang chủ - MyApp" />
// <PageTitle title={`(${unreadCount}) Tin nhắn`} />
```

---

## 5. AbortController - Xử lý Race Condition

### Vấn đề Race Condition

Khi user chuyển nhanh giữa các trang (ví dụ: click user A, rồi ngay lập tức click user B), hai request được gửi đi. Nếu response của user A **về sau** response của user B, UI sẽ hiển thị **sai data** (hiện data user A trong khi đang xem user B).

```
Click User A -> Request A gửi đi ---------> Response A về (MUỘN) -> UI hiện A (SAI!)
Click User B -----> Request B gửi đi -> Response B về (SỚM) -> UI hiện B (đúng)
```

### Giải pháp: AbortController

`AbortController` là Web API cho phép **hủy** một fetch request đang chờ.

```jsx
function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/users/${userId}`, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setUser(data);
      } catch (err) {
        // AbortError xảy ra khi request bị hủy - KHÔNG phải lỗi thật
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // Cleanup: hủy request cũ khi userId thay đổi hoặc unmount
    return () => {
      controller.abort();
    };
  }, [userId]);

  if (loading) return <p>Đang tải user {userId}...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### So sánh boolean flag vs AbortController

| Tiêu chí                      | `isCancelled` flag              | `AbortController`                |
| ----------------------------- | ------------------------------- | -------------------------------- |
| Hủy request thực sự           | Không (request vẫn chạy ngầm)  | Có (request bị hủy thật sự)     |
| Tiết kiệm bandwidth           | Không                           | Có                               |
| Ngăn setState sau unmount     | Có                              | Có                               |
| Độ phức tạp                   | Thấp                            | Trung bình                       |
| Nên dùng khi                  | Case đơn giản                   | Production code, fetch lớn       |

> **Khuyến nghị:** Luôn dùng `AbortController` cho fetch trong production. Nó không chỉ ngăn race condition mà còn **hủy thật sự** network request, tiết kiệm tài nguyên.

---

## 6. Dependency Array Deep Dive

### React so sánh dependency bằng `Object.is()`

`Object.is()` hoạt động giống `===` ngoại trừ hai trường hợp đặc biệt:

```js
Object.is(NaN, NaN); // true  (khác với NaN === NaN -> false)
Object.is(+0, -0);   // false (khác với +0 === -0 -> true)
```

### Primitive types - So sánh theo giá trị

```jsx
function PrimitiveDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Phong");

  useEffect(() => {
    // count là number (primitive)
    // Chỉ chạy khi GIÁ TRỊ count thay đổi: 0 -> 1 -> 2
    console.log("Count thay đổi:", count);
  }, [count]);

  useEffect(() => {
    // name là string (primitive)
    // setName("Phong") KHÔNG trigger re-run vì giá trị không đổi
    console.log("Name thay đổi:", name);
  }, [name]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setName("Phong")}>Set cùng tên</button>
    </div>
  );
}
```

### Reference types - So sánh theo tham chiếu

Mỗi lần render, nếu object/array được tạo mới **inline**, nó sẽ có **reference khác** cho dù giá trị bên trong giống nhau. Điều này khiến effect chạy lại không cần thiết.

```jsx
// BAD: object tạo mới mỗi render -> effect chạy lại mỗi render
function BadExample() {
  const config = { theme: "dark", lang: "vi" }; // Reference mới mỗi render!

  useEffect(() => {
    console.log("Config thay đổi!"); // Chạy LẠI mỗi render
  }, [config]);

  return <div>Bad</div>;
}

// GOOD: Dùng useMemo để giữ reference ổn định
function GoodExample() {
  const config = useMemo(() => ({ theme: "dark", lang: "vi" }), []);

  useEffect(() => {
    console.log("Config thay đổi!"); // Chỉ chạy 1 lần
  }, [config]);

  return <div>Good</div>;
}

// GOOD: Đưa primitive values vào dependency thay vì object
function BetterExample({ theme, lang }) {
  useEffect(() => {
    console.log("Theme hoặc lang thay đổi");
  }, [theme, lang]); // Primitive values -> so sánh đúng

  return <div>Better</div>;
}
```

### Function trong dependency

```jsx
// BAD: function tạo mới mỗi render
function SearchComponent({ query }) {
  const fetchResults = () => {
    return fetch(`/api/search?q=${query}`);
  };

  useEffect(() => {
    fetchResults(); // fetchResults mới mỗi render -> effect loop
  }, [fetchResults]); // Reference mới mỗi render!
}

// GOOD: Dùng useCallback
function SearchComponent({ query }) {
  const fetchResults = useCallback(() => {
    return fetch(`/api/search?q=${query}`);
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]); // Chỉ thay đổi khi query thay đổi
}

// BETTER: Khai báo function TRONG useEffect
function SearchComponent({ query }) {
  useEffect(() => {
    const fetchResults = () => {
      return fetch(`/api/search?q=${query}`);
    };
    fetchResults();
  }, [query]); // Đơn giản, rõ ràng
}
```

---

## 7. useEffect vs useLayoutEffect

### Thời điểm thực thi

```
Render -> DOM update -> Browser Paint -> useEffect chạy
Render -> DOM update -> useLayoutEffect chạy -> Browser Paint
```

- `useEffect`: chạy **bất đồng bộ** sau khi browser đã paint. User thấy UI trước, effect chạy sau. **Dùng trong 99% trường hợp.**
- `useLayoutEffect`: chạy **đồng bộ** sau khi DOM update nhưng **trước khi** browser paint. Dùng khi cần đo lường hoặc thay đổi DOM mà không muốn user thấy "nhấp nháy" (flicker).

### Khi nào dùng useLayoutEffect?

```jsx
import { useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect: Đo kích thước element trước khi paint
function Tooltip({ targetRef, content }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // Đọc vị trí DOM TRƯỚC KHI browser paint
    // -> không có hiện tượng "nhảy" vị trí
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: targetRect.top - tooltipRect.height - 8,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    });
  }, [targetRef, content]);

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
      }}
    >
      {content}
    </div>
  );
}
```

```jsx
// useEffect: Fetch data - không cần chạy trước paint
function DataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Không cần block paint, user thấy loading state trước
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return data ? <div>{data.name}</div> : <p>Loading...</p>;
}
```

### Tóm tắt

| Tiêu chí               | useEffect            | useLayoutEffect         |
| ----------------------- | -------------------- | ----------------------- |
| Thời điểm chạy         | Sau paint            | Trước paint             |
| Blocking UI             | Không                | Có                      |
| Use case               | Fetch, subscription  | Đo DOM, chỉnh layout   |
| Performance            | Tốt hơn             | Có thể làm chậm UI     |
| Tần suất sử dụng       | 99%                  | 1%                      |

---

## 8. Common Mistakes

### 8.1 Infinite Loop - Vòng lặp vô hạn

```jsx
// BUG: setCount trong effect -> re-render -> effect chạy lại -> setCount -> ...
function InfiniteLoop() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // BOOM! Infinite loop
  }); // Không có dependency array = chạy mỗi render

  return <p>{count}</p>;
}

// BUG: Object trong dependency tạo reference mới mỗi render
function InfiniteLoop2() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((items) => setData(items)); // setData -> re-render -> effect chạy lại
  }, [data]); // data là array, reference mới mỗi render -> LOOP!

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// FIX: Bỏ data ra khỏi dependency, dùng [] vì chỉ cần fetch 1 lần
function Fixed() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((items) => setData(items));
  }, []); // Chỉ chạy 1 lần khi mount

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 8.2 Missing Dependencies - Quên khai báo dependency

```jsx
// BUG: Effect dùng `userId` nhưng không khai báo trong dependency
function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`/api/users/${userId}/posts`) // Dùng userId
      .then((res) => res.json())
      .then(setPosts);
  }, []); // THIẾU userId! -> userId thay đổi nhưng effect không re-run

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}

// FIX: Thêm userId vào dependency array
function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then((res) => res.json())
      .then(setPosts);
  }, [userId]); // Thêm userId vào dependency

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

> **Tip:** Bật ESLint rule `react-hooks/exhaustive-deps` để tự động phát hiện missing dependencies.

### 8.3 Stale Closures - Giá trị cũ bị "đóng băng"

```jsx
// BUG: count bị "đóng băng" tại giá trị 0 trong closure
function StaleCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log("Count hiện tại:", count); // Luôn in 0!
      setCount(count + 1); // Luôn set thành 1!
    }, 1000);

    return () => clearInterval(id);
  }, []); // count = 0 bị capture trong closure và không bao giờ cập nhật

  return <p>{count}</p>; // Hiển thị: 0 -> 1 -> 1 -> 1 -> 1 (bị kẹt)
}

// FIX 1: Dùng functional update (phổ biến nhất)
function FixedCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + 1); // Luôn dùng giá trị mới nhất
    }, 1000);

    return () => clearInterval(id);
  }, []); // An toàn vì không đọc count trực tiếp

  return <p>{count}</p>; // 0 -> 1 -> 2 -> 3 -> ...
}

// FIX 2: Dùng useRef để luôn có giá trị mới nhất
function FixedCounterRef() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count; // Cập nhật ref mỗi render

  useEffect(() => {
    const id = setInterval(() => {
      console.log("Count hiện tại:", countRef.current); // Luôn đúng
      setCount(countRef.current + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

### 8.4 Thao tác async không xử lý unmount

```jsx
// BUG: setState sau khi unmount -> React warning
function LeakyComponent({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Nếu component unmount trước khi fetch xong,
    // setData sẽ gọi trên component đã "chết"
    fetch(`/api/data/${id}`)
      .then((res) => res.json())
      .then((result) => setData(result));
  }, [id]);

  return <div>{data?.name}</div>;
}

// FIX: Dùng AbortController hoặc boolean flag
function SafeComponent({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/data/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [id]);

  return <div>{data?.name}</div>;
}
```

---

## 9. Best Practices

### 9.1 Mỗi effect phục vụ một mục đích duy nhất

```jsx
// BAD: Một effect làm nhiều việc không liên quan
function Dashboard() {
  useEffect(() => {
    // Việc 1: Cập nhật document title
    document.title = "Dashboard";

    // Việc 2: Đăng ký resize listener
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Việc 3: Fetch data
    fetch("/api/stats").then(/* ... */);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div>Dashboard</div>;
}

// GOOD: Tách riêng từng effect
function Dashboard() {
  // Effect 1: Document title
  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  // Effect 2: Resize listener
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect 3: Fetch data
  useEffect(() => {
    fetch("/api/stats").then(/* ... */);
  }, []);

  return <div>Dashboard</div>;
}
```

> **Lý do:** Tách riêng giúp mỗi effect có **dependency array riêng**, dễ kiểm soát khi nào chạy lại, dễ debug, và dễ extract thành custom hook.

### 9.2 Extract Custom Hooks

Khi một pattern lặp lại nhiều lần, hãy tách thành custom hook:

```jsx
// Custom hook: useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Sử dụng - sạch và gọn
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <h1>{user.name}</h1>;
}
```

```jsx
// Custom hook: useWindowSize
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Sử dụng
function ResponsiveLayout() {
  const { width } = useWindowSize();
  return width > 768 ? <DesktopLayout /> : <MobileLayout />;
}
```

```jsx
// Custom hook: useDocumentTitle
function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

// Sử dụng
function ChatPage({ unreadCount }) {
  useDocumentTitle(unreadCount > 0 ? `(${unreadCount}) Chat` : "Chat");
  return <div>...</div>;
}
```

### 9.3 Những thứ KHÔNG nên dùng useEffect

```jsx
// KHÔNG NÊN: Tính toán derived state trong useEffect
function Bad({ items }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);
  // Gây thêm 1 re-render không cần thiết!
}

// NÊN: Tính trực tiếp trong render
function Good({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  // Hoặc dùng useMemo nếu tính toán nặng:
  // const total = useMemo(() => items.reduce(...), [items]);
  return <p>Tổng: {total}</p>;
}

// KHÔNG NÊN: Xử lý event trong useEffect
function Bad2() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Không nên: "phản ứng" lại với state thay đổi
  useEffect(() => {
    fetch(`/api/search?q=${query}`).then(/* ... */);
  }, [query]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}

// NÊN: Gọi trực tiếp trong event handler (nếu logic đơn giản)
function Good2() {
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    const res = await fetch(`/api/search?q=${query}`);
    setResults(await res.json());
  };

  return <input onChange={handleSearch} />;
}
```

---

## 10. Bài tập

### Bài 1: useDebounce Hook (Cơ bản)

Viết custom hook `useDebounce(value, delay)` trả về giá trị debounced. Khi `value` thay đổi, giá trị debounced chỉ cập nhật **sau `delay` ms** nếu không có thay đổi mới.

```jsx
// Gợi ý sử dụng:
function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // Fetch chỉ chạy sau 500ms user ngừng gõ
      fetch(`/api/search?q=${debouncedQuery}`);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

<details>
<summary>Gợi ý</summary>

Dùng `useEffect` với `setTimeout` bên trong. Cleanup function sẽ `clearTimeout`. Dependency là `value` và `delay`.

</details>

### Bài 2: useOnlineStatus Hook (Trung bình)

Viết custom hook `useOnlineStatus()` theo dõi trạng thái online/offline của user bằng `navigator.onLine` và event `online`/`offline`.

```jsx
// Kết quả mong đợi:
function App() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {isOnline ? "Đang kết nối mạng" : "Mất kết nối - Chế độ offline"}
    </div>
  );
}
```

<details>
<summary>Gợi ý</summary>

Dùng `useState(navigator.onLine)` làm giá trị ban đầu. Trong `useEffect`, lắng nghe event `online` và `offline` trên `window`. Cleanup bằng `removeEventListener`.

</details>

### Bài 3: useFetch với Retry (Nâng cao)

Mở rộng custom hook `useFetch` với khả năng **tự động retry** khi gặp lỗi. Hỗ trợ:

- `maxRetries`: số lần retry tối đa (mặc định 3)
- `retryDelay`: thời gian chờ giữa các lần retry (mặc định 1000ms)
- Hàm `retry()` để user có thể retry thủ công

```jsx
// Kết quả mong đợi:
function App() {
  const { data, error, loading, retry } = useFetch("/api/data", {
    maxRetries: 3,
    retryDelay: 1000,
  });

  if (error) {
    return (
      <div>
        <p>Lỗi: {error}</p>
        <button onClick={retry}>Thử lại</button>
      </div>
    );
  }

  return <div>{JSON.stringify(data)}</div>;
}
```

<details>
<summary>Gợi ý</summary>

Dùng `useRef` để theo dõi số lần retry hiện tại. Trong `useEffect`, nếu fetch thất bại và chưa vượt quá `maxRetries`, dùng `setTimeout` để gọi lại sau `retryDelay`. Cleanup phải `clearTimeout` và `abort` request. Hàm `retry()` reset retry count và tăng một state trigger để force re-run effect.

</details>

### Bài 4: useLocalStorage Hook (Trung bình)

Viết custom hook `useLocalStorage(key, initialValue)` hoạt động giống `useState` nhưng đồng bộ giá trị với `localStorage`. Bonus: đồng bộ giữa nhiều tab bằng event `storage`.

```jsx
// Kết quả mong đợi:
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Theme hiện tại: {theme}
    </button>
    // Giá trị "theme" được lưu vào localStorage
    // Reload trang vẫn giữ nguyên giá trị
    // Thay đổi ở tab khác cũng cập nhật
  );
}
```

<details>
<summary>Gợi ý</summary>

Khởi tạo state bằng cách đọc từ `localStorage` (bọc trong `try/catch` phòng JSON parse lỗi). Dùng `useEffect` để ghi vào `localStorage` mỗi khi state thay đổi. Thêm một `useEffect` khác để lắng nghe event `storage` trên `window` nhằm đồng bộ giữa các tab.

</details>

---

## Tổng kết

| Khái niệm                 | Ghi nhớ                                               |
| -------------------------- | ------------------------------------------------------ |
| `useEffect(() => {})`      | Chạy sau MỖI render - hiếm khi dùng                   |
| `useEffect(() => {}, [])`  | Chạy 1 lần khi mount                                  |
| `useEffect(() => {}, [a])` | Chạy khi `a` thay đổi                                 |
| Cleanup function           | Return function để dọn dẹp: listener, timer, request   |
| AbortController            | Hủy fetch request - chống race condition               |
| Primitive dep              | So sánh theo giá trị - an toàn                         |
| Reference dep              | So sánh theo reference - cần useMemo/useCallback       |
| useLayoutEffect            | Chạy trước paint - đo DOM, fix flicker                 |
| 1 effect = 1 concern       | Tách riêng effect, dễ debug và tái sử dụng             |
| Custom hooks               | Extract logic lặp lại thành hook để dùng chung         |
