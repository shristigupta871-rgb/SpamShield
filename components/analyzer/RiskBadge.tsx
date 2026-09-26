import type { RiskLevel } from '@/lib/types';

const colors: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${colors[risk]}`}>
      {risk}
    </span>
  );
}
