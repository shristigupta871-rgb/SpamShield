'use client';

import type { RiskLevel } from '@/lib/types';
import GlitchText from '@/components/ui/GlitchText';

const colors: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
  MEDIUM: 'bg-amber-100 dark:bg-yellow-500/15 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/30',
  HIGH: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-400 border-red-400 dark:border-red-500/60 shadow-md font-black',
};

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-sans font-black uppercase tracking-wider ${colors[risk]}`}>
        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
        <GlitchText speed={0.4} enableShadows={true} className="text-red-700 dark:text-red-400 font-black tracking-wider text-xs sm:text-sm">
          🔴 HIGH RISK
        </GlitchText>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider ${colors[risk]}`}>
      {risk === 'LOW' && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
      {risk === 'MEDIUM' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
      {risk === 'LOW' ? '🟢 LOW RISK' : '🟡 MEDIUM RISK'}
    </span>
  );
}
