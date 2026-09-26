'use client';

import { useState } from 'react';
import CardSwap, { Card } from '@/components/ui/CardSwap';

interface QuizQuestion {
  id: number;
  message: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    message: "URGENT: Your SBI Account has been suspended due to pending KYC update. Click http://sbi-kyc-update.xyz to restore immediately.",
    options: [
      "Legitimate update from SBI bank",
      "Phishing scam: Urgent threat + fake domain link (.xyz)",
      "Standard promotional message"
    ],
    correctIndex: 1,
    explanation: "Red Flags: Banks never use urgent threat messages with third-party domains like .xyz. Official banks will never ask you to update KYC via unverified web links."
  },
  {
    id: 2,
    message: "You have received ₹15,000 via Google Pay cashback! Enter your UPI PIN to claim funds into your bank account.",
    options: [
      "Normal cashback collection",
      "UPI Fraud: Entering UPI PIN is ONLY for paying/sending money, NEVER for receiving money",
      "Bank system test"
    ],
    correctIndex: 1,
    explanation: "Red Flags: You NEVER enter your UPI PIN to receive money! Entering a UPI PIN authorizes a deduction from your account."
  },
  {
    id: 3,
    message: "USPS: Package delivery failure due to address error. Pay $1.50 redelivery fee at http://usps-tracking-fee.com within 12 hours.",
    options: [
      "Legitimate courier notification",
      "Package Delivery Scam: Fake fee payment link to steal credit card details",
      "Postal survey"
    ],
    correctIndex: 1,
    explanation: "Red Flags: Postal services do not demand fee payments over SMS links with short timeframes. Always verify tracking numbers directly on official apps."
  }
];

const SCAM_CARDS = [
  {
    icon: '🏦',
    title: 'Banking & KYC Scams',
    subtitle: 'Targeting account credentials & access',
    description: 'Scammers send panic-inducing SMS messages claiming your bank account or debit card will be blocked immediately unless you complete a KYC update.',
    goldenRule: 'Banks never ask you to update KYC via SMS links. Always use your official banking app.'
  },
  {
    icon: '💳',
    title: 'UPI & Payment Collect Scams',
    subtitle: 'Targeting mobile wallets & PINs',
    description: 'Scammers send fake cashback offers or collect request links, convincing victims that entering their UPI PIN will deposit money into their bank account.',
    goldenRule: 'Entering your UPI PIN is ONLY for paying money, NEVER for receiving money.'
  },
  {
    icon: '📦',
    title: 'Courier & Delivery Scams',
    subtitle: 'Targeting shipping fees & credit cards',
    description: 'Fake SMS notifications claiming a package could not be delivered due to address errors or unpaid fees, linking to credit card harvesting sites.',
    goldenRule: 'Verify parcel tracking numbers directly on official USPS, FedEx, or DHL websites.'
  },
  {
    icon: '💼',
    title: 'Fake Job & Task Scams',
    subtitle: 'Targeting job seekers with high-pay offers',
    description: 'Unsolicited WhatsApp/Telegram offers promising $500/day for rating YouTube videos, requiring upfront "equipment or training fees".',
    goldenRule: 'Legitimate employers never ask candidates to pay money upfront for work equipment or training.'
  },
  {
    icon: '🎁',
    title: 'Prize & Sweepstakes Fraud',
    subtitle: 'Targeting lottery claims & processing fees',
    description: 'Messages claiming you won a new car or $50,000 cash prize, requiring you to click a link or pay processing fees to claim rewards.',
    goldenRule: 'Never pay money or click links to claim a prize from a lottery you never entered.'
  }
];

export default function ScamKnowledgeHub() {
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="space-y-12 py-8 transition-colors duration-200">
      {/* Knowledge Hub Header */}
      <div className="text-center font-sans">
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50">
          Educational Security Guide
        </span>
        <h2 className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white sm:text-4xl">Scam Knowledge Hub</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 font-sans text-base max-w-2xl mx-auto">
          Learn how scammers operate, spot common warning signs, and understand how to protect your credentials and finances.
        </p>
      </div>

      {/* Interactive Quiz Section */}
      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Interactive Quiz</span>
            <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-1">Can You Spot the Red Flags?</h3>
          </div>
          <span className="text-2xl">🎯</span>
        </div>

        <div className="space-y-6 font-sans">
          {QUIZ_QUESTIONS.map((q) => {
            const selected = selectedQuizAnswers[q.id];
            const isAnswered = showResults[q.id];
            const isCorrect = selected === q.correctIndex;

            return (
              <div key={q.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5">
                <p className="text-xs uppercase font-sans font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-2">Scenario #{q.id}</p>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 font-mono text-sm break-all text-slate-800 dark:text-slate-200 mb-4 shadow-sm">
                  "{q.message}"
                </div>

                <p className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-300 mb-3">What looks suspicious about this message?</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {q.options.map((option, idx) => {
                    let btnStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700";
                    if (isAnswered) {
                      if (idx === q.correctIndex) {
                        btnStyle = "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-bold";
                      } else if (idx === selected && !isCorrect) {
                        btnStyle = "border-red-500 bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 font-bold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={`rounded-xl border p-3 text-left font-sans text-xs font-medium transition ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className={`mt-4 rounded-xl border p-4 font-sans text-xs leading-relaxed ${
                    isCorrect
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300'
                      : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300'
                  }`}>
                    <p className="font-bold mb-1">{isCorrect ? '✅ Correct Assessment!' : '❌ Incorrect'}</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Stacked Card Swap Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 p-8 shadow-2xl overflow-hidden">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Scam Encyclopedia Stack</span>
            <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mt-1">Common Scam Categories & Golden Rules</h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            🔄 Auto-Swapping 3D Stack (Hover to Pause)
          </span>
        </div>

        <div className="relative h-[420px] w-full flex items-center justify-center py-6">
          <CardSwap
            width={480}
            height={340}
            cardDistance={40}
            verticalDistance={45}
            delay={3800}
            pauseOnHover={true}
            skewAmount={3}
          >
            {SCAM_CARDS.map((card, idx) => (
              <Card key={idx} className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 text-left text-slate-900 dark:text-white shadow-md">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{card.icon}</span>
                    <div>
                      <h4 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">{card.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-300 dark:border-emerald-950 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-slate-800 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Golden Rule: </span>
                  {card.goldenRule}
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </div>
  );
}
