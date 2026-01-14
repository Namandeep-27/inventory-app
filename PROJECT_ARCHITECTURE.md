# Project Architecture & Technical Overview

## 📦 **Backend Dependencies (Python Packages)**

Located in `backend/requirements.txt`:

1. **FastAPI (0.104.1)** - Modern web framework for building APIs
2. **Uvicorn (0.24.0)** - ASGI server to run FastAPI
3. **Supabase (2.0.0)** - Python client for Supabase (PostgreSQL database)
4. **Pydantic (2.5.0)** - Data validation using Python type annotations
5. **python-dotenv (1.0.0)** - Load environment variables from .env file
6. **qrcode[pil] (7.4.2)** - QR code generation library (though not directly used in current implementation)

## 📦 **Frontend Dependencies (Node.js Packages)**

Located in `frontend/package.json`:

### Production Dependencies:
1. **Next.js (^14.0.0)** - React framework for production
2. **React (^18.0.0)** - UI library
3. **React-DOM (^18.0.0)** - React renderer for web
4. **html5-qrcode (^2.3.8)** - QR code scanner for web browsers
5. **axios (^1.6.0)** - HTTP client for API calls
6. **tailwindcss (^3.3.0)** - Utility-first CSS framework
7. **autoprefixer (^10.4.16)** - CSS vendor prefixer
8. **postcss (^8.4.32)** - CSS transformer
9. **react-hot-toast (^2.4.1)** - Toast notifications
10. **uuid (^9.0.1)** - Generate UUIDs for client-side event IDs
11. **qrcode.react (^3.1.0)** - React component for displaying QR codes
12. **react-select (^5.8.0)** - Select component for dropdowns

### Development Dependencies:
- **TypeScript (^5.0.0)** - Type-safe JavaScript
- **@types/node, @types/react, @types/react-dom, @types/uuid** - TypeScript type definitions

---

## 🗄️ **Database Schema & Tables**

**Database:** PostgreSQL (via Supabase)

### 1. **products** Table
```sql
- product_id (UUID, PRIMARY KEY) - Auto-generated UUID
- brand (VARCHAR) - Product brand name
- name (VARCHAR) - Product name
- size (VARCHAR, nullable) - Product size
- created_at (TIMESTAMP) - Creation timestamp
```
**Index:** `idx_products_brand_name` on (brand, name)

### 2. **boxes** Table
```sql
- box_id (VARCHAR, PRIMARY KEY) - Format: BX-YYYYMMDD-######
- product_id (UUID, FOREIGN KEY → products) - References products table
- lot_code (VARCHAR, nullable) - Batch/lot identifier
- created_at (TIMESTAMP) - Creation timestamp
- created_by (VARCHAR, nullable) - User who created the box
```
**Indexes:**
- `idx_boxes_product_id` on product_id
- `idx_boxes_created_at` on created_at

### 3. **locations** Table
```sql
- location_id (UUID, PRIMARY KEY) - Auto-generated UUID
- location_code (VARCHAR, UNIQUE) - Format: Zone-Aisle-Rack-Shelf (e.g., A3-R2-S4)
- zone (VARCHAR, nullable)
- aisle (VARCHAR, nullable)
- rack (VARCHAR, nullable)
- shelf (VARCHAR, nullable)
- is_system_location (BOOLEAN) - True for system locations like RECEIVING
- created_at (TIMESTAMP) - Creation timestamp
```
**Index:** `idx_locations_location_code` on location_code

### 4. **box_id_counters** Table (For Race-Safe ID Generation)
```sql
- date (DATE, PRIMARY KEY) - Date for which counter is valid
- last_seq (INTEGER) - Last sequence number used for that date
- updated_at (TIMESTAMP) - Last update timestamp
```
**PostgreSQL Function:** `increment_box_id_counter(target_date DATE)` - Atomically increments counter

### 5. **events** Table (Event Log)
```sql
- event_id (UUID, PRIMARY KEY) - Auto-generated UUID
- client_event_id (UUID, UNIQUE) - Client-generated UUID for idempotency
- event_type (VARCHAR) - Must be: 'IN', 'OUT', or 'MOVE'
- box_id (VARCHAR, FOREIGN KEY → boxes) - References boxes table
- location_id (UUID, FOREIGN KEY → locations, nullable) - References locations table
- timestamp (TIMESTAMP) - When event occurred (default: NOW())
- user_id (VARCHAR, nullable)
- mode (VARCHAR) - Must be: 'INBOUND', 'OUTBOUND', or 'MOVE'
- source_type (VARCHAR) - Default: 'PHONE', can be: 'PHONE', 'INBOUND_STATION', 'OUTBOUND_STATION', 'API'
- source_id (VARCHAR, nullable)
- raw_qr_value (TEXT, nullable) - Original QR code value scanned
- warning (TEXT, nullable) - Warning message if any
- exception_type (VARCHAR, nullable) - Can be: 'OUT_WITHOUT_IN', 'MOVE_WHEN_OUT', 'DUPLICATE_SCAN'
```
**Indexes:**
- `idx_events_box_id` on box_id
- `idx_events_timestamp` on timestamp
- `idx_events_client_event_id` on client_event_id
- `idx_events_exception_type` on exception_type

### 6. **inventory_state** Table (Current Snapshot)
```sql
- box_id (VARCHAR, PRIMARY KEY, FOREIGN KEY → boxes) - References boxes table
- status (VARCHAR) - Must be: 'IN_STOCK' or 'OUT_OF_WAREHOUSE'
- current_location_id (UUID, FOREIGN KEY → locations, nullable) - Current location of box
- last_event_time (TIMESTAMP, nullable) - Time of last event
- last_event_type (VARCHAR, nullable) - Type of last event (IN/OUT/MOVE)
```
**Indexes:**
- `idx_inventory_state_status` on status
- `idx_inventory_state_location` on current_location_id

### 7. **System Location (Seed Data)**
- **RECEIVING** - Special system location for inbound boxes (seeded via migration `002_seed_receiving_location.sql`)

---

## 🏗️ **Pydantic Models (Data Validation)**

Located in `backend/app/models.py`:

### Product Models:
- **ProductCreate** - For creating products (brand, name, optional size)
- **ProductResponse** - Response model (includes product_id, created_at)

### Box Models:
- **BoxCreate** - For creating boxes (product_id, optional lot_code)
- **BoxResponse** - Response model (box_id, qr_value, product info, lot_code)
- **BoxDetailsResponse** - Detailed box info with events and current location

### Event Models:
- **EventCreate** - For creating events (client_event_id, event_type, box_id, location_code, mode, source_type, source_id)
  - Validation: event_type must match pattern `^(IN|OUT|MOVE)$`
  - Validation: mode must match pattern `^(INBOUND|OUTBOUND|MOVE)$`
  - Validation: source_type must match pattern `^(PHONE|INBOUND_STATION|OUTBOUND_STATION|API)$`
- **EventResponse** - Response model (event_id, success, message, warning, exception_type, is_duplicate, box info)

### Location Models:
- **LocationCreate** - For creating locations (zone, aisle, rack, shelf)
- **LocationResponse** - Response model (location_id, location_code, zone, aisle, rack, shelf, is_system_location, created_at)

### Inventory Models:
- **InventoryItem** - Inventory item representation (box_id, status, current_location, last_event_time, product, lot_code)

---

## 📱 **QR Code System**

### QR Code Format:

**Box QR Codes:**
- Format: `BOX:<box_id>`
- Example: `BOX:BX-20260109-000142`
- The `box_id` follows format: `BX-YYYYMMDD-######` (6-digit sequence)

**Location QR Codes:**
- Format: `LOC:<location_code>`
- Example: `LOC:A3-R2-S4`
- The `location_code` is generated from zone-aisle-rack-shelf

### How QR Codes Are Generated:

#### 1. **Box QR Codes:**
   - When a box is created via `/boxes` POST endpoint:
     - Backend generates a unique `box_id` using `generate_box_id()` function
     - Format: `BX-{YYYYMMDD}-{######}` where `######` is a 6-digit sequence number
     - Sequence is generated using PostgreSQL function `increment_box_id_counter()` for race-safety
     - Each date has its own sequence counter (resets daily)
     - The QR value returned is: `BOX:{box_id}`
   - Frontend displays QR code using `QRCodeDisplay` component (uses `qrcode.react` library)
   - QR code level: **H** (High error correction - can tolerate up to 30% damage)

#### 2. **Location QR Codes:**
   - When a location is created via `/locations` POST endpoint:
     - Location code is generated from: `{zone}-{aisle}-{rack}-{shelf}`
     - The QR value is: `LOC:{location_code}`
   - Frontend displays QR code using same `QRCodeDisplay` component

### QR Code Scanning:

- Uses `html5-qrcode` library in frontend
- Scanner validates prefix (`BOX:` or `LOC:`) before accepting
- Strips prefix before processing
- Includes duplicate scan prevention (5-second cooldown)
- Provides audio/visual feedback (beep, vibration)

### Are QR Codes Different Every Time?

**YES - Box QR Codes are UNIQUE every time:**

1. **Box IDs are unique:**
   - Format: `BX-YYYYMMDD-######`
   - Sequence number (`######`) increments for each box created on the same day
   - Uses atomic PostgreSQL counter to prevent duplicates
   - Different dates get different sequence counters
   - Example progression:
     - `BX-20260109-000001`
     - `BX-20260109-000002`
     - `BX-20260109-000003`
     - `BX-20260110-000001` (next day, counter resets)

2. **Location QR Codes:**
   - Based on location_code (zone-aisle-rack-shelf combination)
   - Same location = same QR code (by design - physical location doesn't change)
   - Different locations = different QR codes

3. **QR Code Generation:**
   - QR codes are **not stored in database**
   - They are **generated on-the-fly** from the data
   - Same `box_id` = same QR code (deterministic)
   - But each box gets a **unique box_id**, so each box has a **unique QR code**

---

## 🔄 **Business Rules Engine**

Located in `backend/app/rules_engine.py`:

### Rule T1: Mode-Event Type Validation
- INBOUND mode → Must have IN event
- OUTBOUND mode → Must have OUT event
- MOVE mode → Must have MOVE event

### Rule T2: MOVE Requires Location
- MOVE events must have a location_code

### Rule T3: Inventory State Validation
- Cannot MOVE a box that is OUT_OF_WAREHOUSE (exception: `MOVE_WHEN_OUT`)
- OUT event without previous IN event generates warning (exception: `OUT_WITHOUT_IN`)

---

## 🛠️ **API Architecture**

### Backend (FastAPI):
- **Entry Point:** `backend/app/main.py`
- **Routers:**
  - `/products` - Product management
  - `/boxes` - Box creation and retrieval
  - `/locations` - Location management
  - `/events` - Event logging (IN/OUT/MOVE)
  - `/exceptions` - Exception querying
  - `/inventory` - Inventory queries

### Frontend (Next.js):
- **Framework:** Next.js 14 with App Router
- **Pages:**
  - `/` - Home/dashboard
  - `/scan` - QR scanning interface
  - `/create-box` - Box creation
  - `/boxes/[box_id]` - Box details
  - `/products` - Product management
  - `/locations` - Location management
  - `/inventory` - Inventory view
  - `/activity` - Event history
  - `/exceptions` - Exception view

### Data Flow:
1. Frontend scans QR code → extracts `BOX:xxx` or `LOC:xxx`
2. Frontend creates event with `client_event_id` (UUID) for idempotency
3. Backend validates event against business rules
4. Backend creates event record in `events` table
5. Backend updates `inventory_state` table (current snapshot)
6. Backend returns response with product info and status

---

## 🔐 **Key Features:**

1. **Idempotency:** Events use `client_event_id` (UUID) to prevent duplicate processing
2. **Race Safety:** Box ID generation uses atomic PostgreSQL function
3. **Audit Trail:** All events are logged in `events` table
4. **Current State:** `inventory_state` table maintains fast lookups
5. **QR Validation:** Scanner validates prefix before accepting
6. **Error Handling:** Business rules prevent invalid state transitions
7. **Exception Tracking:** System tracks exceptions (OUT_WITHOUT_IN, MOVE_WHEN_OUT)

---

## 📝 **Summary**

- **Models:** 8 Pydantic models for validation (Product, Box, Event, Location, Inventory)
- **Packages:** 6 backend Python packages, 12 frontend npm packages
- **Database:** 7 tables (products, boxes, locations, events, inventory_state, box_id_counters, plus system seed data)
- **QR Codes:** 
  - Format: `BOX:<box_id>` or `LOC:<location_code>`
  - Box QR codes are **unique** (race-safe sequence generation)
  - Location QR codes are deterministic based on location_code
  - Generated on-the-fly, not stored in database
- **Box IDs:** Format `BX-YYYYMMDD-######` with daily sequence reset
