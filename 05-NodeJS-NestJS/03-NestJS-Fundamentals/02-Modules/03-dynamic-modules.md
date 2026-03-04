# Dynamic modules (forRoot, forRootAsync, forFeature)

## 6. Dynamic Modules

### 6.1. Khai niem

**Dynamic modules** cho phep ban tao modules co the duoc cau hinh (configurable) tai thoi diem import. Day la cach de tao modules tai su dung ma co the nhan cac options khac nhau.

Co 3 pattern chinh:
- **`forRoot()`** - Cau hinh module o cap root (singleton), thuong dung cho ket noi database, config chung
- **`forRootAsync()`** - Giong `forRoot()` nhung ho tro async configuration
- **`forFeature()`** - Cau hinh module o cap feature, thuong dung cho entities/repositories cu the

### 6.2. forRoot() Pattern

```typescript
// === database/database.module.ts ===
import { Module, DynamicModule } from '@nestjs/common';

export interface DatabaseModuleOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true, // Thuong la global de dung o moi noi
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: async (dbOptions: DatabaseModuleOptions) => {
            // Tao database connection dua tren options
            console.log(`Connecting to ${dbOptions.host}:${dbOptions.port}/${dbOptions.database}`);
            // const connection = await createConnection(dbOptions);
            // return connection;
            return { connected: true, ...dbOptions };
          },
          inject: ['DATABASE_OPTIONS'],
        },
        DatabaseService,
      ],
      exports: ['DATABASE_CONNECTION', DatabaseService],
    };
  }
}

// === database/database.service.ts ===
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_CONNECTION') private connection: any,
  ) {}

  getConnection() {
    return this.connection;
  }
}
```

**Su dung:**

```typescript
// === app.module.ts ===
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'secret',
      database: 'myapp',
    }),
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

### 6.3. forRootAsync() Pattern

`forRootAsync()` cho phep cau hinh bat dong bo, thuong dung khi can doc config tu file, environment variables, hoac external service.

```typescript
// === database/database.module.ts ===
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export interface DatabaseModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
  inject?: any[];
}

@Module({})
export class DatabaseModule {
  // forRoot: cau hinh dong bo (truyen truc tiep options)
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [
        { provide: 'DATABASE_OPTIONS', useValue: options },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }

  // forRootAsync: cau hinh bat dong bo (factory function)
  static forRootAsync(asyncOptions: DatabaseModuleAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      imports: asyncOptions.imports || [],
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
```

**Su dung forRootAsync:**

```typescript
// === app.module.ts ===
@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env file

    // Async configuration - doc tu ConfigService
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

### 6.4. forFeature() Pattern

`forFeature()` dung de dang ky cac thanh phan cu the cho tung feature module, thuong thay trong TypeORM, Mongoose.

```typescript
// === database/database.module.ts ===
@Module({})
export class DatabaseModule {
  // forRoot: thiet lap connection (goi 1 lan o AppModule)
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [
        { provide: 'DATABASE_OPTIONS', useValue: options },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }

  // forFeature: dang ky entities/repositories cho tung module
  static forFeature(entities: Function[]): DynamicModule {
    const repositories = entities.map((entity) => ({
      provide: `${entity.name}Repository`,
      useFactory: (dbService: DatabaseService) => {
        return dbService.getRepository(entity);
      },
      inject: [DatabaseService],
    }));

    return {
      module: DatabaseModule,
      providers: repositories,
      exports: repositories,
    };
  }
}
```

**Su dung forFeature:**

```typescript
// === users/users.module.ts ===
@Module({
  imports: [
    // Dang ky User entity cho module nay
    DatabaseModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// === products/products.module.ts ===
@Module({
  imports: [
    // Dang ky Product, Category entities cho module nay
    DatabaseModule.forFeature([Product, Category]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

### 6.5. Vi du thuc te: Custom CacheModule

```typescript
// === cache/interfaces/cache-options.interface.ts ===
export interface CacheModuleOptions {
  store: 'memory' | 'redis';
  ttl: number; // Time to live (seconds)
  max?: number; // Max items in cache
  redisUrl?: string;
}

// === cache/cache.module.ts ===
import { Module, DynamicModule, Global } from '@nestjs/common';
import { CacheModuleOptions } from './interfaces/cache-options.interface';
import { CacheService } from './cache.service';

@Global()
@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: 'CACHE_OPTIONS',
          useValue: options,
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }

  static forRootAsync(asyncOptions: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<CacheModuleOptions> | CacheModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: CacheModule,
      imports: asyncOptions.imports || [],
      providers: [
        {
          provide: 'CACHE_OPTIONS',
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }
}

// === cache/cache.service.ts ===
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CacheModuleOptions } from './interfaces/cache-options.interface';

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  constructor(
    @Inject('CACHE_OPTIONS') private options: CacheModuleOptions,
  ) {}

  async onModuleInit() {
    console.log(`Cache initialized with store: ${this.options.store}`);
    if (this.options.store === 'redis') {
      // Ket noi Redis...
      console.log(`Connecting to Redis at: ${this.options.redisUrl}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.options.ttl) * 1000;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// === Su dung ===
// app.module.ts
@Module({
  imports: [
    CacheModule.forRoot({
      store: 'memory',
      ttl: 300, // 5 phut
      max: 1000,
    }),
    // Hoac dung forRootAsync:
    // CacheModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (config: ConfigService) => ({
    //     store: config.get('CACHE_STORE') as 'memory' | 'redis',
    //     ttl: config.get<number>('CACHE_TTL'),
    //     redisUrl: config.get('REDIS_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
})
export class AppModule {}
```
