# 11 - Performance

## 1. Memory Management

```js
// Stack: primitive values, references
// Heap: objects, arrays, functions

// Tránh memory leaks
// 1. Xóa event listeners khi không cần
element.removeEventListener('click', handler);

// 2. Clear intervals/timeouts
const id = setInterval(fn, 1000);
clearInterval(id);

// 3. Tránh giữ reference không cần thiết
let cache = {};
// Dùng WeakMap thay vì object thông thường
const cache = new WeakMap();

// 4. Nullify large objects khi xong
let largeData = fetchHugeData();
processData(largeData);
largeData = null; // Cho phép GC thu hồi
```

## 2. Garbage Collection

```js
// JS dùng Mark-and-Sweep algorithm
// Object bị GC khi không còn reference nào trỏ tới

// WeakRef - reference yếu, không ngăn GC
const weakRef = new WeakRef(largeObject);
const obj = weakRef.deref(); // Có thể undefined nếu đã bị GC

// FinalizationRegistry - callback khi object bị GC
const registry = new FinalizationRegistry((value) => {
  console.log(`Object with ${value} was garbage collected`);
});
registry.register(obj, 'cleanup-id');
```

## 3. Debounce & Throttle

```js
// Debounce: Chờ user ngừng action rồi mới thực thi
// Ví dụ: search input, resize
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 300);

// Throttle: Giới hạn tần suất thực thi
// Ví dụ: scroll, mousemove
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (inThrottle) return;
    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => inThrottle = false, limit);
  };
}

window.addEventListener('scroll', throttle(handleScroll, 100));
```

## 4. Lazy Loading

```js
// Images
<img loading="lazy" src="image.jpg" alt="..." />

// Dynamic import
const module = await import('./heavy-module.js');

// Intersection Observer cho lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

## 5. Các kỹ thuật tối ưu khác

```js
// requestAnimationFrame cho animations
function animate() {
  // update animation
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Document Fragment cho batch DOM updates
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.querySelector('ul').appendChild(fragment);

// Virtual scrolling concept
// Chỉ render items trong viewport thay vì toàn bộ list

// Web Workers cho heavy computation
// Chuyển tính toán nặng sang thread riêng
```
