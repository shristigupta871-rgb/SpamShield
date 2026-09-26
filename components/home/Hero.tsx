'use client';

import Link from 'next/link';
import SplitText from '@/components/ui/SplitText';
import Aurora from '@/components/ui/Aurora';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-200">
      {/* Background Aurora WebGL Layer */}
      <div className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none z-0">
        <Aurora
          colorStops={['#065f46', '#10b981', '#0284c7']}
          blend={0.6}
          amplitude={1.0}
          speed={0.8}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-sans font-semibold text-emerald-800 dark:text-emerald-300 backdrop-blur-md">
              <span>🛡️</span>
              <span>SpamShield AI Threat Platform</span>
            </p>
            
            <div className="mb-2">
              <SplitText
                text="Catch suspicious texts before they catch you."
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-white"
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

            <p className="mt-6 max-w-xl font-sans text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Scan SMS messages, suspicious URLs, email headers, and screenshots for urgency, payment requests, and scam patterns in seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/analyze"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 font-sans font-bold text-slate-950 transition shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
              >
                Analyze a Message →
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 font-sans font-semibold text-slate-800 dark:text-white transition hover:border-slate-400 dark:hover:border-slate-500 backdrop-blur-md text-sm sm:text-base shadow-sm"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-colors duration-200">
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/90 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sample Threat Alert</p>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <p className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                “URGENT! Your bank account is locked. Click now to verify your payment details and avoid immediate suspension.”
              </p>
              <div className="mt-5 flex flex-wrap gap-2 font-sans">
                <span className="rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-xs font-bold text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                  🚨 HIGH RISK (92/100)
                </span>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  ⚠ Urgency Language
                </span>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  💳 Payment Request
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
