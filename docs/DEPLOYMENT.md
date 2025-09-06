# Deployment Guide

## Prerequisites

- GitHub account
- Railway account (free)
- Vercel account (free)

## Deploy Backend to Railway

1. Visit https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your forked repository
4. Set root directory to `backend/`
5. Railway will auto-detect and deploy FastAPI
6. Copy the deployed URL (e.g., `https://your-app.railway.app`)

## Deploy Frontend to Vercel

1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Set framework preset to "Next.js"
4. Add environment variable:
   - Name: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `https://your-app.railway.app` (from Railway step)
5. Click "Deploy"

## That's it!

Your app is now live. Vercel automatically deploys on every push to main branch.