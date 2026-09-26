'use client';

import SpotlightCard from '@/components/ui/SpotlightCard';

export default function RecommendedAction({ text }: { text: string }) {
  if (!text) return null;

  return (
    <SpotlightCard
      className="border-emerald-500/40 bg-slate-900/90 text-emerald-100 shadow-xl backdrop-blur-md"
      spotlightColor="rgba(16, 185, 129, 0.25)"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-base font-bold text-emerald-300 uppercase tracking-wider">
          Recommended Action
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-200">{text}</p>
    </SpotlightCard>
  );
}
