# Production Setup Checklist

Before deploying to production, update these configuration items:

## Backend Configuration

Set this environment variable in Railway dashboard:

**Required:**
```
ALLOWED_ORIGINS=https://your-project-abc123.vercel.app,https://your-custom-domain.com
```

*Note: Comma-separated list of allowed origins. Do not include localhost in production.*

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

2. **Deploy Frontend to Vercel:**
   - Import GitHub repository  
   - Add environment variable: `NEXT_PUBLIC_BACKEND_URL`
   - Deploy

That's it! Your app will be live and fully functional.