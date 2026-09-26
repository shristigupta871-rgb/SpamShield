import type { AnalysisResult } from './types';

export function mockAnalyze(message: string): AnalysisResult {
  const normalized = message.toLowerCase();
  const signals: string[] = [];

  if (/urgent|immediately|today|asap|act now|limited time/i.test(normalized)) {
    signals.push('Urgent or time-pressured language');
  }

  if (/https?:\/\/|\.com|\.net|\.org|click here|tap link|visit/i.test(normalized)) {
    signals.push('External link or suspicious website reference');
  }

  if (/pay|payment|wallet|bank|verify|account|update now|send money|bitcoin|gift card/i.test(normalized)) {
    signals.push('Requests for payment, account verification, or personal data');
  }

  if (/winner|congratulations|free prize|claim now|lottery|cash reward/i.test(normalized)) {
    signals.push('Prize or reward scam language');
  }

  const score = Math.min(100, signals.length * 25 + (normalized.length > 300 ? 15 : 0));

  let risk: AnalysisResult['risk'];
  let recommendation = 'This message looks relatively safe. You can proceed with caution.';

  if (score >= 70) {
    risk = 'HIGH';
    recommendation = 'Do not click any links or share personal information. Report the message and block the sender.';
  } else if (score >= 40) {
    risk = 'MEDIUM';
    recommendation = 'Verify the sender independently before acting. Avoid clicking links until you confirm legitimacy.';
  } else {
    risk = 'LOW';
  }

  return {
    risk,
    score,
    signals: signals.length > 0 ? signals : ['No obvious scam signals detected'],
    recommendation,
  };
}
