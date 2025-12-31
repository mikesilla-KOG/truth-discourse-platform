import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
