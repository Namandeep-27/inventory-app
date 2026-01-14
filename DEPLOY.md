# Quick Deployment Guide

Follow these steps to deploy your app to the cloud (takes ~10 minutes total).

## Prerequisites

- GitHub account (free)
- Your Supabase credentials (from `backend/.env`)

---

## Step 1: Push Code to GitHub (if not already done)

If your code is already on GitHub, skip to Step 2.

1. Go to https://github.com/new and create a new repository
2. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Railway (5 minutes)

1. **Go to Railway:** https://railway.app
   - Click "Login" → Sign up with GitHub (free)

2. **New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service:**
   - Click on the service
   - Go to "Settings" tab
   - Under "Root Directory", set to: `backend`
   - Save

4. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add these (get values from your `backend/.env` file):
     ```
     SUPABASE_URL=your_supabase_url_here
     SUPABASE_ANON_KEY=your_supabase_key_here
     PORT=8000
     ```

5. **Set Start Command:**
   - Go to "Settings" → "Deploy"
   - Set "Start Command" to:
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

6. **Get Backend URL:**
   - Go to "Settings" → "Domains"
   - Railway generates a domain like: `xxx-production.up.railway.app`
   - Copy this URL (you'll need it in Step 3)
   - ⚠️ Wait 2-3 minutes for deployment to complete

---

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   (Follow prompts to create account if needed)

3. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```
   - Follow prompts (press Enter for defaults)
   - This will give you a URL like: `your-app.vercel.app`

4. **Add Environment Variable:**
   - Go to: https://vercel.com/dashboard
   - Click on your project
   - Go to "Settings" → "Environment Variables"
   - Add:
     - **Key:** `NEXT_PUBLIC_API_URL`
     - **Value:** `https://your-backend-url.railway.app` (from Step 2)
     - **Environments:** Check all (Production, Preview, Development)
     - Click "Save"

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

6. **Done!** 🎉
   - Your app is now live at: `https://your-app.vercel.app`
   - Share this URL with anyone!

---

## Using on Your Phone

Just open the Vercel URL in your phone's browser! The app is already mobile-friendly.

---

## Troubleshooting

**Backend not working?**
- Check Railway logs: Dashboard → Your service → Deployments → View Logs
- Verify environment variables are set correctly
- Make sure Root Directory is set to `backend`

**Frontend can't connect to backend?**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Make sure backend URL includes `https://`
- Redeploy frontend after adding environment variable

**CORS errors?**
- Backend is already configured to allow all origins
- If issues persist, check Railway logs

---

## Cost

- **Vercel:** Free (unlimited deployments)
- **Railway:** $5/month free credit (usually enough for small apps)

---

## Next Steps

After deployment, your app is:
- ✅ Accessible from any device (phone, tablet, computer)
- ✅ Shareable with anyone (just send the URL)
- ✅ Always available (24/7)
- ✅ Auto-updates when you push code to GitHub

Enjoy! 🚀
