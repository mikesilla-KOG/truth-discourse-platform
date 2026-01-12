import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
