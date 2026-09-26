'use client';

import Stepper, { Step } from '@/components/ui/Stepper';

const stepsData = [
  {
    stepNumber: '01',
    title: 'Submit Input',
    subtitle: 'Paste Text, URL, Email or Screenshot',
    description: 'Provide any suspicious SMS message, web link, email header, or upload a screenshot/image for automated Tesseract OCR processing.',
    badge: 'Multi-Modal Capture',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
  },
  {
    stepNumber: '02',
    title: 'Multi-Signal Analysis',
    subtitle: 'Deep Pattern & Typosquatting Check',
    description: 'Our engine checks for high-risk urgency phrases, monetary requests, typosquatting domains, high-risk TLDs, and DKIM/SPF header mismatches.',
    badge: 'Dual Heuristic Engine',
    badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
  },
  {
    stepNumber: '03',
    title: 'ML & Threat Intel Scoring',
    subtitle: 'TF-IDF Classifier + Live Feed Check',
    description: 'The trained TF-IDF Logistic Regression model predicts spam probability while querying cached global threat intelligence feeds (URLhaus / OpenPhish).',
    badge: '60/40 Hybrid Weight',
    badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
  },
  {
    stepNumber: '04',
    title: 'Review Risk & Take Action',
    subtitle: 'Actionable Guidance & Audit History',
    description: 'Get an unrounded 0-100 risk score, clear classification badges, evidence breakdowns, and safety tips logged persistently into your database.',
    badge: 'Instant Threat Protection',
    badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 transition-colors duration-200">
      <div className="mb-12 text-center font-sans">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Step-by-Step Workflow</p>
        <h2 className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white md:text-4xl">Simple Checks. Safer Decisions.</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Explore how SpamShield AI evaluates messages, links, and screenshots in 4 simple automated steps.
        </p>
      </div>

      <div className="w-full flex justify-center">
        <Stepper
          initialStep={1}
          backButtonText="Previous Step"
          nextButtonText="Next Step"
          onFinalStepCompleted={() => {
            const analyzerElem = document.getElementById('analyzer');
            if (analyzerElem) {
              analyzerElem.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {stepsData.map((step, idx) => (
            <Step key={idx}>
              <div className="flex flex-col gap-4 text-left font-sans">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-400 dark:text-slate-600">
                    {step.stepNumber}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">{step.subtitle}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </Step>
          ))}
        </Stepper>
      </div>
    </section>
  );
}
