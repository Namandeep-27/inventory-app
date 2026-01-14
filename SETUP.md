# Setup Instructions

## Quick Start

### 1. Database Setup (Supabase)

1. Create a Supabase project at https://supabase.com
2. Get your Supabase URL and anon key from Project Settings → API
3. Run the migrations:
   - Go to SQL Editor in Supabase dashboard
   - Run `backend/supabase/migrations/001_initial_schema.sql`
   - Run `backend/supabase/migrations/002_seed_receiving_location.sql`

### 2. Backend Setup

```bash
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Or use virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Configure environment variables
# Create .env.local file:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Verification

1. Backend health check: http://localhost:8000/health
2. API docs: http://localhost:8000/docs
3. Frontend: http://localhost:3000

## First Steps

1. Create a product: Go to `/create-box`, you'll need to create a product first
2. Actually, you'll need to use the API to create products first, or add a products page
3. Create products via API: POST http://localhost:8000/products
   ```json
   {
     "brand": "Jack Daniels",
     "name": "Tennessee Whiskey",
     "size": "750ml"
   }
   ```
4. Create locations via API or the locations page
5. Create box labels at `/create-box`
6. Start scanning at `/scan`

## Troubleshooting

### Backend errors
- Check Supabase credentials in `.env`
- Verify migrations have been run
- Check Supabase RPC function is created (for box ID generation)

### Frontend errors
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check browser console for errors

### Database errors
- Verify all migrations ran successfully
- Check RECEIVING location was seeded
- Verify foreign key constraints are in place
