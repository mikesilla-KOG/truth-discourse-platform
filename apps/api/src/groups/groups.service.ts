import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../utils/slugify';
import { DbService } from '../db/db.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService, private db: DbService) {}

  async createGroup(data: { name: string; visibility?: string; rules?: string; ownerId: number }) {
    const slug = slugify(data.name);
    try {
      return await this.prisma.group.create({
        data: {
          name: data.name,
          slug,
          visibility: data.visibility || 'PUBLIC',
          rules: data.rules || '',
          ownerId: data.ownerId,
        },
      });
    } catch (e) {
      // fallback to DB raw create
      return await this.db.createGroup(data.name, slug, data.visibility || 'PUBLIC', data.rules || '', data.ownerId);
    }
  }

  async list() {
    try {
      return await this.prisma.group.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { memberships: true } });
    } catch (e) {
      return await this.db.getGroups();
    }
  }

  async findBySlug(slug: string) {
    try {
      return await this.prisma.group.findUnique({ where: { slug }, include: { posts: true, memberships: true } });
    } catch (e) {
      return await this.db.getGroupBySlug(slug);
    }
  }

  async joinGroup(slug: string, userId: number) {
    try {
      const g = await this.prisma.group.findUnique({ where: { slug } });
      if (!g) throw new NotFoundException('Group not found');
      return await this.prisma.membership.upsert({ where: { userId_groupId: { userId, groupId: g.id } as any }, update: { role: 'MEMBER' }, create: { userId, groupId: g.id, role: 'MEMBER' } });
    } catch (e) {
      return await this.db.joinGroup(slug, userId);
    }
  }

  async leaveGroup(slug: string, userId: number) {
    try {
      const g = await this.prisma.group.findUnique({ where: { slug } });
      if (!g) throw new NotFoundException('Group not found');
      await this.prisma.membership.deleteMany({ where: { userId, groupId: g.id } });
      return { ok: true };
    } catch (e) {
      return await this.db.leaveGroup(slug, userId);
    }
  }
}
