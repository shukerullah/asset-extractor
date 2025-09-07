# Production Setup Checklist

Before deploying to production, update these configuration items:

## Backend Configuration

Set this environment variable in Railway dashboard:

**Required:**
```
ALLOWED_ORIGINS=https://your-project-abc123.vercel.app,https://your-custom-domain.com
```

*Note: Comma-separated list of allowed origins. Do not include localhost in production.*

**Optional:**
```
MODEL_NAME=u2netp
```

*AI model for background removal. Options:*
- `u2netp` - **Recommended** - Lightweight, fast, ~300MB RAM usage
- `u2net` - Higher quality, slower, ~600MB+ RAM usage  
- `u2net_human_seg` - Optimized for people
- `u2net_cloth_seg` - Optimized for clothing
- `isnet-general-use` - General purpose alternative

*Default: `u2netp` (best for Railway free tier)*

## Frontend Configuration

**Environment Variables** - Set in Vercel dashboard:

**Required:**
```
NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
```

**Optional:**
```
NEXT_PUBLIC_MAX_SELECTIONS=5
```
*Limits number of selections per image to protect server resources. Default: unlimited*

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