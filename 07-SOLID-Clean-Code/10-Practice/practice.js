/**
 * SOLID & Clean Code - Bài tập thực hành
 *
 * Hãy refactor các đoạn code bên dưới áp dụng:
 * - SOLID principles
 * - Clean naming
 * - Clean functions
 * - DRY / KISS / YAGNI
 * - Loại bỏ code smells
 */

// ============================================================
// BÀI 1: Refactor class vi phạm SRP, OCP, DIP
// ============================================================

class TodoApp {
  constructor() {
    this.todos = [];
  }

  // Vi phạm SRP: class làm quá nhiều việc
  // Vi phạm OCP: phải sửa khi thêm loại storage mới
  // Vi phạm DIP: phụ thuộc trực tiếp vào localStorage

  add(t, p) {
    // Bad naming: t = text, p = priority
    if (!t) {
      console.log("Error: empty todo");
      return;
    }
    const todo = {
      id: Date.now(),
      t: t,
      p: p || "medium",
      d: false, // d = done
      c: new Date(), // c = created
    };
    this.todos.push(todo);

    // Vi phạm SRP: persistence logic trong business class
    localStorage.setItem("todos", JSON.stringify(this.todos));

    // Vi phạm SRP: notification logic
    console.log(`Todo added: ${t}`);
    // Gửi notification nếu priority cao
    if (p === "high") {
      // Giả lập gửi email
      console.log(`URGENT: New high priority todo - ${t}`);
    }
  }

  remove(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(this.todos));
    console.log(`Todo removed: ${id}`);
  }

  complete(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.d = true;
      localStorage.setItem("todos", JSON.stringify(this.todos));
      console.log(`Todo completed: ${todo.t}`);
    }
  }

  // Vi phạm OCP: phải sửa khi thêm filter mới
  getFiltered(type) {
    switch (type) {
      case "done":
        return this.todos.filter((t) => t.d === true);
      case "pending":
        return this.todos.filter((t) => t.d === false);
      case "high":
        return this.todos.filter((t) => t.p === "high");
      case "medium":
        return this.todos.filter((t) => t.p === "medium");
      case "low":
        return this.todos.filter((t) => t.p === "low");
      // Thêm filter mới? Phải sửa ở đây...
      default:
        return this.todos;
    }
  }

  // Vi phạm SRP: report logic
  generateReport() {
    const total = this.todos.length;
    const done = this.todos.filter((t) => t.d).length;
    const pending = total - done;
    const highPriority = this.todos.filter((t) => t.p === "high").length;
    return `Total: ${total}, Done: ${done}, Pending: ${pending}, High: ${highPriority}`;
  }

  // Vi phạm SRP: export logic
  exportCSV() {
    let csv = "id,text,priority,done,created\n";
    this.todos.forEach((t) => {
      csv += `${t.id},${t.t},${t.p},${t.d},${t.c}\n`;
    });
    return csv;
  }
}

// ============================================================
// BÀI 2: Refactor code smells
// ============================================================

class OrderManager {
  proc(cust, items, pay, addr1, addr2, city, zip, country, note, gift, disc) {
    // Validate
    if (!cust) return { ok: false, msg: "no customer" };
    if (!items || items.length === 0) return { ok: false, msg: "no items" };
    if (!pay) return { ok: false, msg: "no payment" };

    // Calculate
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      let p = items[i].price * items[i].qty;
      if (items[i].qty > 10) {
        p = p * 0.9; // bulk discount
      }
      total += p;
    }

    // Apply discount
    if (disc) {
      if (disc.type === "percent") {
        total = total * (1 - disc.value / 100);
      } else if (disc.type === "fixed") {
        total = total - disc.value;
      } else if (disc.type === "bogo") {
        // Buy one get one
        const cheapest = Math.min(...items.map((i) => i.price));
        total = total - cheapest;
      }
    }

    // Tax
    if (country === "US") {
      total = total * 1.08;
    } else if (country === "UK") {
      total = total * 1.2;
    } else if (country === "VN") {
      total = total * 1.1;
    } else {
      total = total * 1.15;
    }

    // Shipping
    let shipping = 0;
    if (total < 500000) {
      shipping = 30000;
    }
    if (gift) {
      shipping += 15000;
    }

    total += shipping;

    // Save - giả lập
    const order = {
      id: "ORD" + Date.now(),
      customer: cust,
      items: items,
      total: Math.round(total),
      address: `${addr1} ${addr2}, ${city} ${zip}, ${country}`,
      note: note,
      gift: gift,
      date: new Date(),
    };

    console.log(`Order ${order.id}: ${order.total}`);
    return { ok: true, order: order };
  }
}

// ============================================================
// BÀI 3: Áp dụng Design Patterns
// ============================================================

// Refactor dùng Strategy Pattern cho tax calculation
// Refactor dùng Builder Pattern cho Order creation
// Refactor dùng Observer Pattern cho notifications

// Gợi ý:
// 1. TaxStrategy: USTax, UKTax, VNTax, DefaultTax
// 2. OrderBuilder: setCustomer(), addItem(), setAddress(), build()
// 3. OrderEventEmitter: on('orderCreated', callback)

console.log("Hãy refactor code ở trên và viết lời giải vào solution.js");
