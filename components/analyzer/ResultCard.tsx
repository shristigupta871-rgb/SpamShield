'use client';

import type { AnalysisResult } from '@/lib/types';
import RiskBadge from './RiskBadge';
import CountUp from '@/components/ui/CountUp';

export default function ResultCard({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return null;
  }

  const score = result.score ?? 0;
  const risk = result.risk;
  const signals = result.signals || [];
  const evidence = result.evidence || [];

  const categoryLabels: Record<string, string> = {
    banking_kyc_scam: '🏦 Banking / KYC Scam',
    upi_payment_scam: '💳 UPI / Payment Scam',
    delivery_scam: '📦 Delivery / Courier Scam',
    job_scam: '💼 Job / Employment Scam',
    investment_scam: '📈 Investment Scam',
    prize_scam: '🎁 Prize / Sweepstakes Scam',
    phishing: '🎣 Phishing Attempt',
    phishing_url: '🔗 Phishing Link / Malicious Domain',
    phishing_email: '📧 Spoofed / Phishing Email',
    suspicious_link: '⚠️ Suspicious URL',
    suspicious_email: '⚠️ Suspicious Email Header',
    suspicious: '⚠️ Suspicious Activity',
    safe_url: '✅ Safe Domain',
    safe_email: '✅ Safe Email Header',
    safe: '✅ Legitimate / Not Spam'
  };

  const formattedCategory = result.category ? (categoryLabels[result.category] || result.category.toUpperCase().replace('_', ' ')) : 'General Security Check';

  // Breakdown Signal Flags
  const isUrgent = signals.some(s => s.toLowerCase().includes('urgent') || s.toLowerCase().includes('time-pressured'));
  const isFinancial = signals.some(s => s.toLowerCase().includes('payment') || s.toLowerCase().includes('financial') || s.toLowerCase().includes('bank') || s.toLowerCase().includes('kyc') || s.toLowerCase().includes('upi'));
  const isLink = signals.some(s => s.toLowerCase().includes('link') || s.toLowerCase().includes('url') || s.toLowerCase().includes('website') || s.toLowerCase().includes('domain'));
  const isCredential = signals.some(s => s.toLowerCase().includes('verification') || s.toLowerCase().includes('credential') || s.toLowerCase().includes('spoofed') || s.toLowerCase().includes('mismatch'));
  const isThreat = signals.some(s => s.toLowerCase().includes('threat') || s.toLowerCase().includes('block') || s.toLowerCase().includes('locked') || s.toLowerCase().includes('action'));

  // Risk Bar calculation
  const filledBars = Math.min(10, Math.max(1, Math.round(score / 10)));
  const emptyBars = 10 - filledBars;
  const riskBarString = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Title & Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700">
                Category: {formattedCategory}
              </span>
              {result.channel && (
                <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-800">
                  Channel: {result.channel}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-extrabold text-white">SpamShield Threat Intelligence Report</h3>
          </div>
          <RiskBadge risk={risk} />
        </div>

        {/* Task 4: Separate External Threat Intelligence Feed Match Banner */}
        {result.threat_feed_match !== undefined && (
          <div className={`mb-6 rounded-2xl border p-4 text-xs backdrop-blur-sm ${
            result.threat_feed_match 
              ? 'border-red-800 bg-red-950/40 text-red-200' 
              : 'border-emerald-900 bg-emerald-950/20 text-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider">
                {result.threat_feed_match ? '🚨 External Threat Feed Match: VERIFIED MALICIOUS' : '🛡️ Threat Feed Check: CLEAR'}
              </span>
              <span className="font-mono text-[10px] opacity-75">{result.threat_feed_source || 'URLhaus / OpenPhish Feed'}</span>
            </div>
            <p className="mt-1 leading-relaxed opacity-90">
              {result.threat_feed_match 
                ? 'This domain or URL was identified in live global phishing and malware intelligence feeds.' 
                : 'URL checked against cached global phishing feeds; no active feed blocks matched.'}
            </p>
          </div>
        )}

        {/* Risk Level Bar */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Assessment Level</span>
            <span className="text-sm font-extrabold text-white">
              <CountUp from={0} to={score} duration={1.2} className="text-emerald-400 font-extrabold" /> / 100
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl tracking-widest text-emerald-400 font-extrabold mb-2">
            {riskBarString} <span className="text-sm font-sans font-bold ml-2 text-slate-200">{risk} RISK</span>
          </div>
          <p className="text-xs text-slate-400">
            {risk === 'HIGH'
              ? 'Multiple critical threat vectors detected. Strong indicators of phishing or malicious intent.'
              : risk === 'MEDIUM'
                ? 'Moderate threat signals present. Exercise caution and verify sender independently.'
                : 'Low threat level. No major phishing indicators detected.'}
          </p>
        </div>

        {/* Visual OCR Extracted Text snippet if present */}
        {result.extractedText && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-emerald-400">OCR Extracted Image Text</span>
              <span className="text-xs text-slate-500 font-mono">{result.ocrActive ? 'Tesseract OCR Active' : 'Visual Feature Scan'}</span>
            </div>
            <p className="font-mono text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto italic">
              "{result.extractedText}"
            </p>
          </div>
        )}

        {/* Why Was This Flagged? Section */}
        <div className="mb-6">
          <h4 className="text-base font-bold text-white mb-3">Why Was This Flagged?</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {isUrgent && (
              <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3 text-xs">
                <span className="font-bold text-amber-300">⚠ Urgency Language</span>
                <p className="mt-1 text-slate-300">Pressures recipient to act immediately with deadline threats.</p>
              </div>
            )}
            {isFinancial && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-xs">
                <span className="font-bold text-red-300">⚠ Financial Action Request</span>
                <p className="mt-1 text-slate-300">Requests money transfers, UPI PINs, or bank account credentials.</p>
              </div>
            )}
            {isLink && (
              <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3 text-xs">
                <span className="font-bold text-amber-300">⚠ External Link Reference</span>
                <p className="mt-1 text-slate-300">Contains unverified URL link pointing to external sites.</p>
              </div>
            )}
            {isThreat && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-xs">
                <span className="font-bold text-red-300">⚠ Threat / Account Block Signal</span>
                <p className="mt-1 text-slate-300">Claims an account, debit card, or service will be locked today.</p>
              </div>
            )}
            {!isUrgent && !isFinancial && !isLink && !isThreat && (
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                ✓ No high-priority threat signals identified.
              </div>
            )}
          </div>
        </div>

        {/* Evidence / Suspicious Phrases Section */}
        {evidence.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Evidence & Suspicious Phrases Found</h4>
            <div className="space-y-2">
              {evidence.map((ev, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs">
                  <span className="font-mono font-bold text-emerald-400">{ev.phrase}</span>
                  <span className="text-slate-400">→ {ev.label}: <span className="text-slate-300">{ev.rationale}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ML Model Intelligence Box */}
        {result.mlDetails && (
          <div className="mb-6 rounded-2xl border border-emerald-950 bg-emerald-950/20 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Machine Learning Model Prediction
              </span>
              <span className="text-xs text-slate-400 font-mono">{result.mlDetails.model_used}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">ML Spam Probability</p>
                <p className="mt-1 text-2xl font-bold text-emerald-300">
                  <CountUp from={0} to={result.mlDetails.ml_probability} duration={1.2} />%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Classifier Confidence</p>
                <p className="mt-1 text-2xl font-bold text-emerald-300">
                  <CountUp from={0} to={result.mlDetails.ml_confidence} duration={1.2} />%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scan Breakdown Table */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scan Signal Breakdown</h4>
          <div className="divide-y divide-slate-800/60 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Urgent Language</span>
              <span className={isUrgent ? "font-bold text-amber-400" : "text-emerald-400"}>{isUrgent ? "⚠ Detected" : "✓ Not detected"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Financial Request</span>
              <span className={isFinancial ? "font-bold text-red-400" : "text-emerald-400"}>{isFinancial ? "⚠ Detected" : "✓ Not detected"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Suspicious URL / Domain</span>
              <span className={isLink ? "font-bold text-amber-400" : "text-emerald-400"}>{isLink ? "⚠ Detected" : "✓ Not detected"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Credential Harvest Attempt</span>
              <span className={isCredential ? "font-bold text-red-400" : "text-emerald-400"}>{isCredential ? "⚠ Detected" : "✓ Not detected"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Threat / Account Block Language</span>
              <span className={isThreat ? "font-bold text-red-400" : "text-emerald-400"}>{isThreat ? "⚠ Detected" : "✓ Not detected"}</span>
            </div>
          </div>
        </div>

        {/* Safety Recommendation Box */}
        <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Safety Recommendation</h4>
          <div className="space-y-2 text-xs text-slate-200">
            <p className="font-semibold text-slate-100">🚫 What Should You Do?</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Do not click any web links or tap phone numbers provided in suspicious messages.</li>
              <li><strong className="text-red-300">Never share:</strong> OTP, UPI PIN, Passwords, CVV, or banking credentials.</li>
              <li>Verify independently using the organization's official app or official website.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
