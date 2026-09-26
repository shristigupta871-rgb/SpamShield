'use client';

import { useState } from 'react';

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

export default function ScamKnowledgeHub() {
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="space-y-12 py-8">
      {/* Knowledge Hub Header */}
      <div className="text-center">
        <span className="rounded-full bg-emerald-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-800/50">
          Educational Security Guide
        </span>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Scam Knowledge Hub</h2>
        <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
          Learn how scammers operate, spot common warning signs, and understand how to protect your credentials and finances.
        </p>
      </div>

      {/* Interactive Quiz Section */}
      <div className="rounded-3xl border border-emerald-900/60 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Interactive Quiz</span>
            <h3 className="text-2xl font-bold text-white mt-1">Can You Spot the Red Flags?</h3>
          </div>
          <span className="text-2xl">🎯</span>
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q) => {
            const selected = selectedQuizAnswers[q.id];
            const isAnswered = showResults[q.id];
            const isCorrect = selected === q.correctIndex;

            return (
              <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Scenario #{q.id}</p>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-sm text-slate-200 mb-4">
                  "{q.message}"
                </div>

                <p className="text-sm font-semibold text-slate-300 mb-3">What looks suspicious about this message?</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {q.options.map((option, idx) => {
                    let btnStyle = "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700";
                    if (isAnswered) {
                      if (idx === q.correctIndex) {
                        btnStyle = "border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold";
                      } else if (idx === selected && !isCorrect) {
                        btnStyle = "border-red-500 bg-red-950/80 text-red-300 font-bold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={`rounded-xl border p-3 text-left text-xs transition ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed ${
                    isCorrect ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300' : 'border-red-800 bg-red-950/30 text-red-300'
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

      {/* Scam Encyclopedia Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏦</span>
            <div>
              <h3 className="text-lg font-bold text-white">Banking & KYC Scams</h3>
              <p className="text-xs text-slate-400">Targeting account access & credentials</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Scammers send panic-inducing SMS messages claiming your bank account or debit card will be blocked immediately unless you complete a KYC update.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">Golden Rule:</span> Banks never ask you to update KYC via SMS links. Always use your official banking app.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💳</span>
            <div>
              <h3 className="text-lg font-bold text-white">UPI & Payment Collect Scams</h3>
              <p className="text-xs text-slate-400">Targeting mobile wallets & banking PINs</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Scammers send "Collect Request" notifications or fake cashback offers, convincing victims that entering their UPI PIN will deposit money into their account.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">Golden Rule:</span> Entering your UPI PIN is ONLY for paying money, NEVER for receiving money.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📦</span>
            <div>
              <h3 className="text-lg font-bold text-white">Courier & Delivery Scams</h3>
              <p className="text-xs text-slate-400">Targeting delivery notifications & shipping fees</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Fake SMS notifications claiming a package could not be delivered due to address errors or unpaid customs fees, linking to credit card harvesting forms.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">Golden Rule:</span> Verify parcel tracking numbers directly on official USPS, FedEx, or DHL websites.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💼</span>
            <div>
              <h3 className="text-lg font-bold text-white">Fake Job & Task Scams</h3>
              <p className="text-xs text-slate-400">Targeting job seekers with high-pay promises</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Unsolicited WhatsApp/Telegram offers promising $500/day for 1 hour of work rating YouTube videos or liking posts, requiring upfront "registration fees".
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">Golden Rule:</span> Legitimate employers never ask candidates to pay money upfront for work equipment or training.
          </div>
        </div>
      </div>
    </div>
  );
}
