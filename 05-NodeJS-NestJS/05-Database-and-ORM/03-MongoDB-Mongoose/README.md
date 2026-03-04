# MongoDB & Mongoose trong NestJS

## Muc luc

- [1. Gioi thieu MongoDB](#1-gioi-thieu-mongodb)
- [2. Cac khai niem co ban](#2-cac-khai-niem-co-ban)
- [3. Cai dat va ket noi](#3-cai-dat-va-ket-noi)
- [4. Schema Definition](#4-schema-definition)
- [5. Prop Options chi tiet](#5-prop-options-chi-tiet)
- [6. CRUD Operations](#6-crud-operations)
- [7. Query Helpers](#7-query-helpers)
- [8. Virtual Properties](#8-virtual-properties)
- [9. Hooks va Middleware](#9-hooks-va-middleware)
- [10. Population - References giua Collections](#10-population---references-giua-collections)
- [11. Aggregation Pipeline](#11-aggregation-pipeline)
- [12. Indexes](#12-indexes)
- [13. Transactions](#13-transactions)
- [14. Common Mistakes](#14-common-mistakes)
- [15. Best Practices](#15-best-practices)
- [16. Bai tap](#16-bai-tap)

---

## 1. Gioi thieu MongoDB

### MongoDB la gi?

MongoDB la mot **NoSQL database** huong tai lieu (document-oriented). Thay vi luu du lieu trong cac bang (tables) nhu SQL, MongoDB luu du lieu duoi dang **documents** (tai lieu) co cau truc linh hoat giong JSON.

### Tai sao chon MongoDB?

- **Schema linh hoat**: Moi document trong cung mot collection co the co cau truc khac nhau
- **Horizontal Scaling**: Ho tro sharding de phan tan du lieu tren nhieu server
- **Hieu suat cao**: Toi uu cho cac thao tac doc/ghi voi du lieu lon
- **JSON-native**: Du lieu luu tru duoi dang BSON (Binary JSON), phu hop voi JavaScript/TypeScript
- **Rich Query Language**: Ho tro query phuc tap, aggregation pipeline

### MongoDB vs SQL Database

| Tinh nang | MongoDB | SQL (PostgreSQL) |
|-----------|---------|-------------------|
| Du lieu | Documents (BSON) | Rows trong Tables |
| Schema | Linh hoat (schemaless) | Co dinh (strict schema) |
| Quan he | References / Embedded | Foreign Keys |
| Scaling | Horizontal (Sharding) | Vertical |
| Transactions | Ho tro tu v4.0 | Built-in |
| Use case | Blog, CMS, IoT, Realtime | Banking, ERP, quan he phuc tap |

---

## 2. Cac khai niem co ban

### Document

Document la don vi du lieu co ban nhat trong MongoDB, tuong tu nhu mot row trong SQL. Document duoc luu tru duoi dang **BSON** (Binary JSON).

```json
{
  "_id": ObjectId("64a1b2c3d4e5f6789012345"),
  "name": "Nguyen Van A",
  "email": "nguyenvana@email.com",
  "age": 25,
  "address": {
    "city": "Ha Noi",
    "district": "Cau Giay"
  },
  "hobbies": ["coding", "reading", "gaming"],
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Collection

Collection la nhom cac documents, tuong tu nhu mot table trong SQL. Mot collection co the chua cac documents co cau truc khac nhau.

```
Database: my_blog
  ├── Collection: users
  │     ├── Document: { name: "A", age: 25 }
  │     └── Document: { name: "B", age: 30, phone: "0123..." }
  ├── Collection: posts
  │     └── Document: { title: "Hello", content: "..." }
  └── Collection: comments
        └── Document: { text: "Nice!", userId: ObjectId(...) }
```

### Database

Database la container chua nhieu collections. Mot MongoDB server co the chua nhieu databases.

### BSON (Binary JSON)

BSON la dinh dang nhi phan cua JSON, ho tro them nhieu kieu du lieu:

| Kieu du lieu | Mo ta | Vi du |
|-------------|-------|-------|
| String | Chuoi ky tu | `"Hello World"` |
| Number (Int32, Int64, Double) | So | `42`, `3.14` |
| Boolean | True/False | `true` |
| Date | Ngay thang | `ISODate("2024-01-15")` |
| ObjectId | ID duy nhat 12 bytes | `ObjectId("64a...")` |
| Array | Mang | `["a", "b", "c"]` |
| Object | Object long nhau | `{ city: "HN" }` |
| Binary | Du lieu nhi phan | Anh, file |
| Null | Gia tri null | `null` |
| Regex | Bieu thuc chinh quy | `/pattern/i` |

### ObjectId

ObjectId la kieu du lieu dac biet cua MongoDB, duoc tu dong tao cho truong `_id`. No co do dai 12 bytes bao gom:

- 4 bytes: Timestamp (thoi gian tao)
- 5 bytes: Random value
- 3 bytes: Incrementing counter

```
ObjectId("64a1b2c3d4e5f6789012345")
         |------||--------||-----|
         Timestamp  Random   Counter
```

---

## 3. Cai dat va ket noi

### Cai dat packages

```bash
# Cai dat Mongoose va NestJS Mongoose module
npm install @nestjs/mongoose mongoose

# Cai dat types (neu can)
npm install -D @types/mongoose
```

### Ket noi co ban

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/my_database'),
  ],
})
export class AppModule {}
```

### Ket noi voi options

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/my_database', {
      // Connection options
      autoIndex: true,           // Tu dong tao index
      maxPoolSize: 10,           // So ket noi toi da trong pool
      serverSelectionTimeoutMS: 5000, // Timeout chon server
      socketTimeoutMS: 45000,    // Timeout socket
      family: 4,                 // Su dung IPv4
    }),
  ],
})
export class AppModule {}
```

### Ket noi voi ConfigModule (khuyen nghi)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        // Cac options khac
        autoIndex: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

```env
# .env
MONGODB_URI=mongodb://localhost:27017/my_database
NODE_ENV=development
```

### Ket noi nhieu databases

```typescript
// app.module.ts
@Module({
  imports: [
    // Database chinh
    MongooseModule.forRoot('mongodb://localhost:27017/primary_db', {
      connectionName: 'primary',
    }),
    // Database thu hai
    MongooseModule.forRoot('mongodb://localhost:27017/secondary_db', {
      connectionName: 'secondary',
    }),
  ],
})
export class AppModule {}

// Trong feature module, chi dinh connection name
@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'primary',   // Ten connection
    ),
    MongooseModule.forFeature(
      [{ name: Log.name, schema: LogSchema }],
      'secondary',  // Ten connection
    ),
  ],
})
export class UsersModule {}
```

### Su kien ket noi (Connection Events)

```typescript
// database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({})
export class DatabaseModule implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    this.connection.on('connected', () => {
      console.log('MongoDB da ket noi thanh cong');
    });

    this.connection.on('disconnected', () => {
      console.log('MongoDB da ngat ket noi');
    });

    this.connection.on('error', (error) => {
      console.error('MongoDB loi ket noi:', error);
    });
  }
}
```

---

## 4. Schema Definition

### Schema co ban

```typescript
// schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Dinh nghia type cho document
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age: number;
}

// Tao schema tu class
export const UserSchema = SchemaFactory.createForClass(User);
```

### Schema voi day du options

```typescript
// schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({
  timestamps: true,           // Tu dong them createdAt, updatedAt
  collection: 'blog_posts',   // Ten collection (mac dinh la ten class + 's')
  toJSON: {
    virtuals: true,           // Bao gom virtual properties khi chuyen JSON
    transform: (doc, ret) => {
      delete ret.__v;         // Xoa truong __v
      ret.id = ret._id;      // Them truong id
      delete ret._id;        // Xoa truong _id
      return ret;
    },
  },
  toObject: { virtuals: true },
})
export class Post {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  author: MongooseSchema.Types.ObjectId;

  // timestamps: true se tu dong them createdAt va updatedAt
}

export const PostSchema = SchemaFactory.createForClass(Post);
```

### Nested Schema (Schema long nhau)

```typescript
// schemas/address.schema.ts - Sub-document schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // Khong tao _id cho sub-document
export class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop()
  zipCode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// schemas/user.schema.ts - Su dung nested schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Address, AddressSchema } from './address.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  // Nested object don
  @Prop({ type: AddressSchema })
  address: Address;

  // Mang cac nested objects
  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Dang ky Schema trong Module

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      // Co the dang ky nhieu schema
      // { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 5. Prop Options chi tiet

### Tong hop tat ca @Prop() options

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  // === REQUIRED: Bat buoc phai co gia tri ===
  @Prop({ required: true })
  name: string;

  // Required voi custom message
  @Prop({ required: [true, 'Gia san pham la bat buoc'] })
  price: number;

  // === DEFAULT: Gia tri mac dinh ===
  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now }) // Ham, khong phai Date.now()
  createdAt: Date;

  @Prop({ default: () => [] }) // Factory function cho mang/object
  tags: string[];

  // === UNIQUE: Gia tri duy nhat ===
  @Prop({ unique: true })
  sku: string;

  // === INDEX: Tao index ===
  @Prop({ index: true })
  category: string;

  // === ENUM: Chi chap nhan cac gia tri trong danh sach ===
  @Prop({
    enum: ['electronics', 'clothing', 'food', 'books'],
    default: 'electronics',
  })
  type: string;

  // Enum voi custom message
  @Prop({
    enum: {
      values: ['small', 'medium', 'large'],
      message: 'Size {VALUE} khong hop le. Chi chap nhan: small, medium, large',
    },
  })
  size: string;

  // === MIN / MAX: Gia tri nho nhat / lon nhat cho Number va Date ===
  @Prop({ min: 0 })
  quantity: number;

  @Prop({ max: 100 })
  discount: number;

  @Prop({ min: [0, 'Gia phai >= 0'], max: [999999, 'Gia phai <= 999999'] })
  salePrice: number;

  // === MINLENGTH / MAXLENGTH: Do dai chuoi ===
  @Prop({ minlength: 3, maxlength: 100 })
  description: string;

  // === TRIM: Tu dong xoa khoang trang dau cuoi ===
  @Prop({ trim: true })
  title: string;

  // === LOWERCASE / UPPERCASE ===
  @Prop({ lowercase: true })
  email: string;

  @Prop({ uppercase: true })
  code: string;

  // === MATCH: Regex validation ===
  @Prop({ match: /^[a-zA-Z0-9]+$/ })
  slug: string;

  // === IMMUTABLE: Khong cho phep thay doi sau khi tao ===
  @Prop({ immutable: true })
  createdBy: string;

  // === SELECT: Mac dinh co hien thi trong query khong ===
  @Prop({ select: false }) // Mac dinh an, phai dung .select('+password')
  password: string;

  // === REF: Reference den collection khac ===
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  seller: MongooseSchema.Types.ObjectId;

  // Mang references
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Review' })
  reviews: MongooseSchema.Types.ObjectId[];

  // === TYPE: Chi dinh kieu du lieu cu the ===
  @Prop({ type: Map, of: String })
  metadata: Map<string, string>;

  @Prop({ type: [Number] })
  ratings: number[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  extraData: any; // Chap nhan bat ky kieu gi

  // === VALIDATE: Custom validation ===
  @Prop({
    validate: {
      validator: (v: number) => v >= 0 && v <= 5,
      message: 'Rating phai tu 0 den 5',
    },
  })
  averageRating: number;

  // Async validator
  @Prop({
    validate: {
      validator: async function(v: string) {
        // Kiem tra gia tri khong trung
        const count = await this.constructor.countDocuments({ sku: v });
        return count === 0;
      },
      message: 'SKU da ton tai',
    },
  })
  uniqueCode: string;

  // === ALIAS: Ten khac cho truong ===
  @Prop({ alias: 'qty' })
  remainingQuantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

### Vi du toan dien ve @Prop() voi TypeScript

```typescript
// schemas/user-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

// Enum cho TypeScript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// Sub-document: Social Links
@Schema({ _id: false })
export class SocialLinks {
  @Prop()
  facebook: string;

  @Prop()
  twitter: string;

  @Prop()
  github: string;

  @Prop()
  linkedin: string;
}
export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

// Main schema
export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class UserProfile {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
    minlength: 8,
  })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop({ min: 0, max: 150 })
  age: number;

  @Prop()
  avatarUrl: string;

  @Prop({ type: SocialLinksSchema })
  socialLinks: SocialLinks;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserProfile' })
  referredBy: Types.ObjectId;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
```

---

## 6. CRUD Operations

### Inject Model vao Service

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Cac method CRUD se viet o day
}
```

### CREATE - Tao moi document

```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly age?: number;
  readonly password: string;
}

// users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Cach 1: Tao instance roi save
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // Cach 2: Su dung Model.create()
  async createWithModelCreate(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  // Tao nhieu documents cung luc
  async createMany(users: CreateUserDto[]): Promise<User[]> {
    return this.userModel.insertMany(users);
  }

  // Tao voi kiem tra trung lap
  async createIfNotExists(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existing) {
      throw new ConflictException('Email da ton tai');
    }
    return this.userModel.create(createUserDto);
  }
}
```

### READ - Doc du lieu

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Tim tat ca
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Tim voi dieu kien
  async findWithConditions(): Promise<User[]> {
    return this.userModel.find({
      age: { $gte: 18, $lte: 60 },  // 18 <= age <= 60
      isActive: true,
    }).exec();
  }

  // Tim mot document theo dieu kien
  async findOne(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  // Tim theo ID
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User voi ID ${id} khong ton tai`);
    }
    return user;
  }

  // Tim voi select (chi lay cac truong can thiet)
  async findWithSelect(): Promise<User[]> {
    return this.userModel.find()
      .select('name email age')    // Chi lay 3 truong
      .select('-password')          // Loai bo truong password
      .exec();
  }

  // Tim voi pagination
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Tim voi search
  async search(keyword: string): Promise<User[]> {
    return this.userModel.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ],
    }).exec();
  }

  // Dem so documents
  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  // Kiem tra ton tai
  async exists(email: string): Promise<boolean> {
    const result = await this.userModel.exists({ email });
    return !!result;
  }

  // Tim gia tri duy nhat (distinct)
  async getDistinctCities(): Promise<string[]> {
    return this.userModel.distinct('address.city').exec();
  }
}
```

### UPDATE - Cap nhat du lieu

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Cap nhat mot document theo ID va tra ve document moi
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,            // Tra ve document sau khi cap nhat
        runValidators: true,  // Chay validators khi update
      },
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`User voi ID ${id} khong ton tai`);
    }
    return updatedUser;
  }

  // Cap nhat voi $set (chi cap nhat cac truong duoc chi dinh)
  async updatePartial(id: string, fields: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true },
    ).exec();
  }

  // Cap nhat mot document theo dieu kien
  async updateOneByCondition(email: string, update: any): Promise<any> {
    return this.userModel.updateOne(
      { email },                  // Dieu kien
      { $set: update },          // Du lieu cap nhat
      { runValidators: true },
    ).exec();
  }

  // Cap nhat nhieu documents
  async updateMany(condition: any, update: any): Promise<any> {
    return this.userModel.updateMany(
      condition,
      { $set: update },
    ).exec();
    // Ket qua: { matchedCount: 5, modifiedCount: 3, ... }
  }

  // Update operators
  async updateWithOperators(id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $set: { name: 'Ten moi' },           // Dat gia tri
        $inc: { viewCount: 1 },               // Tang gia tri
        $push: { tags: 'new-tag' },           // Them vao mang
        $pull: { tags: 'old-tag' },           // Xoa khoi mang
        $addToSet: { tags: 'unique-tag' },    // Them neu chua co
        $unset: { tempField: '' },            // Xoa truong
        $rename: { oldName: 'newName' },      // Doi ten truong
        $min: { lowScore: 50 },               // Cap nhat neu nho hon
        $max: { highScore: 100 },             // Cap nhat neu lon hon
        $currentDate: { lastModified: true }, // Dat bang thoi gian hien tai
      },
      { new: true },
    ).exec();
  }

  // Upsert: Cap nhat neu ton tai, tao moi neu khong
  async upsert(email: string, userData: CreateUserDto): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      userData,
      {
        new: true,
        upsert: true,         // Tao moi neu khong tim thay
        runValidators: true,
      },
    ).exec();
  }

  // Cap nhat phan tu trong mang
  async updateArrayElement(userId: string, oldTag: string, newTag: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { _id: userId, tags: oldTag },
      { $set: { 'tags.$': newTag } },  // $ la vi tri phan tu match
      { new: true },
    ).exec();
  }
}
```

### DELETE - Xoa du lieu

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Xoa theo ID va tra ve document da xoa
  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User voi ID ${id} khong ton tai`);
    }
    return deletedUser;
  }

  // Xoa theo dieu kien (mot document)
  async removeOne(email: string): Promise<any> {
    return this.userModel.deleteOne({ email }).exec();
    // Ket qua: { deletedCount: 1 }
  }

  // Xoa nhieu documents
  async removeMany(condition: any): Promise<any> {
    return this.userModel.deleteMany(condition).exec();
    // Ket qua: { deletedCount: 5 }
  }

  // Soft delete (danh dau da xoa, khong xoa that)
  async softDelete(id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true },
    ).exec();
  }

  // Tim tat ca (khong bao gom soft deleted)
  async findAllActive(): Promise<User[]> {
    return this.userModel.find({ isDeleted: { $ne: true } }).exec();
  }

  // Khoi phuc soft deleted
  async restore(id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $set: { isDeleted: false },
        $unset: { deletedAt: '' },
      },
      { new: true },
    ).exec();
  }
}
```

### Controller day du

```typescript
// users/users.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.usersService.search(search);
    }
    return this.usersService.findWithPagination(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

---

## 7. Query Helpers

### Where

```typescript
// Tim users tren 18 tuoi
const users = await this.userModel
  .where('age').gte(18)
  .where('isActive').equals(true)
  .exec();

// Tuong duong
const users2 = await this.userModel.find({
  age: { $gte: 18 },
  isActive: true,
}).exec();
```

### Sort

```typescript
// Sap xep theo ten (A-Z), neu trung ten thi theo tuoi (giam dan)
const users = await this.userModel.find()
  .sort({ name: 1, age: -1 })  // 1 = tang dan, -1 = giam dan
  .exec();

// Cach khac: dung string
const users2 = await this.userModel.find()
  .sort('name -age')  // Khong co dau - = tang dan, co - = giam dan
  .exec();

// Sap xep theo ngay tao moi nhat
const latest = await this.userModel.find()
  .sort({ createdAt: -1 })
  .exec();
```

### Limit va Skip (Pagination)

```typescript
// Lay 10 documents, bo qua 20 documents dau tien (trang 3)
const users = await this.userModel.find()
  .skip(20)
  .limit(10)
  .exec();

// Ham pagination tong quat
async paginate(
  filter: any = {},
  page: number = 1,
  limit: number = 10,
  sort: any = { createdAt: -1 },
) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.userModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec(),
    this.userModel.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}
```

### Select (Projection)

```typescript
// Chi lay cac truong can thiet
const users = await this.userModel.find()
  .select('name email age')       // Chi lay 3 truong nay
  .exec();

// Loai bo cac truong khong can
const users2 = await this.userModel.find()
  .select('-password -__v')       // Loai bo 2 truong nay
  .exec();

// Lay truong bi an (select: false trong schema)
const user = await this.userModel.findById(id)
  .select('+password')            // Buoc lay truong bi an
  .exec();
```

### Populate (Join documents)

```typescript
// Schema co reference
@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];
}

// Populate don gian
const posts = await this.postModel.find()
  .populate('author')                    // Lay toan bo thong tin author
  .exec();

// Populate voi select
const posts2 = await this.postModel.find()
  .populate('author', 'name email')      // Chi lay name va email cua author
  .exec();

// Populate nhieu truong
const posts3 = await this.postModel.find()
  .populate('author', 'name email')
  .populate('comments')
  .exec();

// Populate long nhau (nested populate)
const posts4 = await this.postModel.find()
  .populate({
    path: 'comments',
    populate: {
      path: 'author',                   // Populate author cua moi comment
      select: 'name avatar',
    },
  })
  .exec();

// Populate voi dieu kien
const posts5 = await this.postModel.find()
  .populate({
    path: 'comments',
    match: { isApproved: true },         // Chi lay comments da duyet
    options: {
      sort: { createdAt: -1 },           // Sap xep theo moi nhat
      limit: 5,                          // Gioi han 5 comments
    },
  })
  .exec();
```

### Tong hop Query phuc tap

```typescript
async advancedQuery(options: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    keyword, category, minPrice, maxPrice,
    tags, page = 1, limit = 10,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = options;

  // Xay dung filter
  const filter: any = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags }; // Co it nhat 1 tag trong danh sach
    // $all: co tat ca tags
  }

  // Build sort
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.productModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name email')
      .select('-__v')
      .lean()  // Tra ve plain JS object thay vi Mongoose document
      .exec(),
    this.productModel.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    filters: { keyword, category, minPrice, maxPrice, tags },
  };
}
```

---

## 8. Virtual Properties

Virtual properties la cac truong khong duoc luu vao database, ma duoc tinh toan tu cac truong khac.

### Dinh nghia Virtual

```typescript
// schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },   // BAT BUOC de virtual hien thi trong JSON
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  birthDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// === DINH NGHIA VIRTUAL SAU KHI TAO SCHEMA ===

// Virtual: fullName
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: age (tinh tu birthDate)
UserSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birth = new Date(this.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// Virtual: co setter
UserSchema.virtual('fullName')
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (fullName: string) {
    const [firstName, ...lastParts] = fullName.split(' ');
    this.firstName = firstName;
    this.lastName = lastParts.join(' ');
  });

// Virtual populate: Lay posts cua user ma khong can luu trong user document
UserSchema.virtual('posts', {
  ref: 'Post',                    // Model reference
  localField: '_id',              // Truong cua User
  foreignField: 'author',         // Truong cua Post tro den User
  justOne: false,                 // false = mang, true = 1 document
  options: { sort: { createdAt: -1 } },
});
```

### Su dung Virtual

```typescript
// Trong service
async findUser(id: string) {
  const user = await this.userModel.findById(id)
    .populate('posts')  // Populate virtual field
    .exec();

  console.log(user.fullName);  // "Nguyen Van A"
  console.log(user.age);       // 25
  console.log(user.posts);     // [...] - danh sach posts
  return user;
}

// Ket qua JSON:
// {
//   "_id": "...",
//   "firstName": "Nguyen",
//   "lastName": "Van A",
//   "birthDate": "1999-05-15",
//   "fullName": "Nguyen Van A",   <-- Virtual
//   "age": 25,                     <-- Virtual
//   "posts": [...]                 <-- Virtual populate
// }
```

---

## 9. Hooks va Middleware

Hooks (hay Middleware) la cac ham duoc thuc thi truoc hoac sau mot thao tac nhat dinh tren document hoac query.

### Cac loai Middleware

1. **Document middleware**: `save`, `validate`, `remove`, `updateOne`, `deleteOne`
2. **Query middleware**: `find`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`, `updateOne`, `deleteOne`, `countDocuments`
3. **Aggregate middleware**: `aggregate`

### Pre Hooks (Truoc khi thuc thi)

```typescript
// schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  slug: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// === PRE SAVE: Hash password truoc khi luu ===
UserSchema.pre('save', async function (next) {
  // Chi hash neu password duoc thay doi
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// === PRE SAVE: Tao slug tu name ===
UserSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// === PRE VALIDATE: Xu ly truoc khi validate ===
UserSchema.pre('validate', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// === PRE FIND: Tu dong loai bo soft deleted ===
UserSchema.pre('find', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('countDocuments', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// === PRE FINDONEANDUPDATE: Validate truoc khi update ===
UserSchema.pre('findOneAndUpdate', function (next) {
  // Luon chay validators khi update
  this.setOptions({ runValidators: true });
  next();
});

// === PRE REMOVE / DELETEONE: Cascade delete ===
UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  // Xoa tat ca posts cua user nay
  await this.model('Post').deleteMany({ author: this._id });
  // Xoa tat ca comments cua user nay
  await this.model('Comment').deleteMany({ author: this._id });
  next();
});
```

### Post Hooks (Sau khi thuc thi)

```typescript
// === POST SAVE: Sau khi luu thanh cong ===
UserSchema.post('save', function (doc, next) {
  console.log(`User "${doc.name}" da duoc luu voi ID: ${doc._id}`);

  // Co the gui email chao mung, tao log, etc.
  // Luu y: day la post hook nen khong anh huong den ket qua save
  next();
});

// === POST SAVE: Xu ly loi duplicate ===
UserSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    next(new Error(`${field} "${error.keyValue[field]}" da ton tai`));
  } else {
    next(error);
  }
});

// === POST FIND: Log query ===
UserSchema.post('find', function (docs, next) {
  console.log(`Tim thay ${docs.length} users`);
  next();
});

// === POST FINDONE ===
UserSchema.post('findOne', function (doc, next) {
  if (doc) {
    console.log(`Tim thay user: ${doc.name}`);
  }
  next();
});

// === POST REMOVE ===
UserSchema.post('deleteOne', { document: true, query: false }, function (doc, next) {
  console.log(`User "${doc.name}" da bi xoa`);
  next();
});
```

### Them instance methods

```typescript
// Them method vao schema
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

// Them static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Su dung trong service
async login(email: string, password: string) {
  const user = await this.userModel
    .findOne({ email })
    .select('+password')
    .exec();

  if (!user) {
    throw new UnauthorizedException('Email khong ton tai');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException('Mat khau khong dung');
  }

  return user.toProfileJSON();
}
```

---

## 10. Population - References giua Collections

### One-to-Many Relationship

```typescript
// === SCHEMAS ===

// schemas/author.schema.ts
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Author {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  bio: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

// Virtual populate: Lay books cua author
AuthorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author',
});

// schemas/book.schema.ts
@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  isbn: string;

  // Reference den Author
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Author', required: true })
  author: MongooseSchema.Types.ObjectId;

  // Reference den Category
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: MongooseSchema.Types.ObjectId;

  // Mang references den Review
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Review' }] })
  reviews: MongooseSchema.Types.ObjectId[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
```

### Many-to-Many Relationship

```typescript
// schemas/student.schema.ts
@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  name: string;

  // Nhieu students co the hoc nhieu courses
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }] })
  courses: MongooseSchema.Types.ObjectId[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// schemas/course.schema.ts
@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  // Nhieu courses co nhieu students
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Student' }] })
  students: MongooseSchema.Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
```

### Embedded Documents vs References

```typescript
// === EMBEDDED (Noi dung trong document) ===
// Phu hop khi: du lieu it thay doi, luon truy cap cung nhau, 1-to-few

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  customer: MongooseSchema.Types.ObjectId;

  // Embedded: items nam trong order document
  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;
}

// === REFERENCES (Tham chieu) ===
// Phu hop khi: du lieu thay doi thuong xuyen, truy cap doc lap, 1-to-many

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  // Reference: chi luu ID, populate khi can
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: MongooseSchema.Types.ObjectId[];
}
```

### Vi du su dung Population trong Service

```typescript
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
  ) {}

  // Lay book voi thong tin author
  async findBookWithAuthor(bookId: string) {
    return this.bookModel.findById(bookId)
      .populate('author', 'name email bio')
      .populate('category', 'name')
      .populate({
        path: 'reviews',
        select: 'rating comment',
        populate: {
          path: 'user',
          select: 'name avatar',
        },
        options: {
          sort: { createdAt: -1 },
          limit: 10,
        },
      })
      .exec();
  }

  // Lay author voi tat ca books
  async findAuthorWithBooks(authorId: string) {
    return this.authorModel.findById(authorId)
      .populate('books')  // Virtual populate
      .exec();
  }

  // Them review vao book
  async addReview(bookId: string, reviewId: string) {
    return this.bookModel.findByIdAndUpdate(
      bookId,
      { $push: { reviews: reviewId } },
      { new: true },
    ).populate('reviews').exec();
  }

  // Xoa review khoi book
  async removeReview(bookId: string, reviewId: string) {
    return this.bookModel.findByIdAndUpdate(
      bookId,
      { $pull: { reviews: reviewId } },
      { new: true },
    ).exec();
  }
}
```

---

## 11. Aggregation Pipeline

Aggregation Pipeline la cong cu manh me nhat cua MongoDB de xu ly va phan tich du lieu. Du lieu di qua mot chuoi cac giai doan (stages), moi giai doan bien doi du lieu.

### Cac Stages co ban

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // === $MATCH: Loc du lieu (giong WHERE trong SQL) ===
  async getRecentOrders() {
    return this.orderModel.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date('2024-01-01'),
            $lt: new Date('2024-12-31'),
          },
        },
      },
    ]).exec();
  }

  // === $GROUP: Nhom du lieu (giong GROUP BY trong SQL) ===
  async getOrderStats() {
    return this.orderModel.aggregate([
      {
        $match: { status: 'completed' },
      },
      {
        $group: {
          _id: '$status',               // Nhom theo truong status
          totalOrders: { $sum: 1 },     // Dem so orders
          totalRevenue: { $sum: '$totalAmount' },  // Tong doanh thu
          avgOrderValue: { $avg: '$totalAmount' }, // Trung binh
          maxOrder: { $max: '$totalAmount' },      // Don hang lon nhat
          minOrder: { $min: '$totalAmount' },      // Don hang nho nhat
        },
      },
    ]).exec();
  }

  // === $SORT: Sap xep ===
  async getTopCustomers() {
    return this.orderModel.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },  // Sap xep giam dan
      { $limit: 10 },                 // Lay 10 khach hang dau
    ]).exec();
  }

  // === $PROJECT: Chon va bien doi truong (giong SELECT trong SQL) ===
  async getOrderSummary() {
    return this.orderModel.aggregate([
      {
        $project: {
          _id: 0,                       // An truong _id
          orderId: '$_id',              // Doi ten truong
          customer: '$customerName',
          total: '$totalAmount',
          itemCount: { $size: '$items' },  // Dem so phan tu trong mang
          year: { $year: '$createdAt' },   // Trich nam tu date
          month: { $month: '$createdAt' }, // Trich thang tu date
          // Tinh toan
          discountedTotal: {
            $multiply: ['$totalAmount', 0.9],  // Giam 10%
          },
          // Dieu kien
          orderSize: {
            $cond: {
              if: { $gte: ['$totalAmount', 1000000] },
              then: 'large',
              else: {
                $cond: {
                  if: { $gte: ['$totalAmount', 500000] },
                  then: 'medium',
                  else: 'small',
                },
              },
            },
          },
        },
      },
    ]).exec();
  }

  // === $LOOKUP: Join voi collection khac (giong JOIN trong SQL) ===
  async getOrdersWithCustomerInfo() {
    return this.orderModel.aggregate([
      {
        $lookup: {
          from: 'users',              // Ten collection (khong phai Model name)
          localField: 'customerId',   // Truong trong orders
          foreignField: '_id',        // Truong trong users
          as: 'customer',             // Ten truong ket qua
        },
      },
      {
        $unwind: '$customer',         // Bien mang thanh object (vi $lookup tra ve mang)
      },
      {
        $project: {
          orderId: '$_id',
          totalAmount: 1,
          'customer.name': 1,
          'customer.email': 1,
        },
      },
    ]).exec();
  }

  // === $UNWIND: Tach mang thanh nhieu documents ===
  async getProductSales() {
    return this.orderModel.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },           // Tach moi item thanh 1 document
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
    ]).exec();
  }

  // === AGGREGATION PHUC TAP: Bao cao doanh thu theo thang ===
  async getMonthlyRevenue(year: number) {
    return this.orderModel.aggregate([
      // Buoc 1: Loc orders hoan thanh trong nam
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      // Buoc 2: Nhom theo thang
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      // Buoc 3: Dinh dang ket qua
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: { $round: ['$totalRevenue', 0] },
          orderCount: 1,
          avgOrderValue: { $round: ['$avgOrderValue', 0] },
        },
      },
      // Buoc 4: Sap xep theo thang
      {
        $sort: { year: 1, month: 1 },
      },
    ]).exec();
  }

  // === AGGREGATION: Thong ke san pham theo danh muc ===
  async getProductStatsByCategory() {
    return this.productModel.aggregate([
      // Join voi categories
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      // Nhom theo category
      {
        $group: {
          _id: '$category.name',
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$stock' },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              stock: '$stock',
            },
          },
        },
      },
      // Chi lay top 5 san pham moi category
      {
        $addFields: {
          topProducts: { $slice: ['$products', 5] },
        },
      },
      {
        $project: {
          products: 0,  // Xoa mang products goc
        },
      },
      { $sort: { totalProducts: -1 } },
    ]).exec();
  }

  // === AGGREGATION: Tim users khong dat hang trong 30 ngay ===
  async getInactiveUsers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customerId', '$$userId'] },
                    { $gte: ['$createdAt', thirtyDaysAgo] },
                  ],
                },
              },
            },
          ],
          as: 'recentOrders',
        },
      },
      {
        $match: {
          recentOrders: { $size: 0 },  // Khong co don hang gan day
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          lastOrderDate: 1,
        },
      },
    ]).exec();
  }

  // === $FACET: Chay nhieu pipeline song song ===
  async getDashboardStats() {
    return this.orderModel.aggregate([
      {
        $facet: {
          // Pipeline 1: Tong quan
          overview: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                avgOrderValue: { $avg: '$totalAmount' },
              },
            },
          ],
          // Pipeline 2: Theo trang thai
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
              },
            },
          ],
          // Pipeline 3: Top 5 don hang lon nhat
          topOrders: [
            { $sort: { totalAmount: -1 } },
            { $limit: 5 },
            {
              $project: {
                orderId: '$_id',
                totalAmount: 1,
                customerName: 1,
                createdAt: 1,
              },
            },
          ],
          // Pipeline 4: Doanh thu 7 ngay gan nhat
          last7Days: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]).exec();
  }
}
```

---

## 12. Indexes

Indexes giup tang toc do truy van bang cach tao cau truc du lieu dac biet de MongoDB co the tim kiem nhanh hon.

### Tao Index trong Schema

```typescript
// === CACH 1: Dung @Prop({ index: true }) ===
@Schema()
export class User {
  @Prop({ index: true })
  email: string;

  @Prop({ unique: true })  // unique tu dong tao index
  username: string;
}

// === CACH 2: Dung @Schema() decorator ===
@Schema()
@Index({ email: 1 })                    // Single field index
@Index({ firstName: 1, lastName: 1 })   // Compound index
@Index({ title: 'text', content: 'text' }) // Text index
@Index({ createdAt: 1 }, { expireAfterSeconds: 3600 }) // TTL index
export class User {
  // ...
}

// === CACH 3: Dinh nghia sau khi tao schema ===
export const UserSchema = SchemaFactory.createForClass(User);

// Single field index
UserSchema.index({ email: 1 });          // 1 = tang dan, -1 = giam dan

// Compound index (index ket hop)
UserSchema.index({ firstName: 1, lastName: 1 });

// Unique index
UserSchema.index({ email: 1 }, { unique: true });

// Text index (cho full-text search)
UserSchema.index({ title: 'text', content: 'text', tags: 'text' });

// TTL index (tu dong xoa documents sau thoi gian)
UserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Xoa sau 24h

// Partial index (chi index documents thoa dieu kien)
UserSchema.index(
  { email: 1 },
  {
    partialFilterExpression: { isActive: true },
  },
);

// Sparse index (chi index documents co truong nay)
UserSchema.index({ phone: 1 }, { sparse: true });

// 2dsphere index (cho du lieu dia ly)
UserSchema.index({ location: '2dsphere' });
```

### Su dung Text Search

```typescript
// Schema voi text index
@Schema()
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: [String] })
  tags: string[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Tao text index
ArticleSchema.index(
  { title: 'text', content: 'text', tags: 'text' },
  {
    weights: {
      title: 10,     // Title co trong so cao nhat
      tags: 5,       // Tags co trong so trung binh
      content: 1,    // Content co trong so thap nhat
    },
    name: 'article_text_index',
  },
);

// Su dung text search
@Injectable()
export class ArticlesService {
  async search(keyword: string) {
    return this.articleModel.find(
      { $text: { $search: keyword } },
      { score: { $meta: 'textScore' } },  // Them diem relevance
    )
    .sort({ score: { $meta: 'textScore' } })  // Sap xep theo relevance
    .exec();
  }

  // Search voi cac tuy chon
  async advancedSearch(keyword: string) {
    return this.articleModel.find({
      $text: {
        $search: keyword,
        $language: 'none',        // Tat stemming
        $caseSensitive: false,    // Khong phan biet hoa thuong
      },
    }).exec();
  }
}
```

### Geo-spatial Queries

```typescript
// Schema voi location
@Schema()
export class Store {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };
}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ location: '2dsphere' });

// Tim stores gan vi tri
async findNearby(longitude: number, latitude: number, maxDistance: number = 5000) {
  return this.storeModel.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,  // met
      },
    },
  }).exec();
}
```

---

## 13. Transactions

MongoDB ho tro transactions tu version 4.0. Transactions dam bao tinh nguyen tu (atomicity) cho cac thao tac tren nhieu documents/collections.

### Transaction co ban

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';

@Injectable()
export class TransferService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async transferMoney(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) {
    // Bat dau session
    const session = await this.connection.startSession();

    try {
      // Bat dau transaction
      session.startTransaction();

      // Tru tien tu tai khoan nguon
      const fromAccount = await this.accountModel.findByIdAndUpdate(
        fromAccountId,
        { $inc: { balance: -amount } },
        { new: true, session },  // Quan trong: truyen session
      );

      if (!fromAccount || fromAccount.balance < 0) {
        throw new BadRequestException('So du khong du');
      }

      // Cong tien vao tai khoan dich
      const toAccount = await this.accountModel.findByIdAndUpdate(
        toAccountId,
        { $inc: { balance: amount } },
        { new: true, session },
      );

      if (!toAccount) {
        throw new NotFoundException('Tai khoan dich khong ton tai');
      }

      // Tao ban ghi giao dich
      await this.transactionModel.create(
        [{
          fromAccount: fromAccountId,
          toAccount: toAccountId,
          amount,
          type: 'transfer',
          status: 'completed',
        }],
        { session },  // Quan trong: truyen session cho create
      );

      // Commit transaction
      await session.commitTransaction();

      return {
        message: 'Chuyen tien thanh cong',
        fromBalance: fromAccount.balance,
        toBalance: toAccount.balance,
      };
    } catch (error) {
      // Rollback neu co loi
      await session.abortTransaction();
      throw error;
    } finally {
      // Ket thuc session
      session.endSession();
    }
  }
}
```

### Transaction voi withTransaction() helper

```typescript
async createOrder(createOrderDto: CreateOrderDto) {
  const session = await this.connection.startSession();

  try {
    // withTransaction tu dong commit/abort
    const result = await session.withTransaction(async () => {
      // Tao order
      const [order] = await this.orderModel.create(
        [{
          customer: createOrderDto.customerId,
          items: createOrderDto.items,
          totalAmount: createOrderDto.totalAmount,
          status: 'pending',
        }],
        { session },
      );

      // Giam so luong ton kho
      for (const item of createOrderDto.items) {
        const product = await this.productModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true, session },
        );

        if (!product || product.stock < 0) {
          throw new BadRequestException(
            `San pham ${item.productId} khong du hang`,
          );
        }
      }

      // Cap nhat thong ke user
      await this.userModel.findByIdAndUpdate(
        createOrderDto.customerId,
        {
          $inc: { totalOrders: 1, totalSpent: createOrderDto.totalAmount },
          $set: { lastOrderAt: new Date() },
        },
        { session },
      );

      return order;
    });

    return result;
  } finally {
    session.endSession();
  }
}
```

### Retry Transaction khi bi conflict

```typescript
async executeWithRetry<T>(
  operation: (session: ClientSession) => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      });

      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      lastError = error;

      // Chi retry neu la transient error
      if (
        error.hasErrorLabel &&
        error.hasErrorLabel('TransientTransactionError')
      ) {
        console.log(`Transaction that bai, thu lai lan ${attempt + 1}`);
        continue;
      }

      throw error;
    } finally {
      session.endSession();
    }
  }

  throw lastError;
}

// Su dung
async safeTransfer(from: string, to: string, amount: number) {
  return this.executeWithRetry(async (session) => {
    await this.accountModel.findByIdAndUpdate(
      from,
      { $inc: { balance: -amount } },
      { session },
    );
    await this.accountModel.findByIdAndUpdate(
      to,
      { $inc: { balance: amount } },
      { session },
    );
  });
}
```

---

## 14. Common Mistakes

### Loi 1: Quen exec() khi query

```typescript
// SAI - Query khong duoc thuc thi
const users = this.userModel.find({ isActive: true });
// users la Query object, khong phai ket qua

// DUNG - Them .exec()
const users = await this.userModel.find({ isActive: true }).exec();
```

### Loi 2: Khong enable virtuals trong toJSON

```typescript
// SAI - Virtuals khong hien thi trong response
@Schema()
export class User {
  @Prop() firstName: string;
  @Prop() lastName: string;
}

// DUNG - Them toJSON/toObject options
@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop() firstName: string;
  @Prop() lastName: string;
}
```

### Loi 3: Khong dung runValidators khi update

```typescript
// SAI - Validators khong chay khi update
await this.userModel.findByIdAndUpdate(id, { age: -5 }); // -5 duoc chap nhan

// DUNG - Bat runValidators
await this.userModel.findByIdAndUpdate(
  id,
  { age: -5 },
  { runValidators: true }, // Se throw error neu age < 0
);
```

### Loi 4: N+1 Query Problem

```typescript
// SAI - N+1 queries
const posts = await this.postModel.find().exec();
for (const post of posts) {
  post.author = await this.userModel.findById(post.authorId).exec(); // N queries
}

// DUNG - Dung populate
const posts = await this.postModel.find()
  .populate('author', 'name email')
  .exec();
```

### Loi 5: Khong su dung lean() cho read-only queries

```typescript
// KHONG TOI UU - Tra ve full Mongoose documents
const users = await this.userModel.find().exec();
// Moi document co getters, setters, methods, ... -> ton bo nho

// TOI UU - Tra ve plain JS objects
const users = await this.userModel.find().lean().exec();
// Nhanh hon 5-10x, it ton bo nho
// Luu y: khong co virtuals, methods, save()
```

### Loi 6: Khong index truong thuong query

```typescript
// CHAM - Full collection scan
const users = await this.userModel.find({ email: 'test@test.com' }).exec();
// Neu khong co index tren email, MongoDB phai scan toan bo collection

// NHANH - Co index
UserSchema.index({ email: 1 });
// Gio query se dung index, nhanh hon rat nhieu
```

### Loi 7: Luu ObjectId nhu string

```typescript
// SAI
@Prop({ type: String, ref: 'User' })
author: string;

// DUNG
@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
author: MongooseSchema.Types.ObjectId;
```

### Loi 8: Khong xu ly ObjectId validation

```typescript
import { isValidObjectId } from 'mongoose';

// SAI - Crash neu id khong hop le
async findById(id: string) {
  return this.userModel.findById(id).exec(); // Throw CastError
}

// DUNG - Validate truoc
async findById(id: string) {
  if (!isValidObjectId(id)) {
    throw new BadRequestException('ID khong hop le');
  }
  return this.userModel.findById(id).exec();
}

// HOAC tao Pipe
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('ID khong hop le');
    }
    return value;
  }
}

// Su dung
@Get(':id')
findOne(@Param('id', ParseObjectIdPipe) id: string) {
  return this.usersService.findById(id);
}
```

---

## 15. Best Practices

### 1. Schema Design

```typescript
// DO: Su dung timestamps
@Schema({ timestamps: true })
export class User {}

// DO: Dinh nghia type ro rang cho moi truong
@Prop({ type: String, required: true })
name: string;

// DO: Su dung enum cho cac truong co gia tri co dinh
@Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
status: string;

// DO: Dat select: false cho sensitive data
@Prop({ select: false })
password: string;
```

### 2. Service Pattern

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // DO: Luon tra ve Promise
  // DO: Dung NotFoundException khi khong tim thay
  // DO: Tach logic thanh cac method nho
  async findById(id: string): Promise<UserDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID khong hop le');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User voi ID ${id} khong ton tai`);
    }
    return user;
  }

  // DO: Su dung lean() cho read-only queries
  async findAll(): Promise<User[]> {
    return this.userModel.find().lean().exec();
  }

  // DO: Dung DTO cho input
  async create(dto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(dto);
  }
}
```

### 3. Index Strategy

```typescript
// DO: Index cac truong thuong query
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1, createdAt: -1 });

// DO: Dung compound index theo thu tu query
// Neu thuong query: { status: 'active', createdAt: { $gte: ... } }
UserSchema.index({ status: 1, createdAt: -1 });

// DO: Tat autoIndex trong production
MongooseModule.forRoot(uri, {
  autoIndex: process.env.NODE_ENV !== 'production',
});
```

### 4. Error Handling

```typescript
// DO: Wrap operations trong try-catch
async create(dto: CreateUserDto) {
  try {
    return await this.userModel.create(dto);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      throw new ConflictException(`${field} da ton tai`);
    }
    throw new InternalServerErrorException('Loi khi tao user');
  }
}
```

### 5. Performance

```typescript
// DO: Dung projection de chi lay truong can thiet
await this.userModel.find().select('name email').exec();

// DO: Dung countDocuments thay vi find().length
const count = await this.userModel.countDocuments(filter);

// DO: Dung bulkWrite cho nhieu operations
await this.userModel.bulkWrite([
  { updateOne: { filter: { _id: id1 }, update: { $set: { name: 'A' } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { name: 'B' } } } },
  { deleteOne: { filter: { _id: id3 } } },
]);

// DO: Dung cursor cho du lieu lon
const cursor = this.userModel.find().cursor();
for await (const user of cursor) {
  // Xu ly tung user, khong load tat ca vao memory
}
```

---

## 16. Bai tap

### Bai tap 1: Blog System (Easy)

Xay dung he thong blog voi:
- Schema: User, Post, Comment
- User co name, email, password, avatar
- Post co title, content, slug (tu dong tao tu title), tags, status (draft/published), author (ref User)
- Comment co text, author (ref User), post (ref Post)
- CRUD cho tat ca entities
- Populate author khi lay post
- Pagination cho posts
- Tim kiem posts theo keyword
- Soft delete cho posts

### Bai tap 2: E-commerce Product Catalog (Medium)

- Schema: Category, Product, Review
- Category co name, slug, parent (self-reference cho category long nhau)
- Product co name, price, description, images[], category (ref), stock, specifications (Map)
- Review co rating (1-5), comment, user (ref), product (ref)
- Aggregation: Tinh averageRating cho moi product
- Text search cho products
- Filter theo: category, price range, rating
- Sort theo: price, rating, newest
- Geo-spatial: Tim products cua stores gan vi tri

### Bai tap 3: Social Network (Medium)

- Schema: User, Post, Like, Follow
- User co thong tin profile, followers count, following count
- Post co content, images[], likes count
- Follow: follower (ref User), following (ref User)
- Like: user (ref User), post (ref Post)
- Aggregation: News feed (posts tu nguoi minh follow, sap xep theo thoi gian)
- Virtual populate: Lay posts cua user
- Hooks: Cap nhat followers/following count khi follow/unfollow

### Bai tap 4: Analytics Dashboard (Hard)

- Schema: Event, User, Session
- Event co type, userId, metadata (Mixed), timestamp
- Tao aggregation pipelines cho:
  - So nguoi dung hoat dong theo ngay/tuan/thang
  - Top pages duoc xem nhieu nhat
  - User retention rate
  - Conversion funnel
  - Doanh thu theo danh muc san pham
- Su dung $facet de tra ve nhieu thong ke trong 1 query
- TTL index de tu dong xoa events cu hon 90 ngay

### Bai tap 5: Transaction System (Hard)

- Schema: Account, Transaction, TransferLog
- Implement chuyen tien giua 2 tai khoan dung Transactions
- Dam bao atomicity: Neu bat ky buoc nao loi, rollback tat ca
- Retry logic cho transient errors
- Logging moi giao dich
- Kiem tra so du truoc khi chuyen
- Rate limiting: Toi da 10 giao dich/phut/user

---

## Tong ket

MongoDB voi Mongoose trong NestJS cung cap mot giai phap manh me cho viec lam viec voi NoSQL database. Cac diem chinh can nam:

1. **Schema Design**: Su dung decorators de dinh nghia schema ro rang
2. **CRUD Operations**: Nam vung cac methods co ban va advanced
3. **Query Helpers**: Biet cach su dung sort, limit, skip, select, populate
4. **Aggregation Pipeline**: Cong cu manh me nhat cho data analysis
5. **Indexes**: Quan trong cho hieu suat query
6. **Transactions**: Dam bao data integrity cho cac thao tac phuc tap
7. **Hooks/Middleware**: Xu ly logic truoc/sau cac thao tac database

Khi thiet ke schema, hay can nhac giua **embedded documents** va **references** dua tren use case cu the. Su dung **indexes** cho cac truong thuong query va **aggregation pipeline** cho bao cao/thong ke phuc tap.
