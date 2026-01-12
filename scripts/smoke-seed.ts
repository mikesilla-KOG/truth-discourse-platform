import 'tsconfig-paths/register';
import { DbService } from '../apps/api/src/db/db.service';

async function run() {
  try {
    if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/discourse_truth';
    const db = new DbService();
    await new Promise((r) => setTimeout(r, 500)); // allow init
    await db.seed();
    const g = await db.getGroups();
    console.log('groups:', g.length);
    if (g.length >= 3) {
      console.log('OK');
      process.exit(0);
    } else {
      console.error('Not enough groups seeded');
      process.exit(2);
    }
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
}

run();
