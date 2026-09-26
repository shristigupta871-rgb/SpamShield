import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          SpamShield AI
        </Link>

        <div className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/analyze" className="hover:text-white">Analyze</Link>
        </div>
      </div>
    </nav>
  );
}
