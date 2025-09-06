# 🎯 Asset Extractor

**AI-powered background removal tool. Upload any image, select objects, and download transparent PNGs instantly.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)](https://fastapi.tiangolo.com/)
[![AI Powered](https://img.shields.io/badge/AI-rembg-red)](https://github.com/danielgatis/rembg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Features

- **Interactive Selection**: Click and drag to select objects from images
- **AI Background Removal**: Powered by state-of-the-art AI models (u2net, isnet)
- **Batch Processing**: Process multiple selections simultaneously  
- **Professional UI**: Clean, responsive design with canvas editing tools
- **Fast & Secure**: Modern cloud architecture with Railway + Vercel
- **Open Source**: MIT licensed, ready to fork and deploy

## 🚀 Quick Deploy

### Deploy to Vercel + Railway (Recommended)

1. **Fork this repository**

2. **Deploy Backend to Railway**
   ```bash
   # Railway will auto-detect the backend/ folder
   # Visit: https://railway.app/new
   # Import your fork, set root directory to 'backend/'
   ```

3. **Deploy Frontend to Vercel**  
   ```bash
   # Visit: https://vercel.com/new
   # Import your fork, add environment variable:
   # NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
   ```

4. **You're live!** 🎉

### Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/asset-extractor.git
cd asset-extractor
npm install

# Start development server
npm run dev
```

## 🏗️ Architecture

```
┌─────────────┐    API calls    ┌──────────────┐
│   Vercel    │ ──────────────→ │   Railway    │
│  (Frontend) │                 │  (Backend)   │
│   Next.js   │                 │   FastAPI    │
└─────────────┘                 └──────────────┘
```

- **Frontend**: Next.js with TypeScript, Canvas API, responsive design
- **Backend**: FastAPI with rembg AI models, automatic scaling
- **Deployment**: Vercel (frontend) + Railway (backend)

## 📖 Documentation

- [**Deployment Guide**](./docs/DEPLOYMENT.md) - Complete deployment instructions
- [**Railway Setup**](./docs/RAILWAY_DEPLOYMENT.md) - Backend deployment details  
- [**API Reference**](./docs/API.md) - Backend API documentation

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🛡️ Security

For security concerns, please see [SECURITY.md](./docs/SECURITY.md).

## 🙏 Acknowledgments

- [rembg](https://github.com/danielgatis/rembg) - AI background removal library
- [Next.js](https://nextjs.org/) - React framework  
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Railway](https://railway.app/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting

---

**Made with ❤️ for creators worldwide. Star ⭐ if you found this helpful!**