import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    fetch(`${base}/posts`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  async function loginDemo() {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'alice' }) });
      const d = await res.json();
      if (d?.token) {
        localStorage.setItem('tdp_token', d.token);
        window.location.href = '/profile';
      } else {
        alert('Login failed');
      }
    } catch (e) {
      alert('Login failed');
    }
  }

  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DiscourseTruth (MVP scaffold)</h1>
        <div>
          <button onClick={loginDemo} className="px-3 py-1 bg-green-600 text-white rounded">Login demo</button>
        </div>
      </header>

      <p className="mt-4 text-gray-600">A small demo of posts and comments. Click a post to view and comment.</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Recent posts</h2>
        {loading && <p className="mt-2">Loading...</p>}
        {!loading && posts.length === 0 && <p className="mt-2 text-sm text-gray-500">No posts available.</p>}
        <ul className="mt-4 space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="p-4 border rounded flex gap-4">
              <img src={p.author?.avatar} alt={p.author?.username} className="w-12 h-12 rounded-full" />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-xs text-gray-500">by {p.author?.username} · {new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="mr-2">👍 {p.reactions?.agree || 0}</span>
                    <span className="mr-2">💬 {/* comments count not included in listing */}</span>
                  </div>
                </div>

                <p className="mt-2 text-gray-800">{p.excerpt}</p>
                <div className="mt-3">
                  <Link href={`/post/${p.id}`} className="text-blue-600">View post</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
