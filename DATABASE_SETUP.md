# Database Setup Guide

## Step-by-Step Instructions to Create Your Database

### Prerequisites
- A Supabase account (free tier works - sign up at https://supabase.com)

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click **"New Project"** or **"Create Project"**
3. Fill in:
   - **Name**: Your project name (e.g., "Inventory System")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
4. Click **"Create new project"**
5. Wait 1-2 minutes for project to initialize

---

## Step 2: Run Database Migrations

### Migration 1: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"** button
3. Copy the **entire contents** of this file:
   ```
   backend/supabase/migrations/001_initial_schema.sql
   ```
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. ✅ You should see: **"Success. No rows returned"**

**What this creates:**
- `products` table - stores product information
- `boxes` table - stores box/container information
- `locations` table - stores warehouse locations
- `events` table - stores all inventory events
- `inventory_state` table - current state of inventory
- `box_id_counters` table - for generating unique box IDs
- Database function: `increment_box_id_counter`

### Migration 2: Seed Initial Data

1. Still in SQL Editor, click **"New query"** again
2. Copy the **entire contents** of this file:
   ```
   backend/supabase/migrations/002_seed_receiving_location.sql
   ```
3. Paste it into the SQL Editor
4. Click **"Run"**
5. ✅ You should see: **"Success. 1 row inserted"**

**What this creates:**
- A special "RECEIVING" location where inbound boxes are initially placed

---

## Step 3: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Project Settings** (gear icon ⚙️ in left sidebar)
2. Click **"API"** in the settings menu
3. Copy these two values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDE1NTU5OTl9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Step 4: Configure Backend

1. Navigate to your project folder:
   ```bash
   cd backend
   ```

2. Create or edit the `.env` file:
   ```bash
   # If .env doesn't exist, create it
   touch .env
   
   # Or edit existing one
   nano .env
   # or
   code .env
   ```

3. Add these lines (replace with YOUR values from Step 3):
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Example:**
   ```env
   SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoxNzAxNTU1OTk5fQ.example_key_here
   ```

4. Save the file

---

## Step 5: Verify Database Setup

### Test from Command Line:

```bash
# Test backend can connect to database
curl http://localhost:8000/products
```

**Expected response:**
- ✅ Good: `[]` (empty array) or list of products
- ❌ Bad: `"Could not find the table"` error → Migrations not run yet!

### Or Use the Status Check Script:

```bash
./test-system.sh
```

Look for:
- ✅ **Database Connection**: ✅ Connected

---

## Step 6: Verify Tables Were Created

### Option A: Using Supabase Dashboard

1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `products`
   - ✅ `boxes`
   - ✅ `locations` (should have 1 row - RECEIVING)
   - ✅ `events`
   - ✅ `inventory_state`
   - ✅ `box_id_counters`

### Option B: Using SQL Editor

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 6 tables listed.

### Check RECEIVING Location Exists:

Run this query:
```sql
SELECT * FROM locations WHERE location_code = 'RECEIVING';
```

Should return 1 row with `location_code = 'RECEIVING'`.

---

## Troubleshooting

### ❌ "Could not find the table" Error

**Problem:** Tables don't exist in database.

**Solution:**
1. Go to Supabase SQL Editor
2. Re-run both migration files:
   - `001_initial_schema.sql`
   - `002_seed_receiving_location.sql`
3. Check for any error messages
4. Verify tables in Table Editor

### ❌ Connection Error / Authentication Failed

**Problem:** Backend can't connect to Supabase.

**Solutions:**
1. Check `backend/.env` file exists and has correct values
2. Verify SUPABASE_URL starts with `https://` and ends with `.supabase.co`
3. Verify SUPABASE_ANON_KEY is the full key (starts with `eyJ...`)
4. Make sure no extra spaces or quotes around values
5. Restart backend server after editing `.env`

### ❌ "relation does not exist" Error

**Problem:** Migrations didn't run successfully.

**Solution:**
1. Check Supabase SQL Editor for error messages
2. Make sure you ran migrations in the correct database/project
3. Verify you're using the right Supabase project in `.env`

### ❌ Migration Script Errors

**Problem:** SQL syntax errors when running migrations.

**Solutions:**
1. Make sure you copied the ENTIRE file content
2. Run migrations one at a time (001 first, then 002)
3. Check Supabase logs for specific error messages
4. Verify your Supabase project supports all PostgreSQL features

---

## Quick Reference

### Files You Need:
- `backend/supabase/migrations/001_initial_schema.sql` - Creates all tables
- `backend/supabase/migrations/002_seed_receiving_location.sql` - Creates RECEIVING location

### Where to Run Migrations:
- **Supabase Dashboard** → **SQL Editor** → Paste SQL → Run

### Configuration File:
- `backend/.env` - Contains your Supabase credentials

### Test Database:
```bash
curl http://localhost:8000/products
# Should return: [] or [...]
```

---

## Next Steps

Once database is set up:

1. ✅ Verify tables exist (check Table Editor)
2. ✅ Test backend connection (`curl http://localhost:8000/products`)
3. ✅ Create your first product via frontend (http://localhost:3000/products)
4. ✅ Create locations for your warehouse
5. ✅ Start scanning boxes!

---

## Need Help?

- Check Supabase Dashboard → Logs for error messages
- Verify `.env` file has correct credentials
- Make sure backend server is restarted after `.env` changes
- Use `./test-system.sh` to check overall system status
