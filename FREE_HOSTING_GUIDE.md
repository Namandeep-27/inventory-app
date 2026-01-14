# Free Hosting Guide

This guide shows you how to host your Phone Inventory System **completely free** using free-tier services.

## 🎯 Recommended Setup (100% Free)

- **Frontend**: Vercel (Next.js) - Free forever
- **Backend**: Railway or Render - Free tier available
- **Database**: Supabase - Free tier (500MB, 2 projects)

---

## Option 1: Vercel + Railway (Recommended)

### Step 1: Deploy Frontend to Vercel (5 minutes)

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com)** and sign up with GitHub

3. **Import your repository**:
   - Click "New Project"
   - Select your repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variable**:
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://YOUR_RAILWAY_URL.up.railway.app`
   - (You'll update this after deploying backend)

5. **Deploy** - Click "Deploy"

✅ **Frontend is now live!** You'll get a URL like `https://your-app.vercel.app`

---

### Step 2: Deploy Backend to Railway (10 minutes)

1. **Go to [Railway](https://railway.app)** and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**:
   - Railway will auto-detect Python
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**:
   - Go to Variables tab
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```

5. **Generate Domain**:
   - Go to Settings → Generate Domain
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

6. **Update Frontend**:
   - Go back to Vercel
   - Update `NEXT_PUBLIC_API_URL` to your Railway URL
   - Redeploy frontend

✅ **Backend is now live!**

---

## Option 2: Vercel + Render (Alternative)

### Backend on Render (Free Tier)

1. **Go to [Render](https://render.com)** and sign up

2. **Create New Web Service**:
   - Connect your GitHub repo
   - **Name**: `inventory-backend`
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   - Add Supabase credentials

4. **Free Tier Limits**:
   - Service spins down after 15 min of inactivity
   - First request takes ~30 seconds to wake up
   - 750 hours/month free

✅ **Backend URL**: `https://your-app.onrender.com`

---

## Option 3: All-in-One with Fly.io (Advanced)

### Deploy Both Frontend & Backend

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   fly launch
   # Follow prompts
   fly deploy
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend
   fly launch
   # Follow prompts
   fly deploy
   ```

**Free Tier**: 3 shared-cpu VMs, 3GB persistent storage

---

## 🗄️ Database Setup (Supabase - Free)

1. **Go to [Supabase](https://supabase.com)** and create account

2. **Create New Project**:
   - Choose organization
   - Project name: `inventory-system`
   - Database password: (save this!)
   - Region: Choose closest to you

3. **Run Migrations**:
   - Go to SQL Editor
   - Run migrations in order:
     - `001_initial_schema.sql`
     - `002_seed_receiving_location.sql`
     - `003_add_reversed_to_events.sql`

4. **Get Credentials**:
   - Go to Settings → API
   - Copy:
     - Project URL
     - `anon` public key

5. **Add to Backend Environment Variables**:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your_anon_key
   ```

---

## 📱 Update Phone Access

After deployment, update your phone access:

1. **Get your Vercel URL**: `https://your-app.vercel.app`

2. **On your phone, open**: `https://your-app.vercel.app`

3. **No more local IP needed!** Works from anywhere 🌍

---

## 💰 Free Tier Limits

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free forever for personal projects

### Railway
- ✅ $5 free credit/month
- ✅ Enough for small apps
- ⚠️ May need to upgrade for production

### Render
- ✅ 750 hours/month free
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Slow cold starts

### Supabase
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 2 projects free

---

## 🚀 Quick Start Commands

### Deploy Everything at Once:

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy Frontend (Vercel)
# - Go to vercel.com, import repo, deploy

# 3. Deploy Backend (Railway)
# - Go to railway.app, import repo, deploy

# 4. Update frontend env var with backend URL
# - Vercel → Settings → Environment Variables
```

---

## 🔧 Troubleshooting

### Backend not connecting?
- Check Railway/Render logs
- Verify environment variables are set
- Ensure CORS is enabled in backend

### Frontend shows errors?
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check browser console for errors

### Database connection issues?
- Verify Supabase credentials
- Check database migrations ran
- Ensure network access is enabled

---

## 📝 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway/Render
3. ✅ Set up Supabase database
4. ✅ Update environment variables
5. ✅ Test on your phone!

**Total time**: ~20 minutes
**Cost**: $0/month forever 🎉

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
