process.env.PRISMA_CONFIG = './apps/api/prisma/prisma.config.cjs';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/discourse_truth';
const { PrismaClient } = require('@prisma/client');
try {
  const p = new PrismaClient();
  console.log('PrismaClient constructed');
  p.$connect().then(() => {
    console.log('connected');
    p.$disconnect().then(()=>process.exit(0));
  }).catch((e)=>{console.error('connect err', e.message); process.exit(2)});
} catch (e) {
  console.error('construct err', e && e.message);
  process.exit(1);
}
