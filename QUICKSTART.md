# Quick Start Guide

## Prerequisites

- Python 3.8+
- Node.js 18+
- Supabase account (free tier works)

## Setup (5 minutes)

### 1. Database Setup

1. Go to https://supabase.com and create a new project
2. In Supabase dashboard, go to **SQL Editor**
3. Copy and run the contents of `backend/supabase/migrations/001_initial_schema.sql`
4. Copy and run the contents of `backend/supabase/migrations/002_seed_receiving_location.sql`
5. Go to **Project Settings → API** and copy:
   - Project URL
   - anon/public key

### 2. Configure Backend

```bash
cd backend
cp .env.example .env  # If .env.example doesn't exist, create .env manually
```

Edit `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Start Backend

```bash
# Option 1: Use the startup script
./start-backend.sh

# Option 2: Manual
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000
API docs: http://localhost:8000/docs

### 4. Configure Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 5. Start Frontend

```bash
# Option 1: Use the startup script
./start-frontend.sh

# Option 2: Manual
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## First Use

1. **Create a Product**:
   - Go to http://localhost:3000/products
   - Click "Create Product"
   - Enter Brand, Product Name, and Size (optional)
   - Click "Create Product"

   OR via API:
   - Go to http://localhost:8000/docs
   - Use POST /products endpoint

2. **Create a Location**:
   - Go to http://localhost:3000/locations
   - Click "Create Location"
   - Enter Zone, Aisle, Rack, Shelf
   - Print the QR code for the shelf

3. **Create a Box Label**:
   - Go to http://localhost:3000/create-box
   - Select a product
   - Optionally enter lot code
   - Click "Generate Box Label"
   - Print the label

4. **Start Scanning**:
   - Go to http://localhost:3000/scan
   - Select mode (INBOUND/OUTBOUND/MOVE)
   - Scan box QR codes
   - For MOVE: First scan location QR, then box QR

## Test the System

1. **INBOUND Flow**:
   - Mode: INBOUND
   - Scan box QR → Box becomes IN_STOCK at RECEIVING

2. **MOVE Flow**:
   - Mode: MOVE
   - Step 1: Scan location QR (e.g., LOC:A3-R2-S4)
   - Step 2: Scan box QR → Box moves to that location

3. **OUTBOUND Flow**:
   - Mode: OUTBOUND
   - Scan box QR → Box becomes OUT_OF_WAREHOUSE

## Verify Everything Works

- Check inventory: http://localhost:3000/inventory
- View exceptions: http://localhost:3000/exceptions
- View activity: http://localhost:3000/activity
- Check box details: Click any box ID in inventory

## Troubleshooting

**Backend won't start:**
- Check `.env` file has correct Supabase credentials
- Verify Python virtual environment is activated
- Check migrations have been run in Supabase

**Frontend shows errors:**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running on port 8000
- Check browser console for errors

**Database errors:**
- Verify all migrations completed successfully
- Check RECEIVING location exists (from migration 002)
- Ensure PostgreSQL function `increment_box_id_counter` exists

**QR scanning not working:**
- Allow camera permissions in browser
- Use HTTPS or localhost (required for camera access)
- Try a different browser (Chrome/Edge recommended)
