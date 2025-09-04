# 🎮 Game Asset Extractor

A powerful web application for extracting transparent PNG assets from AI-generated images using local AI background removal.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![AI Powered](https://img.shields.io/badge/AI-rembg-red)

## ✨ Features

- **🎯 Interactive Selection**: Click and drag to select objects from images
- **🤖 AI Background Removal**: Local processing with multiple AI models (u2net, u2netp, etc.)
- **🔄 Batch Processing**: Process multiple selections simultaneously
- **📱 Responsive Design**: Works on desktop and mobile devices
- **⚡ Offline Capable**: No external API dependencies
- **🎨 Professional UI**: Beautiful CSS modules with animations
- **📦 Easy Downloads**: Individual or bulk asset downloads
- **🛡️ Production Ready**: Rate limiting, error monitoring, and security headers
- **🐳 Docker Support**: One-click deployment with Docker
- **📊 Performance Metrics**: Built-in monitoring and optimization

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **pnpm** (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd asset-extractor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   pip3 install rembg onnxruntime
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎨 How to Use

1. **Upload Image**: Click or drag & drop an image
2. **Select Objects**: Click and drag to create circular selections
3. **Generate Assets**: Click "Generate Assets" to process selections
4. **Download**: Download individual assets or all at once

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **App Router**: Modern Next.js routing
- **CSS Modules**: Scoped styling with animations
- **TypeScript**: Full type safety
- **AAA Pattern**: Arrange, Act, Assert structure

### Backend (Python + AI)
- **rembg Library**: State-of-the-art background removal
- **Multiple Models**: u2net, u2netp, u2net_human_seg, etc.
- **Local Processing**: No external API dependencies
- **Automatic Cleanup**: Temporary file management

### API Design
```
POST /api/remove-background
- Accepts: multipart/form-data with image file
- Returns: PNG with transparent background
- Timeout: 5 minutes (for model downloads)
- Error Handling: Graceful fallbacks
```

## 🔧 Production Deployment

### Quick Deploy with Docker
```bash
./deploy.sh
```

### Manual Build
```bash
pnpm build
pnpm start
```

### Docker Compose
```bash
docker-compose up -d
```

### Environment Setup
- Ensure Python 3.8+ is available
- Pre-download AI models for faster first use
- Configure appropriate timeout values

📋 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide**

## 🎯 Performance & Security

### Performance Optimizations
- **Model Caching**: AI models download once, cached locally
- **Bundle Optimization**: 117KB first load JS size  
- **Static Generation**: Pre-rendered pages for faster loading
- **Automatic Cleanup**: Prevents disk bloat
- **Rate Limiting**: 5 requests/minute per IP
- **Response Caching**: 1-hour cache for processed images

### Security Features
- **Input Validation**: File size, type, and content validation
- **Security Headers**: CSRF, XSS, and content-type protection
- **Rate Limiting**: Prevents API abuse
- **Error Monitoring**: Built-in logging and monitoring
- **Temp File Cleanup**: Automatic cleanup prevents data leaks

## 📁 Project Structure

```
src/
├── app/                               # Next.js app router
├── components/                        # Reusable UI components
├── services/                         # Business logic & API calls
├── types/                           # TypeScript definitions
├── utils/                           # Helper functions
└── middleware.ts                    # Security & rate limiting

scripts/
└── remove_background.py            # Python AI processing script
```

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found: rembg"**
   ```bash
   pip3 install rembg onnxruntime
   ```

2. **"Model download timeout"**
   - Wait for initial model download (~176MB)
   - Subsequent uses will be instant

---

**Built with ❤️ using Next.js, TypeScript, and AI**
