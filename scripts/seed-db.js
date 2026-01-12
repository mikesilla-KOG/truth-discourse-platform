const { Pool } = require('pg');
(async () => {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/discourse_truth?schema=public';
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(`
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
    `);

    const r = await pool.query('SELECT count(*)::int as c FROM users');
    if (r.rows[0].c > 0) {
      console.log('Already seeded, skipping');
      process.exit(0);
    }

    await pool.query(`INSERT INTO users (email, username, bio, avatar) VALUES
      ('alice@example.com','alice','Curious about truth.','https://i.pravatar.cc/64?img=1'),
      ('bob@example.com','bob','Moderator and researcher.','https://i.pravatar.cc/64?img=2'),
      ('carol@example.com','carol','Community member.','https://i.pravatar.cc/64?img=3')
    `);

    await pool.query(`INSERT INTO posts (author_id, title, excerpt, content, source, created_at) VALUES
      (1,'Welcome to the demo site!','This demo shows posts, comments, and reactions. Click to read more and try commenting!','This is a demo post to showcase the DiscourseTruth frontend with sample content, reactions, and comments. Feel free to comment and react.', NULL, NOW() - interval '1 day'),
      (2,'Research on source verification','A short thread about verifying sources and making claims transparent.','Here we discuss approaches to verifying source claims and community moderation patterns.','https://example.com/source-article', NOW() - interval '5 hour'),
      (3,'Community guidelines','Guidelines for constructive discussion and responsible sourcing.','Please be kind, cite sources, and engage constructively. This is a demo post.', NULL, NOW() - interval '30 minute')
    `);

    await pool.query(`INSERT INTO comments (post_id, author_id, content, created_at) VALUES
      (1,2,'Nice intro — excited to try this!', NOW() - interval '23 hour'),
      (1,3,'Looking forward to contributing.', NOW() - interval '22 hour'),
      (2,1,'Good article link — thanks for sharing.', NOW() - interval '4 hour')
    `);

    await pool.query(`INSERT INTO reactions (user_id, post_id, type) VALUES
      (1,1,'agree'),(2,1,'agree'),(3,1,'agree'),(2,2,'insightful')
    `);

    console.log('Seed completed');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();