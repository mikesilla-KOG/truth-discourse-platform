import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DbService } from '../db/db.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService, private db?: DbService) {}

  async createComment(data: { postId: number; authorId: number; content: string; parentId?: number }) {
    // Validate parent/depth first (let validation errors bubble up to caller)
    let depth = 0;
    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new Error('Parent comment not found');
      if (parent.depth >= 3) throw new Error('Max comment depth reached');
      depth = parent.depth + 1;
    }

    try {
      return await this.prisma.comment.create({ data: { postId: data.postId, authorId: data.authorId, content: data.content, parentId: data.parentId, depth } });
    } catch (e) {
      // Fallback to the raw DB implementation if Prisma is unavailable
      return this.db ? this.db.createComment(data.postId, data.authorId, data.content) : Promise.reject(e);
    }
  }

  async listForPost(postId: number) {
    try {
      return this.prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' }, include: { author: true } });
    } catch (e) {
      return this.db.getPost(postId).then((p) => p.comments || []);
    }
  }
}
