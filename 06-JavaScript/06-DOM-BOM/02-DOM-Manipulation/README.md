# DOM Manipulation (Thao tác DOM)

## 1. Tạo phần tử

```js
// Tạo element
const div = document.createElement('div');
const span = document.createElement('span');

// Tạo text node
const text = document.createTextNode('Hello');

// Tạo document fragment (tối ưu khi thêm nhiều phần tử)
const fragment = document.createDocumentFragment();
```

---

## 2. Nội dung

### textContent vs innerHTML vs innerText

```js
const el = document.querySelector('#content');

// textContent: text thuần, KHÔNG parse HTML, nhanh nhất, an toàn nhất
el.textContent = '<b>Hello</b>'; // Hiển thị "<b>Hello</b>" dưới dạng text

// innerHTML: parse HTML — CẨN THẬN XSS!
el.innerHTML = '<b>Hello</b>'; // Hiển thị Hello in đậm
// ❌ NGUY HIỂM: el.innerHTML = userInput; // XSS vulnerability!

// innerText: text hiển thị (bỏ phần tử ẩn), trigger reflow — chậm
el.innerText; // Chỉ text mà user nhìn thấy
```

**Quy tắc:**
- Hiển thị **text thuần** → `textContent` (nhanh, an toàn)
- Cần **render HTML** → `innerHTML` (KHÔNG BAO GIỜ dùng với user input!)
- Cần tạo DOM từ user input an toàn → `createElement` + `textContent`

---

## 3. Thêm phần tử vào DOM

```js
const parent = document.querySelector('.container');
const child = document.createElement('p');
child.textContent = 'New paragraph';

// Thêm cuối
parent.appendChild(child);         // Cũ — return child
parent.append(child, 'text');      // Mới — thêm nhiều, chấp nhận text

// Thêm đầu
parent.prepend(child);

// Thêm trước/sau phần tử khác
referenceEl.before(newEl);         // Trước referenceEl
referenceEl.after(newEl);          // Sau referenceEl

// Thêm vào vị trí cụ thể
parent.insertBefore(newEl, referenceEl); // Trước referenceEl

// insertAdjacentHTML — thêm HTML string tại vị trí chỉ định
el.insertAdjacentHTML('beforebegin', '<p>Before</p>');  // Trước el
el.insertAdjacentHTML('afterbegin', '<p>First child</p>'); // Đầu el
el.insertAdjacentHTML('beforeend', '<p>Last child</p>');   // Cuối el
el.insertAdjacentHTML('afterend', '<p>After</p>');     // Sau el
```

---

## 4. Xóa & Thay thế

```js
// Xóa chính nó
el.remove();

// Xóa con
parent.removeChild(child);

// Thay thế
parent.replaceChild(newEl, oldEl);
oldEl.replaceWith(newEl);

// Clone
const clone = el.cloneNode(true);  // true = deep clone (cả children)
const shallow = el.cloneNode(false); // Chỉ element, không con
```

---

## 5. Attributes & Properties

### Attributes (trong HTML) vs Properties (trong JS)

```js
// Standard attributes ↔ properties
el.id = 'myId';                    // Property
el.className = 'box active';       // Property (className, không phải class)
el.setAttribute('id', 'myId');     // Attribute
el.getAttribute('class');          // 'box active'
el.removeAttribute('disabled');
el.hasAttribute('required');       // true/false

// Custom data attributes
el.dataset.id;                     // Đọc data-id
el.dataset.userId = '42';         // Gán data-user-id="42"
el.dataset;                        // DOMStringMap { id, userId }
```

---

## 6. CSS & Classes

### classList (khuyên dùng)

```js
el.classList.add('active');           // Thêm class
el.classList.remove('hidden');        // Xóa class
el.classList.toggle('open');          // Toggle (thêm nếu chưa có, xóa nếu có)
el.classList.toggle('dark', isDark);  // Conditional toggle
el.classList.contains('active');      // Kiểm tra → true/false
el.classList.replace('old', 'new');   // Thay thế class
```

### Inline styles

```js
el.style.color = 'red';
el.style.fontSize = '16px';          // camelCase, không phải font-size
el.style.cssText = 'color: red; font-size: 16px;'; // Gán nhiều style cùng lúc
el.style.removeProperty('color');

// Đọc computed style (style thực tế sau khi apply CSS)
const computed = getComputedStyle(el);
computed.fontSize;  // '16px'
computed.color;     // 'rgb(255, 0, 0)'
```

---

## 7. Kích thước & Vị trí

```js
// getBoundingClientRect — vị trí relative to viewport
const rect = el.getBoundingClientRect();
rect.top;     // Khoảng cách từ top viewport
rect.left;    // Khoảng cách từ left viewport
rect.width;   // Chiều rộng
rect.height;  // Chiều cao

// Offset dimensions
el.offsetWidth;   // width + padding + border + scrollbar
el.offsetHeight;
el.offsetTop;     // Vị trí relative to offsetParent
el.offsetLeft;

// Client dimensions
el.clientWidth;   // width + padding (KHÔNG border, KHÔNG scrollbar)
el.clientHeight;

// Scroll
el.scrollTop;     // Số pixel đã scroll (dọc)
el.scrollLeft;
el.scrollWidth;   // Tổng chiều rộng scrollable
el.scrollHeight;

// Scroll methods
el.scrollTo({ top: 0, behavior: 'smooth' });
el.scrollIntoView({ behavior: 'smooth', block: 'center' });
```

---

## 8. Performance: Batch DOM Updates

Mỗi lần thay đổi DOM có thể trigger **reflow** (tính lại layout) và **repaint** (vẽ lại). Nhiều thay đổi nhỏ → nhiều reflow → chậm.

```js
// ❌ Chậm — 1000 reflows
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  ul.appendChild(li); // Mỗi lần → reflow
}

// ✅ Nhanh — 1 reflow
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // Thêm vào fragment (off-DOM)
}
ul.appendChild(fragment); // 1 lần duy nhất → 1 reflow
```
