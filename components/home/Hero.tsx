'use client';

import Link from 'next/link';
import SplitText from '@/components/ui/SplitText';

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            🛡️ SpamShield AI Platform
          </p>
          
          <div className="mb-2">
            <SplitText
              text="Catch suspicious texts before they catch you."
              className="text-4xl font-extrabold tracking-tight text-white md:text-6xl leading-tight"
              delay={45}
              duration={0.7}
              splitType="words"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              tag="h1"
              textAlign="left"
            />
          </div>

          <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
            Scan messages, suspicious URLs, email headers, and screenshots for urgency, payment requests, and scam patterns in seconds.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/analyze"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 font-bold text-slate-950 transition hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
            >
              Analyze a Message →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 backdrop-blur-md">
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Sample Threat Alert</p>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <p className="text-sm font-mono text-slate-200 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              “URGENT! Your bank account is locked. Click now to verify your payment details and avoid immediate suspension.”
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-950 px-3 py-1 text-xs font-bold text-red-300 border border-red-800">
                🚨 HIGH RISK (92/100)
              </span>
              <span className="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-800">
                ⚠ Urgency
              </span>
              <span className="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-800">
                💳 Payment Request
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
