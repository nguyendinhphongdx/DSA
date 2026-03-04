# Transport Layers

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
