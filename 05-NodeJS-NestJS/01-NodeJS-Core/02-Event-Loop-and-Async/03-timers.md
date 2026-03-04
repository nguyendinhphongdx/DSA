# 4. setTimeout vs setImmediate vs process.nextTick

## So sanh chi tiet

| Dac diem | process.nextTick() | Promise.then() | setTimeout(fn, 0) | setImmediate() |
|----------|-------------------|---------------|-------------------|----------------|
| **Kieu** | Microtask | Microtask | Macrotask (Timer) | Macrotask (Check) |
| **Do uu tien** | Cao nhat | Cao | Thap | Thap |
| **Phase** | Giua moi phase | Giua moi phase | Timers | Check |
| **Starvation risk** | Co | Co | Khong | Khong |

## process.nextTick()

```js
// process.nextTick() duoc xu ly NGAY SAU operation hien tai
// TRUOC khi Event Loop tiep tuc bat ky phase nao

console.log('1. Start');

process.nextTick(() => {
  console.log('2. nextTick');
});

console.log('3. End');

// Output: 1 → 3 → 2

// NGUY HIEM: Recursive nextTick co the block Event Loop (starvation)
function recursiveNextTick() {
  process.nextTick(() => {
    console.log('nextTick - se chay mai mai!');
    recursiveNextTick(); // KHONG BAO GIO cho setTimeout/setImmediate chay
  });
}
// recursiveNextTick(); // DUNG LAM DIEU NAY!
```

**Khi nao dung process.nextTick():**
- Xu ly errors truoc khi Event Loop tiep tuc
- Cho phep callback chay SAU khi call stack trong nhung TRUOC I/O
- Emit events sau khi constructor hoan thanh

```js
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // SAI: emit ngay trong constructor
    // this.emit('ready'); // Listener chua duoc dang ky!

    // DUNG: dung nextTick de emit sau khi constructor xong
    process.nextTick(() => {
      this.emit('ready'); // Listener da duoc dang ky
    });
  }
}

const emitter = new MyEmitter();
emitter.on('ready', () => {
  console.log('Emitter san sang!'); // Se duoc goi
});
```

## setTimeout(fn, 0) vs setImmediate()

```js
// O MAIN MODULE: Thu tu KHONG dam bao
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
// Co the la: setTimeout → setImmediate
// Hoac:      setImmediate → setTimeout
// Phu thuoc vao performance cua may tai thoi diem do

// TRONG I/O CALLBACK: setImmediate LUON chay truoc
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
});
// LUON: setImmediate → setTimeout
// Vi sau I/O callback (poll phase), check phase (setImmediate) den truoc timers phase
```

## Demo tong hop

```js
const fs = require('fs');

console.log('=== BAT DAU ===');

// Macrotask - Timers phase
setTimeout(() => {
  console.log('T1: setTimeout 0ms');

  process.nextTick(() => console.log('T1-NT: nextTick trong setTimeout'));
  Promise.resolve().then(() => console.log('T1-P: Promise trong setTimeout'));
}, 0);

setTimeout(() => {
  console.log('T2: setTimeout 0ms (thu 2)');
}, 0);

// Macrotask - Check phase
setImmediate(() => {
  console.log('I1: setImmediate');

  process.nextTick(() => console.log('I1-NT: nextTick trong setImmediate'));
  Promise.resolve().then(() => console.log('I1-P: Promise trong setImmediate'));
});

// I/O
fs.readFile(__filename, () => {
  console.log('IO: File da doc xong');

  setTimeout(() => console.log('IO-T: setTimeout trong I/O'), 0);
  setImmediate(() => console.log('IO-I: setImmediate trong I/O'));
  process.nextTick(() => console.log('IO-NT: nextTick trong I/O'));
  Promise.resolve().then(() => console.log('IO-P: Promise trong I/O'));
});

// Microtask
process.nextTick(() => console.log('NT1: nextTick 1'));
process.nextTick(() => console.log('NT2: nextTick 2'));

Promise.resolve().then(() => console.log('P1: Promise 1'));
Promise.resolve().then(() => console.log('P2: Promise 2'));

console.log('=== KET THUC SYNC ===');

// Output (thu tu chung):
// === BAT DAU ===
// === KET THUC SYNC ===
// NT1: nextTick 1
// NT2: nextTick 2
// P1: Promise 1
// P2: Promise 2
// T1: setTimeout 0ms
// T1-NT: nextTick trong setTimeout
// T1-P: Promise trong setTimeout
// T2: setTimeout 0ms (thu 2)
// I1: setImmediate
// I1-NT: nextTick trong setImmediate
// I1-P: Promise trong setImmediate
// IO: File da doc xong
// IO-NT: nextTick trong I/O
// IO-P: Promise trong I/O
// IO-I: setImmediate trong I/O    ← setImmediate trong I/O luon truoc setTimeout
// IO-T: setTimeout trong I/O
```
