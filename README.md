# SpamShield AI — Explainable Threat Intelligence Platform

SpamShield AI is an end-to-end, multi-channel threat detection platform that analyzes SMS text messages, URLs/domains, email headers, and visual screenshots using machine learning and security heuristics.

---

## ⚡ QUICKSTART (Docker Compose)

Run the entire full-stack application (Next.js frontend + FastAPI backend + SQLite database) with a single command:

```bash
docker-compose up --build
```

Access the application:
- **Frontend App**: http://localhost:3000/analyze
- **FastAPI Swagger Docs**: http://localhost:8000/docs
- **Health Endpoint**: http://localhost:8000/health

---

## 🔑 Environment & API Key Authentication

Protected endpoints (`GET /api/scans`, `DELETE /api/scans`) require the `X-API-Key` header for authorization.

1. Create a `backend/.env` file:
   ```env
   SPAMSHIELD_API_KEY=spamshield_secret_key_2026
   ```
2. When making requests to data-mutating scan history endpoints, pass:
   ```http
   X-API-Key: spamshield_secret_key_2026
   ```

---

## 🛠 Manual Local Setup

### 1. Backend (FastAPI + Python 3.12)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt pillow pytesseract
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Next.js 14)
```bash
npm install
npm run dev
```

### 3. Run Test Suite
```bash
cd backend
python tests/test_all_levels.py
```
