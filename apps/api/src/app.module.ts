import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GroupsModule } from './groups/groups.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { DbService } from './db/db.service';
import { DbModule } from './db/db.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GroupsModule, PostsModule, CommentsModule, DbModule],
  controllers: [require('./demo/demo.controller').DemoController],
  providers: [DbService],
})
export class AppModule {}
