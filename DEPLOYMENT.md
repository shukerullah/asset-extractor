# 🚀 Deployment Guide

This document provides comprehensive instructions for deploying the Asset Extractor application in various environments.

## 📋 Prerequisites

- **Docker** 20.10+ (recommended)
- **Node.js** 18+ (for non-Docker deployments)
- **Python** 3.8+ with pip
- **2GB+ RAM** (for AI model processing)
- **10GB+ storage** (for models and temporary files)

## 🐳 Docker Deployment (Recommended)

### Quick Deploy
```bash
# Clone and deploy in one command
git clone <your-repo-url>
cd asset-extractor
./deploy.sh
```

### Manual Docker Steps
```bash
# 1. Build the image
docker build -t asset-extractor:latest .

# 2. Run the container
docker run -d \
  --name asset-extractor \
  -p 3000:3000 \
  --restart unless-stopped \
  asset-extractor:latest

# 3. Check status
docker ps
docker logs asset-extractor
```

### Docker Compose
```bash
# Start with compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Manual Deployment

### 1. Environment Setup
```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip3 install rembg onnxruntime

# Create temp directory
mkdir -p temp
```

### 2. Build Application
```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## ☁️ Cloud Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Note**: Vercel has limitations with Python dependencies. Consider using Docker on cloud providers instead.

### Railway
1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set start command: `pnpm start`
4. Add environment variables if needed

### DigitalOcean App Platform
```yaml
# app.yaml
name: asset-extractor
services:
- name: web
  source_dir: /
  github:
    repo: your-username/asset-extractor
    branch: main
  run_command: pnpm start
  build_command: pnpm build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
```

## 📊 Production Monitoring

### Health Checks
- **Endpoint**: `GET /` (returns 200 if healthy)
- **Docker**: Built-in healthcheck in docker-compose.yml
- **Kubernetes**: Add liveness and readiness probes

### Performance Metrics
The API returns performance headers:
```
X-Processing-Time: 2340
X-Input-Size: 1048576
X-Output-Size: 892456
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200000
```

### Error Monitoring
- Check application logs for error patterns
- Monitor rate limit headers
- Watch for Python script failures

## 🔒 Security Considerations

### Rate Limiting
- **Current**: 5 requests per minute per IP
- **Customize**: Edit `src/utils/rate-limiter.ts`

### File Security
- **Max file size**: 10MB
- **Allowed formats**: JPEG, PNG, WebP, BMP
- **Temp cleanup**: Automatic after processing

### Headers Applied
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Length-Limit: 10485760
```

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found: rembg"**
   ```bash
   pip3 install rembg onnxruntime
   ```

2. **"Python script timeout"**
   - First run downloads ~176MB model
   - Increase timeout or pre-download models

3. **"Permission denied on /temp"**
   ```bash
   mkdir -p temp
   chmod 755 temp
   ```

4. **Docker build fails**
   - Ensure Docker has enough memory (4GB+)
   - Clear Docker cache: `docker system prune -a`

### Performance Issues
- **Slow processing**: AI models need time to download initially
- **Memory usage**: Each request uses ~500MB during processing
- **Disk space**: Temporary files are auto-cleaned but monitor `/temp`

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Backup strategy for temp files
- [ ] Log rotation configured
- [ ] Health checks implemented
- [ ] Security headers verified

## 📞 Support

If you encounter issues:
1. Check the application logs
2. Verify all dependencies are installed
3. Ensure sufficient system resources
4. Review the security and rate limiting settings

For optimal performance, deploy on a server with at least 2GB RAM and SSD storage.