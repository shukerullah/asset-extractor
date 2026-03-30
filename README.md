# Asset Extractor

**AI-powered background removal tool.** Upload images, select objects, remove backgrounds, download transparent PNGs. Free, fast, no signup.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://asset-extractor-tool.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)

## How It Works

1. Upload any image (JPEG, PNG, WebP, BMP)
2. Draw rectangle selections around objects
3. AI removes the background from each selection
4. Download transparent PNGs instantly

## Architecture

```
asset-extractor/
├── api/   → FastAPI + rembg (Python)  → Any Docker host
└── web/   → Next.js 15 (TypeScript)   → Vercel
```

| Service | Stack | Deployment |
|---------|-------|------------|
| `api/`  | FastAPI, rembg, ONNX Runtime | [Render](https://render.com), or any Docker host |
| `web/`  | Next.js 15, TypeScript, Tailwind CSS | [Vercel](https://vercel.com) |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+

### Local Development

**Start the API:**

```bash
cd api
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → Docs: http://localhost:8000/docs
```

**Start the frontend** (in a separate terminal):

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

**Or run both at once** from the project root:

```bash
npm install
npm run dev
```

## AI Models

Background removal quality and speed are controlled by the `MODEL_NAME` environment variable. No code changes needed — just set the variable and restart.

| Model | Size | Quality | Speed | Best For |
|-------|------|---------|-------|----------|
| `silueta` | 43 MB | Good | Fast | Hosted deployments, free-tier servers |
| `isnet-general-use` | 179 MB | High | Moderate | Self-hosting, best quality on CPU |
| `u2net` | 176 MB | Good | Moderate | General purpose |
| `u2netp` | 4 MB | Basic | Fastest | Ultra-lightweight, lower accuracy |
| `u2net_human_seg` | 176 MB | Good | Moderate | Human subjects |
| `birefnet-general` | ~900 MB | Best | Slow | GPU environments only |

**Hosted deployment** uses `silueta` — fast, lightweight, works well on free-tier servers.

**Self-hosting?** We recommend `isnet-general-use` — significantly better quality, especially on complex images with hair, fur, or semi-transparent objects.

## Deployment

### Backend → Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `api/`
4. Render auto-detects the Dockerfile
5. Add environment variables:
   ```
   MODEL_NAME=silueta
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
6. Deploy

> The backend uses a standard Dockerfile and works on any Docker host — Render, Railway, Fly.io, AWS, DigitalOcean, or your own server.

### Frontend → Vercel

1. Import this repository on [Vercel](https://vercel.com/new)
2. Set root directory to `web/`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```
4. Deploy

## API Reference

Once the API is running, interactive docs are available at `/docs`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check (used by deployment platforms) |
| `/remove-background` | POST | Remove background from an image |
| `/models` | GET | List available AI models |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE).
