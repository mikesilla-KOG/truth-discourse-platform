import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>(null);
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    fetch(`${base}/posts/${id}`)
      .then((r) => r.json())
      .then((d) => setPost(d))
      .catch(() => setMsg('Unable to fetch post'));
  }, [id]);

  async function submit(e: any) {
    e.preventDefault();
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Not authenticated');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId: Number(id), content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Request failed');
      setContent('');
      // re-fetch post to update comments
      const r = await fetch(`${base}/posts/${id}`);
      const updated = await r.json();
      setPost(updated);
      setMsg('Comment posted');
    } catch (e: any) {
      setMsg(e.message || 'Error posting comment');
    }
  }

  return (
    <main className="min-h-screen p-8">
      {!post && <p>Loading...</p>}
      {post && (
        <div>
          <h1 className="text-xl font-bold">Post #{post.id}</h1>
          <p className="mt-2">{post.content}</p>
          {post.source && (
            <p className="mt-2 text-sm text-blue-600">Source: <a href={post.source} target="_blank" rel="noreferrer">{post.source}</a></p>
          )}

          <section className="mt-6">
            <h2 className="font-semibold">Comments</h2>
            <div className="mt-2 space-y-2">
              {post.comments && post.comments.length === 0 && <p className="text-sm">No comments yet</p>}
              {post.comments && post.comments.map((c: any) => (
                <div key={c.id} className="p-2 border rounded">
                  <p className="text-sm"><strong>{c.author?.username || 'User'}</strong> · <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span></p>
                  <p className="mt-1">{c.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="font-semibold">Add a comment</h3>
            <form onSubmit={submit} className="mt-2">
              <textarea className="w-full p-2 border" value={content} onChange={(e) => setContent(e.target.value)} />
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Post comment</button>
            </form>
            {msg && <p className="mt-2 text-sm">{msg}</p>}
          </section>
        </div>
      )}
    </main>
  );
}
