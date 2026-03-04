# 5. Callback Pattern

Callback la pattern co nhat trong Node.js. Convention: **error-first callback** - tham so dau tien luon la error.

## 5.1. Error-first callback

```js
const fs = require('fs');

// Node.js convention: callback(error, result)
fs.readFile('./data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Loi doc file:', err.message);
    return; // QUAN TRONG: phai return sau khi xu ly loi
  }
  console.log('Noi dung file:', data);
});

// Tu viet function theo callback pattern
function divideAsync(a, b, callback) {
  // Gia lap async operation
  setTimeout(() => {
    if (typeof a !== 'number' || typeof b !== 'number') {
      return callback(new TypeError('Tham so phai la so'));
    }
    if (b === 0) {
      return callback(new Error('Khong the chia cho 0'));
    }
    callback(null, a / b); // null = khong co loi
  }, 100);
}

// Su dung
divideAsync(10, 3, (err, result) => {
  if (err) {
    console.error('Loi:', err.message);
    return;
  }
  console.log('Ket qua:', result); // 3.333...
});

divideAsync(10, 0, (err, result) => {
  if (err) {
    console.error('Loi:', err.message); // Khong the chia cho 0
    return;
  }
  console.log('Ket qua:', result);
});
```

## 5.2. Callback Hell (Pyramid of Doom)

```js
// Van de: Nhieu thao tac async phu thuoc nhau → code long nhau
const fs = require('fs');

// Callback Hell - KHO doc, kho bao tri
fs.readFile('./config.json', 'utf8', (err, configData) => {
  if (err) return console.error(err);

  const config = JSON.parse(configData);

  fs.readFile(config.dataFile, 'utf8', (err, rawData) => {
    if (err) return console.error(err);

    const data = JSON.parse(rawData);

    fs.readFile(config.templateFile, 'utf8', (err, template) => {
      if (err) return console.error(err);

      const result = template.replace('{{data}}', JSON.stringify(data));

      fs.writeFile('./output.html', result, (err) => {
        if (err) return console.error(err);

        console.log('Xong!');
        // Them operation nua? Long them 1 cap...
      });
    });
  });
});

// Cach giai quyet 1: Tach thanh named functions
function readConfig(callback) {
  fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function readData(config, callback) {
  fs.readFile(config.dataFile, 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, { config, data: JSON.parse(data) });
  });
}

function readTemplate(context, callback) {
  fs.readFile(context.config.templateFile, 'utf8', (err, template) => {
    if (err) return callback(err);
    callback(null, { ...context, template });
  });
}

function writeOutput(context, callback) {
  const result = context.template.replace('{{data}}', JSON.stringify(context.data));
  fs.writeFile('./output.html', result, callback);
}

// Su dung - flat hon nhung van chua ly tuong
readConfig((err, config) => {
  if (err) return console.error(err);
  readData(config, (err, context) => {
    if (err) return console.error(err);
    readTemplate(context, (err, fullContext) => {
      if (err) return console.error(err);
      writeOutput(fullContext, (err) => {
        if (err) return console.error(err);
        console.log('Xong!');
      });
    });
  });
});
```
