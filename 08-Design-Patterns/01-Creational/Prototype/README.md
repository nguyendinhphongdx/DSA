# Prototype Pattern

## 1. Khái niệm

Tạo object mới bằng cách **clone** từ object mẫu (prototype), thay vì tạo từ đầu.

```
┌──────────┐   clone()   ┌──────────┐
│ Prototype│ ──────────→  │  Clone   │
│ (mẫu)   │              │  (copy)  │
└──────────┘              └──────────┘
```

---

## 2. Shallow vs Deep Copy

```javascript
// Shallow copy - chỉ copy level 1
const original = { name: 'Phong', address: { city: 'Ha Noi' } };
const shallow = { ...original };
shallow.address.city = 'HCM';
console.log(original.address.city); // 'HCM' ← BỊ ảnh hưởng!

// Deep copy
const deep = structuredClone(original);  // ES2022+
deep.address.city = 'Da Nang';
console.log(original.address.city); // 'HCM' ← Không bị ảnh hưởng
```

---

## 3. Implementation

```javascript
class GameCharacter {
  constructor(name, health, attack, skills, equipment) {
    this.name = name;
    this.health = health;
    this.attack = attack;
    this.skills = skills;
    this.equipment = equipment;
  }

  clone() {
    return new GameCharacter(
      this.name,
      this.health,
      this.attack,
      [...this.skills],                          // Deep copy array
      { ...this.equipment }                       // Shallow copy object
    );
  }
}

// Tạo prototype (mẫu)
const warriorTemplate = new GameCharacter(
  'Warrior', 100, 20,
  ['slash', 'block', 'charge'],
  { weapon: 'sword', armor: 'plate' }
);

// Clone và customize
const player1 = warriorTemplate.clone();
player1.name = 'Knight Phong';
player1.equipment.weapon = 'great-sword';

const player2 = warriorTemplate.clone();
player2.name = 'Paladin Minh';
player2.skills.push('heal');
```

---

## 4. Prototype Registry

```javascript
class PrototypeRegistry {
  #prototypes = new Map();

  register(name, prototype) {
    this.#prototypes.set(name, prototype);
  }

  create(name, overrides = {}) {
    const proto = this.#prototypes.get(name);
    if (!proto) throw new Error(`Prototype '${name}' not found`);
    return { ...structuredClone(proto), ...overrides };
  }
}

const registry = new PrototypeRegistry();

registry.register('email-config', {
  host: 'smtp.gmail.com', port: 587, secure: true,
  auth: { user: '', pass: '' }
});

registry.register('db-config', {
  host: 'localhost', port: 5432, database: 'app',
  pool: { min: 2, max: 10 }
});

// Clone và override
const devDB = registry.create('db-config', { database: 'app_dev' });
const prodDB = registry.create('db-config', { host: 'prod-server', database: 'app_prod' });
```

---

## 5. Các cách clone trong JavaScript

```javascript
const obj = { a: 1, b: { c: 2 }, d: [3, 4] };

// 1. Spread operator (shallow)
const copy1 = { ...obj };

// 2. Object.assign (shallow)
const copy2 = Object.assign({}, obj);

// 3. JSON (deep, nhưng mất functions/Date/undefined)
const copy3 = JSON.parse(JSON.stringify(obj));

// 4. structuredClone (deep, recommended)
const copy4 = structuredClone(obj);
```

---

## 6. Bài tập

```javascript
// Tạo hệ thống template cho notifications:
// - emailTemplate: { type: 'email', subject: '', body: '', to: '' }
// - smsTemplate: { type: 'sms', message: '', phone: '' }
// Clone và customize cho từng trường hợp cụ thể
```
