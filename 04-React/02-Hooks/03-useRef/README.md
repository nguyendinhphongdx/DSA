# useRef Hook

## 1. Khái niệm useRef

`useRef` là một React Hook trả về một **mutable ref object** có property `.current`. Giá trị này **tồn tại xuyên suốt các lần re-render** mà KHÔNG gây re-render khi thay đổi.

```jsx
import { useRef } from "react";

function MyComponent() {
  const myRef = useRef(initialValue);
  // myRef = { current: initialValue }

  console.log(myRef.current); // đọc giá trị
  myRef.current = newValue;   // ghi giá trị — KHÔNG gây re-render
}
```

### 1.1 Ref object là gì?

`useRef(initialValue)` trả về một plain JavaScript object có đúng 1 property:

```jsx
// Bản chất useRef tạo ra object như này:
{ current: initialValue }
```

- `initialValue` chỉ được dùng **lần render đầu tiên**. Các lần render sau, React bỏ qua argument này.
- Object này **persistent** -- cùng một object reference qua mọi lần render (khác với biến local bị tạo lại mỗi render).
- Thay đổi `.current` **KHÔNG trigger re-render** (đây là khác biệt lớn nhất so với `useState`).

### 1.2 Mental model

Hãy nghĩ `useRef` như một **chiếc hộp** mà bạn có thể bỏ bất cứ thứ gì vào. React giữ chiếc hộp đó cho bạn qua mọi lần render, nhưng React **không quan tâm** bên trong hộp có gì -- React không theo dõi, không so sánh, không re-render khi nội dung thay đổi.

```
Render 1:  myRef ──► { current: 0 }
                          │
                          ▼ (mutate trực tiếp)
Render 2:  myRef ──► { current: 5 }   ← cùng object, React không biết đã thay đổi
                          │
                          ▼
Render 3:  myRef ──► { current: 42 }  ← vẫn cùng object đó
```

---

## 2. Hai công dụng chính

### 2.1 Tham chiếu DOM elements

Đây là use case phổ biến nhất. Bạn gắn ref vào JSX element, React sẽ tự gán DOM node vào `.current` sau khi mount.

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const handleClick = () => {
    // inputRef.current bây giờ là DOM element <input>
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" placeholder="Nhập gì đó..." />
      <button onClick={handleClick}>Focus vào input</button>
    </>
  );
}
```

**Lifecycle của DOM ref:**

| Giai đoạn | `inputRef.current` |
|---|---|
| Trước khi mount (render đầu tiên) | `null` |
| Sau khi mount | DOM element `<input>` |
| Khi unmount | `null` (React tự cleanup) |

**Các thao tác DOM phổ biến:**

```jsx
// Focus
inputRef.current.focus();
inputRef.current.blur();

// Scroll
elementRef.current.scrollIntoView({ behavior: "smooth" });
elementRef.current.scrollTop = elementRef.current.scrollHeight;

// Đo kích thước
const { width, height } = elementRef.current.getBoundingClientRect();

// Media
videoRef.current.play();
videoRef.current.pause();

// Selection
inputRef.current.select();
inputRef.current.setSelectionRange(0, 5);
```

### 2.2 Lưu trữ mutable values (không trigger re-render)

Đây là use case ít người biết nhưng **cực kỳ hữu ích**. Bạn dùng `useRef` để lưu bất cứ giá trị nào cần tồn tại qua các render mà KHÔNG muốn gây re-render.

```jsx
function StopWatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null); // lưu interval ID

  const start = () => {
    if (intervalRef.current) return; // đã chạy rồi
    intervalRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p>Time: {time}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

**Tại sao không dùng biến `let` thường?**

```jsx
function StopWatch() {
  // ❌ SAI: biến local bị reset mỗi lần render
  let intervalId = null;

  const start = () => {
    intervalId = setInterval(() => { /* ... */ }, 1000);
    // Khi component re-render, intervalId bị reset thành null
    // => không thể clearInterval được nữa => MEMORY LEAK!
  };
}
```

```jsx
// ❌ SAI: biến ngoài component bị chia sẻ giữa các instances
let intervalId = null;

function StopWatch() {
  // Nếu render 2 StopWatch, chúng chia sẻ cùng intervalId
  // => conflict!
}
```

```jsx
// ✅ ĐÚNG: useRef tạo giá trị riêng cho mỗi instance, persistent qua render
function StopWatch() {
  const intervalRef = useRef(null);
  // Mỗi StopWatch có intervalRef riêng
  // Giá trị tồn tại qua mọi lần re-render
}
```

---

## 3. useRef vs useState

| Đặc điểm | `useState` | `useRef` |
|---|---|---|
| Trigger re-render khi thay đổi | Co | Khong |
| Giá trị mới có ngay | Không (sau lần render tiếp) | Co (synchronous) |
| Cách cập nhật | `setState(newValue)` | `ref.current = newValue` |
| Immutable/Mutable | Immutable (replace) | Mutable (mutate trực tiếp) |
| Dùng để hiển thị UI | Co | Khong |
| Dùng cho side effects | Ít khi | Thuong xuyen |
| Snapshot behavior | Co (closure captures) | Khong (luon la gia tri moi nhat) |

### 3.1 Khi nào dùng useState?

Khi giá trị đó **ảnh hưởng trực tiếp đến UI** (cần re-render để hiển thị thay đổi):

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  // count thay đổi => re-render => UI cập nhật
  return <p>{count}</p>;
}
```

### 3.2 Khi nào dùng useRef?

Khi giá trị đó **KHÔNG ảnh hưởng đến UI** hoặc bạn cần tham chiếu DOM:

```jsx
function Form() {
  const renderCount = useRef(0);

  // Đếm số lần render (không cần hiển thị, chỉ để debug)
  renderCount.current += 1;
  console.log(`Rendered ${renderCount.current} times`);

  // ...
}
```

### 3.3 Ví dụ so sánh trực quan

```jsx
function CompareDemo() {
  const [stateValue, setStateValue] = useState(0);
  const refValue = useRef(0);

  const handleClickState = () => {
    setStateValue(stateValue + 1);
    // Component re-render, UI hiển thị giá trị mới
  };

  const handleClickRef = () => {
    refValue.current += 1;
    console.log("refValue:", refValue.current);
    // Component KHÔNG re-render, UI KHÔNG thay đổi
    // Nhưng giá trị đã thay đổi trong memory
  };

  return (
    <div>
      <p>State: {stateValue}</p>
      {/* Giá trị hiển thị dưới đây sẽ KHÔNG tự cập nhật */}
      <p>Ref: {refValue.current}</p>
      <button onClick={handleClickState}>Increment State</button>
      <button onClick={handleClickRef}>Increment Ref</button>
    </div>
  );
}
```

> **Quan sát:** Bấm "Increment Ref" nhiều lần, con số trên UI không đổi. Nhưng khi bấm "Increment State" (gây re-render), giá trị ref hiển thị sẽ nhảy lên đúng số lần đã bấm trước đó.

---

## 4. Ví dụ thực tế

### 4.1 Auto-focus input khi mount

```jsx
function SearchBar() {
  const searchRef = useRef(null);

  useEffect(() => {
    // Chạy 1 lần sau mount => focus vào input
    searchRef.current.focus();
  }, []);

  return (
    <div className="search-bar">
      <input
        ref={searchRef}
        type="text"
        placeholder="Tìm kiếm..."
      />
    </div>
  );
}
```

> **Tip:** React 19 cung cấp `autoFocus` prop cho input, nhưng `useRef` cho phép kiểm soát chính xác hơn (ví dụ: focus có điều kiện, focus sau khi fetch data xong).

### 4.2 Track previous state value

React không có built-in cách lấy giá trị state trước đó. `useRef` giải quyết hoàn hảo:

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]); // Chạy SAU mỗi render khi value thay đổi

  return ref.current; // Trả về giá trị CŨ (trước khi useEffect chạy)
}

// Sử dụng:
function PriceTracker({ price }) {
  const prevPrice = usePrevious(price);

  return (
    <div>
      <p>Giá hiện tại: {price}đ</p>
      <p>Giá trước đó: {prevPrice}đ</p>
      {prevPrice !== undefined && (
        <p style={{ color: price > prevPrice ? "green" : "red" }}>
          {price > prevPrice ? "Tăng" : "Giảm"}{" "}
          {Math.abs(price - prevPrice)}đ
        </p>
      )}
    </div>
  );
}
```

**Flow hoạt động:**

```
Render 1: price = 100
  - ref.current = undefined (chưa có giá trị cũ)
  - prevPrice = undefined
  - Sau render: useEffect chạy => ref.current = 100

Render 2: price = 150
  - ref.current vẫn = 100 (chưa chạy useEffect)
  - prevPrice = 100 ✅
  - Sau render: useEffect chạy => ref.current = 150

Render 3: price = 120
  - ref.current vẫn = 150
  - prevPrice = 150 ✅
  - Sau render: useEffect chạy => ref.current = 120
```

### 4.3 Debounce với timer ref

Debounce: chỉ thực thi sau khi user ngừng action một khoảng thời gian.

```jsx
function SearchWithDebounce() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear timer cũ mỗi lần user gõ
    clearTimeout(timerRef.current);

    // Đặt timer mới: chỉ search sau 500ms ngừng gõ
    timerRef.current = setTimeout(() => {
      fetchSearchResults(value).then(setResults);
    }, 500);
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Tìm kiếm sản phẩm..."
      />
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Tại sao dùng `useRef` cho timerRef thay vì `useState`?**

1. Thay đổi timer ID **không cần re-render** (user không thấy timer ID trên UI).
2. `useState` sẽ gây re-render thừa mỗi lần user gõ (vì `setTimerId` trigger render).
3. Cần giá trị **mới nhất** ngay lập tức để `clearTimeout` -- `useState` trả về giá trị cũ trong cùng render cycle.

### 4.4 Throttle với ref

Throttle: thực thi tối đa 1 lần mỗi khoảng thời gian.

```jsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const lastExecutionRef = useRef(0);
  const THROTTLE_MS = 200;

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastExecutionRef.current >= THROTTLE_MS) {
        lastExecutionRef.current = now;
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="scroll-indicator">
      Scroll position: {scrollY}px
    </div>
  );
}
```

### 4.5 Lưu interval ID cho cleanup

```jsx
function PollingComponent({ url, intervalMs = 5000 }) {
  const [data, setData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);

  const startPolling = () => {
    if (intervalRef.current) return; // đang poll rồi

    setIsPolling(true);

    // Fetch ngay lập tức lần đầu
    fetchData();

    // Rồi fetch định kỳ
    intervalRef.current = setInterval(fetchData, intervalMs);
  };

  const stopPolling = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPolling(false);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Polling error:", error);
      stopPolling(); // Dừng poll nếu lỗi
    }
  };

  // Cleanup khi unmount hoặc url thay đổi
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <button onClick={isPolling ? stopPolling : startPolling}>
        {isPolling ? "Stop Polling" : "Start Polling"}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### 4.6 Scroll to bottom (Chat app)

```jsx
function ChatWindow({ messages }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Detect: user đang scroll lên đọc tin cũ => tắt auto-scroll
  const handleScroll = () => {
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: "400px", overflowY: "auto" }}
    >
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          <strong>{msg.sender}:</strong> {msg.text}
        </div>
      ))}

      {/* Element "ảo" ở cuối để scroll tới */}
      <div ref={bottomRef} />

      {!autoScroll && (
        <button
          className="scroll-to-bottom"
          onClick={() => {
            setAutoScroll(true);
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Tin nhắn mới
        </button>
      )}
    </div>
  );
}
```

### 4.7 Video player controls

```jsx
function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  const changeSpeed = (rate) => {
    videoRef.current.playbackRate = rate;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="controls">
        <button onClick={() => skip(-10)}>-10s</button>
        <button onClick={togglePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={() => skip(10)}>+10s</button>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          step={0.1}
        />

        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <select onChange={(e) => changeSpeed(parseFloat(e.target.value))}>
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        <button onClick={toggleFullscreen}>Fullscreen</button>
      </div>
    </div>
  );
}
```

### 4.8 Đo kích thước element (ResizeObserver)

```jsx
function ResponsiveBox() {
  const boxRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });

    if (boxRef.current) {
      observer.observe(boxRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        resize: "both",
        overflow: "auto",
        border: "2px solid #333",
        padding: "20px",
        minWidth: "100px",
        minHeight: "100px",
      }}
    >
      <p>Kéo góc phải dưới để resize</p>
      <p>
        Width: {dimensions.width}px | Height: {dimensions.height}px
      </p>
    </div>
  );
}
```

### 4.9 Track mount status (tránh setState sau unmount)

```jsx
function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

// Sử dụng:
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    fetchUser(userId).then((data) => {
      // Chỉ setState nếu component vẫn còn mounted
      if (isMounted.current) {
        setUser(data);
      }
    });
  }, [userId]);

  return user ? <div>{user.name}</div> : <p>Loading...</p>;
}
```

> **Lưu ý:** Trong React 18+ với Strict Mode, pattern này ít cần thiết hơn vì React đã có cơ chế cleanup tốt hơn. Tuy nhiên, nó vẫn hữu ích trong một số edge case.

---

## 5. forwardRef -- Truyền ref đến child component

Mặc định, React **KHÔNG cho phép** truyền `ref` như một prop bình thường vào function component. Bạn cần `forwardRef` để "chuyển tiếp" ref vào bên trong.

### 5.1 Vấn đề

```jsx
// ❌ KHÔNG HOẠT ĐỘNG: ref không được truyền vào child
function CustomInput(props) {
  return <input className="custom-input" {...props} />;
}

function Form() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // ❌ Error! inputRef.current = null
  }, []);

  return <CustomInput ref={inputRef} />;
  // React cảnh báo: Function components cannot be given refs
}
```

### 5.2 Giải pháp với forwardRef

```jsx
import { forwardRef, useRef, useEffect } from "react";

// forwardRef wraps component, cung cấp tham số ref thứ 2
const CustomInput = forwardRef(function CustomInput(props, ref) {
  return (
    <input
      ref={ref}
      className="custom-input"
      {...props}
    />
  );
});

function Form() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // ✅ Hoạt động!
  }, []);

  return <CustomInput ref={inputRef} placeholder="Nhập tên..." />;
}
```

### 5.3 React 19: ref là prop bình thường

Kể từ React 19, `ref` có thể truyền như prop bình thường mà KHÔNG cần `forwardRef`:

```jsx
// React 19+: không cần forwardRef nữa!
function CustomInput({ ref, ...props }) {
  return <input ref={ref} className="custom-input" {...props} />;
}

function Form() {
  const inputRef = useRef(null);

  return <CustomInput ref={inputRef} placeholder="Nhập tên..." />;
  // ✅ Hoạt động trực tiếp trong React 19
}
```

> `forwardRef` sẽ bị deprecated trong tương lai, nhưng hiện tại vẫn hoạt động để backward compatible.

### 5.4 Ví dụ thực tế: Reusable component library

```jsx
const Button = forwardRef(function Button({ children, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
});

const TextArea = forwardRef(function TextArea({ label, ...props }, ref) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <textarea ref={ref} className="form-textarea" {...props} />
    </div>
  );
});

// Sử dụng:
function CommentForm() {
  const textareaRef = useRef(null);
  const submitBtnRef = useRef(null);

  const handleKeyDown = (e) => {
    // Ctrl+Enter => focus vào nút Submit
    if (e.ctrlKey && e.key === "Enter") {
      submitBtnRef.current.focus();
    }
  };

  return (
    <form>
      <TextArea
        ref={textareaRef}
        label="Bình luận"
        onKeyDown={handleKeyDown}
        rows={4}
      />
      <Button ref={submitBtnRef} type="submit">
        Gửi bình luận
      </Button>
    </form>
  );
}
```

---

## 6. useImperativeHandle -- Tùy chỉnh ref API

`useImperativeHandle` cho phép bạn **kiểm soát chính xác** những gì parent component có thể truy cập qua ref, thay vì expose toàn bộ DOM node.

### 6.1 Cú pháp

```jsx
useImperativeHandle(ref, createHandle, [dependencies]);
```

### 6.2 Tại sao cần?

Khi bạn `forwardRef` một component, parent có quyền truy cập **toàn bộ DOM node** -- có thể gọi bất kỳ method nào (`remove()`, `innerHTML = "..."`, ...). Điều này **phá vỡ encapsulation**.

`useImperativeHandle` cho phép bạn expose một **custom API** thay vì DOM node thô.

### 6.3 Ví dụ cơ bản

```jsx
import { forwardRef, useImperativeHandle, useRef } from "react";

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  // Chỉ expose 2 methods cho parent, KHÔNG expose DOM node
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
      inputRef.current.focus();
    },
    // Parent KHÔNG THỂ gọi inputRef.current.remove()
    // Parent KHÔNG THỂ truy cập inputRef.current.style
    // => Encapsulation tốt hơn!
  }));

  return <input ref={inputRef} {...props} className="fancy-input" />;
});

// Parent component:
function Form() {
  const fancyRef = useRef(null);

  return (
    <div>
      <FancyInput ref={fancyRef} placeholder="Nhập email..." />
      <button onClick={() => fancyRef.current.focus()}>Focus</button>
      <button onClick={() => fancyRef.current.clear()}>Clear</button>
    </div>
  );
}
```

### 6.4 Ví dụ nang cao: Modal component

```jsx
const Modal = forwardRef(function Modal({ title, children }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open() {
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
    toggle() {
      setIsOpen((prev) => !prev);
    },
    get isOpen() {
      return isOpen;
    },
  }), [isOpen]); // dependency vì dùng isOpen trong getter

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div
        ref={dialogRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={() => setIsOpen(false)}>X</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});

// Sử dụng:
function App() {
  const modalRef = useRef(null);

  return (
    <div>
      <button onClick={() => modalRef.current.open()}>
        Mở Modal
      </button>

      <Modal ref={modalRef} title="Xác nhận">
        <p>Bạn có chắc chắn muốn xóa?</p>
        <button onClick={() => modalRef.current.close()}>
          Hủy
        </button>
        <button onClick={() => {
          handleDelete();
          modalRef.current.close();
        }}>
          Xóa
        </button>
      </Modal>
    </div>
  );
}
```

### 6.5 Ví dụ nang cao: Form component với validate

```jsx
const FormField = forwardRef(function FormField(
  { label, type = "text", validate, ...props },
  ref
) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    getValue() {
      return inputRef.current.value;
    },
    setValue(val) {
      inputRef.current.value = val;
      setError("");
    },
    focus() {
      inputRef.current.focus();
    },
    validate() {
      const value = inputRef.current.value;
      if (validate) {
        const errorMsg = validate(value);
        setError(errorMsg || "");
        return !errorMsg;
      }
      return true;
    },
    reset() {
      inputRef.current.value = "";
      setError("");
    },
  }));

  return (
    <div className="form-field">
      <label>{label}</label>
      <input ref={inputRef} type={type} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

// Sử dụng:
function RegistrationForm() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate tất cả fields
    const isNameValid = nameRef.current.validate();
    const isEmailValid = emailRef.current.validate();
    const isPasswordValid = passwordRef.current.validate();

    if (isNameValid && isEmailValid && isPasswordValid) {
      const data = {
        name: nameRef.current.getValue(),
        email: emailRef.current.getValue(),
        password: passwordRef.current.getValue(),
      };
      console.log("Submit:", data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        ref={nameRef}
        label="Tên"
        validate={(v) => (!v ? "Bắt buộc nhập tên" : null)}
      />
      <FormField
        ref={emailRef}
        label="Email"
        type="email"
        validate={(v) => {
          if (!v) return "Bắt buộc nhập email";
          if (!v.includes("@")) return "Email không hợp lệ";
          return null;
        }}
      />
      <FormField
        ref={passwordRef}
        label="Mật khẩu"
        type="password"
        validate={(v) => {
          if (!v) return "Bắt buộc nhập mật khẩu";
          if (v.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
          return null;
        }}
      />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
```

---

## 7. Callback Refs -- Pattern nang cao

Thay vì truyền một ref object, bạn có thể truyền một **function** vào prop `ref`. React sẽ gọi function đó với DOM node khi mount và `null` khi unmount.

```jsx
function MeasureExample() {
  const [height, setHeight] = useState(0);

  // Callback ref: được gọi khi DOM node mount/unmount
  const measuredRef = (node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  };

  return (
    <div>
      <h1 ref={measuredRef}>Hello, World</h1>
      <p>Chiều cao của heading: {height}px</p>
    </div>
  );
}
```

### 7.1 Tại sao dùng callback ref?

- **Khi element xuất hiện có điều kiện:** `useRef` + `useEffect` không biết khi nào element thực sự mount. Callback ref được gọi **đúng lúc** element được gắn vào DOM.
- **Khi cần setup/cleanup ngay tại thời điểm mount/unmount.**

```jsx
function ConditionalInput({ showInput }) {
  // ❌ Không lý tưởng: useEffect chạy sau render, ref có thể null
  const inputRef = useRef(null);
  useEffect(() => {
    if (showInput) {
      inputRef.current?.focus(); // có thể null nếu timing sai
    }
  }, [showInput]);

  // ✅ Callback ref: được gọi chính xác khi element mount
  const callbackRef = (node) => {
    if (node) {
      node.focus(); // node chắc chắn tồn tại
    }
  };

  return (
    <div>
      {showInput && <input ref={callbackRef} />}
    </div>
  );
}
```

### 7.2 Kết hợp callback ref với useRef

```jsx
function CombinedExample() {
  const nodeRef = useRef(null);

  const setRef = (node) => {
    // Lưu reference vào useRef
    nodeRef.current = node;

    // Thực hiện side effect ngay khi mount
    if (node) {
      node.style.border = "2px solid blue";
      console.log("Element mounted:", node.tagName);
    } else {
      console.log("Element unmounted");
    }
  };

  return <div ref={setRef}>Hello</div>;
}
```

---

## 8. Lỗi thường gặp

### 8.1 Đọc/ghi ref.current trong quá trình render

```jsx
function Bad() {
  const countRef = useRef(0);

  // ❌ SAI: Đọc/ghi ref trong render phase
  countRef.current += 1;
  return <p>Renders: {countRef.current}</p>;
}
```

**Vấn đề:** React có thể gọi render function nhiều lần (Strict Mode gọi 2 lần, Concurrent Mode có thể gọi rồi bỏ). Đọc/ghi ref trong render dẫn đến kết quả **không dự đoán được**.

```jsx
function Good() {
  const countRef = useRef(0);

  // ✅ ĐÚNG: Đọc/ghi ref trong event handler hoặc useEffect
  useEffect(() => {
    countRef.current += 1;
    console.log(`Rendered ${countRef.current} times`);
  });

  return <p>Check console for render count</p>;
}
```

> **Quy tắc:** Chỉ đọc/ghi `ref.current` trong **event handlers**, **useEffect**, hoặc **useLayoutEffect** -- KHÔNG trong render body.

> **Ngoại lệ:** Lazy initialization pattern (ghi 1 lần duy nhất) là OK:

```jsx
function LazyInit() {
  const cacheRef = useRef(null);

  // ✅ OK: chỉ ghi 1 lần (idempotent)
  if (cacheRef.current === null) {
    cacheRef.current = createExpensiveObject();
  }

  return <div>{/* ... */}</div>;
}
```

### 8.2 Mong đợi re-render khi thay đổi ref

```jsx
function Mistake() {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1;
    // ❌ UI sẽ KHÔNG cập nhật vì ref thay đổi không gây re-render
  };

  return (
    <div>
      <p>Count: {countRef.current}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

**Fix:** Nếu cần UI cập nhật, dùng `useState` thay vì `useRef`:

```jsx
function Fixed() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount((c) => c + 1); // ✅ Trigger re-render
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

### 8.3 Quên cleanup timer/interval

```jsx
function LeakyComponent() {
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log("tick");
    }, 1000);

    // ❌ QUÊN return cleanup function
    // => Interval chạy mãi kể cả sau khi unmount => MEMORY LEAK
  }, []);
}
```

```jsx
function CleanComponent() {
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log("tick");
    }, 1000);

    // ✅ Cleanup khi unmount
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
}
```

### 8.4 Truy cập ref.current quá sớm

```jsx
function TooEarly() {
  const divRef = useRef(null);

  // ❌ Chạy trong render, DOM chưa mount
  console.log(divRef.current); // null!
  console.log(divRef.current.offsetHeight); // ❌ TypeError!

  return <div ref={divRef}>Hello</div>;
}
```

```jsx
function Correct() {
  const divRef = useRef(null);

  // ✅ useEffect chạy SAU render, DOM đã mount
  useEffect(() => {
    console.log(divRef.current); // <div>Hello</div>
    console.log(divRef.current.offsetHeight); // 20
  }, []);

  return <div ref={divRef}>Hello</div>;
}
```

### 8.5 Dùng ref thay cho state khi cần render

```jsx
// ❌ Anti-pattern: dùng ref + forceUpdate thay cho state
function AntiPattern() {
  const dataRef = useRef([]);
  const [, forceUpdate] = useState(0);

  const addItem = (item) => {
    dataRef.current.push(item);
    forceUpdate((n) => n + 1); // hack để force re-render
  };

  // Dùng useState cho data cần render
}
```

```jsx
// ✅ Dùng useState đúng cách
function Correct() {
  const [data, setData] = useState([]);

  const addItem = (item) => {
    setData((prev) => [...prev, item]);
  };

  return (
    <ul>
      {data.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
```

---

## 9. Tổng kết quy tắc sử dụng useRef

```
Cần hiển thị trên UI?
├── CÓ  → useState
└── KHÔNG
    ├── Cần tham chiếu DOM element?
    │   └── CÓ  → useRef + gắn vào JSX ref prop
    └── Cần lưu giá trị qua các render?
        ├── Timer ID, interval ID → useRef
        ├── Previous value → useRef (custom hook)
        ├── Flag (isMounted, isFirstRender) → useRef
        ├── External library instance → useRef
        └── Accumulated value không cần render → useRef
```

**Checklist khi dùng useRef:**

1. KHÔNG đọc/ghi `ref.current` trong render body (trừ lazy init).
2. KHÔNG mong đợi re-render khi thay đổi `ref.current`.
3. LUON cleanup timers/intervals trong `useEffect` return.
4. Dùng `forwardRef` (hoặc ref prop trong React 19) khi cần truyền ref vào child.
5. Dùng `useImperativeHandle` để giới hạn API mà parent truy cập được.
6. Ưu tiên `useState` khi giá trị cần hiển thị trên UI.

---

## 10. Bài tập

### Bài 1: Stopwatch (Co ban)

Xây dựng component `Stopwatch` với các yêu cầu:

- Hiển thị thời gian dạng `MM:SS:ms` (phút:giây:mili giây).
- 3 nút: **Start**, **Stop**, **Reset**.
- Dùng `useRef` để lưu `setInterval` ID.
- Dùng `useState` cho thời gian hiển thị.
- Cleanup interval khi unmount.

```jsx
// Gợi ý cấu trúc:
function Stopwatch() {
  const [time, setTime] = useState(0); // milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // TODO: Implement start, stop, reset
  // TODO: Format time to MM:SS:ms
  // TODO: Cleanup on unmount
}
```

---

### Bài 2: Click Outside to Close (Trung binh)

Xây dựng component `Dropdown` tự đóng khi click bên ngoài:

- Nút toggle để mở/đóng dropdown menu.
- Click bất kỳ đâu bên ngoài dropdown => đóng.
- Dùng `useRef` để tham chiếu dropdown container.
- Dùng `useEffect` để add/remove event listener trên `document`.

```jsx
// Gợi ý:
function Dropdown({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // TODO: Kiểm tra click có nằm ngoài dropdownRef không
    };

    // TODO: Add event listener
    // TODO: Return cleanup function
  }, [isOpen]);

  // TODO: Render dropdown UI
}
```

---

### Bài 3: Auto-resize Textarea (Trung binh)

Xây dựng `AutoResizeTextarea` tự điều chỉnh chiều cao theo nội dung:

- Textarea tự cao lên khi user gõ nhiều dòng.
- Thu nhỏ lại khi xóa text.
- Có min-height và max-height.
- Dùng `useRef` để truy cập DOM node và đo `scrollHeight`.

```jsx
// Gợi ý:
function AutoResizeTextarea({ minRows = 2, maxRows = 10, ...props }) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    // TODO: Reset height to auto
    // TODO: Set height to scrollHeight
    // TODO: Clamp between min and max
  };

  // TODO: Adjust on mount and on change
}
```

---

### Bài 4: Infinite Scroll (Nang cao)

Xây dựng danh sách với infinite scroll dùng `IntersectionObserver`:

- Hiển thị danh sách items, mỗi lần load 20 items.
- Khi scroll gần cuối danh sách, tự động load thêm.
- Dùng `useRef` cho observer instance và sentinel element.
- Hiển thị loading indicator khi đang fetch.

```jsx
// Gợi ý:
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // TODO: Setup IntersectionObserver
  // TODO: Observe sentinel element
  // TODO: Fetch data when sentinel is visible
  // TODO: Cleanup observer
}
```

---

### Bài 5: Drawing Canvas (Nang cao)

Xây dựng ứng dụng vẽ đơn giản trên canvas:

- Dùng `useRef` tham chiếu `<canvas>` element.
- Cho phép vẽ tự do bằng chuột (mousedown + mousemove).
- Chọn màu và kích thước bút.
- Nút Clear để xóa canvas.
- Nút Undo để hoàn tác nét vẽ cuối (lưu history trong ref).

```jsx
// Gợi ý:
function DrawingCanvas({ width = 800, height = 600 }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef([]); // lưu ImageData cho undo
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);

  // TODO: Get 2D context from canvas
  // TODO: Handle mouse events (down, move, up, leave)
  // TODO: Save snapshot before each stroke for undo
  // TODO: Implement clear and undo
}
```

---

### Bài 6: useImperativeHandle Form (Nang cao)

Xây dựng `MultiStepForm` với các bước (steps), mỗi step là component riêng expose validate API:

- Tạo `FormStep` component dùng `forwardRef` + `useImperativeHandle`.
- Mỗi step expose: `validate()`, `getData()`, `reset()`.
- Parent component gọi `stepRef.current.validate()` trước khi chuyển step.
- Hiển thị progress bar và nút Next/Back.

```jsx
// Gợi ý:
const PersonalInfoStep = forwardRef(function PersonalInfoStep(props, ref) {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validate() {
      // TODO: Validate fields, set errors
      // Return true/false
    },
    getData() {
      // TODO: Return { name, email }
    },
    reset() {
      // TODO: Clear all fields and errors
    },
  }));

  // TODO: Render form fields
});

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = [useRef(null), useRef(null), useRef(null)];

  const handleNext = () => {
    // TODO: Validate current step before advancing
  };

  // TODO: Render steps and navigation
}
```
