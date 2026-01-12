import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../utils/slugify';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(data: { name: string; visibility?: string; rules?: string; ownerId: number }) {
    const slug = slugify(data.name);
    return this.prisma.group.create({
      data: {
        name: data.name,
        slug,
        visibility: data.visibility || 'PUBLIC',
        rules: data.rules || '',
        ownerId: data.ownerId,
      },
    });
  }

  async list() {
    return this.prisma.group.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { memberships: true } });
  }

  async findBySlug(slug: string) {
    return this.prisma.group.findUnique({ where: { slug }, include: { posts: true, memberships: true } });
  }

  async joinGroup(slug: string, userId: number) {
    const g = await this.prisma.group.findUnique({ where: { slug } });
    if (!g) throw new NotFoundException('Group not found');
    return this.prisma.membership.upsert({
      where: { userId_groupId: { userId, groupId: g.id } as any },
      update: { role: 'MEMBER' },
      create: { userId, groupId: g.id, role: 'MEMBER' },
    });
  }

  async leaveGroup(slug: string, userId: number) {
    const g = await this.prisma.group.findUnique({ where: { slug } });
    if (!g) throw new NotFoundException('Group not found');
    await this.prisma.membership.deleteMany({ where: { userId, groupId: g.id } });
    return { ok: true };
  }
}
