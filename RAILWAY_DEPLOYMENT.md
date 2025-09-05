# 🚂 Railway Backend Deployment Guide

## 📋 Prerequisites
- Railway account (https://railway.app)
- Git repository with backend code

## 🚀 Step-by-Step Deployment

### 1. **Prepare Backend Directory**
Your `backend/` folder now contains:
```
backend/
├── main.py              # FastAPI web server
├── requirements.txt     # Python dependencies  
├── Procfile            # Railway process configuration
├── railway.toml        # Railway deployment settings
├── runtime.txt         # Python version specification
└── remove_background.py # Legacy CLI script (keep for reference)
```

### 2. **Deploy to Railway**

#### Option A: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway create asset-extractor-backend

# Deploy from backend directory
cd backend
railway up
```

#### Option B: Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set **Root Directory** to `backend/`
5. Click "Deploy"

### 3. **Configure Environment Variables**
In Railway dashboard → Variables tab, add:
```bash
# Optional: Add any custom environment variables
PYTHON_VERSION=3.11
```

### 4. **Get Your Railway URL**
After deployment, Railway will provide you with a URL like:
```
https://your-app-name-production.up.railway.app
```

### 5. **Update Frontend (Vercel)**
In your Vercel project settings, add environment variable:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-app-name-production.up.railway.app
```

## 🧪 Testing Your Deployment

### Test Backend Health
```bash
curl https://your-railway-url.railway.app/health
```

### Test Background Removal
```bash
curl -X POST -F "image=@test-image.jpg" https://your-railway-url.railway.app/remove-background
```

### View API Documentation
Visit: `https://your-railway-url.railway.app/docs`

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails - Missing Dependencies**
   - Check `requirements.txt` is in backend folder
   - Verify Python version in `runtime.txt`

2. **Health Check Fails**
   - Railway needs `/health` endpoint to respond with 200
   - Check logs in Railway dashboard

3. **CORS Errors**
   - Update CORS origins in `main.py` with your Vercel domain
   - Add both `*.vercel.app` and your custom domain

4. **Model Loading Timeout**
   - First request may take 2-3 minutes to download AI model
   - Subsequent requests will be fast (model cached in memory)

## 📊 Monitoring

### Railway Dashboard
- View logs in real-time
- Monitor resource usage
- Check deployment history

### Health Check
- Endpoint: `/health`
- Returns model loading status
- Used by Railway for uptime monitoring

## 🔄 CI/CD

Railway automatically redeploys when you push to your main branch. To trigger manual deployments:
```bash
railway redeploy
```

## 📈 Scaling

Railway automatically scales based on traffic. For high-traffic applications:
- Monitor memory usage (AI models use ~2GB RAM)
- Consider upgrading to Railway Pro plan
- Implement request queuing for heavy loads

## 🛡️ Security

Current security features:
- ✅ CORS configuration
- ✅ File size limits (10MB)
- ✅ File type validation
- ✅ Input sanitization
- ✅ Error handling without data leaks

## 💰 Costs

Railway pricing:
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- Free tier available for testing

Estimated monthly cost for moderate usage: **$5-15**