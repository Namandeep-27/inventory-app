# How to Check if Everything is Working

## Quick Status Check (Recommended)

Use the automated status check script:

```bash
./check-status.sh
```

This will show:
- ✅ Backend health status
- ✅ Frontend accessibility
- ✅ Number of running processes

## Manual Status Checks

### 1. Check Backend Server

**Health Endpoint:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

**Root Endpoint:**
```bash
curl http://localhost:8000/
# Expected: {"message":"Phone Inventory Location API"}
```

**API Documentation:**
- Open in browser: http://localhost:8000/docs
- Should show Swagger UI with all available endpoints

**Check if Backend Process is Running:**
```bash
ps aux | grep uvicorn | grep -v grep
# Should show uvicorn process
```

### 2. Check Frontend Server

**Accessibility:**
```bash
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK (or similar)
```

**In Browser:**
- Open: http://localhost:3000
- Should load the frontend application without errors

**Check if Frontend Process is Running:**
```bash
ps aux | grep "next dev" | grep -v grep
# Should show next dev process
```

### 3. Check Database Connection (Supabase)

**Via Backend API:**
```bash
# Test products endpoint (requires DB connection)
curl http://localhost:8000/products
# Expected: [] (empty list) or list of products
# ❌ If you see "Could not find the table" error → Database migrations not run yet!
```

**Database Migration Status:**
```bash
# Check if tables exist by testing endpoints
curl -s http://localhost:8000/products | grep -q "Could not find the table" && echo "❌ Tables missing - run migrations!" || echo "✅ Tables exist"
```

**Common Database Error:**
If you see: `"Could not find the table 'public.products' in the schema cache"`
→ **Solution**: Run database migrations in Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Run `backend/supabase/migrations/001_initial_schema.sql`
3. Run `backend/supabase/migrations/002_seed_receiving_location.sql`

**Check Backend Logs:**
```bash
tail -f /tmp/backend.log
# Look for any database connection errors
```

**Verify .env Configuration:**
```bash
cat backend/.env
# Should have:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-key-here
```

### 4. Test Key Functionality

#### Test Product Creation
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"brand":"TestBrand","product_name":"TestProduct","size":"Small"}'
```

#### Test Location Listing
```bash
curl http://localhost:8000/locations
# Should return locations including RECEIVING
```

#### Test Inventory
```bash
curl http://localhost:8000/inventory
# Should return inventory list (may be empty)
```

### 5. Frontend Integration Tests

**Open these pages in browser (http://localhost:3000):**

1. **Home Page**: `/`
   - Should load without errors

2. **Products Page**: `/products`
   - Should show products list
   - Create button should work

3. **Locations Page**: `/locations`
   - Should show locations list
   - Should include RECEIVING location

4. **Inventory Page**: `/inventory`
   - Should show inventory (may be empty initially)

5. **Scan Page**: `/scan`
   - Should load camera/scanner interface
   - Mode selector should work

6. **Create Box Page**: `/create-box`
   - Should show product selector
   - Should generate box labels

### 6. Check Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Check for:
   - ❌ Red errors (connection issues, API errors)
   - ⚠️ Yellow warnings (non-critical)
   - ✅ No errors = good sign

## Complete System Check Checklist

Run through this checklist to verify everything:

- [ ] **Backend Health**: `curl http://localhost:8000/health` returns `{"status":"healthy"}`
- [ ] **Backend Docs**: http://localhost:8000/docs loads successfully
- [ ] **Frontend**: http://localhost:3000 loads without errors
- [ ] **Database Connection**: Products endpoint works (`curl http://localhost:8000/products`)
- [ ] **RECEIVING Location**: Should exist in locations list
- [ ] **Frontend Pages**: All pages load (products, locations, inventory, scan, create-box)
- [ ] **Browser Console**: No critical errors in browser DevTools
- [ ] **API Endpoints**: All endpoints respond (check via /docs)
- [ ] **QR Scanner**: Camera permissions work on scan page
- [ ] **Box Creation**: Can create box labels successfully

## Common Issues & Fixes

### ❌ Backend not responding
**Fix:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### ❌ Frontend not responding
**Fix:**
```bash
cd frontend
npm run dev
```

### ❌ Database connection errors
**Fix:**
1. Check `backend/.env` has correct Supabase credentials
2. Verify migrations ran in Supabase SQL Editor
3. Check Supabase project is active

### ❌ Frontend shows API errors
**Fix:**
1. Verify backend is running on port 8000
2. Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Check CORS settings in backend (should allow localhost:3000)

### ❌ Camera not working on scan page
**Fix:**
1. Use HTTPS or localhost (required for camera)
2. Allow camera permissions in browser
3. Try different browser (Chrome/Edge recommended)

## Quick Health Check Commands

**All-in-one check:**
```bash
echo "=== Backend ===" && curl -s http://localhost:8000/health && \
echo -e "\n=== Frontend ===" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && \
echo -e "\n=== Processes ===" && ps aux | grep -E "(uvicorn|next dev)" | grep -v grep | wc -l | xargs echo "Running:"
```

**Check logs:**
```bash
# Backend logs
tail -20 /tmp/backend.log

# Frontend logs  
tail -20 /tmp/frontend.log
```

## Restart Everything

If something isn't working:

```bash
# Stop everything
pkill -f uvicorn
pkill -f "next dev"

# Restart using the script
./START-SERVERS.sh

# Or manually start each service
```

## Current Status

Based on the last check:
- ✅ **Backend**: Running on port 8000
- ✅ **Frontend**: Running on port 3000
- ✅ **Processes**: 2 active (backend + frontend)

Your system appears to be running correctly! 🎉
