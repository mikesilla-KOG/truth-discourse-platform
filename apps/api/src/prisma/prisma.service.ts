import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Pass adapter with connection info per Prisma v7 requirements
    super({ adapter: { provider: 'postgres', url: process.env.DATABASE_URL } } as any);
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // Don't crash the whole app if the adapter connect API isn't ready yet
      console.warn('Prisma connect failed during module init:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) {
      // ignore disconnect errors
    }
  }
}
