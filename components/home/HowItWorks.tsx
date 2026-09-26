const steps = [
  {
    title: 'Paste a message',
    description: 'Drop in a suspicious SMS, email, or instant message for a quick scan.',
  },
  {
    title: 'Check the signals',
    description: 'We look for urgency, payment requests, and risky link patterns.',
  },
  {
    title: 'Review the score',
    description: 'A risk level tells you how likely the message is a scam.',
  },
  {
    title: 'Take action',
    description: 'Follow the recommended steps to stay protected and avoid falling for the trap.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">How it works</p>
        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Simple checks. Safer decisions.</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
              {index + 1}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="text-slate-300">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
