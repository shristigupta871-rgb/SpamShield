# SpamShield AI — Full Project Technical Specification & Handoff Document

## Executive Summary

**SpamShield AI** is an end-to-end, production-grade, explainable scam intelligence and multi-channel threat detection platform. It is built using a modern full-stack architecture: **Next.js 14** (TypeScript, Tailwind CSS) for the frontend user experience and **FastAPI** (Python 3.12, Scikit-Learn, SQLite, Pytesseract OCR) for the backend microservice.

The platform is **100% COMPLETED through Level 7 (Production Hardened)** and includes Camera Snapshot Capture, Image File Upload OCR, Scam Knowledge Hub, Interactive Educational Quiz, Evidence Phrase Extraction, and Database Scan History.

---

## 1. Complete Workflow Completed (Level 1 → Level 7 + Visual Features)

### Level 1 — UI Shell & Visual Design
- Built a modern, dark-mode cybersecurity visual system with custom Tailwind CSS styling.
- Responsive landing page (`app/page.tsx`), navigation header (`components/layout/Navbar.tsx`), and threat scanner UI.

### Level 2 — Real Frontend ↔ Backend Integration
- Established HTTP API communication between Next.js (`http://localhost:3000`) and FastAPI (`http://localhost:8000`).
- Handled loading states, network error handling, CORS headers, and API error payloads.

### Level 3 — Real Machine Learning Classifier Pipeline
- Trained an offline TF-IDF + Logistic Regression classifier on benchmark SMS and Email scam/phishing datasets ([`ml/train.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/ml/train.py)).
- Serialized model artifacts to [`ml/models/spam_pipeline.pkl`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/ml/models/spam_pipeline.pkl) and [`ml/models/evaluation_metrics.json`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/ml/models/evaluation_metrics.json) (100% Precision, Recall, and F1 Score).
- Implemented runtime model loader ([`backend/app/services/ml_service.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/services/ml_service.py)) providing real-time spam probability predictions.

### Level 4 — Scam Intelligence & Explainability Engine
- Implemented a hybrid threat scoring engine combining 60% ML spam probability with 40% heuristic rule triggers.
- Category classification (`banking_kyc_scam`, `upi_payment_scam`, `delivery_scam`, `job_scam`, `prize_scam`, `phishing`, `safe`).
- Generated human-readable "Why Was This Flagged?" explainability reports detailing specific threat indicators.

### Level 5 — Multi-Channel Threat Inspection
- **SMS / Message Scanner**: Analyzes text messages for threat language, urgency, and payout demands.
- **URL & Domain Link Inspector** ([`backend/app/services/url_service.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/services/url_service.py)): Detects domain typosquatting (e.g. `paypa1-login.xyz`), raw IP hostnames, high-risk TLDs (`.xyz`, `.top`, `.cc`), link shorteners (`bit.ly`, `tinyurl.com`), and excessive subdomain depth.
- **Email Header & Body Inspector** ([`backend/app/services/email_service.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/services/email_service.py)): Detects sender domain spoofing (e.g., email claiming to be from Chase sent from `@chase-secure-update.com`), urgent subject lines, and embedded links.

### Level 6 — SQLite Database Scan History Persistence
- Integrated SQLite database ([`backend/app/db/database.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/db/database.py)) to record all security scans automatically.
- Scan history endpoints (`GET /api/scans`, `DELETE /api/scans/{scan_id}`, `DELETE /api/scans`).
- Built Scan History dashboard UI ([`components/analyzer/ScanHistoryView.tsx`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/components/analyzer/ScanHistoryView.tsx)).

### Level 7 — Production Hardening & Testing
- **Rate Limiting Middleware** ([`backend/app/middleware/security.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/middleware/security.py)): In-memory token-bucket rate limiter enforcing 100 req/min per IP, returning HTTP 429 on abuse.
- **Structured Access Logger**: Tracks API request processing duration and logs IP access.
- **Automated Test Suite** ([`backend/tests/test_all_levels.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/tests/test_all_levels.py)): 100% automated pass rate across Level 1 - 7 test suite.

### Additional Product Features
- **📷 Camera Snapshot Capture**: HTML5 MediaDevices camera capture with live video preview and retake controls.
- **🖼️ Image Upload OCR Scanner**: Drag-and-drop screenshot scanner (`.PNG`, `.JPG`) using `Pillow` and `pytesseract` OCR text extraction ([`backend/app/services/visual_service.py`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/backend/app/services/visual_service.py)).
- **Evidence Phrase Extraction**: Displays exact quoted evidence phrases with security rationales (e.g. `"ACCOUNT BLOCKED TODAY"` -> Account Block Action).
- **Quick Scam Examples**: Preset demo buttons (🏦 KYC Scam, 📦 Courier Scam, 💼 Job Scam, 💳 UPI Scam, 🎁 Prize Scam).
- **Educational Knowledge Hub & Red Flags Quiz**: Interactive scenario quiz and scam encyclopedia ([`components/knowledge/ScamKnowledgeHub.tsx`](file:///c:/Users/SHRISTI/OneDrive/Desktop/SpamShield/components/knowledge/ScamKnowledgeHub.tsx)).
- **Privacy-First Banner**: Transparent privacy notice.

---

## 2. Technical Architecture & Component Tree

```mermaid
graph TD
    User([User Input: Text / Camera / Image / URL / Email]) --> Frontend[Next.js 14 MultiChannelAnalyzer]
    Frontend -->|POST /api/analyze/message| Backend[FastAPI main.py]
    Frontend -->|POST /api/analyze/url| Backend
    Frontend -->|POST /api/analyze/email| Backend
    Frontend -->|POST /api/analyze/visual| Backend
    
    Backend --> SecurityMiddleware[RateLimitMiddleware]
    SecurityMiddleware --> Services
    
    subgraph Services [Backend Microservices]
        Services --> AnalysisService[analysis_service.py]
        Services --> UrlService[url_service.py]
        Services --> EmailService[email_service.py]
        Services --> VisualService[visual_service.py]
        
        VisualService --> OCR[pytesseract / PIL]
        VisualService --> AnalysisService
        EmailService --> UrlService
        EmailService --> AnalysisService
        
        AnalysisService --> MLService[ml_service.py]
        MLService --> ModelArtifacts[ml/models/spam_pipeline.pkl]
    end
    
    Services --> DB[SQLite Database backend/spamshield.db]
    Backend -->|JSON Analysis Response| Frontend
    Frontend --> ResultCard[ResultCard.tsx & Threat Assessment Report]
```

---

## 3. API Contract Specifications

### POST `/api/analyze/message`
**Request:**
```json
{ "message": "URGENT: Your bank account is locked. Click http://bit.ly/verify to restore." }
```

### POST `/api/analyze/url`
**Request:**
```json
{ "url": "http://paypa1-security-login.xyz/verify" }
```

### POST `/api/analyze/email`
**Request:**
```json
{
  "sender": "support@chase-secure-update.com",
  "subject": "URGENT: Chase Account Locked",
  "body": "Click http://chase-security.com to restore access."
}
```

### POST `/api/analyze/visual`
**Request:**
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "filename": "screenshot.png"
}
```

### Sample Standardized Response Contract:
```json
{
  "risk": "HIGH",
  "score": 95,
  "classification": "likely_scam",
  "category": "phishing_url",
  "signals": [
    "High-risk top-level domain detected (.xyz)",
    "Typosquatting / domain manipulation detected",
    "Sensitive account action keywords found in URL: login, verify"
  ],
  "evidence": [
    {
      "phrase": "\"paypa1-security-login.xyz\"",
      "label": "Typosquatting Domain",
      "rationale": "Impersonates legitimate brand PayPal with character substitution"
    }
  ],
  "explanation": "High URL Threat Risk (Score: 95/100). Key suspicious patterns identified: High-risk top-level domain detected (.xyz)...",
  "recommendedAction": "DO NOT CLICK THIS LINK! It shows strong indicators of phishing or malicious intent.",
  "channel": "url",
  "scan_id": 15
}
```

---

## 4. Local Execution & Verification

### Launch FastAPI Backend
```powershell
cd "c:\Users\SHRISTI\OneDrive\Desktop\SpamShield\backend"
.\.venv312\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Launch Next.js Frontend
```powershell
cd "c:\Users\SHRISTI\OneDrive\Desktop\SpamShield"
npm run dev
```

### Run Test Suite
```powershell
cd "c:\Users\SHRISTI\OneDrive\Desktop\SpamShield\backend"
.\.venv312\Scripts\python.exe tests/test_all_levels.py
```

### Local URLs:
- **Frontend App**: [http://localhost:3000/analyze](http://localhost:3000/analyze)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
