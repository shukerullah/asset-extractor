FROM python:3.11-slim-bookworm

WORKDIR /app

# System deps for Pillow and image processing
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libglib2.0-0 \
       libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip + install deps (important for rembg/onnxruntime)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

# Most platforms (Render, Railway) set PORT automatically; fall back to 8000 for local Docker
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
