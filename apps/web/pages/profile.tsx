import { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('tdp_token');
    if (!token) {
      setMsg('Not authenticated');
      return;
    }

    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333') + '/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setUser(d.user);
        else setMsg('Unable to fetch user');
      })
      .catch((e) => setMsg('Error fetching profile'));
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      {msg && <p className="mt-4">{msg}</p>}
      {user && (
        <div className="mt-4">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
    </main>
  );
}
