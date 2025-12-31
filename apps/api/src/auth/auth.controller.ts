import { Body, Controller, Post, Req, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() payload: any) {
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() payload: any) {
    return this.authService.login(payload);
  }

  @Get('me')
  async me(@Req() req: any) {
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      const data = jwt.verify(token, secret) as any;
      // return basic user info
      return { ok: true, user: { id: data.sub, email: data.email } };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
