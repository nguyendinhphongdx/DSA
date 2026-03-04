# 09 - Regular Expressions

## 1. Cú pháp cơ bản

```js
// Tạo RegExp
const regex1 = /pattern/flags;
const regex2 = new RegExp('pattern', 'flags');

// Flags
// g - global (tìm tất cả)
// i - case insensitive
// m - multiline
// s - dotAll (. match cả \n)
// u - unicode
// d - indices
```

## 2. Character Classes

```
.       Bất kỳ ký tự nào (trừ \n)
\d      Chữ số [0-9]
\D      Không phải chữ số
\w      Word character [a-zA-Z0-9_]
\W      Không phải word character
\s      Whitespace (space, tab, newline)
\S      Không phải whitespace
\b      Word boundary
```

## 3. Quantifiers

```
*       0 hoặc nhiều
+       1 hoặc nhiều
?       0 hoặc 1
{n}     Đúng n lần
{n,}    n lần trở lên
{n,m}   Từ n đến m lần
*?      Lazy (ít nhất có thể)
```

## 4. Groups & Assertions

```
(abc)     Capturing group
(?:abc)   Non-capturing group
(?<name>) Named group
|         OR
^         Bắt đầu chuỗi
$         Kết thúc chuỗi
(?=abc)   Lookahead (theo sau bởi abc)
(?!abc)   Negative lookahead
(?<=abc)  Lookbehind (đứng trước bởi abc)
(?<!abc)  Negative lookbehind
```

## 5. Methods

```js
// RegExp methods
regex.test(string);    // true/false
regex.exec(string);    // Match object hoặc null

// String methods
str.match(regex);      // Array matches hoặc null
str.matchAll(regex);   // Iterator of all matches (cần flag g)
str.search(regex);     // Index of first match hoặc -1
str.replace(regex, replacement);
str.replaceAll(regex, replacement);
str.split(regex);
```

## 6. Patterns thường dùng

```js
// Email
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Phone (VN)
/^(0|\+84)(3|5|7|8|9)\d{8}$/

// URL
/^https?:\/\/[^\s/$.?#].[^\s]*$/

// Password (min 8, uppercase, lowercase, number)
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

// Số có dấu phẩy
/^\d{1,3}(,\d{3})*(\.\d+)?$/

// HTML tag
/<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/

// Trim whitespace
str.replace(/^\s+|\s+$/g, '');

// Remove duplicate spaces
str.replace(/\s+/g, ' ');

// camelCase to kebab-case
str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
```
