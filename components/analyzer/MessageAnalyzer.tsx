'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import ResultCard from './ResultCard';

export default function MessageAnalyzer() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError(null);
      setResult({
        risk: 'LOW',
        score: 0,
        signals: ['Please enter a message to analyze.'],
        recommendation: 'Add some text before scanning so we can detect suspicious patterns.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ detail: 'Backend request failed.' }));
        throw new Error(errorPayload.detail || 'Unable to analyze the message right now.');
      }

      const data = (await response.json()) as AnalysisResult & {
        classification?: string;
        category?: string;
        explanation?: string;
        recommendedAction?: string;
      };

      setResult({
        risk: data.risk,
        score: data.score ?? 0,
        classification: data.classification,
        category: data.category,
        signals: data.signals ?? ['No suspicious patterns detected.'],
        explanation: data.explanation,
        recommendation: data.recommendation ?? data.recommendedAction ?? 'Review the message carefully before acting.',
        recommendedAction: data.recommendedAction,
      });
    } catch (fetchError) {
      const messageText = fetchError instanceof Error ? fetchError.message : 'An unexpected error occurred.';
      setError(messageText);
      setResult({
        risk: 'LOW',
        score: 0,
        signals: ['Could not reach the analysis backend.'],
        recommendation: 'Start the FastAPI server on port 8000, then try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Threat scanner</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Analyze a Message</h2>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste a message here..."
          className="h-48 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-base text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500"
        />

        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </div>

      {result && <ResultCard result={result} />}
    </section>
  );
}
