# useClass, useValue, useFactory, useExisting

## 4. Custom Providers

NestJS ho tro 4 cach tao custom providers: `useClass`, `useValue`, `useFactory`, `useExisting`.

### 4.1. useClass - Provider dung class

```typescript
// Cach viet day du (tuong duong shorthand)
@Module({
  providers: [
    {
      provide: CatsService,      // Token (key)
      useClass: CatsService,     // Class implementation
    },
  ],
})
export class CatsModule {}

// Shorthand (NestJS tu hieu):
@Module({
  providers: [CatsService],
})
export class CatsModule {}
```

**Use case: Thay doi implementation dua tren environment:**

```typescript
// Interface/Abstract class
export abstract class ConfigService {
  abstract get(key: string): string;
}

// Implementation cho development
@Injectable()
export class DevelopmentConfigService extends ConfigService {
  get(key: string): string {
    return process.env[key] || 'dev-default';
  }
}

// Implementation cho production
@Injectable()
export class ProductionConfigService extends ConfigService {
  get(key: string): string {
    // Doc tu secret manager (AWS Secrets Manager, Vault...)
    return process.env[key];
  }
}

// Module chon implementation dua tren environment
@Module({
  providers: [
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? ProductionConfigService
          : DevelopmentConfigService,
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}

// Su dung:
@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {
    // Tu dong nhan dung implementation dua tren environment
  }
}
```

### 4.2. useValue - Provider dung gia tri cu the

```typescript
// Dung cho: constants, mock objects, external libraries

// Constant values
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: 'my-secret-api-key-123',
    },
    {
      provide: 'APP_CONFIG',
      useValue: {
        appName: 'My NestJS App',
        version: '1.0.0',
        port: 3000,
        isProduction: false,
      },
    },
    {
      provide: 'ALLOWED_ORIGINS',
      useValue: ['http://localhost:3000', 'https://myapp.com'],
    },
  ],
})
export class AppModule {}

// Inject bang @Inject() decorator voi token string
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_KEY') private readonly apiKey: string,
    @Inject('APP_CONFIG') private readonly config: AppConfig,
    @Inject('ALLOWED_ORIGINS') private readonly origins: string[],
  ) {
    console.log(`API Key: ${this.apiKey}`);
    console.log(`App: ${this.config.appName}`);
  }
}
```

**Mock object cho testing:**

```typescript
// Mock service cho testing
const mockCatsService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Tom' }),
  create: jest.fn().mockResolvedValue({ id: 1, name: 'Tom' }),
};

// Trong test module
const module = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService, // Thay the real service bang mock
    },
  ],
}).compile();
```

### 4.3. useFactory - Provider dung factory function

Factory cho phep tao provider **dong** dua tren dependencies khac.

```typescript
// Factory don gian
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const connection = await createDatabaseConnection({
          host: 'localhost',
          port: 5432,
          database: 'myapp',
        });
        return connection;
      },
    },
  ],
})
export class DatabaseModule {}

// Factory voi dependencies (inject)
@Module({
  providers: [
    ConfigService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createDatabaseConnection({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
        });
        return connection;
      },
      inject: [ConfigService], // Inject ConfigService vao factory
    },
  ],
})
export class DatabaseModule {}
```

**Vi du phuc tap hon:**

```typescript
// Factory tao logger dua tren environment
@Module({
  providers: [
    ConfigService,
    {
      provide: 'LOGGER',
      useFactory: (configService: ConfigService) => {
        const environment = configService.get('NODE_ENV');

        if (environment === 'production') {
          // Production: dung structured logging (JSON)
          return new ProductionLogger({
            level: 'warn',
            format: 'json',
            transport: 'file',
          });
        }

        if (environment === 'test') {
          // Test: silent logger
          return new SilentLogger();
        }

        // Development: console logger voi colors
        return new DevelopmentLogger({
          level: 'debug',
          format: 'pretty',
          transport: 'console',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['LOGGER'],
})
export class LoggerModule {}

// Su dung:
@Injectable()
export class UsersService {
  constructor(@Inject('LOGGER') private readonly logger: Logger) {
    this.logger.info('UsersService initialized');
  }
}
```

### 4.4. useExisting - Alias Provider

`useExisting` tao alias cho mot provider da ton tai. Hai tokens se tro den cung mot instance.

```typescript
// Tao alias: 'AliasedLoggerService' tro den cung instance voi LoggerService
@Module({
  providers: [
    LoggerService,
    {
      provide: 'AliasedLoggerService',
      useExisting: LoggerService,
      // AliasedLoggerService va LoggerService la CUNG MOT instance
    },
  ],
  exports: [LoggerService, 'AliasedLoggerService'],
})
export class LoggerModule {}
```

**Use case thuc te: Backward compatibility**

```typescript
// Khi rename service, giu lai ten cu cho backward compatibility
@Module({
  providers: [
    NewUsersService,
    {
      provide: 'OldUsersService', // Ten cu
      useExisting: NewUsersService, // Tro den service moi
    },
  ],
})
export class UsersModule {}

// Code cu van hoat dong:
@Injectable()
export class OldController {
  constructor(@Inject('OldUsersService') private usersService: any) {}
}

// Code moi dung service moi:
@Injectable()
export class NewController {
  constructor(private readonly usersService: NewUsersService) {}
}
```

### 4.5. Injection Tokens

Khi dung string token, nen tao constants de tranh typo:

```typescript
// === constants/injection-tokens.ts ===
export const INJECTION_TOKENS = {
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  CACHE_MANAGER: 'CACHE_MANAGER',
  LOGGER: 'LOGGER',
  CONFIG: 'CONFIG',
  MAIL_TRANSPORT: 'MAIL_TRANSPORT',
} as const;

// Hoac dung Symbol (unique, khong bi trung):
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const CACHE_MANAGER = Symbol('CACHE_MANAGER');
export const LOGGER = Symbol('LOGGER');

// Su dung:
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => createConnection(),
    },
  ],
})
export class DatabaseModule {}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}
}
```
