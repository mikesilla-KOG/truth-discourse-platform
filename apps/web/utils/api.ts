export async function post(path: string, body: any) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}
