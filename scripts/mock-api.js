const http = require('http');
const url = require('url');

const users = [
  { id: 1, email: 'alice@example.com', username: 'alice', avatar: 'https://i.pravatar.cc/64?img=1', bio: 'Curious about truth.' },
  { id: 2, email: 'bob@example.com', username: 'bob', avatar: 'https://i.pravatar.cc/64?img=2', bio: 'Moderator and researcher.' },
  { id: 3, email: 'carol@example.com', username: 'carol', avatar: 'https://i.pravatar.cc/64?img=3', bio: 'Community member.' },
];

const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Welcome to the demo site!',
    excerpt: 'This demo shows posts, comments, and reactions. Click to read more and try commenting!',
    content: 'This is a demo post to showcase the DiscourseTruth frontend with sample content, reactions, and comments. Feel free to comment and react.',
    source: null,
    images: [],
    reactions: { agree: 3, disagree: 0, insightful: 1 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 2,
    authorId: 2,
    title: 'Research on source verification',
    excerpt: 'A short thread about verifying sources and making claims transparent.',
    content: 'Here we discuss approaches to verifying source claims and community moderation patterns.',
    source: 'https://example.com/source-article',
    images: [],
    reactions: { agree: 1, disagree: 1, insightful: 2 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 3,
    authorId: 3,
    title: 'Community guidelines',
    excerpt: 'Guidelines for constructive discussion and responsible sourcing.',
    content: 'Please be kind, cite sources, and engage constructively. This is a demo post.',
    source: null,
    images: [],
    reactions: { agree: 2, disagree: 0, insightful: 0 },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

const comments = [
  { id: 1, postId: 1, authorId: 2, content: 'Nice intro — excited to try this!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
  { id: 2, postId: 1, authorId: 3, content: 'Looking forward to contributing.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
  { id: 3, postId: 2, authorId: 1, content: 'Good article link — thanks for sharing.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
];

let nextCommentId = comments.length + 1;

const tokens = {}; // token -> userId

function sendJSON(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(obj));
}

function getUserFromAuth(req) {
  const auth = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!auth) return null;
  const id = tokens[auth];
  if (!id) return null;
  return users.find((u) => u.id === id) || null;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});

  if (req.method === 'POST' && path === '/auth/login') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const json = JSON.parse(body || '{}');
        const username = (json.username || json.email || '').toString();
        // simple auth: find user by username or email
        const user = users.find((u) => u.username === username || u.email === username) || users[0];
        const token = `demo-token-${user.id}-${Date.now()}`;
        tokens[token] = user.id;
        return sendJSON(res, 200, { ok: true, token });
      } catch (e) {
        const token = 'demo-token-1';
        tokens[token] = 1;
        return sendJSON(res, 200, { ok: true, token });
      }
    });
    return;
  }

  if (req.method === 'GET' && path === '/auth/me') {
    const user = getUserFromAuth(req);
    if (user) return sendJSON(res, 200, { ok: true, user });
    return sendJSON(res, 200, { ok: false });
  }

  if (req.method === 'GET' && path === '/posts') {
    // include author summary and reaction summary
    const listing = posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      author: users.find((u) => u.id === p.authorId),
      reactions: p.reactions,
      createdAt: p.createdAt,
    }));
    return sendJSON(res, 200, { posts: listing });
  }

  const postIdMatch = path.match(/^\/posts\/(\d+)$/);
  if (req.method === 'GET' && postIdMatch) {
    const id = Number(postIdMatch[1]);
    const post = posts.find((p) => p.id === id);
    if (!post) return sendJSON(res, 404, { error: 'Not found' });
    const postComments = comments.filter((c) => c.postId === id).map((c) => ({ ...c, author: users.find((u) => u.id === c.authorId) }));
    return sendJSON(res, 200, { post: { ...post, author: users.find((u) => u.id === post.authorId), comments: postComments } });
  }

  if (req.method === 'POST' && path.match(/^\/posts\/(\d+)\/react$/)) {
    // body: { type: 'agree' }
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const json = JSON.parse(body || '{}');
        const type = json.type || 'agree';
        const postId = Number(path.match(/^\/posts\/(\d+)\/react$/)[1]);
        const post = posts.find((p) => p.id === postId);
        if (!post) return sendJSON(res, 404, { ok: false });
        post.reactions[type] = (post.reactions[type] || 0) + 1;
        return sendJSON(res, 200, { ok: true, reactions: post.reactions });
      } catch (e) {
        return sendJSON(res, 400, { ok: false });
      }
    });
    return;
  }

  const commentsMatch = path.match(/^\/comments\/post\/(\d+)$/);
  if (req.method === 'GET' && commentsMatch) {
    const id = Number(commentsMatch[1]);
    const postComments = comments.filter((c) => c.postId === id).map((c) => ({ ...c, author: users.find((u) => u.id === c.authorId) }));
    return sendJSON(res, 200, { comments: postComments });
  }

  if (req.method === 'POST' && path === '/comments') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const json = JSON.parse(body || '{}');
        const user = getUserFromAuth(req) || users[0];
        const newComment = {
          id: nextCommentId++,
          postId: json.postId,
          authorId: user.id,
          content: json.content,
          createdAt: new Date().toISOString(),
        };
        comments.push(newComment);
        return sendJSON(res, 201, { ok: true, comment: { ...newComment, author: user } });
      } catch (e) {
        return sendJSON(res, 400, { ok: false });
      }
    });
    return;
  }

  // user lookup
  const userMatch = path.match(/^\/users\/(\d+)$/);
  if (req.method === 'GET' && userMatch) {
    const id = Number(userMatch[1]);
    const u = users.find((x) => x.id === id);
    if (!u) return sendJSON(res, 404, { error: 'Not found' });
    return sendJSON(res, 200, { user: u });
  }

  sendJSON(res, 404, { error: 'Not found' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Mock API listening on port', PORT);
});
