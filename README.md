# Asset Extractor

**Simple background removal tool. Upload an image, select areas, and download transparent PNGs.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Features

- Click and drag to select objects from images
- Background removal using AI models
- Download selected areas as PNG files
- Clean, responsive web interface

## Quick Deploy

### Deploy to Vercel + Railway

1. Fork this repository

2. Deploy backend to Railway:
   - Visit https://railway.app/new
   - Import your fork
   - Set root directory to `backend/`

3. Deploy frontend to Vercel:
   - Visit https://vercel.com/new  
   - Import your fork
   - Add environment variables:
     - `NEXT_PUBLIC_BACKEND_URL=https://your-app.railway.app`
     - `NEXT_PUBLIC_MAX_SELECTIONS=5` (optional, limits selections to protect server)

**Backend configuration** (set in Railway):
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`
   - `MODEL_NAME=u2netp` (optional, AI model: u2netp=fast, u2net=quality)

**⚠️ Important:** See [docs/PRODUCTION_SETUP.md](./docs/PRODUCTION_SETUP.md) for required configuration updates before going live.

### Local Development

**1. Install dependencies:**
```bash
npm install
cd backend && pip install -r requirements.txt
```

**2. Start both services:**
```bash
npm run dev:full
```

**Or run separately:**
```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend  
npm run dev
```

Visit: http://localhost:3000

## Architecture

- **Frontend**: Next.js 15 + TypeScript
- **Backend**: FastAPI with rembg (deployed separately)
- **Deployment**: Vercel + Railway

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) file.