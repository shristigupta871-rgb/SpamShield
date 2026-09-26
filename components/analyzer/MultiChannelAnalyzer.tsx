'use client';

import { useState, useRef } from 'react';
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

export default function MultiChannelAnalyzer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('message');

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
      setError('Could not access camera. Please allow camera permissions or upload an image file instead.');
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
      const msg = err instanceof Error ? err.message : 'Unexpected error during analysis.';
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

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      
      {/* Privacy First Banner */}
      <div className="mb-6 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-4 text-xs text-slate-300 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <span>🔒 Privacy First</span>
        </div>
        <p className="mt-1 text-slate-400">
          Only upload information necessary for threat analysis. Never share passwords, OTPs, PINs, CVVs, or sensitive credentials.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Title */}
        <div className="mb-6 text-center">
          <span className="rounded-full bg-emerald-950 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-800">
            Explainable Scam Intelligence
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">SpamShield Threat Scanner</h2>
          <p className="mt-2 text-sm text-slate-400">
            Analyze suspicious messages, screenshots, emails and URLs.
          </p>
        </div>

        {/* Primary Input Switcher Navigation Tabs */}
        <div className="mb-6 flex flex-wrap justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-950 p-1.5 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('message'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'message' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            💬 Type / Paste
          </button>
          <button
            onClick={() => { setActiveTab('camera'); startCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'camera' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            📷 Use Camera
          </button>
          <button
            onClick={() => { setActiveTab('upload'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'upload' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🖼️ Upload Image
          </button>
          <button
            onClick={() => { setActiveTab('url'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'url' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔗 Check URL
          </button>
          <button
            onClick={() => { setActiveTab('email'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'email' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            📧 Analyze Email
          </button>
          <button
            onClick={() => { setActiveTab('history'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 Scan History
          </button>
          <button
            onClick={() => { setActiveTab('knowledge'); stopCamera(); setError(null); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
              activeTab === 'knowledge' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎓 Knowledge Hub
          </button>
        </div>

        {/* Quick Examples Toolbar */}
        {(activeTab === 'message' || activeTab === 'upload') && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Try Quick Scam Examples</p>
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
                    className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500 hover:text-white"
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
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious SMS text message or chat snippet here..."
              className="h-44 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
            <button
              onClick={handleAnalyzeMessage}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing Message Threat...' : 'Analyze Message'}
            </button>
          </div>
        )}

        {/* Tab 2: Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4 text-center">
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Captured Screenshot" className="mx-auto max-h-64 rounded-2xl border border-slate-700 object-contain" />
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => { setImagePreview(null); startCamera(); }}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900"
                  >
                    Retake Photo
                  </button>
                  <button
                    onClick={handleAnalyzeVisual}
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isLoading ? 'Scanning OCR Visuals...' : 'Analyze Photo'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                </div>
                <button
                  onClick={capturePhoto}
                  className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  📸 Take Snapshot & Analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Upload Image */}
        {activeTab === 'upload' && (
          <div className="space-y-4 text-center">
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Uploaded Preview" className="mx-auto max-h-64 rounded-2xl border border-slate-700 object-contain" />
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setImagePreview(null)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900"
                  >
                    Remove Image
                  </button>
                  <button
                    onClick={handleAnalyzeVisual}
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isLoading ? 'Scanning OCR Visuals...' : 'Analyze Image'}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-6 cursor-pointer hover:border-emerald-500 transition">
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-sm font-semibold text-slate-200">Click or Drag Image Screenshot Here</span>
                <span className="text-xs text-slate-500 mt-1">Supports SMS screenshots, WhatsApp chats, payment alerts (.PNG, .JPG)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Tab 4: URL Inspection */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://paypa1-security-login.xyz/verify-account"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm font-mono text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
            <button
              onClick={handleAnalyzeUrl}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Inspecting Link & Domain...' : 'Inspect URL'}
            </button>
          </div>
        )}

        {/* Tab 5: Email Analysis */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender Email Address (e.g. support@chase-secure-update.com)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject Line (e.g. URGENT: Account Blocked)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Paste email body text here..."
              className="h-36 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
            <button
              onClick={handleAnalyzeEmail}
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing Email Headers & Body...' : 'Analyze Email'}
            </button>
          </div>
        )}

        {/* Tab 6: Scan History */}
        {activeTab === 'history' && <ScanHistoryView />}

        {/* Tab 7: Knowledge Hub */}
        {activeTab === 'knowledge' && <ScamKnowledgeHub />}

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-center text-xs font-semibold text-red-300">
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
