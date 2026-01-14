# Troubleshooting Guide

## Common Errors and Solutions

### Frontend Errors

#### Error: "Cannot find module 'html5-qrcode'"
**Solution:**
```bash
cd frontend
npm install
```

#### Error: TypeScript errors with html5-qrcode
**Solution:**
```bash
cd frontend
npm install --save-dev @types/html5-qrcode
npm install
```

#### Error: "Failed to start camera"
**Causes:**
- Camera permissions not granted
- Not using HTTPS or localhost
- Browser doesn't support camera API

**Solutions:**
1. Allow camera permissions when browser prompts
2. Use Chrome or Edge (Safari may have issues)
3. Make sure you're on localhost or HTTPS
4. Check browser settings → Privacy → Camera permissions

#### Error: "Invalid QR type" when scanning
**Cause:** Scanning wrong QR type for the mode
**Solution:**
- INBOUND/OUTBOUND mode → Must scan BOX: QR codes
- MOVE Step 1 → Must scan LOC: QR codes
- MOVE Step 2 → Must scan BOX: QR codes

#### Error: "Unknown box. Create label first"
**Cause:** Trying to scan a box that hasn't been created yet
**Solution:**
1. Go to Create Box page
2. Generate a box label
3. Print and stick it on the physical box
4. Then scan it

#### Error: "Location not found"
**Cause:** Location doesn't exist or QR code is incorrect
**Solution:**
1. Go to Locations page
2. Verify location exists
3. Generate new QR code if needed
4. Make sure QR code format is LOC:<location_code>

#### Error: Module not found / Import errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Backend Errors

#### Error: "SUPABASE_URL and SUPABASE_ANON_KEY must be set"
**Solution:**
1. Create `backend/.env` file
2. Add:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Get these from Supabase dashboard → Project Settings → API

#### Error: "relation does not exist" or "table does not exist"
**Cause:** Database migrations not run
**Solution:**
1. Go to Supabase dashboard → SQL Editor
2. Run `backend/supabase/migrations/001_initial_schema.sql`
3. Run `backend/supabase/migrations/002_seed_receiving_location.sql`

#### Error: "function increment_box_id_counter does not exist"
**Cause:** Migration 001 didn't create the PostgreSQL function
**Solution:**
1. Go to Supabase SQL Editor
2. Run this manually:
   ```sql
   CREATE OR REPLACE FUNCTION increment_box_id_counter(target_date DATE)
   RETURNS INTEGER AS $$
   DECLARE
       new_seq INTEGER;
   BEGIN
       INSERT INTO box_id_counters (date, last_seq, updated_at)
       VALUES (target_date, 1, NOW())
       ON CONFLICT (date) DO UPDATE
       SET last_seq = box_id_counters.last_seq + 1,
           updated_at = NOW()
       RETURNING last_seq INTO new_seq;
       
       RETURN new_seq;
   END;
   $$ LANGUAGE plpgsql;
   ```

#### Error: "Foreign key constraint violation"
**Causes:**
- Trying to create event with non-existent box_id
- Trying to create box with non-existent product_id

**Solutions:**
1. Create product first (via Products page or API)
2. Create box label (box will be created automatically)
3. Then scan the box

#### Error: ModuleNotFoundError or ImportError
**Solution:**
```bash
cd backend
pip install -r requirements.txt

# Or with virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### Database Errors

#### Error: Duplicate key violation on box_id_counters
**Cause:** Multiple requests trying to create counter simultaneously
**Solution:** This should be handled by the PostgreSQL function. If it persists:
1. Check that the `increment_box_id_counter` function exists
2. Verify the function has proper locking

#### Error: Duplicate client_event_id
**Cause:** Trying to send the same event twice
**Solution:** This is expected behavior (idempotency). The system returns the existing event.

#### Error: RECEIVING location not found
**Cause:** Migration 002 didn't run
**Solution:**
```sql
INSERT INTO locations (location_code, zone, aisle, rack, shelf, is_system_location)
VALUES ('RECEIVING', 'RECEIVING', 'N/A', 'N/A', 'N/A', TRUE)
ON CONFLICT (location_code) DO NOTHING;
```

---

### Runtime Errors

#### QR Scanner keeps restarting
**Cause:** useEffect dependencies causing re-renders
**Solution:** Fixed in latest code - make sure you have the latest QRScanner.tsx

#### Multiple QR readers appearing
**Cause:** Component mounting multiple times
**Solution:** The cleanup function should prevent this. Check browser console for errors.

#### State not updating after scan
**Cause:** Closure issue with state variables
**Solution:** Fixed by using refs for cooldown tracking instead of state

#### Network errors: CORS or connection refused
**Causes:**
- Backend not running
- Wrong API URL in frontend
- CORS configuration

**Solutions:**
1. Verify backend is running on http://localhost:8000
2. Check `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Backend CORS is configured for all origins (check `backend/app/main.py`)

---

### Build Errors

#### Next.js build fails
**Solution:**
```bash
cd frontend
rm -rf .next
npm run build
```

#### TypeScript compilation errors
**Solution:**
```bash
cd frontend
npm install --save-dev @types/html5-qrcode
rm -rf node_modules .next
npm install
```

---

### Installation Errors

#### npm install fails
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### pip install fails
**Solution:**
```bash
cd backend
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# Or use virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Still Having Issues?

### Check Logs

**Backend logs:**
- Look at terminal where backend is running
- Check for Python errors or Supabase connection errors

**Frontend logs:**
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API call failures

### Verify Setup

1. **Backend running?**
   - Visit http://localhost:8000/health
   - Should return `{"status": "healthy"}`

2. **Frontend running?**
   - Visit http://localhost:3000
   - Should show the app

3. **Database connected?**
   - Check backend logs for connection errors
   - Verify Supabase credentials in `.env`

4. **Migrations run?**
   - Check Supabase dashboard → Table Editor
   - Should see: products, boxes, locations, events, inventory_state, box_id_counters

### Get Help

1. Check error messages in:
   - Browser console (F12)
   - Backend terminal
   - Supabase dashboard logs

2. Verify:
   - All dependencies installed
   - Environment variables set
   - Database migrations run
   - Both servers running

3. Common issues:
   - Camera permissions
   - CORS errors
   - Database connection
   - Missing migrations
