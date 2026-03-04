# Events (Sự kiện)

## Event là gì?

Event là **tín hiệu** cho biết có điều gì đó xảy ra — user click chuột, nhấn phím, trang tải xong, form được submit... JavaScript lắng nghe events và thực thi code phản hồi.

---

## 1. Gắn Event Listener

### addEventListener (Khuyên dùng)

```js
const button = document.querySelector('#myBtn');

// Cú pháp: element.addEventListener(eventType, handler, options)
button.addEventListener('click', function(event) {
  console.log('Clicked!', event);
});

// Arrow function
button.addEventListener('click', (e) => {
  console.log('Clicked!');
});

// Named function (dễ remove sau)
function handleClick(e) {
  console.log('Clicked!');
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick); // Phải cùng reference!
```

### Options

```js
// once: chạy 1 lần rồi tự remove
button.addEventListener('click', handler, { once: true });

// passive: không gọi preventDefault (tối ưu scroll performance)
el.addEventListener('touchmove', handler, { passive: true });

// capture: bắt event ở capturing phase (thay vì bubbling)
el.addEventListener('click', handler, { capture: true });
// hoặc
el.addEventListener('click', handler, true);
```

---

## 2. Event Object

Khi event xảy ra, JS tạo **Event object** chứa thông tin chi tiết.

```js
element.addEventListener('click', (event) => {
  // Target & CurrentTarget
  event.target;        // Phần tử ĐƯỢC click (sâu nhất)
  event.currentTarget; // Phần tử GẮN listener

  // Position
  event.clientX;       // X relative to viewport
  event.clientY;       // Y relative to viewport
  event.pageX;         // X relative to document
  event.pageY;         // Y relative to document

  // Keyboard/Mouse modifiers
  event.altKey;        // Alt đang nhấn?
  event.ctrlKey;       // Ctrl đang nhấn?
  event.shiftKey;      // Shift đang nhấn?
  event.metaKey;       // Cmd (Mac) / Win (Windows)?

  // Event info
  event.type;          // 'click'
  event.timeStamp;     // Thời điểm xảy ra

  // Control
  event.preventDefault();  // Ngăn hành vi mặc định
  event.stopPropagation(); // Ngăn event lan truyền
});
```

---

## 3. Event Propagation (Lan truyền)

Khi event xảy ra, nó đi qua **3 giai đoạn**:

```
1. Capturing Phase: document → html → body → ... → target
2. Target Phase: event tại phần tử đích
3. Bubbling Phase: target → ... → body → html → document
```

```html
<div id="outer">
  <div id="inner">
    <button id="btn">Click me</button>
  </div>
</div>
```

```js
// Mặc định: listeners chạy ở BUBBLING phase
// Click button → btn handler → inner handler → outer handler

document.getElementById('outer').addEventListener('click', () => {
  console.log('Outer'); // 3. Chạy sau cùng
});

document.getElementById('inner').addEventListener('click', () => {
  console.log('Inner'); // 2. Chạy thứ hai
});

document.getElementById('btn').addEventListener('click', () => {
  console.log('Button'); // 1. Chạy đầu tiên
});
// Click button → "Button", "Inner", "Outer"
```

### stopPropagation

```js
document.getElementById('btn').addEventListener('click', (e) => {
  e.stopPropagation(); // Ngăn event bubble lên parent
  console.log('Button');
});
// Click button → chỉ "Button", không có "Inner" hay "Outer"
```

### preventDefault

Ngăn **hành vi mặc định** của browser (không liên quan đến propagation):

```js
// Ngăn form submit reload trang
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Xử lý form bằng JS
});

// Ngăn link navigate
link.addEventListener('click', (e) => {
  e.preventDefault();
  // Custom navigation
});
```

---

## 4. Các loại Event phổ biến

### Mouse Events
```js
el.addEventListener('click', handler);      // Click
el.addEventListener('dblclick', handler);    // Double click
el.addEventListener('mouseenter', handler);  // Chuột vào (không bubble)
el.addEventListener('mouseleave', handler);  // Chuột ra (không bubble)
el.addEventListener('mouseover', handler);   // Chuột vào (có bubble)
el.addEventListener('mouseout', handler);    // Chuột ra (có bubble)
el.addEventListener('mousemove', handler);   // Chuột di chuyển
el.addEventListener('contextmenu', handler); // Right click
```

### Keyboard Events
```js
document.addEventListener('keydown', (e) => {
  console.log(e.key);     // 'Enter', 'a', 'ArrowUp'...
  console.log(e.code);    // 'Enter', 'KeyA', 'ArrowUp' (vị trí phím vật lý)

  // Phím tắt Ctrl+S
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveDocument();
  }
});
```

### Form Events
```js
input.addEventListener('input', handler);    // Giá trị thay đổi (real-time)
input.addEventListener('change', handler);   // Giá trị thay đổi (sau blur)
input.addEventListener('focus', handler);    // Được focus
input.addEventListener('blur', handler);     // Mất focus
form.addEventListener('submit', handler);    // Form submit
form.addEventListener('reset', handler);     // Form reset
```

### Window/Document Events
```js
window.addEventListener('load', handler);             // Trang tải xong (all resources)
document.addEventListener('DOMContentLoaded', handler); // DOM ready (trước images)
window.addEventListener('resize', handler);            // Thay đổi kích thước
window.addEventListener('scroll', handler);            // Scroll
window.addEventListener('beforeunload', handler);     // Trước khi đóng tab
```

---

## 5. Custom Events

```js
// Tạo custom event
const event = new CustomEvent('userLogin', {
  detail: { userId: 1, name: 'Phong' }, // Dữ liệu kèm theo
  bubbles: true,    // Cho phép bubble
  cancelable: true, // Cho phép preventDefault
});

// Lắng nghe
document.addEventListener('userLogin', (e) => {
  console.log('User logged in:', e.detail);
});

// Dispatch (kích hoạt)
document.dispatchEvent(event);
```
