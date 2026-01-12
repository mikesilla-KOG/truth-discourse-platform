import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DbService } from '../db/db.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService, private db?: DbService) {}

  async createPost(data: { authorId: number; groupId?: number; content: string; source?: string }) {
    try {
      return await this.prisma.post.create({ data: { authorId: data.authorId, groupId: data.groupId, content: data.content, source: data.source } });
    } catch (e) {
      return { ok: false, error: 'Prisma unavailable, use DB fallback' };
    }
  }

  async getPost(id: number) {
    try {
      return await this.prisma.post.findUnique({ where: { id }, include: { comments: { orderBy: { createdAt: 'asc' }, include: { author: true } } } });
    } catch (e) {
      return this.db.getPost(id);
    }
  }

  async feedForUser(userId: number, limit = 20) {
    try {
      return await this.prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    } catch (e) {
      return this.db.getPosts();
    }
  }

  async reactPost(postId: number, type: string, userId?: number) {
    try {
      // try using Prisma if available
      return await (this as any).prisma.reaction.create({ data: { userId: userId || null, type, postId } }).then(async () => {
        const res = await this.prisma.reaction.groupBy({ by: ['type'], where: { postId }, _count: { type: true } as any });
        const out: any = { agree: 0, disagree: 0, insightful: 0 };
        res.forEach((r: any) => (out[r.type] = r._count.type));
        return out;
      });
    } catch (e) {
      return this.db.reactPost(postId, type, userId);
    }
  }
}
