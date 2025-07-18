from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Callable
import time
import os
from datetime import datetime, timedelta
from collections import defaultdict
import logging
from functools import wraps

# Get API key from environment
API_KEY = os.getenv("CRICKET_API_KEY")

logger = logging.getLogger(__name__)

# Rate limiting configuration
RATE_LIMIT_DURATION = timedelta(minutes=1)
MAX_REQUESTS_PER_MINUTE = 60

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_rate_limited(self, client_ip: str) -> bool:
        now = datetime.now()
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < RATE_LIMIT_DURATION
        ]
        
        if len(self.requests[client_ip]) >= MAX_REQUESTS_PER_MINUTE:
            return True
            
        self.requests[client_ip].append(now)
        return False

rate_limiter = RateLimiter()

async def verify_api_key(request: Request) -> bool:
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return False
    return api_key == API_KEY

async def api_key_middleware(request: Request, call_next: Callable):
    if not await verify_api_key(request):
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or missing API key"}
        )
    return await call_next(request)

async def rate_limit_middleware(request: Request, call_next: Callable):
    client_ip = request.client.host
    
    if rate_limiter.is_rate_limited(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests", "retry_after": "60 seconds"}
        )
    
    try:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        response.headers["X-Process-Time"] = str(process_time)
        return response
        
    except Exception as e:
        logger.exception("Unhandled error in request")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": str(e)}
        )

async def error_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )
