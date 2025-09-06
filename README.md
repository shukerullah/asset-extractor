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
   - Add environment variable: `NEXT_PUBLIC_BACKEND_URL=https://your-app.railway.app`

### Local Development

```bash
git clone https://github.com/username/asset-extractor.git
cd asset-extractor
npm install
npm run dev
```

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