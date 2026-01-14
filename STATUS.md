# Server Status

## Current Status

✅ **Backend Server**: RUNNING
- URL: http://localhost:8000
- Health Check: http://localhost:8000/health
- API Docs: http://localhost:8000/docs
- Process ID: Check with `ps aux | grep uvicorn`

🔄 **Frontend Server**: STARTING
- URL: http://localhost:3000
- May take 30-60 seconds to compile on first run
- Check terminal or visit http://localhost:3000

## Quick Checks

### Check if servers are running:

```bash
# Backend
curl http://localhost:8000/health

# Frontend  
curl http://localhost:3000
```

### Check processes:

```bash
# Backend
ps aux | grep uvicorn

# Frontend
ps aux | grep "next dev"
```

### Stop servers:

```bash
# Find and kill processes
pkill -f uvicorn
pkill -f "next dev"

# Or use Ctrl+C in their terminals
```

## Access Points

Once both are running:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:8000
3. **API Documentation**: http://localhost:8000/docs
4. **Health Check**: http://localhost:8000/health

## Important Notes

⚠️ **Before using the app:**
1. Edit `backend/.env` with your Supabase credentials
2. Run database migrations in Supabase SQL Editor
3. Frontend will show errors if backend isn't configured

## Next Steps

1. Open http://localhost:3000 in your browser
2. If you see errors, check:
   - Backend is running (check http://localhost:8000/health)
   - Supabase credentials in `backend/.env`
   - Database migrations have been run
