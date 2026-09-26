import Link from 'next/link';

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            SpamShield AI
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Catch suspicious texts before they catch you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Scan messages for urgency, suspicious links, payment requests, and scam patterns in seconds.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/analyze"
              className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Analyze a Message
            </Link>
            <a
              href="#how-it-works"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-emerald-900/20">
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Sample alert</p>
            <p className="text-slate-200">
              “URGENT! Your account is locked. Click now to verify your payment details and avoid suspension.”
            </p>
            <div className="mt-5 flex gap-2">
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">HIGH RISK</span>
              <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300">Urgent</span>
              <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300">Payment request</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
