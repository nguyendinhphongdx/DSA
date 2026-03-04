# MessagePattern, EventPattern, Request-Response vs Event-based

## 4. MessagePattern va EventPattern

Day la 2 cach chinh de microservice nhan va xu ly messages.

### @MessagePattern() - Request-Response

Giong nhu HTTP request-response: client gui message va **cho** response.

```typescript
// math.controller.ts (Microservice)
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MathController {
  // Lang nghe message co pattern 'sum'
  @MessagePattern('sum')
  calculateSum(@Payload() data: number[]): number {
    console.log('Nhan duoc yeu cau tinh tong:', data);
    return data.reduce((a, b) => a + b, 0);
  }

  // Pattern co the la object
  @MessagePattern({ cmd: 'multiply' })
  multiply(@Payload() data: { a: number; b: number }): number {
    return data.a * data.b;
  }

  // Tra ve Promise (async)
  @MessagePattern({ cmd: 'find_user' })
  async findUser(@Payload() data: { id: number }) {
    // Gia lap query database
    const user = await this.usersService.findOne(data.id);
    return user;
  }
}
```

### @EventPattern() - Event-based

Client gui event va **KHONG cho** response. Fire-and-forget.

```typescript
// notifications.controller.ts (Microservice)
import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  // Lang nghe event 'user_created'
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { userId: number; email: string }) {
    console.log('User moi duoc tao:', data);
    // Gui email chao mung
    await this.emailService.sendWelcomeEmail(data.email);
    // Khong can return gi - client khong cho
  }

  @EventPattern('order_completed')
  async handleOrderCompleted(@Payload() data: {
    orderId: number;
    userId: number;
    total: number;
  }) {
    console.log('Don hang hoan tat:', data);
    // Gui notification
    await this.notificationService.sendPush(data.userId, 'Don hang da hoan tat!');
    // Cap nhat thong ke
    await this.statsService.updateSales(data.total);
  }
}
```

### So sanh MessagePattern va EventPattern

| Tinh chat | @MessagePattern | @EventPattern |
|-----------|-----------------|---------------|
| Kieu giao tiep | Request-Response | Fire-and-forget |
| Client cho response? | Co | Khong |
| Return value | Gui ve cho client | Bi bo qua |
| Use case | Query data, commands | Notifications, logging, async tasks |
| Loi xu ly | Client nhan duoc loi | Phai tu xu ly (retry, dead letter) |

### @Payload() va @Ctx() Decorators

```typescript
import { MessagePattern, Payload, Ctx, TcpContext } from '@nestjs/microservices';

@MessagePattern('get_data')
getData(
  @Payload() data: any,              // Du lieu gui kem message
  @Ctx() context: TcpContext,        // Context cua transport hien tai
) {
  // context cung cap thong tin ve ket noi, pattern, ...
  const pattern = context.getPattern();
  console.log('Pattern:', pattern);
  return { result: 'ok' };
}
```

---

## 7. Request-Response vs Event-based

### Request-Response Pattern (Dong bo)

```
Service A                    Service B
   |                            |
   |------- send('cmd') ------->|
   |                            | (xu ly)
   |<------ response -----------|
   |                            |
```

```typescript
// Service A (gui)
const user = await firstValueFrom(
  this.usersClient.send({ cmd: 'find_user' }, { id: 1 }),
);

// Service B (nhan va tra loi)
@MessagePattern({ cmd: 'find_user' })
findUser(@Payload() data: { id: number }) {
  return this.usersService.findOne(data.id);
  // Gia tri return duoc gui ve cho Service A
}
```

**Dac diem:**
- Client **cho** response (blocking)
- Phu hop cho: query data, validation, commands can ket qua
- Timeout: nen set timeout de tranh cho vo han
- Loi: client nhan duoc error neu service loi

### Event-based Pattern (Bat dong bo)

```
Service A                    Message Broker               Service B
   |                              |                          |
   |--- emit('event') ---------->|                          |
   |                              |---- deliver event ------>|
   |  (tiep tuc xu ly)           |                          | (xu ly)
   |                              |                          |
```

```typescript
// Service A (emit)
this.notificationClient.emit('user_created', {
  userId: user.id,
  email: user.email,
});
// Khong cho, tiep tuc xu ly ngay

// Service B (nhan event)
@EventPattern('user_created')
async handleUserCreated(@Payload() data: { userId: number; email: string }) {
  await this.emailService.sendWelcome(data.email);
  // KHONG return gi - khong ai cho ket qua
}
```

**Dac diem:**
- Client **khong cho** (non-blocking, fire-and-forget)
- Phu hop cho: notifications, logging, async processing, event sourcing
- Nhieu consumers co the lang nghe cung 1 event
- Can xu ly loi rieng (retry, dead letter queue)

### Khi nao dung cai nao?

| Tinh huong | Pattern | Ly do |
|------------|---------|-------|
| Lay thong tin user | Request-Response | Can du lieu tra ve ngay |
| Gui email xac nhan | Event-based | Khong can cho email gui xong |
| Validate du lieu | Request-Response | Can biet hop le hay khong |
| Ghi log | Event-based | Khong anh huong logic chinh |
| Thanh toan | Request-Response | Can biet ket qua |
| Cap nhat cache | Event-based | Background task |
