'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AnalysisResult } from '@/lib/types';
import ResultCard from './ResultCard';
import ScanHistoryView from './ScanHistoryView';
import ScamKnowledgeHub from '../knowledge/ScamKnowledgeHub';
import GlareHover from '@/components/ui/GlareHover';

type ActiveTab = 'message' | 'camera' | 'upload' | 'url' | 'email' | 'history' | 'knowledge';

const DEMO_EXAMPLES = [
  {
    label: '🏦 KYC Scam',
    type: 'message',
    text: 'URGENT: Your SBI bank account will be blocked today due to pending KYC update. Click http://sbi-kyc-verify.xyz to update immediately.'
  },
  {
    label: '📦 Courier Scam',
    type: 'message',
    text: 'USPS Notice: Package #928172 couldn\'t be delivered due to incorrect address. Pay $1.50 redelivery fee at http://usps-redelivery.com within 12 hours.'
  },
  {
    label: '💼 Job Scam',
    type: 'message',
    text: 'Exciting Part-Time Opportunity! Earn $300-$800 daily working 1 hour from home rating videos. Contact HR on Telegram @WorkFromHome2026'
  },
  {
    label: '💳 UPI Scam',
    type: 'message',
    text: 'You have received ₹15,000 cashback via Google Pay! Open app and enter your UPI PIN to claim reward into your bank account.'
  },
  {
    label: '🎁 Prize Scam',
    type: 'message',
    text: 'CONGRATULATIONS! You won a $1000 Walmart Gift Card! Claim your free reward today at http://claim-giftcard-win.xyz'
  }
];

function MultiChannelAnalyzerContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab') as ActiveTab | null;

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    initialTabParam && ['message', 'camera', 'upload', 'url', 'email', 'history', 'knowledge'].includes(initialTabParam)
      ? initialTabParam
      : 'message'
  );

  // Input States
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [urlInput, setUrlInput] = useState('');

  // Image & Camera States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTabParam && ['message', 'camera', 'upload', 'url', 'email', 'history', 'knowledge'].includes(initialTabParam)) {
      setActiveTab(initialTabParam);
    }
  }, [initialTabParam]);

  // Camera Controls
  const startCamera = async () => {
    setError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera. Please check browser permissions or upload an image screenshot instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  // Image File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (.png, .jpg, .jpeg, .webp).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds 10MB limit. Please choose a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Analysis Submit Handlers
  const handleAnalyzeMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message to analyze.');
      return;
    }
    await sendAnalysisRequest('http://localhost:8000/api/analyze/message', { message });
  };

  const handleAnalyzeEmail = async () => {
    if (!emailBody.trim() && !subject.trim()) {
      setError('Please enter email subject or body content.');
      return;
    }
    await sendAnalysisRequest('http://localhost:8000/api/analyze/email', { sender, subject, body: emailBody });
  };

  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a website URL or link.');
      return;
    }
    await sendAnalysisRequest('http://localhost:8000/api/analyze/url', { url: urlInput });
  };

  const handleAnalyzeVisual = async () => {
    if (!imagePreview) {
      setError('Please capture or upload an image first.');
      return;
    }
    await sendAnalysisRequest('http://localhost:8000/api/analyze/visual', {
      imageBase64: imagePreview,
      filename: 'screenshot.png'
    });
  };

  const sendAnalysisRequest = async (endpoint: string, payload: object) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: 'Analysis failed.' }));
        throw new Error(errJson.detail || 'Analysis request failed.');
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error during analysis. Is backend running?';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (exampleText: string) => {
    setActiveTab('message');
    setMessage(exampleText);
    setError(null);
  };

  const openGoogleLensSearch = () => {
    window.open('https://lens.google.com/search?p', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="analyzer" className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6">
      
      {/* Privacy First Banner */}
      <div className="mb-6 rounded-2xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
          <span>🔒 Privacy First Architecture</span>
        </div>
        <p className="mt-1 text-slate-600 dark:text-slate-400 font-sans">
          Only upload information necessary for threat analysis. Never share passwords, OTPs, PINs, CVVs, or sensitive personal credentials.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-8 shadow-2xl backdrop-blur-md transition-colors duration-200">
        
        {/* Header Title */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 px-4 py-1.5 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            Explainable Threat Intelligence
          </span>
          <h2 className="mt-3 text-3xl font-display font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            What Do You Want to Analyze?
          </h2>
          <p className="mt-2 text-sm font-sans text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Choose an input method below to inspect suspicious messages, screenshots, website links, or email headers.
          </p>
        </div>

        {/* PRIMARY ANALYSIS ACTIONS */}
        <div className="mb-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center sm:text-left">
            Primary Scanner Inputs
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <button
              onClick={() => { setActiveTab('message'); stopCamera(); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl p-3.5 sm:py-3 transition-all duration-200 border ${
                activeTab === 'message'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
              }`}
            >
              <span className="text-xl sm:text-base">💬</span>
              <span className="font-sans text-xs sm:text-sm font-semibold text-center sm:text-left">Type / Paste</span>
            </button>

            <button
              onClick={() => { setActiveTab('camera'); startCamera(); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl p-3.5 sm:py-3 transition-all duration-200 border ${
                activeTab === 'camera'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
              }`}
            >
              <span className="text-xl sm:text-base">📷</span>
              <span className="font-sans text-xs sm:text-sm font-semibold text-center sm:text-left">Use Camera</span>
            </button>

            <button
              onClick={() => { setActiveTab('upload'); stopCamera(); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl p-3.5 sm:py-3 transition-all duration-200 border ${
                activeTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
              }`}
            >
              <span className="text-xl sm:text-base">🖼️</span>
              <span className="font-sans text-xs sm:text-sm font-semibold text-center sm:text-left">Upload Image</span>
            </button>

            <button
              onClick={() => { setActiveTab('url'); stopCamera(); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl p-3.5 sm:py-3 transition-all duration-200 border ${
                activeTab === 'url'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
              }`}
            >
              <span className="text-xl sm:text-base">🔗</span>
              <span className="font-sans text-xs sm:text-sm font-semibold text-center sm:text-left">Check URL</span>
            </button>

            <button
              onClick={() => { setActiveTab('email'); stopCamera(); setError(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl p-3.5 sm:py-3 transition-all duration-200 border col-span-2 sm:col-span-1 ${
                activeTab === 'email'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
              }`}
            >
              <span className="text-xl sm:text-base">📧</span>
              <span className="font-sans text-xs sm:text-sm font-semibold text-center sm:text-left">Analyze Email</span>
            </button>
          </div>
        </div>

        {/* SECONDARY ACTIONS (DE-EMPHASIZED / SEPARATE ROW) */}
        <div className="mb-8 flex flex-wrap items-center justify-center sm:justify-start gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <span className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400 mr-2">Secondary Views:</span>
          <button
            onClick={() => { setActiveTab('history'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-sans text-xs font-semibold transition border ${
              activeTab === 'history'
                ? 'bg-slate-800 dark:bg-slate-800 text-white border-slate-700'
                : 'bg-slate-100 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📜 Scan History
          </button>
          <button
            onClick={() => { setActiveTab('knowledge'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-sans text-xs font-semibold transition border ${
              activeTab === 'knowledge'
                ? 'bg-slate-800 dark:bg-slate-800 text-white border-slate-700'
                : 'bg-slate-100 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎓 Knowledge Hub
          </button>
        </div>

        {/* Quick Examples Toolbar */}
        {(activeTab === 'message' || activeTab === 'upload') && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 transition-colors">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Try Quick Scam Examples</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_EXAMPLES.map((ex, idx) => (
                <GlareHover
                  key={idx}
                  width="auto"
                  height="auto"
                  borderRadius="0.75rem"
                  glareColor="#10b981"
                  glareOpacity={0.35}
                >
                  <button
                    onClick={() => loadExample(ex.text)}
                    className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3.5 py-2 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-white shadow-sm"
                  >
                    {ex.label}
                  </button>
                </GlareHover>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Text / SMS */}
        {activeTab === 'message' && (
          <div className="space-y-4">
            <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
              Message or SMS Text Snippet
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious SMS text message or chat snippet here..."
              className="h-44 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 font-sans text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition shadow-inner"
            />
            <button
              onClick={handleAnalyzeMessage}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-sans font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {isLoading ? 'Evaluating Message Signals...' : 'Analyze Message Threat'}
            </button>
          </div>
        )}

        {/* Tab 2: Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img src={imagePreview} alt="Captured Screenshot Preview" className="mx-auto max-h-64 rounded-2xl border border-slate-300 dark:border-slate-700 object-contain shadow-md" />
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => { setImagePreview(null); startCamera(); }}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-2.5 font-sans text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900 transition"
                  >
                    🔄 Retake Photo
                  </button>
                  <button
                    onClick={handleAnalyzeVisual}
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-6 py-2.5 font-sans text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-md"
                  >
                    {isLoading ? 'Scanning OCR Visual Features...' : '⚡ Analyze Photo'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-950 shadow-lg">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>LIVE WEBCAM FEED</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="rounded-xl bg-emerald-500 px-6 py-3 font-sans font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md"
                  >
                    📸 Capture Snapshot & Analyze
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-4 py-3 font-sans text-xs font-semibold text-slate-700 dark:text-slate-400 hover:text-red-500 transition"
                  >
                    ✕ Close Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Upload Image */}
        {activeTab === 'upload' && (
          <div className="space-y-4 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img src={imagePreview} alt="Uploaded Screenshot Preview" className="mx-auto max-h-64 rounded-2xl border border-slate-300 dark:border-slate-700 object-contain shadow-md" />
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setImagePreview(null)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-2.5 font-sans text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900 transition"
                  >
                    ✕ Remove Image
                  </button>
                  <button
                    onClick={openGoogleLensSearch}
                    className="rounded-xl border border-blue-400 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-2.5 font-sans text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1.5"
                  >
                    <span>🔍</span>
                    <span>Search with Google Lens</span>
                  </button>
                  <button
                    onClick={handleAnalyzeVisual}
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-6 py-2.5 font-sans text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-md"
                  >
                    {isLoading ? 'Scanning OCR Visual Features...' : '⚡ Analyze Image Screenshot'}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6 cursor-pointer hover:border-emerald-500 transition shadow-inner">
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-200">Click or Drag Screenshot Image Here</span>
                <span className="text-xs font-sans text-slate-500 mt-1">Supports SMS screenshots, WhatsApp chats, payment alerts (.PNG, .JPG, max 10MB)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Tab 4: URL Inspection */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
              Target Link or Domain URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://paypa1-security-login.xyz/verify-account"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-sm break-all text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition shadow-inner"
            />
            <button
              onClick={handleAnalyzeUrl}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-sans font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {isLoading ? 'Inspecting Link & Threat Feeds...' : 'Inspect URL'}
            </button>
          </div>
        )}

        {/* Tab 5: Email Analysis */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
              Sender Email & Content
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender Email Address (e.g. support@chase-secure-update.com)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-sans text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject Line (e.g. URGENT: Account Blocked)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-sans text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Paste email body text or headers here..."
              className="h-36 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 font-sans text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition shadow-inner"
            />
            <button
              onClick={handleAnalyzeEmail}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-sans font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {isLoading ? 'Analyzing Email Headers & Body...' : 'Analyze Email Threat'}
            </button>
          </div>
        )}

        {/* Tab 6: Scan History */}
        {activeTab === 'history' && <ScanHistoryView />}

        {/* Tab 7: Knowledge Hub */}
        {activeTab === 'knowledge' && <ScamKnowledgeHub />}

        {error && (
          <div className="mt-4 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-center text-xs font-sans font-semibold text-red-800 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Result Card Output */}
      {activeTab !== 'history' && activeTab !== 'knowledge' && result && (
        <ResultCard result={result} />
      )}
    </section>
  );
}

export default function MultiChannelAnalyzer() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm font-sans text-slate-500">
        Loading Threat Scanner...
      </div>
    }>
      <MultiChannelAnalyzerContent />
    </Suspense>
  );
}
