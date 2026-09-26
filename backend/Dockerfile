# FastAPI Backend Dockerfile
FROM python:3.12-slim

# Install system dependencies including Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt pillow pytesseract

# Copy application source code and trained ML models
COPY app ./app
COPY ml ./ml

EXPOSE 8000

ENV SPAMSHIELD_API_KEY=spamshield_secret_key_2026

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
