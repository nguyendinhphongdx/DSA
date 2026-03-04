# 06 - DOM & BOM

## 1. DOM Selection

```js
// Modern (khuyên dùng)
document.querySelector('.class');          // Phần tử đầu tiên
document.querySelectorAll('.class');        // NodeList (tất cả)

// Classic
document.getElementById('id');
document.getElementsByClassName('class');   // HTMLCollection (live)
document.getElementsByTagName('div');       // HTMLCollection (live)

// Traversal
element.parentElement;
element.children;              // HTMLCollection
element.firstElementChild;
element.lastElementChild;
element.nextElementSibling;
element.previousElementSibling;
element.closest('.parent');    // Tìm ancestor gần nhất match selector
```

## 2. DOM Manipulation

```js
// Tạo element
const div = document.createElement('div');
div.textContent = 'Hello';
div.innerHTML = '<span>Hello</span>';
div.className = 'box';
div.id = 'myBox';
div.setAttribute('data-id', '123');
div.dataset.id; // '123'

// Thêm vào DOM
parent.appendChild(child);
parent.append(child, 'text');      // Thêm nhiều, chấp nhận text
parent.prepend(child);             // Thêm đầu
element.before(newElement);        // Thêm trước
element.after(newElement);         // Thêm sau
parent.insertBefore(newNode, referenceNode);

// Xóa
element.remove();
parent.removeChild(child);

// Clone
const clone = element.cloneNode(true); // true = deep clone

// Style
element.style.color = 'red';
element.style.cssText = 'color: red; font-size: 16px;';
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('active');
element.classList.contains('active');

// Kích thước & Vị trí
element.getBoundingClientRect(); // { top, left, width, height... }
element.offsetWidth;  // width + padding + border
element.clientWidth;  // width + padding
element.scrollWidth;  // total scrollable width
```

## 3. Events

```js
// addEventListener (khuyên dùng)
element.addEventListener('click', handler);
element.addEventListener('click', handler, { once: true }); // Chạy 1 lần
element.removeEventListener('click', handler);

// Event Object
element.addEventListener('click', (e) => {
  e.target;           // Element được click
  e.currentTarget;    // Element gắn listener
  e.preventDefault();  // Ngăn hành vi mặc định
  e.stopPropagation(); // Ngăn bubbling
  e.type;             // 'click'
});

// Common Events
// Mouse: click, dblclick, mouseenter, mouseleave, mousemove
// Keyboard: keydown, keyup, keypress
// Form: submit, input, change, focus, blur
// Window: load, DOMContentLoaded, resize, scroll
// Touch: touchstart, touchmove, touchend
```

## 4. Event Delegation

```js
// Thay vì gắn listener cho từng item:
// items.forEach(item => item.addEventListener('click', handler));

// Gắn listener cho parent:
document.querySelector('.list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return;
  console.log('Clicked item:', item.dataset.id);
});
```

## 5. BOM (Browser Object Model)

```js
// Window
window.innerWidth;   // Viewport width
window.innerHeight;
window.scrollTo(0, 0);
window.open(url);

// Location
location.href;       // Full URL
location.pathname;   // /path
location.search;     // ?query=value
location.hash;       // #section
location.reload();

// History
history.pushState(state, '', '/new-url');
history.replaceState(state, '', '/new-url');
history.back();
history.forward();

// Navigator
navigator.userAgent;
navigator.language;
navigator.onLine;
```

## 6. Web Storage

```js
// localStorage - Lưu vĩnh viễn
localStorage.setItem('key', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('key'));
localStorage.removeItem('key');
localStorage.clear();

// sessionStorage - Lưu trong phiên
sessionStorage.setItem('key', 'value');

// Storage event (cross-tab)
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});
```
