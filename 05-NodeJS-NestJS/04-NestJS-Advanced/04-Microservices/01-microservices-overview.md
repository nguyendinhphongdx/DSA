# Microservices Architecture Overview va NestJS Microservices Co ban

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
