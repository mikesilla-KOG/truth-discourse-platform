import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateGroup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rules, setRules] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('tdp_token');
    if (!token) return setMsg('Sign in to create groups');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    try {
      const res = await fetch(`${base}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, rules }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'Create failed');
      router.push(`/group/${d.slug}`);
    } catch (e: any) {
      setMsg(e.message || 'Error');
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Create group</h1>
      <form onSubmit={submit} className="mt-4 max-w-md space-y-4">
        <input className="w-full p-2 border" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full p-2 border" placeholder="Rules / description" value={rules} onChange={(e) => setRules(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </form>
    </main>
  );
}
