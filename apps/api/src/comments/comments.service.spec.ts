import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  const mockPrisma: any = {
    comment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    mockPrisma.comment.create.mockReset();
    mockPrisma.comment.findUnique.mockReset();
    mockPrisma.comment.findMany.mockReset();
    service = new CommentsService(mockPrisma as any);
  });

  it('creates a top-level comment with depth 0', async () => {
    mockPrisma.comment.create.mockResolvedValue({ id: 1, depth: 0 });
    const res = await service.createComment({ postId: 1, authorId: 1, content: 'Hi' });
    expect(mockPrisma.comment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ postId: 1, authorId: 1, content: 'Hi', depth: 0 }),
    });
    expect(res).toEqual({ id: 1, depth: 0 });
  });

  it('creates a nested comment when parent exists', async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: 5, depth: 1 });
    mockPrisma.comment.create.mockResolvedValue({ id: 2, depth: 2 });
    const res = await service.createComment({ postId: 1, authorId: 2, content: 'Reply', parentId: 5 });
    expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(mockPrisma.comment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ parentId: 5, depth: 2 }),
    });
    expect(res).toEqual({ id: 2, depth: 2 });
  });

  it('throws when parent depth is already 3', async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: 7, depth: 3 });
    await expect(service.createComment({ postId: 1, authorId: 2, content: 'Too deep', parentId: 7 })).rejects.toThrow('Max comment depth reached');
  });

  it('lists comments for a post', async () => {
    mockPrisma.comment.findMany.mockResolvedValue([{ id: 1, content: 'A' }]);
    const res = await service.listForPost(1);
    expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({ where: { postId: 1 }, orderBy: { createdAt: 'asc' }, include: { author: true } });
    expect(res).toEqual([{ id: 1, content: 'A' }]);
  });
});
