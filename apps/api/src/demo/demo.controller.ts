import { Controller, Post } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Controller('demo')
export class DemoController {
  constructor(private db: DbService) {}

  @Post('seed')
  async seed() {
    await this.db.seed();
    return { ok: true };
  }
}
