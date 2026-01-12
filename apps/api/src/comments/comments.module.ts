import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { DbModule } from '../db/db.module';
import { DbService } from '../db/db.service';

@Module({
  imports: [PrismaModule, DbModule],
  providers: [
    {
      provide: CommentsService,
      useFactory: (prisma: PrismaService, db: DbService) => new CommentsService(prisma, db),
      inject: [PrismaService, DbService],
    },
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
