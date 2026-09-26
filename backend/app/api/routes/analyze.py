import os
import base64
from fastapi import APIRouter, HTTPException, Header, Security, Depends
from pydantic import BaseModel, Field
from typing import Optional, List

from app.services.analysis_service import analyze_message
from app.services.url_service import analyze_url
from app.services.email_service import analyze_email
from app.services.visual_service import analyze_visual_image
from app.db.database import save_scan, get_recent_scans, delete_scan, clear_all_scans

router = APIRouter(prefix="/api", tags=["Multi-Channel Threat Analysis & History"])

# Secret API Key loaded from environment
API_KEY_ENV = os.getenv("SPAMSHIELD_API_KEY", "spamshield_secret_key_2026")

def verify_api_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")):
    """Verifies X-API-Key header for sensitive scan management endpoints"""
    if not x_api_key or x_api_key != API_KEY_ENV:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Invalid or missing X-API-Key header."
        )
    return x_api_key


class MessageAnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="SMS or message text to analyze")


class UrlAnalyzeRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2000, description="URL or domain link to inspect")


class EmailAnalyzeRequest(BaseModel):
    sender: Optional[str] = Field("", description="Sender email address e.g. support@domain.com")
    subject: Optional[str] = Field("", description="Email subject line")
    body: str = Field(..., min_length=1, max_length=20000, description="Email body content")


class ImageAnalyzeRequest(BaseModel):
    imageBase64: str = Field(..., description="Base64 encoded image string from camera or file upload")
    filename: Optional[str] = Field("screenshot.png", description="Uploaded image filename")


# Public Read-Only Analyze Endpoints (No X-API-Key required)
@router.post("/analyze")
@router.post("/analyze/message")
def analyze_message_endpoint(payload: MessageAnalyzeRequest):
    try:
        result = analyze_message(payload.message)
        scan_id = save_scan({**result, 'message': payload.message, 'channel': 'message'})
        result['scan_id'] = scan_id
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Message analysis failed: {exc}") from exc


@router.post("/analyze/url")
def analyze_url_endpoint(payload: UrlAnalyzeRequest):
    try:
        result = analyze_url(payload.url)
        scan_id = save_scan({**result, 'channel': 'url'})
        result['scan_id'] = scan_id
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"URL inspection failed: {exc}") from exc


@router.post("/analyze/email")
def analyze_email_endpoint(payload: EmailAnalyzeRequest):
    try:
        result = analyze_email(sender=payload.sender or "", subject=payload.subject or "", body=payload.body)
        scan_id = save_scan({**result, 'channel': 'email'})
        result['scan_id'] = scan_id
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Email analysis failed: {exc}") from exc


@router.post("/analyze/visual")
@router.post("/analyze/image")
def analyze_visual_endpoint(payload: ImageAnalyzeRequest):
    try:
        raw_b64 = payload.imageBase64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        
        img_bytes = base64.b64decode(raw_b64)
        result = analyze_visual_image(img_bytes, filename=payload.filename or "screenshot.png")
        scan_id = save_scan({**result, 'channel': 'image'})
        result['scan_id'] = scan_id
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Visual image analysis failed: {exc}") from exc


# Protected Data-Mutating Scan History Endpoints (X-API-Key Required)
@router.get("/scans", dependencies=[Depends(verify_api_key)])
def get_scans_history(limit: int = 20):
    """Retrieve recent scan history from SQLite database (Requires X-API-Key header)"""
    return get_recent_scans(limit=limit)


@router.delete("/scans/{scan_id}", dependencies=[Depends(verify_api_key)])
def delete_scan_entry(scan_id: int):
    """Delete a specific scan record from database (Requires X-API-Key header)"""
    success = delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    return {"status": "deleted", "scan_id": scan_id}


@router.delete("/scans", dependencies=[Depends(verify_api_key)])
def clear_scans_history():
    """Clear all scan history records from database (Requires X-API-Key header)"""
    count = clear_all_scans()
    return {"status": "cleared", "records_removed": count}
