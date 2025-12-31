export class CommentsService {
  constructor(private prisma: any) {}

  async createComment(data: { postId: number; authorId: number; content: string; parentId?: number }) {
    let depth = 0;
    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new Error('Parent comment not found');
      if (parent.depth >= 3) throw new Error('Max comment depth reached');
      depth = parent.depth + 1;
    }

    return this.prisma.comment.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId,
        depth,
      },
    });
  }

  async listForPost(postId: number) {
    return this.prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' }, include: { author: true } });
  }
}
