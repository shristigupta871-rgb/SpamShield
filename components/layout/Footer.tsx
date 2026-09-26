export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 transition-colors duration-200">
      <div className="mx-auto flex flex-col sm:flex-row max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 py-6 font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-500 text-center sm:text-left">
        <p>© 2026 SpamShield AI — Explainable Threat Intelligence</p>
        <p className="text-emerald-700 dark:text-emerald-500 font-semibold">Stay safe. Verify before you act.</p>
      </div>
    </footer>
  );
}
