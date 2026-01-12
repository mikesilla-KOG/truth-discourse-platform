import '../styles/globals.css'
import type { AppProps } from 'next/app'

import Link from 'next/link';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <header className="p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold">DiscourseTruth</Link>
          <nav className="space-x-4">
            <Link href="/groups" className="text-sm text-gray-700">Groups</Link>
            <Link href="/profile" className="text-sm text-gray-700">Profile</Link>
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
