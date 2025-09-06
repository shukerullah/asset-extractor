# 🚀 Deployment Guide - Vercel + Railway Architecture

Modern cloud deployment using Vercel (frontend) and Railway (backend) for optimal performance and scalability.

## 🏗️ Architecture Overview

```
┌─────────────┐    API calls    ┌──────────────┐
│   Vercel    │ ──────────────→ │   Railway    │
│  (Frontend) │                 │  (Backend)   │
│   Next.js   │                 │   FastAPI    │
└─────────────┘                 └──────────────┘
```

**Frontend (Vercel)**: Next.js app with static assets and UI
**Backend (Railway)**: FastAPI Python service for AI background removal

## 📋 Prerequisites

- **Vercel Account** - [vercel.com](https://vercel.com) (free tier)
- **Railway Account** - [railway.app](https://railway.app) (~$5/month)
- **Git Repository** - GitHub, GitLab, or Bitbucket
- **Domain** (optional) - Custom domain for production

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Prepare Backend
Your backend files are ready in `backend/`:
```
backend/
├── main.py              # FastAPI server
├── requirements.txt     # Dependencies
├── Procfile            # Railway config
├── railway.toml        # Deployment settings
└── runtime.txt         # Python version
```

### 1.2 Deploy to Railway
```bash
# Option A: Railway CLI
npm install -g @railway/cli
railway login
railway create asset-extractor-backend
cd backend
railway up

# Option B: Railway Dashboard
# 1. Go to railway.app/dashboard
# 2. New Project → Deploy from GitHub
# 3. Select repository
# 4. Set Root Directory: backend/
# 5. Deploy
```

### 1.3 Get Railway URL
After deployment, copy your Railway URL:
```
https://your-app-name-production.up.railway.app
```

## ▲ Step 2: Deploy Frontend to Vercel

### 2.1 Configure Environment
Create `.env.local` in root:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
```

### 2.2 Deploy to Vercel
```bash
# Option A: Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Vercel Dashboard
# 1. Go to vercel.com/dashboard
# 2. Import Git Repository
# 3. Set Environment Variables
# 4. Deploy
```

### 2.3 Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_BACKEND_URL = https://your-railway-app.railway.app
```

## 🔧 Configuration

### Railway Environment Variables
```bash
# Optional: Custom settings
PYTHON_VERSION=3.11
PORT=8000  # Railway sets this automatically
```

### Vercel Environment Variables
```bash
# Required: Backend URL
NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.railway.app

# Optional: Custom domain settings
VERCEL_URL=your-domain.com
```

## 🧪 Testing Deployment

### Test Backend (Railway)
```bash
# Health check
curl https://your-railway-url.railway.app/health

# API docs
open https://your-railway-url.railway.app/docs

# Test endpoint
curl -X POST -F "image=@test.jpg" https://your-railway-url.railway.app/remove-background
```

### Test Frontend (Vercel)
1. Visit your Vercel URL
2. Upload an image
3. Create selections
4. Generate assets
5. Download transparent PNGs

### Full Integration Test
1. Upload image on frontend
2. Verify API calls go to Railway
3. Check Railway logs for processing
4. Confirm assets download correctly

## 📊 Monitoring & Logs

### Railway Monitoring
- **Dashboard**: Real-time metrics
- **Logs**: `railway logs` or web dashboard
- **Health**: Automatic health checks at `/health`

### Vercel Monitoring  
- **Analytics**: Built-in performance metrics
- **Functions**: API route monitoring (dev only)
- **Deployments**: Git-based deployment history

## 💰 Cost Estimation

### Railway (Backend)
- **Hobby Plan**: $5/month + usage
- **AI Model**: ~2GB RAM usage
- **Processing**: CPU-intensive during requests
- **Estimated**: $5-15/month for moderate usage

### Vercel (Frontend)
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for commercial use
- **Bandwidth**: Generous limits on free tier

### Total Monthly Cost: **$5-35** depending on usage

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Test health endpoint
curl https://your-app.railway.app/health

# Verify environment variables
railway variables
```

### Frontend Issues
```bash
# Check Vercel deployment logs
vercel logs

# Verify environment variables
vercel env ls

# Test local build
npm run build && npm start
```

### Integration Issues
- **CORS Errors**: Update Railway CORS settings in `main.py`
- **API Timeout**: First request takes 2-3 minutes (model download)
- **Environment Variables**: Ensure they're set in both services

## 🔄 CI/CD Pipeline

### Automatic Deployments
- **Railway**: Auto-deploys on git push to main branch
- **Vercel**: Auto-deploys on git push to main branch
- **Preview**: Automatic preview deployments for PRs

### Manual Deployments
```bash
# Railway
railway redeploy

# Vercel  
vercel --prod
```

## 🛡️ Security Considerations

### Production Security
- ✅ **CORS**: Configured for your domain only
- ✅ **Rate Limiting**: 5 requests per minute per IP
- ✅ **Input Validation**: File size and type checking
- ✅ **Error Handling**: No sensitive data in error messages

### Recommended Additions
- [ ] **API Authentication**: Add API keys for production
- [ ] **Domain Whitelist**: Restrict CORS to specific domains
- [ ] **Request Logging**: Monitor for abuse patterns
- [ ] **CDN**: Consider CloudFlare for additional protection

## 🎉 Going Live Checklist

- [ ] Railway backend deployed and healthy
- [ ] Vercel frontend deployed successfully  
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic)
- [ ] Monitoring dashboards set up
- [ ] Test full user flow end-to-end

## 📞 Support

- **Railway Support**: [railway.app/help](https://railway.app/help)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)  
- **Documentation**: See `RAILWAY_DEPLOYMENT.md` for detailed Railway setup

---

**Your modern, scalable Asset Extractor is ready for production! 🚀**