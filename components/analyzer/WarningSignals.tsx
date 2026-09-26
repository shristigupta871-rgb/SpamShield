export default function WarningSignals({ signals }: { signals: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Warning Signals</h3>
      <ul className="space-y-3 text-sm text-slate-300">
        {signals.map((signal) => (
          <li key={signal} className="flex gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-400" />
            <span>{signal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
