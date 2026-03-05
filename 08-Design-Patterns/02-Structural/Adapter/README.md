# Adapter Pattern

## 1. Khái niệm

Chuyển đổi interface của class này sang interface mà client mong đợi. Adapter cho phép các class không tương thích làm việc cùng nhau.

```
Client ──→ [Adapter] ──→ Adaptee
           ┌─────────────────────┐
           │ Adapter             │
Expected ──│ + expectedMethod()  │──→ adaptee.oldMethod()
Interface  │   (translate)       │
           └─────────────────────┘
```

---

## 2. Ví dụ

### API Version Adapter

```javascript
// Old API (v1)
class OldPaymentAPI {
  processPayment(amount, currency) {
    return { status: 'ok', transaction_id: 'txn_123', amount };
  }
}

// New API (v2) - interface khác hoàn toàn
class NewPaymentAPI {
  createCharge(params) {
    // params: { amount, currency, description }
    return { success: true, chargeId: 'ch_456', data: params };
  }
}

// Adapter: wrap New API để phù hợp interface cũ
class PaymentAdapter {
  constructor(newAPI) {
    this.api = newAPI;
  }

  // Giữ interface cũ
  processPayment(amount, currency) {
    const result = this.api.createCharge({ amount, currency, description: 'Payment' });
    return {
      status: result.success ? 'ok' : 'error',
      transaction_id: result.chargeId,
      amount: result.data.amount,
    };
  }
}

// Client code KHÔNG cần thay đổi
function checkout(paymentProcessor, amount) {
  const result = paymentProcessor.processPayment(amount, 'VND');
  console.log(`Payment: ${result.status}, ID: ${result.transaction_id}`);
}

// Dùng adapter cho API mới
const adapter = new PaymentAdapter(new NewPaymentAPI());
checkout(adapter, 500000);
```

### Third-party Library Adapter

```javascript
// App dùng interface chuẩn
class AppLogger {
  info(message) {}
  error(message) {}
  warn(message) {}
}

// Third-party logger có interface khác
class WinstonLogger {
  log(level, message, meta) {
    console.log(`[${level}] ${message}`, meta);
  }
}

// Adapter
class WinstonAdapter extends AppLogger {
  constructor() {
    super();
    this.winston = new WinstonLogger();
  }

  info(message) { this.winston.log('info', message, {}); }
  error(message) { this.winston.log('error', message, {}); }
  warn(message) { this.winston.log('warn', message, {}); }
}

// App code dùng AppLogger interface
const logger = new WinstonAdapter();
logger.info('App started');
```

---

## 3. Khi nào dùng

- Tích hợp thư viện/API bên thứ 3 có interface khác
- Migrate từ API cũ sang API mới mà không sửa client code
- Wrap legacy code

---

## 4. Bài tập

```javascript
// Tạo adapter cho 2 calendar APIs:
// GoogleCalendar: addEvent({ title, start, end, location })
// OutlookCalendar: createAppointment(subject, startTime, endTime, place)
// → Adapter để dùng chung 1 interface: schedule(event)
```
