#!/usr/bin/env python3
"""
Asset Extractor API
AI-powered background removal service.

Single-file FastAPI backend designed for Railway deployment.
Models are controlled via the MODEL_NAME environment variable:
  - silueta (43MB, fast)      → recommended for hosted/free-tier
  - isnet-general-use (179MB) → recommended for self-hosting
"""

import io
import logging
import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image
from rembg import new_session, remove

# ─── Configuration ────────────────────────────────────────────────────────────

MODEL_NAME = os.getenv("MODEL_NAME", "silueta")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MIN", "30"))
SUPPORTED_FORMATS = {"image/jpeg", "image/png", "image/webp", "image/bmp"}

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("api")


# ─── Rate Limiter ─────────────────────────────────────────────────────────────
# Simple in-memory per-IP throttle. Resets on restart — acceptable for a
# single-instance free-tier deployment. Not a security layer, just abuse
# prevention.

class RateLimiter:
    def __init__(self, limit: int, window: int = 60):
        self.limit = limit
        self.window = window
        self._hits: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> bool:
        """Return True if the request is allowed."""
        now = time.time()
        cutoff = now - self.window
        self._hits[key] = [t for t in self._hits[key] if t > cutoff]
        if len(self._hits[key]) >= self.limit:
            return False
        self._hits[key].append(now)
        return True


rate_limiter = RateLimiter(limit=RATE_LIMIT)


# ─── Lifespan ─────────────────────────────────────────────────────────────────
# Modern FastAPI pattern — replaces deprecated @app.on_event("startup").
# Model loads once at startup, stays in memory for all requests.

model_session = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_session

    logger.info("Starting Asset Extractor API")
    logger.info("Model: %s", MODEL_NAME)
    logger.info("CORS origins: %s", ALLOWED_ORIGINS)
    logger.info("Max file size: %sMB", MAX_FILE_SIZE // (1024 * 1024))
    logger.info("Rate limit: %s req/min", RATE_LIMIT)

    try:
        model_session = new_session(MODEL_NAME)
        logger.info("Model loaded successfully")
    except Exception:
        logger.exception("Failed to load model")
        raise

    yield

    model_session = None
    logger.info("Shutdown complete")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Asset Extractor API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_client_ip(request: Request) -> str:
    """Extract client IP from proxy headers or direct connection."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Service info."""
    return {
        "service": "Asset Extractor API",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check for Railway and uptime monitors."""
    return {
        "status": "healthy" if model_session else "starting",
        "model": MODEL_NAME,
        "model_loaded": model_session is not None,
    }


@app.post("/remove-background")
async def remove_background(
    request: Request,
    image: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, BMP)"),
):
    """
    Remove background from an uploaded image.

    Returns a transparent PNG. Processing time depends on image complexity
    and the selected model.
    """
    start = time.time()
    client_ip = get_client_ip(request)

    # Rate limit
    if not rate_limiter.check(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {RATE_LIMIT} requests per minute.",
        )

    # Validate content type
    if image.content_type not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format. Accepted: {', '.join(sorted(SUPPORTED_FORMATS))}",
        )

    # Read and validate size
    data = await image.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit.",
        )

    # Validate image integrity
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted image file.",
        )

    # Ensure model is ready
    if model_session is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is still loading. Please retry in a moment.",
        )

    # Remove background
    try:
        result = remove(data, session=model_session)
    except Exception:
        logger.exception("Background removal failed for %s", image.filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Background removal failed. Please try again.",
        )

    elapsed = time.time() - start
    logger.info(
        "%s | %s | %s -> %s bytes | %.2fs",
        client_ip,
        image.filename,
        len(data),
        len(result),
        elapsed,
    )

    return Response(
        content=result,
        media_type="image/png",
        headers={
            "X-Processing-Time": f"{elapsed:.2f}",
            "X-Model": MODEL_NAME,
            "Cache-Control": "public, max-age=3600",
        },
    )


@app.get("/models")
async def models():
    """Available AI models and current selection."""
    return {
        "current": MODEL_NAME,
        "loaded": model_session is not None,
        "available": {
            "silueta": {
                "size": "43MB",
                "quality": "good",
                "speed": "fast",
                "use_case": "Hosted / free-tier deployments",
            },
            "isnet-general-use": {
                "size": "179MB",
                "quality": "high",
                "speed": "moderate",
                "use_case": "Self-hosting, best CPU quality",
            },
            "u2net": {
                "size": "176MB",
                "quality": "good",
                "speed": "moderate",
                "use_case": "General purpose",
            },
            "u2netp": {
                "size": "4MB",
                "quality": "basic",
                "speed": "fastest",
                "use_case": "Ultra-lightweight, lower accuracy",
            },
            "u2net_human_seg": {
                "size": "176MB",
                "quality": "good",
                "speed": "moderate",
                "use_case": "Human subjects",
            },
            "birefnet-general": {
                "size": "~900MB",
                "quality": "best",
                "speed": "slow",
                "use_case": "GPU only, state of the art",
            },
        },
    }


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
