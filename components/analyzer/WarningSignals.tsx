'use client';

import AnimatedList from '@/components/ui/AnimatedList';

export default function WarningSignals({ signals }: { signals: string[] }) {
  if (!signals || signals.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 p-5 shadow-lg backdrop-blur-md font-sans transition-colors duration-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          Detected Warning Signals ({signals.length})
        </h3>
        <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-500">Interactive Signal Stream</span>
      </div>

      <AnimatedList
        items={signals}
        showGradients={signals.length > 3}
        enableArrowNavigation={true}
        displayScrollbar={signals.length > 4}
      />
    </div>
  );
}
