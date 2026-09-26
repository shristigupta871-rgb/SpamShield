import time
import logging
from collections import defaultdict
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')
logger = logging.getLogger("SpamShield")

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.ip_tracker = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Clean old timestamps
        timestamps = [t for t in self.ip_tracker[client_ip] if now - t < self.window_seconds]
        self.ip_tracker[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return Response(
                content='{"detail": "Rate limit exceeded. Maximum 100 requests per minute allowed."}',
                status_code=429,
                media_type="application/json"
            )

        self.ip_tracker[client_ip].append(now)
        
        start_time = time.time()
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)
        
        logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration}ms) [{client_ip}]")
        return response
