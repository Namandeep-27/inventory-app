# Cloud Deployment Guide

This guide will help you deploy your inventory app to the cloud so you can share it with others and use it on any device.

## Prerequisites

1. GitHub account (free) - https://github.com
2. Vercel account (free) - https://vercel.com
3. Railway account (free) - https://railway.app
4. Your Supabase credentials (already have these)

---

## Step 1: Push Code to GitHub (if not already done)

If your code is already on GitHub, skip to Step 2.

1. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Name it (e.g., `inventory-app`)
   - Make it public or private (your choice)
   - Don't initialize with README

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/inventory-app.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Railway

1. **Go to Railway:**
   - Visit https://railway.app
   - Sign up with GitHub (one-click)
   - Click "New Project"

2. **Deploy from GitHub:**
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect it's a Python project

3. **Configure the project:**
   - Click on your new service
   - Go to "Settings" tab
   - Click "Root Directory" and set it to: `backend`
   - Save

4. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add these variables:
     ```
     SUPABASE_URL=your_supabase_url_here
     SUPABASE_ANON_KEY=your_supabase_key_here
     PORT=8000
     ```
   - Get your values from your local `backend/.env` file or Supabase dashboard

5. **Configure Start Command:**
   - Go to "Settings" → "Deploy"
   - Set "Start Command" to:
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

6. **Get Your Backend URL:**
   - Go to "Settings" → "Domains"
   - Railway will generate a domain like: `your-app-production.up.railway.app`
   - Copy this URL (you'll need it for Step 3)

---

## Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   - Follow the prompts to login (creates account if needed)

3. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? (choose your account)
     - Link to existing project? **No**
     - Project name? (press Enter for default)
     - Directory? **./** (current directory)
     - Override settings? **No**

4. **Add Environment Variable:**
   - After first deploy, go to: https://vercel.com/dashboard
   - Click on your project
   - Go to "Settings" → "Environment Variables"
   - Add:
     - **Name:** `NEXT_PUBLIC_API_URL`
     - **Value:** `https://your-backend-url.railway.app` (from Step 2)
     - **Environment:** Production, Preview, Development (check all)
     - Click "Save"

5. **Redeploy with Environment Variable:**
   ```bash
   vercel --prod
   ```

6. **Get Your Frontend URL:**
   - After deployment, Vercel will show you the URL
   - Example: `https://inventory-app.vercel.app`
   - This is your **shareable URL**! 🎉

---

## Step 4: Update CORS (if needed)

The backend should already be configured to accept requests from any origin. But if you get CORS errors:

1. Check `backend/app/main.py` - it should have:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. If not, update it and redeploy to Railway

---

## Step 5: Test Your Deployment

1. **Visit your frontend URL** (from Step 3)
2. **Test scanning** - the QR scanner should work
3. **Test on your phone** - open the URL in your phone's browser
4. **Share with others** - send them the frontend URL!

---

## Troubleshooting

### Backend not responding?
- Check Railway logs: Railway dashboard → Your service → "Deployments" → Click on deployment → "View Logs"
- Verify environment variables are set correctly
- Make sure the start command is correct

### Frontend can't connect to backend?
- Check that `NEXT_PUBLIC_API_URL` is set in Vercel
- Make sure the backend URL is correct (includes `https://`)
- Redeploy frontend after adding environment variable

### CORS errors?
- Check backend CORS configuration (should allow all origins)
- Redeploy backend after changes

### Database connection errors?
- Verify Supabase credentials in Railway environment variables
- Check that your Supabase project is active

---

## Updating Your Deployment

### After making code changes:

**Backend (Railway):**
- Push changes to GitHub
- Railway auto-deploys (if enabled)
- Or manually trigger deploy from Railway dashboard

**Frontend (Vercel):**
- Push changes to GitHub
- Vercel auto-deploys
- Or run `vercel --prod` from frontend directory

---

## Cost

Both services offer **free tiers** that should be sufficient for testing and small teams:

- **Vercel:** Free tier includes unlimited deployments
- **Railway:** $5/month free credit (usually enough for small apps)

---

## Quick Commands Reference

```bash
# Deploy frontend to Vercel (first time)
cd frontend
vercel

# Redeploy frontend (after changes or env var updates)
vercel --prod

# Check Vercel deployments
vercel ls

# View Vercel logs
vercel logs
```

---

## You're Done! 🎉

Your app is now live and shareable! Just send the Vercel URL to anyone you want to share it with.
