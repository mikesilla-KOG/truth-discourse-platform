import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ adapter: { provider: 'postgres', url: process.env.DATABASE_URL } as any } as any);

async function main() {
  const hashed = await bcrypt.hash('password', 10);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashed,
      bio: 'Seed user Alice',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: hashed,
      bio: 'Seed user Bob',
    },
  });

  const g = await prisma.group.create({
    data: {
      name: 'General Truths',
      slug: 'general-truths',
      visibility: 'PUBLIC',
      rules: 'Be evidence-focused and civil',
      ownerId: alice.id,
    },
  });

  await prisma.membership.create({ data: { userId: alice.id, groupId: g.id, role: 'ADMIN' } });
  await prisma.membership.create({ data: { userId: bob.id, groupId: g.id, role: 'MEMBER' } });

  const p = await prisma.post.create({
    data: {
      authorId: alice.id,
      groupId: g.id,
      content: 'Welcome to General Truths — a place to share evidence-backed claims.',
      source: 'https://example.com/source',
      images: [],
    },
  });

  // extra sample groups for demo
  const g2 = await prisma.group.create({ data: { name: 'Evidence & Science', slug: 'evidence-science', visibility: 'PUBLIC', rules: 'Share sources and facts', ownerId: bob.id } });
  await prisma.membership.create({ data: { userId: bob.id, groupId: g2.id, role: 'ADMIN' } });
  await prisma.post.create({ data: { authorId: bob.id, groupId: g2.id, content: 'Post about recent studies and evidence.', images: [] } });

  const g3 = await prisma.group.create({ data: { name: 'Open Discussion', slug: 'open-discussion', visibility: 'PUBLIC', rules: 'Be respectful', ownerId: alice.id } });
  await prisma.membership.create({ data: { userId: alice.id, groupId: g3.id, role: 'ADMIN' } });

  await prisma.comment.create({
    data: {
      postId: p.id,
      authorId: bob.id,
      content: 'Interesting — can you share more sources?',
      depth: 0,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
