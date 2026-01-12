import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

    fetch(`${base}/groups`)
      .then((r) => r.json())
      .then((d) => setGroups(d || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  async function join(slug: string) {
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Sign in to join');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/groups/${slug}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'Join failed');
      setMsg('Joined');
      // refresh groups
      const r = await fetch(`${base}/groups`);
      const dd = await r.json();
      setGroups(dd || []);
    } catch (e: any) {
      setMsg(e.message || 'Error');
    }
  }

  async function leave(slug: string) {
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Sign in to leave');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/groups/${slug}/leave`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'Leave failed');
      setMsg('Left group');
      const r = await fetch(`${base}/groups`);
      const dd = await r.json();
      setGroups(dd || []);
    } catch (e: any) {
      setMsg(e.message || 'Error');
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Link href="/groups/create" className="px-3 py-1 bg-blue-600 text-white rounded">Create group</Link>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {!loading && groups.length === 0 && <p className="mt-4 text-sm text-gray-500">No groups yet.</p>}

      <div className="mt-6 space-y-4">
        {groups.map((g: any) => {
          const members = g.memberships || [];
          const isMember = user ? members.some((m: any) => m.userId === user.id) : false;
          return (
            <div key={g.id} className="p-4 border rounded flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg"><Link href={`/group/${g.slug}`}>{g.name}</Link></h2>
                <p className="text-sm text-gray-600">{g.rules || 'No rules specified'}</p>
                <p className="text-xs text-gray-500 mt-1">Members: {members.length}</p>
              </div>
              <div>
                {isMember ? (
                  <button className="px-3 py-1 border rounded" onClick={() => leave(g.slug)}>Leave</button>
                ) : (
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => join(g.slug)}>Join</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
