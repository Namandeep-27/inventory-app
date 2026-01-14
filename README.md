# Phone-Based Inventory + Location Tracking MVP

A warehouse inventory system with phone-based QR scanning for inbound, outbound, and move operations.

## Features

- **Three Scan Modes**: INBOUND, OUTBOUND, and MOVE (two-step location + box scan)
- **Product-Aware**: Every box is linked to a product (brand, name, size)
- **Location Tracking**: Shelf locations tracked via QR codes
- **Race-Safe Box ID Generation**: Transaction-safe daily sequence counters
- **Exception Tracking**: Visibility into OUT_WITHOUT_IN and other exceptions
- **Database Integrity**: Foreign key constraints enforced at database level

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14 (React, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **QR Scanning**: html5-qrcode
- **QR Generation**: qrcode.react

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # Supabase connection
│   ├── models.py            # Pydantic models
│   ├── rules_engine.py      # Business rules (T1, T2, T3)
│   ├── routers/
│   │   ├── events.py        # POST /events
│   │   ├── inventory.py     # GET /inventory
│   │   ├── boxes.py         # GET/POST /boxes
│   │   ├── locations.py     # GET/POST /locations
│   │   ├── products.py      # GET/POST /products
│   │   └── exceptions.py    # GET /exceptions
│   └── utils/
│       └── box_id_generator.py  # Race-safe box ID generation
├── supabase/migrations/     # Database migrations
└── requirements.txt

frontend/
├── app/                     # Next.js app directory
│   ├── scan/               # Scan page
│   ├── inventory/          # Inventory list
│   ├── locations/          # Location management
│   ├── boxes/[box_id]/     # Box details
│   ├── create-box/         # Create box labels
│   ├── exceptions/         # Exception view
│   └── activity/           # Live activity feed
├── components/             # React components
├── lib/                    # Utilities (api, types, feedback)
└── package.json
```

## Setup

### Backend

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Run database migrations:
   - Apply migrations from `backend/supabase/migrations/` to your Supabase database

4. Start the server:
```bash
uvicorn app.main:app --reload
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set environment variables:
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /events` - Create event (IN/OUT/MOVE)
- `GET /inventory` - Get inventory list
- `GET /boxes/{box_id}` - Get box details
- `POST /boxes` - Generate box label
- `GET /products` - List products
- `POST /products` - Create product
- `GET /locations` - List locations
- `POST /locations` - Create location
- `GET /exceptions` - Get exceptions

## Database Schema

See `backend/supabase/migrations/001_initial_schema.sql` for full schema.

Key tables:
- `products` - Product catalog
- `boxes` - Box registry (links to products)
- `locations` - Shelf locations
- `events` - Event history
- `inventory_state` - Current snapshot
- `box_id_counters` - Race-safe sequence counters

## QR Code Formats

- **Location QR**: `LOC:<location_code>` (e.g., `LOC:A3-R2-S4`)
- **Box QR**: `BOX:<box_id>` (e.g., `BOX:BX-20260109-000142`)

Database stores values without prefixes; prefixes added only in QR codes.

## Business Rules

- **T1**: Mode must match event type (INBOUND→IN, OUTBOUND→OUT, MOVE→MOVE)
- **T2**: MOVE requires location_code
- **T3**: 
  - MOVE only allowed if box is IN_STOCK
  - OUT without IN history creates exception
  - IN sets default location to RECEIVING

## Documentation

- **QUICKSTART.md** - Get up and running in 5 minutes
- **SETUP.md** - Detailed setup instructions
- **USER_GUIDE.md** - Complete user guide with workflows
- **EXAMPLE_WORKFLOW.md** - Step-by-step example scenario

## Quick Start

1. Set up Supabase database (run migrations)
2. Configure `backend/.env` with Supabase credentials
3. Run `./start-backend.sh`
4. Run `./start-frontend.sh`
5. Open http://localhost:3000
6. Create products → Create locations → Create boxes → Start scanning!

See **USER_GUIDE.md** for detailed usage instructions.

## License

MIT
