import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GroupsModule } from './groups/groups.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GroupsModule, PostsModule, CommentsModule],
})
export class AppModule {}
