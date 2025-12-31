import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(payload: { email: string; username: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        password: hashed,
      },
    });

    return { ok: true, user: { id: user.id, email: user.email, username: user.username } };
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return { ok: true, token };
  }
}
