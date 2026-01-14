# Quick Deployment Steps

Follow these steps in order to deploy your app to the cloud.

## Prerequisites Checklist

- [ ] GitHub account (free) - https://github.com
- [ ] Code pushed to GitHub repository
- [ ] Supabase credentials ready (from your `.env` file)

---

## Step 1: Deploy Backend to Railway (5 minutes)

1. Go to https://railway.app
2. Click "Login" → Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. In the service settings:
   - **Root Directory:** Set to `backend`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Go to "Variables" tab and add:
   ```
   SUPABASE_URL=your_url_here
   SUPABASE_ANON_KEY=your_key_here
   ```
   (Get these from your local `backend/.env` file)
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL from Settings → Domains (e.g., `https://xxx.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel (3 minutes)

1. Open terminal and run:
   ```bash
   npm install -g vercel
   vercel login
   ```
2. Go to frontend directory:
   ```bash
   cd frontend
   vercel
   ```
3. Follow prompts (press Enter for defaults)
4. After first deploy, add environment variable:
   - Go to https://vercel.com/dashboard
   - Click your project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app`
   - Check all environments (Production, Preview, Development)
   - Save
5. Redeploy:
   ```bash
   vercel --prod
   ```
6. Copy your frontend URL (shown after deploy)

---

## Step 3: Share Your App! 🎉

Send the Vercel URL to anyone - it works on phones, tablets, and computers!

---

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
