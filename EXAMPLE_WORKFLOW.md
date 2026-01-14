# Example Workflow - Step by Step

This is a complete walkthrough of using the system for a real scenario.

## Scenario: Receiving a Shipment of Alcohol

### Setup Phase (One-time, per product/location)

#### 1. Add Products to Catalog
```
Go to: Products page
Create:
  - Brand: "Jack Daniels"
  - Name: "Tennessee Whiskey"  
  - Size: "750ml"

Create:
  - Brand: "Crown Royal"
  - Name: "Deluxe"
  - Size: "1L"
```

#### 2. Create Shelf Locations
```
Go to: Locations page
Create Location 1:
  - Zone: "A"
  - Aisle: "1"
  - Rack: "R1"
  - Shelf: "S1"
  → Location Code: "A1-R1-S1"
  → Print QR code, stick on shelf

Create Location 2:
  - Zone: "A"
  - Aisle: "1"
  - Rack: "R1"
  - Shelf: "S2"
  → Location Code: "A1-R1-S2"
  → Print QR code, stick on shelf
```

---

### Daily Operations

#### Step 1: Generate Box Labels

**Truck arrives with 10 boxes of Jack Daniels**

```
Go to: Create Box page

For each box:
  1. Select Product: "Jack Daniels - Tennessee Whiskey (750ml)"
  2. Enter Lot Code: "L2026-001" (same lot for this shipment)
  3. Click "Generate Box Label"
  4. Print the label
  5. Stick label on physical box

Repeat 10 times.
You'll get box IDs like:
  - BX-20260109-000001
  - BX-20260109-000002
  - BX-20260109-000003
  ... up to BX-20260109-000010
```

**Result:** You have 10 physical boxes with printed QR labels.

---

#### Step 2: Receive Boxes (INBOUND)

```
Go to: Scan page
Mode: INBOUND

For each box:
  1. Point phone camera at Box QR code
  2. Wait for beep/vibration (success)
  3. See product info displayed: "Jack Daniels - Tennessee Whiskey"

After scanning all 10 boxes:
  - All boxes are IN_STOCK
  - All boxes are at RECEIVING location
  - All events are recorded
```

**Check:** Go to Inventory page, you'll see all 10 boxes with status IN_STOCK.

---

#### Step 3: Put-Away to Shelf (MOVE)

```
Go to: Scan page
Mode: MOVE

For each box:
  Step 1: Scan Location QR code on shelf "A1-R1-S1"
    → You see: "Location locked: A1-R1-S1"
  
  Step 2: Scan Box QR code on the box
    → Beep/vibration, success!
    → Box is now at location A1-R1-S1
    → Ready for next box

Put first 5 boxes on shelf A1-R1-S1.
Put remaining 5 boxes on shelf A1-R1-S2.
```

**Check:** Go to Inventory page, filter by Location:
  - 5 boxes at A1-R1-S1
  - 5 boxes at A1-R1-S2

---

#### Step 4: Pick for Shipping (OUTBOUND)

```
Customer orders 3 boxes of Jack Daniels.

Go to: Scan page
Mode: OUTBOUND

For each box to ship:
  1. Point phone camera at Box QR code
  2. Wait for beep/vibration
  3. Box is now OUT_OF_WAREHOUSE

After scanning 3 boxes:
  - 3 boxes: OUT_OF_WAREHOUSE (shipped)
  - 7 boxes: Still IN_STOCK at their locations
```

**Check:** Go to Inventory page:
  - Filter by Status: OUT_OF_WAREHOUSE → see 3 shipped boxes
  - Filter by Status: IN_STOCK → see 7 remaining boxes

---

#### Step 5: Verify & Audit

```
Go to: Exceptions page
→ Check for any warnings (should be none if everything went smoothly)

Go to: Activity page
→ See all recent scanning activity

Click on any Box ID in Inventory:
→ See complete history:
   1. IN - INBOUND (when received)
   2. MOVE - MOVE (when put on shelf)
   3. OUT - OUTBOUND (when shipped)
```

---

## Quick Reference Card

### Scan Modes

| Mode | QR Type | Steps | Result |
|------|---------|-------|--------|
| **INBOUND** | BOX: | 1 | Box → IN_STOCK at RECEIVING |
| **OUTBOUND** | BOX: | 1 | Box → OUT_OF_WAREHOUSE |
| **MOVE** | LOC: then BOX: | 2 | Box → moves to shelf location |

### Navigation

- **Scan** - Main work area (scanning)
- **Inventory** - View all boxes
- **Products** - Manage product catalog
- **Locations** - Manage shelf locations
- **Create Box** - Generate box labels
- **Exceptions** - View warnings/issues
- **Activity** - Recent events feed

### Status Colors

- 🟢 **IN_STOCK** - Box is in warehouse
- 🔴 **OUT_OF_WAREHOUSE** - Box is shipped/missing
- 🟡 **Exception** - Warning/issue detected

---

## Common Questions

**Q: Can I scan multiple boxes quickly?**
A: Yes! Just keep scanning. The cooldown prevents accidental duplicates.

**Q: What if I scan the wrong QR code?**
A: The system validates QR types. Wrong type shows an error, no event is created.

**Q: Can I move a box that's already shipped?**
A: No, system prevents it (MOVE_WHEN_OUT exception). Box must be IN_STOCK to move.

**Q: What if a box is shipped but never received?**
A: System allows it but creates an exception (OUT_WITHOUT_IN) for you to investigate.

**Q: How do I find where a box is?**
A: Go to Inventory, search for Box ID or product name, click Box ID to see location.

**Q: Can I print labels in bulk?**
A: Currently one at a time, but you can generate multiple labels quickly in sequence.
