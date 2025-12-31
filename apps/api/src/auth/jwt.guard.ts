import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      const data = jwt.verify(token, secret) as any;
      req.user = { id: data.sub, email: data.email };
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
