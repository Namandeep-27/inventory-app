# User Guide - Phone Inventory System

## Getting Started

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd /Users/namandeepsinghnayyar/project
./start-backend.sh
```
Backend will run on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd /Users/namandeepsinghnayyar/project
./start-frontend.sh
```
Frontend will run on http://localhost:3000

Open your browser to http://localhost:3000

---

## Complete Workflow

### 1. Create Products

**What:** Add products to your catalog (e.g., "Jack Daniels - Tennessee Whiskey")

1. Click **"Products"** in the navigation bar
2. Click **"Create Product"** button
3. Fill in:
   - **Brand**: e.g., "Jack Daniels"
   - **Product Name**: e.g., "Tennessee Whiskey"
   - **Size**: e.g., "750ml" (optional)
4. Click **"Create Product"**

✅ You can create as many products as needed. They'll appear in the products list.

---

### 2. Create Locations

**What:** Add shelf locations where boxes will be stored (e.g., Zone A, Aisle 3, Rack R2, Shelf S4)

1. Click **"Locations"** in the navigation bar
2. Click **"Create Location"** button
3. Fill in:
   - **Zone**: e.g., "A"
   - **Aisle**: e.g., "3"
   - **Rack**: e.g., "R2"
   - **Shelf**: e.g., "S4"
4. Click **"Create Location"**
5. **Print the QR code** shown for that location
6. **Stick the QR code on the actual shelf** in your warehouse

✅ Location code will be generated automatically (e.g., "A3-R2-S4")

**Important:** Print and stick these location QR codes on your shelves before scanning!

---

### 3. Create Box Labels

**What:** Generate box labels with QR codes for physical boxes

1. Click **"Create Box"** in the navigation bar
2. Select a **Product** from the dropdown
3. Optionally enter a **Lot Code** (e.g., "L2026-01")
4. Click **"Generate Box Label"**
5. **Print the label** using the "Print Label" button
6. **Stick the label on the physical box**

✅ Box ID will be generated automatically (e.g., "BX-20260109-000142")

**Important:** Stick these labels on boxes before scanning!

---

### 4. Scan Operations

**What:** Use your phone camera to scan boxes and track inventory

#### Option A: INBOUND (Receiving Boxes)

1. Click **"Scan"** in the navigation bar
2. Select **"INBOUND"** mode
3. Point your phone camera at a **Box QR code**
4. Camera will scan automatically
5. Box status changes to **IN_STOCK** at **RECEIVING** location
6. You'll see a success message with product info

**What happens:**
- Box is marked as IN_STOCK
- Location set to RECEIVING (temporary receiving area)
- Event is recorded in history

---

#### Option B: MOVE (Put-away / Relocation)

**Two-step process:**

**Step 1 - Scan Location:**
1. Select **"MOVE"** mode
2. Point camera at a **Location QR code** (the shelf sticker)
3. You'll see "Location locked: A3-R2-S4"

**Step 2 - Scan Box:**
1. Point camera at a **Box QR code**
2. Box moves to that location
3. You'll see a success message

**What happens:**
- Box location updates to the scanned shelf location
- Box remains IN_STOCK
- Event is recorded

**To clear location and start over:** Click "Clear" button

---

#### Option C: OUTBOUND (Shipping Boxes)

1. Select **"OUTBOUND"** mode
2. Point your phone camera at a **Box QR code**
3. Box status changes to **OUT_OF_WAREHOUSE**
4. Location is cleared

**What happens:**
- Box is marked as OUT_OF_WAREHOUSE
- Location is removed
- Event is recorded
- ⚠️ If box was never received (no IN event), a warning appears

---

### 5. View Inventory

**What:** See all boxes and their current status

1. Click **"Inventory"** in the navigation bar
2. **Search** by Box ID, brand, or product name
3. **Filter** by:
   - Status (IN_STOCK / OUT_OF_WAREHOUSE)
   - Location
4. Click any **Box ID** to see detailed history

**You can see:**
- Box ID
- Product (Brand - Name - Size)
- Lot Code
- Current Status
- Current Location
- Last Event Time

---

### 6. View Box Details

**What:** See complete history of a box

1. Click any **Box ID** in the inventory list
2. View:
   - **Product Info**: Brand, name, size, lot code
   - **Current Status**: IN_STOCK or OUT_OF_WAREHOUSE
   - **Current Location**: Where it is now
   - **Event History**: Complete timeline of all scans

---

### 7. View Exceptions

**What:** See problematic events (e.g., boxes shipped without being received)

1. Click **"Exceptions"** in the navigation bar
2. **Filter** by exception type:
   - OUT_WITHOUT_IN: Box shipped without being received
   - MOVE_WHEN_OUT: Attempted to move box that's already shipped
   - DUPLICATE_SCAN: Duplicate scan detected

**Use this to:**
- Find data quality issues
- Track missing boxes
- Audit inventory accuracy

---

### 8. View Activity

**What:** See recent scanning activity in real-time

1. Click **"Activity"** in the navigation bar
2. Toggle **"Show exceptions only"** to filter
3. Toggle **"Auto-refresh"** for live updates
4. Click **"Refresh"** to manually update

**You'll see:**
- Recent events
- Timestamps
- Box IDs
- Product names
- Exception badges (yellow/orange)

---

## Common Workflows

### Receiving a Shipment

1. Create box labels for all boxes (if not already done)
2. Stick labels on physical boxes
3. Go to **Scan** page, select **INBOUND**
4. Scan each box QR code as you receive it
5. Boxes are now IN_STOCK at RECEIVING location

### Put-away (Moving to Shelf)

1. Go to **Scan** page, select **MOVE**
2. Scan **Location QR** on the target shelf
3. Scan **Box QR** on the box
4. Box is now at that location
5. Repeat for each box

### Picking for Shipping

1. Go to **Scan** page, select **OUTBOUND**
2. Scan **Box QR** on each box as you ship it
3. Boxes are marked OUT_OF_WAREHOUSE

### Finding a Box

1. Go to **Inventory** page
2. Search by Box ID, brand, or product name
3. Click the Box ID to see exact location and history

### Checking for Issues

1. Go to **Exceptions** page
2. Review any warnings or exceptions
3. Click Box ID to investigate details

---

## Tips & Best Practices

### QR Code Scanning
- **Good lighting** helps scanning work faster
- **Hold phone steady** for 1-2 seconds
- **Clean QR codes** - damaged labels won't scan
- **Correct distance** - hold phone 6-12 inches from QR code

### Location QR Codes
- **Print multiple copies** for backup
- **Laminate** if warehouse is dusty/wet
- **Place prominently** on shelf (easy to scan)
- **Test scan** before attaching permanently

### Box Labels
- **Print on adhesive labels** (4x6 inches recommended)
- **Laminate** for durability if needed
- **Place consistently** on same spot of box
- **Avoid corners/edges** where labels can tear

### Inventory Management
- **Scan regularly** to keep inventory accurate
- **Check exceptions** daily for issues
- **Use lot codes** for product tracking
- **Review activity feed** to see what's happening

---

## Troubleshooting

### QR Code Won't Scan
- Check camera permissions in browser
- Use Chrome or Edge browser (Safari may have issues)
- Ensure good lighting
- Clean the QR code surface
- Hold phone closer or further away

### Box Not Found Error
- Box label must be created first (via Create Box page)
- Verify Box ID exists in Inventory page
- Check if Box ID was typed manually (should scan QR)

### Location Not Found Error
- Location must be created first (via Locations page)
- Verify Location QR code format starts with "LOC:"
- Check Location exists in Locations page

### Camera Not Working
- Allow camera permissions when browser prompts
- Use HTTPS or localhost (required for camera)
- Try a different browser
- Check browser settings for camera permissions

### Wrong QR Type Error
- **INBOUND/OUTBOUND** mode requires **BOX:** QR codes
- **MOVE Step 1** requires **LOC:** QR codes  
- **MOVE Step 2** requires **BOX:** QR codes
- Make sure you're scanning the correct QR type for the mode

---

## Keyboard Shortcuts

- **Scan page** is the main work area (most common)
- Use browser **back button** to navigate
- **Refresh page** if UI seems stuck

---

## Need Help?

- **API Documentation**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health
- **Frontend**: http://localhost:3000

For technical setup issues, see QUICKSTART.md
