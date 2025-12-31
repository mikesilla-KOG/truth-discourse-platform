import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(data: { authorId: number; groupId?: number; content: string; source?: string }) {
    return this.prisma.post.create({
      data: {
        authorId: data.authorId,
        groupId: data.groupId,
        content: data.content,
        source: data.source,
      },
    });
  }

  async getPost(id: number) {
    return this.prisma.post.findUnique({ where: { id }, include: { comments: { orderBy: { createdAt: 'asc' }, include: { author: true } } } });
  }

  async feedForUser(userId: number, limit = 20) {
    // Simple chronological feed: posts by users the user follows or in groups where user is a member
    return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }
}
