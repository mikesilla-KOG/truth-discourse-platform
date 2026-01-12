import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient | null = null;
  private logger = console;

  private getClient(): PrismaClient | null {
    if (this.client) return this.client;
    try {
      // Construct a PrismaClient lazily so test environments that mock this service continue to work
      this.client = new PrismaClient();
      return this.client;
    } catch (err) {
      this.logger.warn('Prisma client construction failed: ' + (err as Error).message);
      this.client = null;
      return null;
    }
  }

  // Expose commonly used model properties so consuming code can call `this.prisma.comment` etc.
  get user(): any {
    return this.getClient().user;
  }
  get post(): any {
    return this.getClient().post;
  }
  get comment(): any {
    return this.getClient().comment;
  }
  get group(): any {
    return this.getClient().group;
  }
  get membership(): any {
    return this.getClient().membership;
  }
  get reaction(): any {
    return this.getClient().reaction;
  }
  get report(): any {
    return this.getClient().report;
  }

  async onModuleInit() {
    try {
      const c = this.getClient();
      if (!c) {
        this.logger.log('Prisma client unavailable at startup; continuing without it');
        return;
      }
      await c.$connect();
      this.logger.log('Prisma connected');
    } catch (err) {
      this.logger.warn('Prisma connect failed during module init: ' + (err as Error).message);
    }
  }

  async onModuleDestroy() {
    if (!this.client) return;
    try {
      await this.client.$disconnect();
    } catch (err) {
      // ignore disconnect errors
    }
  }
}
