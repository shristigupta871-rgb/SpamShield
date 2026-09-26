from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.analyze import router as analyze_router
from app.middleware.security import RateLimitMiddleware
from app.db.database import init_db

app = FastAPI(
    title='SpamShield Level 7 Production AI Threat API', 
    version='7.0.0',
    description='Production-Grade Multi-Channel Threat Intelligence Platform (SMS, Email, URL, SQLite DB, Rate Limiting & ML Pipeline)'
)

# Level 7 Production Rate Limiter & Structured Logging Middleware
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include All API Routes
app.include_router(analyze_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get('/health')
def health_check():
    return {
        'status': 'ok',
        'version': '7.0.0',
        'level': 'Level 7 (Production Hardened)',
        'ml_status': 'active',
        'database': 'sqlite'
    }
