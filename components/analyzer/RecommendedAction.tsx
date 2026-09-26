export default function RecommendedAction({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
      <h3 className="mb-2 text-lg font-semibold text-emerald-200">Recommended Action</h3>
      <p className="text-sm leading-6 text-emerald-100/90">{text}</p>
    </div>
  );
}
