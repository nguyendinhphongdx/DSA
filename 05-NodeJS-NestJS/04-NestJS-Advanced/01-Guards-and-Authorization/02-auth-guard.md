# Authentication Guard

## 3. Authentication Guard

Day la Guard quan trong nhat - kiem tra xem nguoi dung da xac thuc (dang nhap) chua.

### Cai dat thu vien can thiet

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### Tao JWT Authentication Guard

```typescript
// auth/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Khong tim thay token xac thuc');
    }

    try {
      // Xac minh token va giai ma payload
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'my-secret-key',
      });

      // Gan thong tin user vao request de su dung o cac tang sau
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Token khong hop le hoac da het han');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Header format: "Bearer <token>"
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Auth Module hoan chinh

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'my-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
```

### Auth Service

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: number;
  username: string;
  password: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  // Gia lap database
  private readonly users: User[] = [
    { id: 1, username: 'admin', password: 'admin123', roles: ['admin'] },
    { id: 2, username: 'user1', password: 'user123', roles: ['user'] },
    { id: 3, username: 'editor', password: 'editor123', roles: ['user', 'editor'] },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async signIn(username: string, password: string): Promise<{ access_token: string }> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Sai ten dang nhap hoac mat khau');
    }

    // Payload se duoc ma hoa trong JWT token
    const payload = {
      sub: user.id,         // sub = subject (user ID)
      username: user.username,
      roles: user.roles,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

### Auth Controller

```typescript
// auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class SignInDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user duoc gan boi JwtAuthGuard
    return req.user;
  }
}
```

### Su dung voi Passport.js

NestJS tich hop tot voi Passport.js thong qua `@nestjs/passport`:

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'my-secret-key',
    });
  }

  // Passport tu dong goi validate() sau khi xac minh token thanh cong
  // Gia tri tra ve se duoc gan vao request.user
  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
```

```typescript
// auth/guards/jwt-passport.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') se tu dong su dung JwtStrategy
@Injectable()
export class JwtPassportGuard extends AuthGuard('jwt') {}
```
