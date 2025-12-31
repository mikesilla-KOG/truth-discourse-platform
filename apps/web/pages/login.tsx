import { FormEvent, useState } from 'react';
import { post } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function handle(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await post('/auth/login', { email, password });
      // In a real app you'd persist token and redirect
      setMsg('Logged in. Token received.');
      if (res.token) {
        localStorage.setItem('tdp_token', res.token);
      }
      console.log(res);
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handle} className="mt-4 space-y-4 max-w-md">
        <input className="w-full p-2 border" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 border" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </form>
    </main>
  )
}
