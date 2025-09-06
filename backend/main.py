#!/usr/bin/env python3
"""
FastAPI Background Removal Service for Railway Deployment
Production-ready API for AI-powered background removal
"""

import io
import logging
import os
import time
from typing import Optional

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image
from rembg import new_session, remove

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Asset Extractor Backend",
    description="AI-powered background removal service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS origins from environment
allowed_origins = []

# Get allowed origins from environment variable (comma-separated)
if origins_env := os.getenv("ALLOWED_ORIGINS"):
    allowed_origins = [origin.strip() for origin in origins_env.split(",")]
else:
    # Default for development
    allowed_origins = ["http://localhost:3000"]

logger.info(f"🌐 CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Global model session (loaded once at startup)
model_session = None
SUPPORTED_FORMATS = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.on_event("startup")
async def startup_event():
    """Initialize AI model on startup"""
    global model_session
    logger.info("🚀 Starting Asset Extractor Backend...")
    logger.info("📦 Loading AI model (u2net)...")
    
    try:
        model_session = new_session('u2net')
        logger.info("✅ AI model loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to load AI model: {e}")
        logger.error("Backend will not start without AI model")
        raise e

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Asset Extractor Backend API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway and development"""
    return {
        "status": "healthy" if model_session is not None else "starting",
        "timestamp": time.time(),
        "model_loaded": model_session is not None,
        "message": "Backend ready" if model_session is not None else "AI model still loading..."
    }

@app.post("/remove-background")
async def remove_background(
    image: UploadFile = File(..., description="Image file to process")
):
    """
    Remove background from uploaded image
    
    Args:
        image: Image file (JPEG, PNG, WebP, BMP)
    
    Returns:
        PNG image with transparent background
    """
    start_time = time.time()
    
    try:
        # Validate file
        if not image.content_type in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file format. Supported: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Read and validate file size
        image_data = await image.read()
        if len(image_data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // 1024 // 1024}MB"
            )
        
        logger.info(f"📥 Processing image: {image.filename} ({len(image_data)} bytes)")
        
        # Validate image format
        try:
            img = Image.open(io.BytesIO(image_data))
            img.verify()  # Verify it's a valid image
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
        
        # Process with AI model (in-memory)
        if model_session is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI model not loaded"
            )
        
        # Remove background
        output_data = remove(image_data, session=model_session)
        
        processing_time = time.time() - start_time
        logger.info(f"✅ Background removal completed in {processing_time:.2f}s")
        
        # Return PNG with headers
        return Response(
            content=output_data,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=removed_bg_{image.filename}",
                "X-Processing-Time": str(processing_time),
                "X-Input-Size": str(len(image_data)),
                "X-Output-Size": str(len(output_data)),
                "Cache-Control": "public, max-age=3600",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Background removal failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Background removal processing failed"
        )

@app.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    return {
        "models": [
            "u2net",
            "u2netp", 
            "u2net_human_seg",
            "u2net_cloth_seg",
            "isnet-general-use"
        ],
        "current": "u2net",
        "loaded": model_session is not None
    }

if __name__ == "__main__":
    # Run with uvicorn for development
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )