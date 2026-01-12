import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService {
  private pool: Pool;
  private logger = console;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    this.pool = new Pool({ connectionString: url });
    this.init().catch((e) => this.logger.error('DB init failed', e));
  }

  async init() {
    // create minimal tables if they don't exist
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        password TEXT,
        bio TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id INT REFERENCES users(id),
        content TEXT,
        title TEXT,
        excerpt TEXT,
        source TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        author_id INT REFERENCES users(id),
        content TEXT,
        parent_id INT,
        depth INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        post_id INT REFERENCES posts(id),
        type TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name TEXT,
        slug TEXT UNIQUE,
        visibility TEXT DEFAULT 'PUBLIC',
        rules TEXT,
        owner_id INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS memberships (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        group_id INT REFERENCES groups(id),
        role TEXT DEFAULT 'MEMBER',
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE (user_id, group_id)
      );
    `);
  }

  async seed() {
    // users
    const r = await this.pool.query('SELECT count(*)::int as c FROM users');
    if (r.rows[0].c === 0) {
      await this.pool.query(`INSERT INTO users (email, username, bio, avatar) VALUES
        ('alice@example.com','alice','Curious about truth.','https://i.pravatar.cc/64?img=1'),
        ('bob@example.com','bob','Moderator and researcher.','https://i.pravatar.cc/64?img=2'),
        ('carol@example.com','carol','Community member.','https://i.pravatar.cc/64?img=3')
      `);
    }

    // groups
    const g = await this.pool.query('SELECT count(*)::int as c FROM groups');
    if (g.rows[0].c === 0) {
      await this.pool.query(`INSERT INTO groups (name, slug, visibility, rules, owner_id) VALUES
        ('General Truths','general-truths','PUBLIC','Be evidence-focused and civil',1),
        ('Evidence & Science','evidence-science','PUBLIC','Share sources and facts',2),
        ('Open Discussion','open-discussion','PUBLIC','Be respectful',1)
      `);
      await this.pool.query(`INSERT INTO memberships (user_id, group_id, role) VALUES
        (1,1,'ADMIN'),(2,1,'MEMBER'),(2,2,'ADMIN'),(1,3,'ADMIN')
      `);
    }

    // posts
    const p = await this.pool.query('SELECT count(*)::int as c FROM posts');
    if (p.rows[0].c === 0) {
      await this.pool.query(`INSERT INTO posts (author_id, title, excerpt, content, source, created_at, group_id) VALUES
        (1,'Welcome to the demo site!','This demo shows posts, comments, and reactions. Click to read more and try commenting!','This is a demo post to showcase the DiscourseTruth frontend with sample content, reactions, and comments. Feel free to comment and react.', NULL, NOW() - interval '1 day', 1),
        (2,'Research on source verification','A short thread about verifying sources and making claims transparent.','Here we discuss approaches to verifying source claims and community moderation patterns.','https://example.com/source-article', NOW() - interval '5 hour', 2),
        (3,'Community guidelines','Guidelines for constructive discussion and responsible sourcing.','Please be kind, cite sources, and engage constructively. This is a demo post.', NULL, NOW() - interval '30 minute', 3)
      `);
    }

    // comments
    const c = await this.pool.query('SELECT count(*)::int as c FROM comments');
    if (c.rows[0].c === 0) {
      await this.pool.query(`INSERT INTO comments (post_id, author_id, content, created_at) VALUES
        (1,2,'Nice intro — excited to try this!', NOW() - interval '23 hour'),
        (1,3,'Looking forward to contributing.', NOW() - interval '22 hour'),
        (2,1,'Good article link — thanks for sharing.', NOW() - interval '4 hour')
      `);
    }

    // reactions
    const r2 = await this.pool.query('SELECT count(*)::int as c FROM reactions');
    if (r2.rows[0].c === 0) {
      await this.pool.query(`INSERT INTO reactions (user_id, post_id, type) VALUES
        (1,1,'agree'),(2,1,'agree'),(3,1,'agree'),(2,2,'insightful')
      `);
    }

    this.logger.log('Seeded demo data (idempotent)');
  }

  async getPosts() {
    const res = await this.pool.query(`SELECT p.*, u.id as user_id, u.username, u.avatar FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT 50`);
    return res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      author: { id: r.user_id, username: r.username, avatar: r.avatar },
      reactions: {},
      createdAt: r.created_at,
    }));
  }

  async getPost(id: number) {
    const pr = await this.pool.query('SELECT p.*, u.id as user_id, u.username, u.avatar FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = $1', [id]);
    if (!pr.rows[0]) return null;
    const p = pr.rows[0];
    const commentsRes = await this.pool.query('SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON c.author_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC', [id]);
    const reactionsRes = await this.pool.query("SELECT type, count(*)::int as cnt FROM reactions WHERE post_id = $1 GROUP BY type", [id]);
    const reactions: any = { agree: 0, disagree: 0, insightful: 0 };
    reactionsRes.rows.forEach((r) => (reactions[r.type] = r.cnt));
    return {
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      author: { id: p.user_id, username: p.username, avatar: p.avatar },
      reactions,
      createdAt: p.created_at,
      comments: commentsRes.rows.map((c) => ({ id: c.id, postId: c.post_id, content: c.content, createdAt: c.created_at, author: { id: c.author_id, username: c.username, avatar: c.avatar } })),
    };
  }

  // Groups helpers (used when Prisma client unavailable)
  async getGroups() {
    const res = await this.pool.query('SELECT g.*, COUNT(m.id)::int as members FROM groups g LEFT JOIN memberships m ON m.group_id = g.id GROUP BY g.id ORDER BY g.created_at DESC');
    return res.rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, visibility: r.visibility, rules: r.rules, ownerId: r.owner_id, memberships: [] , members: r.members }));
  }

  async getGroupBySlug(slug: string) {
    const res = await this.pool.query('SELECT g.* FROM groups g WHERE g.slug = $1', [slug]);
    if (!res.rows[0]) return null;
    const g = res.rows[0];
    const postsRes = await this.pool.query('SELECT p.*, u.username, u.avatar FROM posts p JOIN users u ON p.author_id = u.id WHERE p.group_id = $1 ORDER BY p.created_at DESC', [g.id]);
    const membersRes = await this.pool.query('SELECT m.*, u.username, u.avatar FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.group_id = $1', [g.id]);
    return { ...g, posts: postsRes.rows, memberships: membersRes.rows };
  }

  async createGroup(name: string, slug: string, visibility: string, rules: string, ownerId: number) {
    await this.pool.query('INSERT INTO groups (name, slug, visibility, rules, owner_id) VALUES ($1,$2,$3,$4,$5)', [name, slug, visibility, rules, ownerId]);
    const res = await this.pool.query('SELECT * FROM groups WHERE slug = $1', [slug]);
    return res.rows[0];
  }

  async joinGroup(slug: string, userId: number) {
    const gRes = await this.pool.query('SELECT id FROM groups WHERE slug = $1', [slug]);
    if (!gRes.rows[0]) throw new Error('Group not found');
    const gid = gRes.rows[0].id;
    await this.pool.query('INSERT INTO memberships (user_id, group_id, role) VALUES ($1,$2,$3) ON CONFLICT (user_id, group_id) DO UPDATE SET role = EXCLUDED.role', [userId, gid, 'MEMBER']);
    return { ok: true };
  }

  async leaveGroup(slug: string, userId: number) {
    const gRes = await this.pool.query('SELECT id FROM groups WHERE slug = $1', [slug]);
    if (!gRes.rows[0]) throw new Error('Group not found');
    const gid = gRes.rows[0].id;
    await this.pool.query('DELETE FROM memberships WHERE user_id = $1 AND group_id = $2', [userId, gid]);
    return { ok: true };
  }

  async createComment(postId: number, authorId: number, content: string) {
    const r = await this.pool.query('INSERT INTO comments (post_id, author_id, content) VALUES ($1,$2,$3) RETURNING id, post_id, author_id, content, created_at', [postId, authorId, content]);
    const row = r.rows[0];
    const authorRes = await this.pool.query('SELECT id, username, avatar FROM users WHERE id = $1', [authorId]);
    return { ...row, author: authorRes.rows[0] };
  }

  async close() {
    try {
      await this.pool.end();
      this.logger.log('DB pool closed');
    } catch (e) {
      this.logger.error('DB close failed', e);
    }
  }

  async reactPost(postId: number, type: string, userId?: number) {
    await this.pool.query('INSERT INTO reactions (user_id, post_id, type) VALUES ($1,$2,$3)', [userId || null, postId, type]);
    const res = await this.pool.query('SELECT type, count(*)::int as cnt FROM reactions WHERE post_id = $1 GROUP BY type', [postId]);
    const reactions: any = { agree: 0, disagree: 0, insightful: 0 };
    res.rows.forEach((r) => (reactions[r.type] = r.cnt));
    return reactions;
  }

}
