import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CommentsService,
      useFactory: (prisma: PrismaService) => new CommentsService(prisma),
      inject: [PrismaService],
    },
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
