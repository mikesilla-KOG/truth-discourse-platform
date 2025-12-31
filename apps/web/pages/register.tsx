import { FormEvent, useState } from 'react';
import { post } from '../utils/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function handle(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await post('/auth/register', { email, username, password });
      setMsg('Account created. You can now log in.');
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={handle} className="mt-4 space-y-4 max-w-md">
        <input className="w-full p-2 border" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full p-2 border" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 border" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Create account</button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </form>
    </main>
  )
}
