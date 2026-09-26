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
      setError(err instanceof Error ? err.message : 'Error loading history');
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
    <div className="space-y-6 py-6">
      {/* Header & Metrics Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Recent Security Scans</h3>
          <p className="text-xs text-slate-400">Persisted locally in SQLite threat database</p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-900/50"
          >
            Clear All History
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Scans</p>
          <p className="mt-1 text-3xl font-extrabold text-white">{totalScans}</p>
        </div>
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-xs font-semibold uppercase text-red-400">High Risk</p>
          <p className="mt-1 text-3xl font-extrabold text-red-300">{highRiskCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-4">
          <p className="text-xs font-semibold uppercase text-amber-400">Medium Risk</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-300">{mediumRiskCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-400">Low Risk / Safe</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-300">{lowRiskCount}</p>
        </div>
      </div>

      {/* Scan History Table/List */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
          Loading scan records...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/30 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      ) : scans.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-500">
          No past scans found. Run a security check to start logging threat history.
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((item, idx) => (
            <div key={item.scan_id || idx} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-sans transition hover:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 border border-slate-800 uppercase">
                  {item.channel || 'message'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200 line-clamp-1">
                    {item.hostname || item.subject || item.sender || item.signals?.[0] || 'Scanned Input'}
                  </p>
                  <p className="text-xs text-slate-500">Category: {item.category || 'general'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Threat Score</p>
                  <p className="text-sm font-bold text-white">{item.score ?? 0} / 100</p>
                </div>
                <RiskBadge risk={item.risk} />
                <button
                  onClick={() => handleDeleteScan(item.scan_id)}
                  className="text-xs text-slate-500 hover:text-red-400 p-1"
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
