# Microservices trong NestJS

## Muc luc

- [1. Microservices Architecture Overview](#1-microservices-architecture-overview)
- [2. NestJS Microservices Co ban](#2-nestjs-microservices-co-ban)
- [3. Transport Layers](#3-transport-layers)
- [4. MessagePattern va EventPattern](#4-messagepattern-va-eventpattern)
- [5. Client Proxy](#5-client-proxy)
- [6. Hybrid Application](#6-hybrid-application)
- [7. Request-Response vs Event-based](#7-request-response-vs-event-based)
- [8. Serialization va Deserialization](#8-serialization-va-deserialization)
- [9. Exception Filters trong Microservices](#9-exception-filters-trong-microservices)
- [10. Vi du: TCP Microservice](#10-vi-du-tcp-microservice)
- [11. Vi du: RabbitMQ Microservice](#11-vi-du-rabbitmq-microservice)
- [12. Cac Transport Layers khac](#12-cac-transport-layers-khac)
- [13. Loi thuong gap](#13-loi-thuong-gap)
- [14. Bai tap](#14-bai-tap)

---

## 1. Microservices Architecture Overview

### Monolithic vs Microservices

**Monolithic (Don khoi):**
```
+------------------------------------------+
|              Ung dung lon                 |
|  +--------+ +--------+ +--------+       |
|  | Users  | | Orders | | Products|      |
|  | Module | | Module | | Module  |      |
|  +--------+ +--------+ +--------+       |
|              1 Database                   |
+------------------------------------------+
```

**Microservices (Vi dich vu):**
```
+----------+     +----------+     +------------+
| Users    |     | Orders   |     | Products   |
| Service  |<--->| Service  |<--->| Service    |
| Port:3001|     | Port:3002|     | Port:3003  |
| DB: users|     | DB: orders|    | DB: products|
+----------+     +----------+     +------------+
      ^                ^                ^
      |                |                |
      v                v                v
+------------------------------------------+
|          API Gateway (Port: 3000)         |
+------------------------------------------+
                    ^
                    |
                Client
```

### Uu diem cua Microservices

| Uu diem | Mo ta |
|---------|-------|
| **Doc lap deploy** | Moi service deploy rieng, khong anh huong nhau |
| **Scalability** | Scale tung service theo nhu cau |
| **Technology diverse** | Moi service co the dung tech stack khac nhau |
| **Fault isolation** | 1 service loi khong lam sap toan bo he thong |
| **Team autonomy** | Moi team phu trach 1 hoac vai service |

### Nhuoc diem

| Nhuoc diem | Mo ta |
|------------|-------|
| **Phuc tap** | Quan ly nhieu service, network calls, distributed transactions |
| **Latency** | Giao tiep qua mang cham hon goi ham truc tiep |
| **Data consistency** | Kho dam bao tinh nhat quan du lieu giua cac service |
| **Monitoring** | Can cong cu monitoring phuc tap (distributed tracing) |
| **Testing** | Integration testing phuc tap hon |

### Cac patterns giao tiep

```
1. Synchronous (Dong bo):
   Client --> Service A --request--> Service B
   Client <-- Service A <--response-- Service B

2. Asynchronous (Bat dong bo):
   Service A --publish event--> Message Broker --deliver--> Service B
                                                        --> Service C
                                                        --> Service D
```

---

## 2. NestJS Microservices Co ban

### Cai dat

```bash
npm install @nestjs/microservices
```

### Tao Microservice don gian

```typescript
// main.ts (Microservice - KHONG phai HTTP server)
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tao microservice thay vi HTTP app
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP, // Giao thuc TCP
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    },
  );

  await app.listen();
  console.log('Microservice dang lang nghe tren port 3001');
}
bootstrap();
```

### So sanh voi HTTP Application

```typescript
// HTTP Application (truyen thong)
const app = await NestFactory.create(AppModule);
await app.listen(3000);
// => Tao HTTP server, lang nghe HTTP requests

// Microservice Application
const app = await NestFactory.createMicroservice(AppModule, { transport: Transport.TCP });
await app.listen();
// => Tao TCP server, lang nghe messages tu cac service khac
```

---

## 3. Transport Layers

NestJS ho tro nhieu transport layers (lop van chuyen) de cac microservices giao tiep voi nhau.

### Tong quan cac Transport Layers

| Transport | Dung khi | Uu diem | Nhuoc diem |
|-----------|----------|---------|------------|
| **TCP** | Giao tiep noi bo don gian | Don gian, nhanh | Khong co message queue |
| **Redis** | Pub/Sub don gian | Nhanh, de setup | Khong dam bao delivery |
| **NATS** | High-performance messaging | Cuc nhanh, nhe | It tinh nang advanced |
| **MQTT** | IoT, thiet bi nhe | Nhe, tiet kiem bandwidth | Khong phu hop cho data lon |
| **RabbitMQ** | Enterprise messaging | Tin cay, nhieu tinh nang | Setup phuc tap hon |
| **Kafka** | Event streaming lon | Throughput cuc cao, luu tru | Phuc tap, can cluster |
| **gRPC** | Inter-service communication | Type-safe, nhanh (HTTP/2) | Can dinh nghia .proto |

### Cai dat tung Transport

```bash
# TCP - khong can cai them gi

# Redis
npm install ioredis

# NATS
npm install nats

# MQTT
npm install mqtt

# RabbitMQ
npm install amqplib amqp-connection-manager

# Kafka
npm install kafkajs

# gRPC
npm install @grpc/grpc-js @grpc/proto-loader
```

### Cau hinh tung Transport

```typescript
// TCP
{
  transport: Transport.TCP,
  options: {
    host: '127.0.0.1',
    port: 3001,
  },
}

// Redis
{
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
    password: 'redis_password',
  },
}

// RabbitMQ
{
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://user:password@localhost:5672'],
    queue: 'my_queue',
    queueOptions: {
      durable: true, // Queue ton tai khi RabbitMQ restart
    },
  },
}

// Kafka
{
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'my-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'my-consumer-group',
    },
  },
}

// gRPC
{
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
    url: '0.0.0.0:5000',
  },
}
```

---

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

## 5. Client Proxy

Client proxy la cach mot service **gui** message den microservice khac.

### Dang ky ClientsModule

```typescript
// app.module.ts (API Gateway hoac service gui message)
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',     // Ten dang ky (injection token)
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### Su dung ClientProxy trong Service/Controller

```typescript
// api-gateway.controller.ts
import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('api')
export class ApiGatewayController {
  constructor(
    @Inject('MATH_SERVICE') private mathClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  // === Request-Response (send) ===
  @Get('sum')
  async getSum() {
    // send() gui message va CHO response
    // Tra ve Observable, dung firstValueFrom de chuyen thanh Promise
    const result = await firstValueFrom(
      this.mathClient.send<number>('sum', [1, 2, 3, 4, 5]),
    );

    return { sum: result }; // { sum: 15 }
  }

  @Get('multiply')
  async multiply() {
    const result = await firstValueFrom(
      this.mathClient.send<number>({ cmd: 'multiply' }, { a: 5, b: 3 }),
    );

    return { result }; // { result: 15 }
  }

  // === Event-based (emit) ===
  @Post('users')
  async createUser(@Body() userData: any) {
    // Tao user trong database local truoc
    const user = await this.usersService.create(userData);

    // Emit event - KHONG cho response
    this.notificationClient.emit('user_created', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }
}
```

### ClientsModule.registerAsync

Su dung khi can doc config tu ConfigService:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ORDERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL')],
            queue: configService.get('ORDERS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}
```

### send() vs emit()

```typescript
// send() - Request-Response
// Client gui message va CHO response
const result = await firstValueFrom(
  this.client.send('pattern', payload),
);
// result = gia tri tra ve tu @MessagePattern handler

// emit() - Event-based
// Client gui event va KHONG cho response
this.client.emit('event_name', payload);
// Khong co gia tri tra ve
```

---

## 6. Hybrid Application

Hybrid application la ung dung ket hop **ca HTTP server va Microservice** trong cung mot NestJS app.

### Tao Hybrid Application

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tao HTTP application truoc
  const app = await NestFactory.create(AppModule);

  // Them microservice listener
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  // Co the them nhieu microservice transports
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: { durable: true },
    },
  });

  // Khoi dong tat ca microservices
  await app.startAllMicroservices();

  // Khoi dong HTTP server
  await app.listen(3000);

  console.log('HTTP server: http://localhost:3000');
  console.log('TCP Microservice: port 3001');
  console.log('RabbitMQ Microservice: orders_queue');
}
bootstrap();
```

### Controller cho Hybrid App

```typescript
// orders.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // === HTTP Endpoints ===

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // === Microservice Handlers ===
  // Cung controller co the xu ly ca HTTP va microservice messages!

  @MessagePattern({ cmd: 'get_orders_by_user' })
  getOrdersByUser(@Payload() data: { userId: number }) {
    return this.ordersService.findByUserId(data.userId);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() data: { orderId: number }) {
    await this.ordersService.updateStatus(data.orderId, 'paid');
  }
}
```

### Architecture vi du

```
+------------------+     HTTP      +------------------+
|    Client/       |  :3000        |    Orders App    |
|    Frontend      | ------------> | (Hybrid)         |
+------------------+               |                  |
                                   | HTTP Controller  |
+------------------+     TCP       | +                |
|    Users         |  :3001        | MS Handlers      |
|    Service       | <-----------> |                  |
+------------------+               +------------------+
                                          |
+------------------+    RabbitMQ          |
|    Payment       |  orders_queue        |
|    Service       | <------------------->|
+------------------+                      |
                                          |
+------------------+    RabbitMQ          |
|    Notification  |  notifications_queue  |
|    Service       | <--------------------+
+------------------+
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

---

## 8. Serialization va Deserialization

### Mac dinh

NestJS tu dong serialize/deserialize JSON khi gui/nhan messages. Nhung ban co the tuy chinh:

### Custom Serializer

```typescript
// serializers/custom.serializer.ts
import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class CustomSerializer implements Serializer {
  private readonly logger = new Logger(CustomSerializer.name);

  serialize(value: any): OutgoingResponse {
    this.logger.debug(`Serializing: ${JSON.stringify(value)}`);

    // Them metadata vao message
    return {
      data: value,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        source: process.env.SERVICE_NAME || 'unknown',
      },
    };
  }
}
```

### Custom Deserializer

```typescript
// deserializers/custom.deserializer.ts
import { Deserializer, IncomingRequest } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class CustomDeserializer implements Deserializer {
  private readonly logger = new Logger(CustomDeserializer.name);

  deserialize(value: any): IncomingRequest {
    this.logger.debug(`Deserializing: ${JSON.stringify(value)}`);

    // Extract data tu message format tuy chinh
    if (value.data && value.metadata) {
      this.logger.debug(`Message from: ${value.metadata.source}`);
      return {
        pattern: value.pattern,
        data: value.data,
      };
    }

    return value;
  }
}
```

### Ap dung Serializer/Deserializer

```typescript
// main.ts (Microservice)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.TCP,
  options: {
    host: '0.0.0.0',
    port: 3001,
    serializer: new CustomSerializer(),
    deserializer: new CustomDeserializer(),
  },
});

// Client registration
ClientsModule.register([
  {
    name: 'MATH_SERVICE',
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3001,
      serializer: new CustomSerializer(),
      deserializer: new CustomDeserializer(),
    },
  },
]);
```

---

## 9. Exception Filters trong Microservices

Exception handling trong microservices khac voi HTTP.

### RPC Exception

```typescript
import { RpcException } from '@nestjs/microservices';

@MessagePattern({ cmd: 'find_user' })
async findUser(@Payload() data: { id: number }) {
  const user = await this.usersService.findOne(data.id);

  if (!user) {
    // Dung RpcException thay vi HttpException
    throw new RpcException('User khong ton tai');
  }

  // Hoac nem voi object
  if (!user.isActive) {
    throw new RpcException({
      statusCode: 403,
      message: 'Tai khoan da bi khoa',
      error: 'Forbidden',
    });
  }

  return user;
}
```

### Custom RPC Exception Filter

```typescript
// filters/rpc-exception.filter.ts
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();

    // Log error
    console.error('RPC Exception:', error);

    // Format error response
    const errorResponse = typeof error === 'string'
      ? { message: error, statusCode: 500 }
      : { ...error };

    return throwError(() => ({
      ...errorResponse,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

### Ap dung Exception Filter

```typescript
// Tren handler
@UseFilters(new CustomRpcExceptionFilter())
@MessagePattern({ cmd: 'find_user' })
findUser(@Payload() data: { id: number }) {}

// Tren controller
@UseFilters(new CustomRpcExceptionFilter())
@Controller()
export class UsersController {}

// Global
const app = await NestFactory.createMicroservice(AppModule, options);
app.useGlobalFilters(new CustomRpcExceptionFilter());
```

### Xu ly exception ben phia Client

```typescript
// API Gateway - Xu ly loi tu microservice
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await firstValueFrom(
        this.usersClient.send({ cmd: 'find_user' }, { id: +id }),
      );
      return user;
    } catch (error) {
      // error la gia tri tu throwError trong microservice
      if (error.statusCode === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Loi khi goi Users Service');
    }
  }
}
```

---

## 10. Vi du: TCP Microservice

### Cau truc du an

```
project/
├── api-gateway/          <-- HTTP server (port 3000)
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── main.ts
│   └── package.json
│
├── users-service/        <-- TCP microservice (port 3001)
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── main.ts
│   └── package.json
│
└── orders-service/       <-- TCP microservice (port 3002)
    ├── src/
    │   ├── app.module.ts
    │   ├── orders.controller.ts
    │   ├── orders.service.ts
    │   └── main.ts
    └── package.json
```

### Users Service (Microservice)

```typescript
// users-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3001,
      },
    },
  );
  await app.listen();
  console.log('Users Microservice is running on port 3001');
}
bootstrap();
```

```typescript
// users-service/src/users.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.findAll();
  }

  @MessagePattern({ cmd: 'get_user' })
  getUser(@Payload() data: { id: number }) {
    const user = this.usersService.findOne(data.id);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `Khong tim thay user voi id ${data.id}`,
      });
    }
    return user;
  }

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() data: { name: string; email: string }) {
    return this.usersService.create(data);
  }

  @MessagePattern({ cmd: 'validate_user' })
  validateUser(@Payload() data: { email: string; password: string }) {
    return this.usersService.validate(data.email, data.password);
  }

  @EventPattern('order_created')
  handleOrderCreated(@Payload() data: { userId: number; orderId: number }) {
    console.log(`User ${data.userId} da tao don hang ${data.orderId}`);
    this.usersService.incrementOrderCount(data.userId);
  }
}
```

```typescript
// users-service/src/users.service.ts
import { Injectable } from '@nestjs/common';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  orderCount: number;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Nguyen Van A', email: 'a@test.com', password: 'pass123', orderCount: 0 },
    { id: 2, name: 'Tran Thi B', email: 'b@test.com', password: 'pass456', orderCount: 0 },
  ];
  private nextId = 3;

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: number): Omit<User, 'password'> | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  create(data: { name: string; email: string }): Omit<User, 'password'> {
    const newUser: User = {
      id: this.nextId++,
      ...data,
      password: 'default_password',
      orderCount: 0,
    };
    this.users.push(newUser);
    const { password, ...result } = newUser;
    return result;
  }

  validate(email: string, password: string): { valid: boolean; userId?: number } {
    const user = this.users.find((u) => u.email === email && u.password === password);
    return user ? { valid: true, userId: user.id } : { valid: false };
  }

  incrementOrderCount(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) user.orderCount++;
  }
}
```

### API Gateway (HTTP Server)

```typescript
// api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('API Gateway is running on http://localhost:3000');
}
bootstrap();
```

```typescript
// api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3001 },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3002 },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

```typescript
// api-gateway/src/app.controller.ts
import {
  Controller, Get, Post, Param, Body, Inject,
  NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { throwError, TimeoutError } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) {}

  @Get('users')
  async getUsers() {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'get_users' }, {}).pipe(
          timeout(5000), // Timeout 5 giay
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new Error('Users Service timeout'));
            }
            return throwError(() => err);
          }),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException('Khong the ket noi den Users Service');
    }
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'get_user' }, { id: +id }),
      );
    } catch (error) {
      if (error?.statusCode === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Loi tu Users Service');
    }
  }

  @Post('users')
  async createUser(@Body() data: { name: string; email: string }) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'create_user' }, data),
    );
  }
}
```

---

## 11. Vi du: RabbitMQ Microservice

### Cai dat RabbitMQ

```bash
# Chay RabbitMQ bang Docker
docker run -d --hostname rabbit --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management

# Management UI: http://localhost:15672 (guest/guest)

# Cai dat package
npm install amqplib amqp-connection-manager
```

### Order Service (RabbitMQ Microservice)

```typescript
// orders-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'orders_queue',
        queueOptions: {
          durable: true, // Queue van ton tai khi RabbitMQ restart
        },
        noAck: false, // Bat buoc acknowledge message (dam bao xu ly xong)
        prefetchCount: 1, // Xu ly 1 message tai 1 thoi diem
      },
    },
  );

  await app.listen();
  console.log('Orders Microservice (RabbitMQ) is running');
}
bootstrap();
```

```typescript
// orders-service/src/orders.controller.ts
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('create_order')
  async createOrder(
    @Payload() data: { userId: number; items: any[]; total: number },
    @Ctx() context: RmqContext,
  ) {
    // Lay reference den channel va message goc
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const order = await this.ordersService.create(data);

      // Acknowledge message (xac nhan da xu ly xong)
      channel.ack(originalMsg);

      return order;
    } catch (error) {
      // Reject message va khong requeue (gui den dead letter queue)
      channel.nack(originalMsg, false, false);
      throw error;
    }
  }

  @MessagePattern('get_orders')
  async getOrders(
    @Payload() data: { userId?: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const orders = data.userId
      ? await this.ordersService.findByUserId(data.userId)
      : await this.ordersService.findAll();

    channel.ack(originalMsg);
    return orders;
  }

  @EventPattern('payment_received')
  async handlePaymentReceived(
    @Payload() data: { orderId: number; amount: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.ordersService.updatePaymentStatus(data.orderId, 'paid');
      console.log(`Don hang #${data.orderId} da thanh toan ${data.amount} VND`);
      channel.ack(originalMsg);
    } catch (error) {
      console.error(`Loi xu ly payment cho don hang #${data.orderId}:`, error);
      // Requeue message de thu lai
      channel.nack(originalMsg, false, true);
    }
  }
}
```

```typescript
// orders-service/src/orders.service.ts
import { Injectable } from '@nestjs/common';

interface Order {
  id: number;
  userId: number;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private nextId = 1;

  async create(data: {
    userId: number;
    items: any[];
    total: number;
  }): Promise<Order> {
    const order: Order = {
      id: this.nextId++,
      ...data,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orders;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  async updatePaymentStatus(orderId: number, status: string): Promise<void> {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.paymentStatus = status;
      if (status === 'paid') {
        order.status = 'confirmed';
      }
    }
  }
}
```

### API Gateway ket noi RabbitMQ

```typescript
// api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'orders_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
})
export class AppModule {}
```

```typescript
// api-gateway/src/orders.controller.ts
import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() data: {
    userId: number;
    items: { name: string; quantity: number; price: number }[];
  }) {
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await firstValueFrom(
      this.ordersClient.send('create_order', { ...data, total }),
    );

    return order;
  }

  @Get()
  async getOrders() {
    return firstValueFrom(
      this.ordersClient.send('get_orders', {}),
    );
  }

  @Post(':id/pay')
  async payOrder(@Param('id') id: string, @Body() data: { amount: number }) {
    // Emit event - khong cho response
    this.ordersClient.emit('payment_received', {
      orderId: +id,
      amount: data.amount,
    });

    return { message: `Dang xu ly thanh toan cho don hang #${id}` };
  }
}
```

---

## 12. Cac Transport Layers khac

### Redis Transport

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
    retryAttempts: 5,
    retryDelay: 1000,
  },
});

// Client
ClientsModule.register([{
  name: 'CACHE_SERVICE',
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
}]);
```

### Kafka Transport

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'orders-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'orders-consumer',
    },
  },
});

// Controller
@Controller()
export class OrdersController {
  @MessagePattern('orders.created') // Kafka topic
  handleOrderCreated(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();

    console.log(`Topic: ${topic}, Partition: ${partition}`);
    console.log('Message:', message);

    return { processed: true };
  }
}
```

### gRPC Transport

```protobuf
// hero/hero.proto
syntax = "proto3";

package hero;

service HeroService {
  rpc FindOne (HeroById) returns (Hero);
  rpc FindAll (Empty) returns (HeroList);
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
  string power = 3;
}

message HeroList {
  repeated Hero heroes = 1;
}

message Empty {}
```

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
    url: '0.0.0.0:5000',
  },
});

// Controller
@Controller()
export class HeroController {
  @GrpcMethod('HeroService', 'FindOne')
  findOne(data: { id: number }): { id: number; name: string; power: string } {
    return { id: data.id, name: 'Son Goku', power: 'Kamehameha' };
  }

  @GrpcMethod('HeroService', 'FindAll')
  findAll(): { heroes: any[] } {
    return {
      heroes: [
        { id: 1, name: 'Son Goku', power: 'Kamehameha' },
        { id: 2, name: 'Naruto', power: 'Rasengan' },
      ],
    };
  }
}
```

---

## 13. Loi thuong gap

### Loi 1: Quen ket noi client truoc khi gui message

```typescript
// SAI - Co the gui message khi client chua ket noi
@Post()
async create(@Body() data: any) {
  return firstValueFrom(this.client.send('create', data));
}

// DUNG - Dam bao client da ket noi
// NestJS tu dong ket noi khi module duoc khoi tao,
// nhung ban co the kiem tra:
async onModuleInit() {
  await this.client.connect();
}
```

### Loi 2: Khong xu ly timeout

```typescript
// SAI - Cho vo han neu microservice khong phan hoi
const result = await firstValueFrom(this.client.send('cmd', data));

// DUNG - Luon co timeout
import { timeout, catchError } from 'rxjs/operators';

const result = await firstValueFrom(
  this.client.send('cmd', data).pipe(
    timeout(5000),
    catchError((err) => {
      throw new InternalServerErrorException('Service khong phan hoi');
    }),
  ),
);
```

### Loi 3: Khong ack/nack message trong RabbitMQ

```typescript
// SAI - Message se bi treo trong queue
@MessagePattern('process')
process(@Payload() data: any) {
  // Xu ly nhung khong ack
  return data;
}

// DUNG - Luon ack hoac nack
@MessagePattern('process')
process(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  try {
    const result = processData(data);
    channel.ack(originalMsg);
    return result;
  } catch (error) {
    channel.nack(originalMsg, false, false); // Khong requeue
    throw new RpcException(error.message);
  }
}
```

### Loi 4: Dung HttpException trong microservice

```typescript
// SAI - HttpException khong duoc transport dung cach trong microservices
throw new NotFoundException('User not found');

// DUNG - Dung RpcException
throw new RpcException({
  statusCode: 404,
  message: 'User not found',
});
```

### Loi 5: Khong xu ly loi khi microservice chua khoi dong

```typescript
// SAI - App se crash neu microservice chua chay
const result = await firstValueFrom(this.client.send('cmd', {}));

// DUNG - Xu ly gracefully
try {
  const result = await firstValueFrom(
    this.client.send('cmd', {}).pipe(timeout(3000)),
  );
  return result;
} catch (error) {
  // Fallback hoac tra ve loi de hieu
  console.error('Microservice khong kha dung:', error.message);
  throw new ServiceUnavailableException('Dich vu tam thoi khong kha dung');
}
```

---

## 14. Bai tap

### Bai tap 1: TCP Microservices co ban
Tao 2 microservice giao tiep qua TCP:
- **Math Service** (port 3001): Cac phep tinh (sum, multiply, divide, factorial)
- **API Gateway** (port 3000): HTTP API goi den Math Service

**Yeu cau:**
- Su dung `@MessagePattern()` cho moi phep tinh
- Xu ly division by zero
- Co timeout 3 giay cho moi request
- Test voi curl hoac Postman

### Bai tap 2: Event-driven voi RabbitMQ
Tao he thong e-commerce don gian voi 3 service:
- **Orders Service**: Tao va quan ly don hang
- **Inventory Service**: Quan ly ton kho
- **Notification Service**: Gui thong bao

Khi tao don hang:
1. Orders Service tao order va emit event `order_created`
2. Inventory Service giam so luong ton kho
3. Notification Service gui email xac nhan

**Yeu cau:**
- Su dung RabbitMQ lam message broker
- Xu ly truong hop het hang (rollback order)
- Implement retry mechanism

### Bai tap 3: Hybrid Application
Tao mot ung dung NestJS hybrid:
- HTTP endpoints cho CRUD products
- TCP microservice handler cho inter-service communication
- RabbitMQ handler cho async events

**Yeu cau:**
- Cung mot controller xu ly ca HTTP va microservice
- Test ca 3 loai communication

### Bai tap 4: gRPC Service
Tao gRPC service cho User Management:
- Dinh nghia `.proto` file
- Implement server side (NestJS microservice)
- Implement client side (API Gateway)
- CRUD operations: Create, Read, Update, Delete users

### Bai tap 5: Microservices Architecture hoan chinh
Thiet ke va xay dung he thong bao gom:
1. **API Gateway** (HTTP, port 3000)
2. **Auth Service** (TCP, port 3001) - Xac thuc, JWT
3. **Users Service** (TCP, port 3002) - Quan ly nguoi dung
4. **Products Service** (TCP, port 3003) - Quan ly san pham
5. **Orders Service** (RabbitMQ) - Quan ly don hang
6. **Notification Service** (RabbitMQ) - Gui thong bao

**Yeu cau:**
- API Gateway authenticate request roi chuyen tiep den service tuong ung
- Orders emit events de Notification xu ly
- Xu ly loi va timeout cho moi service
- Docker Compose de chay toan bo he thong

---

## Tai lieu tham khao

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [NestJS TCP Transport](https://docs.nestjs.com/microservices/basics)
- [NestJS RabbitMQ](https://docs.nestjs.com/microservices/rabbitmq)
- [NestJS Kafka](https://docs.nestjs.com/microservices/kafka)
- [NestJS gRPC](https://docs.nestjs.com/microservices/grpc)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
