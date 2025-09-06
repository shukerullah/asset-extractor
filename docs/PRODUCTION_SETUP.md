# Production Setup Checklist

Before deploying to production, update these configuration items:

## Backend Configuration (backend/main.py)

**CORS Origins** - Add your production Vercel domain:
```python
allow_origins=[
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://your-actual-domain.vercel.app",  # Replace with your domain
],
```

## Frontend Configuration

**Environment Variable** - Set in Vercel dashboard:
```
NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
```

## Deployment Steps

1. **Deploy Backend to Railway:**
   - Import GitHub repository
   - Set root directory: `backend/`
   - Copy Railway URL

2. **Update Backend CORS:**
   - Add your Vercel domain to `allow_origins` in `backend/main.py`
   - Commit and push changes

3. **Deploy Frontend to Vercel:**
   - Import GitHub repository  
   - Add environment variable: `NEXT_PUBLIC_BACKEND_URL`
   - Deploy

That's it! Your app will be live and fully functional.