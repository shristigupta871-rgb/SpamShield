'use client';

import type { RiskLevel } from '@/lib/types';
import GlitchText from '@/components/ui/GlitchText';

const colors: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-red-950/80 text-red-400 border-red-500/60 shadow-lg shadow-red-950/50 font-black',
};

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider ${colors[risk]}`}>
        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
        <GlitchText speed={0.4} enableShadows={true} className="text-red-400 font-black tracking-wider text-xs sm:text-sm">
          HIGH RISK
        </GlitchText>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs sm:text-sm font-bold uppercase ${colors[risk]}`}>
      {risk === 'LOW' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
      {risk === 'MEDIUM' && <span className="h-2 w-2 rounded-full bg-yellow-400" />}
      {risk} RISK
    </span>
  );
}
