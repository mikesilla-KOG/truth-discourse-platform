import { Injectable } from '@nestjs/common';
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

  async findBySlug(slug: string) {
    return this.prisma.group.findUnique({ where: { slug }, include: { posts: true, memberships: true } });
  }
}
