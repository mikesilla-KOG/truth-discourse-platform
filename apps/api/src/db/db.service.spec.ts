import { DbService } from './db.service';

jest.setTimeout(20000);

describe('DbService smoke tests', () => {
  let db: DbService;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/discourse_truth';
    db = new DbService();
  });

  afterAll(async () => {
    if (db && typeof (db as any).close === 'function') {
      await (db as any).close();
    }
  });

  it('seeds demo data and returns groups', async () => {
    await db.seed();
    const groups = await db.getGroups();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThanOrEqual(3);
  });
});
