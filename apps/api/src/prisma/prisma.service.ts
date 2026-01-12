import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient | null = null;
  private logger = new Logger(PrismaService.name);

  constructor() {
    // don't construct PrismaClient eagerly — construct lazily in getClient()
  }

  getClient(): PrismaClient | null {
    if (this.client) return this.client;
    try {
      // Try constructing client — this may fail depending on runtime config
      this.client = new PrismaClient();
      return this.client;
    } catch (err) {
      this.logger.warn('Prisma client construction failed: ' + (err as Error).message);
      this.client = null;
      return null;
    }
  }

  async onModuleInit() {
    const c = this.getClient();
    if (!c) return;
    try {
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
