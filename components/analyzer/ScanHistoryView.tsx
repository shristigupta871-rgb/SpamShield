'use client';

import { useState, useEffect } from 'react';
import type { AnalysisResult } from '@/lib/types';
import RiskBadge from './RiskBadge';

const API_KEY = 'spamshield_secret_key_2026';

export default function ScanHistoryView() {
  const [scans, setScans] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/scans', {
        headers: { 'X-API-Key': API_KEY }
      });
      if (!res.ok) throw new Error('Failed to fetch scan history');
      const data = await res.json();
      setScans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading history. Is backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScan = async (scanId?: number) => {
    if (!scanId) return;
    try {
      await fetch(`http://localhost:8000/api/scans/${scanId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      });
      setScans(prev => prev.filter(s => s.scan_id !== scanId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all scan history records?')) return;
    try {
      await fetch('http://localhost:8000/api/scans', {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      });
      setScans([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalScans = scans.length;
  const highRiskCount = scans.filter(s => s.risk === 'HIGH').length;
  const mediumRiskCount = scans.filter(s => s.risk === 'MEDIUM').length;
  const lowRiskCount = scans.filter(s => s.risk === 'LOW').length;

  return (
    <div className="space-y-6 py-6 transition-colors duration-200">
      {/* Header & Metrics Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-sans">
        <div>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Recent Security Scans</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Persisted locally in SQLite threat database</p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2 font-sans text-xs font-semibold text-red-700 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/50 shadow-sm"
          >
            Clear All History
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4 font-sans">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Scans</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{totalScans}</p>
        </div>
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">High Risk</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-red-700 dark:text-red-300 tabular-nums">{highRiskCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Medium Risk</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">{mediumRiskCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Low Risk / Safe</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{lowRiskCount}</p>
        </div>
      </div>

      {/* Scan History Table/List */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 text-center text-sm font-sans text-slate-500 dark:text-slate-400">
          Loading scan records...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-300 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 text-center text-sm font-sans text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : scans.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-8 text-center text-sm font-sans text-slate-500">
          No past scans found. Run a security check to start logging threat history.
        </div>
      ) : (
        <div className="space-y-3 font-sans">
          {scans.map((item, idx) => (
            <div key={item.scan_id || idx} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-4 font-sans transition hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  {item.channel || 'message'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">
                    {item.hostname || item.subject || item.sender || item.signals?.[0] || 'Scanned Input'}
                  </p>
                  <p className="text-xs text-slate-500 font-sans">Category: {item.category || 'general'} {item.scan_id && <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600 ml-2 tabular-nums">ID #{item.scan_id}</span>}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-sans text-slate-500 dark:text-slate-400">Threat Score</p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">{item.score ?? 0} / 100</p>
                </div>
                <RiskBadge risk={item.risk} />
                <button
                  onClick={() => handleDeleteScan(item.scan_id)}
                  className="text-xs text-slate-400 hover:text-red-500 p-1"
                  title="Delete scan record"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
