import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GroupPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [group, setGroup] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    const token = localStorage.getItem('tdp_token');
    if (token) {
      fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.ok) setUser(d.user); })
        .catch(() => {});
    }

    if (!slug) return;
    fetch(`${base}/groups/${slug}`)
      .then((r) => r.json())
      .then((d) => setGroup(d || null))
      .catch(() => setMsg('Unable to fetch group'));
  }, [slug]);

  async function join() {
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Sign in to join');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/groups/${slug}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'Join failed');
      setMsg('Joined');
      const r = await fetch(`${base}/groups/${slug}`);
      const dd = await r.json();
      setGroup(dd || null);
    } catch (e: any) {
      setMsg(e.message || 'Error');
    }
  }

  async function leave() {
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Sign in to leave');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/groups/${slug}/leave`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'Leave failed');
      setMsg('Left group');
      const r = await fetch(`${base}/groups/${slug}`);
      const dd = await r.json();
      setGroup(dd || null);
    } catch (e: any) {
      setMsg(e.message || 'Error');
    }
  }

  if (!group) return <main className="min-h-screen p-8"><p>Loading...</p></main>;

  const members = group.memberships || [];
  const isMember = user ? members.some((m: any) => m.userId === user.id) : false;

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-gray-600">{group.rules || 'No rules specified'}</p>
          <p className="text-xs text-gray-500 mt-1">Members: {members.length}</p>
        </div>
        <div>
          {isMember ? (
            <button className="px-3 py-1 border rounded" onClick={leave}>Leave</button>
          ) : (
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={join}>Join</button>
          )}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="font-semibold">Posts</h2>
        <div className="mt-4 space-y-4">
          {group.posts && group.posts.length === 0 && <p className="text-sm">No posts in this group yet.</p>}
          {group.posts && group.posts.map((p: any) => (
            <div key={p.id} className="p-3 border rounded">
              <Link href={`/post/${p.id}`} className="font-semibold text-blue-600">{p.content?.slice(0,80) || 'Post'}</Link>
              <p className="text-xs text-gray-500">by {p.authorId}</p>
            </div>
          ))}
        </div>
      </section>

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
