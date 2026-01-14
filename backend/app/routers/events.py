"""Events router."""
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.models import EventCreate, EventResponse
from app.database import supabase
from app.rules_engine import validate_rules, get_receiving_location_id
from datetime import datetime, timezone
from uuid import UUID

router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
async def get_events(limit: int = 100, show_exceptions_only: bool = False):
    """Get all events (or exceptions only) with product and location info."""
    try:
        # Build base query - don't filter by reversed in SQL since column might not exist
        query = supabase.table("events").select("*")
        
        # Filter by exceptions if requested
        if show_exceptions_only:
            query = query.not_.is_("exception_type", "null")
        
        # Get more events than needed to account for duplicates and reversed events
        query = query.order("timestamp", desc=True).limit(limit * 3)  # Get extra in case we filter some out
        
        result = query.execute()
        
        # Filter out reversed events in Python (handles case where column doesn't exist)
        if result.data:
            # Only filter if the column exists in the data
            filtered_data = []
            for event in result.data:
                # If reversed column exists and is True, skip it
                if "reversed" in event and event.get("reversed", False):
                    continue
                filtered_data.append(event)
            result.data = filtered_data
        
        if not result.data:
            return []
        
        # Filter duplicate events: if multiple events have the same client_event_id,
        # only keep the first one (oldest timestamp) - that's the actual scan
        # Events are ordered DESC (newest first), so we process in reverse to find the first
        events_by_client_id = {}
        for event in reversed(result.data):  # Process oldest first
            client_event_id = event.get("client_event_id")
            if client_event_id:
                # Keep the first (oldest) event we encounter for each client_event_id
                if client_event_id not in events_by_client_id:
                    events_by_client_id[client_event_id] = event
        
        # Build list: include first event for each client_event_id, and all events without client_event_id
        unique_event_ids = set()
        unique_events = []
        for event in result.data:  # Process in original order (newest first) for display
            if len(unique_events) >= limit:
                break  # Stop once we have enough unique events
            
            client_event_id = event.get("client_event_id")
            if client_event_id:
                # Only include if this is the first event for this client_event_id
                first_event = events_by_client_id.get(client_event_id)
                if first_event and event["event_id"] == first_event["event_id"]:
                    unique_events.append(event)
                    unique_event_ids.add(event["event_id"])
            else:
                # Events without client_event_id are included (legacy events)
                if event["event_id"] not in unique_event_ids:
                    unique_events.append(event)
                    unique_event_ids.add(event["event_id"])
        
        # Batch fetch all boxes, products, and locations to avoid N+1 queries
        box_ids = list(set(event["box_id"] for event in unique_events))
        location_ids = list(set(event.get("location_id") for event in unique_events if event.get("location_id")))
        
        # Fetch all boxes at once
        boxes_dict = {}
        if box_ids:
            boxes_result = supabase.table("boxes").select("*").in_("box_id", box_ids).execute()
            if boxes_result.data:
                boxes_dict = {box["box_id"]: box for box in boxes_result.data}
        
        # Fetch all products at once
        product_ids = list(set(box.get("product_id") for box in boxes_dict.values() if box.get("product_id")))
        products_dict = {}
        if product_ids:
            products_result = supabase.table("products").select("*").in_("product_id", product_ids).execute()
            if products_result.data:
                products_dict = {product["product_id"]: product for product in products_result.data}
        
        # Fetch all locations at once
        locations_dict = {}
        if location_ids:
            locations_result = supabase.table("locations").select("*").in_("location_id", location_ids).execute()
            if locations_result.data:
                locations_dict = {loc["location_id"]: loc for loc in locations_result.data}
        
        # Build events list with batched data
        events = []
        for event in unique_events:
            # Get box and product from dictionaries
            box_data = boxes_dict.get(event["box_id"])
            product = None
            if box_data:
                product = products_dict.get(box_data.get("product_id"))
            
            # Get location from dictionary
            location = None
            if event.get("location_id"):
                location = locations_dict.get(event["location_id"])
            
            events.append({
                "event_id": event["event_id"],
                "timestamp": event["timestamp"],
                "box_id": event["box_id"],
                "event_type": event["event_type"],
                "mode": event.get("mode"),
                "exception_type": event.get("exception_type"),
                "warning": event.get("warning"),
                "product": {
                    "brand": product["brand"],
                    "name": product["name"],
                    "size": product.get("size")
                } if product else None,
                "locations": {
                    "location_code": location["location_code"]
                } if location else None
            })
        
        return events
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=EventResponse)
async def create_event(event: EventCreate):
    """Create an event (IN/OUT/MOVE) with rules validation."""
    try:
        # Check idempotency
        existing = supabase.table("events").select("*").eq("client_event_id", str(event.client_event_id)).execute()
        if existing.data:
            existing_event = existing.data[0]
            # Get product info for response
            box_result = supabase.table("boxes").select("*, products(*)").eq("box_id", existing_event["box_id"]).execute()
            if box_result.data:
                box_data = box_result.data[0]
                product = box_data["products"]
                return EventResponse(
                    event_id=UUID(existing_event["event_id"]),
                    success=True,
                    message="Event already processed",
                    warning=None,
                    exception_type=existing_event.get("exception_type"),
                    is_duplicate=True,
                    changed=False,
                    box_id=existing_event["box_id"],
                    product={
                        "brand": product["brand"],
                        "name": product["name"],
                        "size": product.get("size")
                    },
                    lot_code=box_data.get("lot_code")
                )
        
        # Strip prefixes
        box_id = event.box_id
        if box_id.startswith("BOX:"):
            box_id = box_id[4:]
        
        location_code = event.location_code
        if location_code and location_code.startswith("LOC:"):
            location_code = location_code[4:]
        
        # Get location_id if location_code provided
        location_id = None
        if location_code:
            loc_result = supabase.table("locations").select("location_id").eq("location_code", location_code).execute()
            if loc_result.data:
                location_id = loc_result.data[0]["location_id"]
            else:
                raise HTTPException(status_code=400, detail=f"Location not found: {location_code}")
        
        # Validate rules
        is_valid, error_msg, exception_type = validate_rules(event.mode, event.event_type, box_id, location_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Determine location for IN events (RECEIVING if not set)
        if event.event_type == "IN" and not location_id:
            receiving_loc_id = get_receiving_location_id()
            if receiving_loc_id:
                location_id = receiving_loc_id
        
        # Create event
        event_data = {
            "client_event_id": str(event.client_event_id),
            "event_type": event.event_type,
            "box_id": box_id,
            "location_id": location_id,
            "mode": event.mode,
            "source_type": event.source_type,
            "source_id": event.source_id,
            "exception_type": exception_type,
            "warning": f"Box was never received (no IN event found)" if exception_type == "OUT_WITHOUT_IN" else None
        }
        
        result = supabase.table("events").insert(event_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create event")
        
        created_event = result.data[0]
        
        # Update inventory_state
        inv_data = {
            "box_id": box_id,
            "status": "IN_STOCK" if event.event_type == "IN" else "OUT_OF_WAREHOUSE",
            "last_event_time": datetime.now(timezone.utc).isoformat(),
            "last_event_type": event.event_type
        }
        
        if event.event_type == "IN":
            if location_id:
                inv_data["current_location_id"] = location_id
        elif event.event_type == "OUT":
            inv_data["current_location_id"] = None
        elif event.event_type == "MOVE":
            # Check if box is already at this location
            current_inv = supabase.table("inventory_state").select("current_location_id").eq("box_id", box_id).execute()
            current_location_id = current_inv.data[0].get("current_location_id") if current_inv.data else None
            
            changed = True
            message = "Event created successfully"
            if location_id and str(current_location_id) == str(location_id):
                # Box is already at this location
                changed = False
                message = "Box already at this location"
            
            if location_id:
                inv_data["current_location_id"] = location_id
            inv_data["status"] = "IN_STOCK"  # MOVE keeps status as IN_STOCK
        
        # Upsert inventory_state
        supabase.table("inventory_state").upsert(inv_data).execute()
        
        # Get product info for response
        box_result = supabase.table("boxes").select("*").eq("box_id", box_id).execute()
        if not box_result.data:
            raise HTTPException(status_code=404, detail="Box not found")
        
        box_data = box_result.data[0]
        
        # Get product
        product_result = supabase.table("products").select("*").eq("product_id", box_data["product_id"]).execute()
        if not product_result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = product_result.data[0]
        
        # Determine changed and message for non-MOVE events
        if event.event_type != "MOVE":
            changed = True
            message = "Event created successfully"
        
        return EventResponse(
            event_id=UUID(created_event["event_id"]),
            success=True,
            message=message,
            warning=created_event.get("warning"),
            exception_type=exception_type,
            is_duplicate=False,
            changed=changed,
            box_id=box_id,
            product={
                "brand": product["brand"],
                "name": product["name"],
                "size": product.get("size")
            },
            lot_code=box_data.get("lot_code")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        error_str = str(e)
        if "foreign key constraint" in error_str.lower() or "violates foreign key" in error_str.lower():
            raise HTTPException(status_code=400, detail="Unknown box. Create label first.")
        raise HTTPException(status_code=400, detail=error_str)


@router.post("/{event_id}/undo")
async def undo_event(event_id: UUID):
    """Undo an event by marking it as reversed and recomputing inventory_state."""
    try:
        # Check if event exists
        event_result = supabase.table("events").select("*").eq("event_id", str(event_id)).execute()
        if not event_result.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        event = event_result.data[0]
        box_id = event["box_id"]
        
        # Check if already reversed
        if event.get("reversed", False):
            raise HTTPException(status_code=400, detail="Event already reversed")
        
        # Mark event as reversed
        supabase.table("events").update({"reversed": True}).eq("event_id", str(event_id)).execute()
        
        # Query latest non-reversed event for this box
        latest_result = supabase.table("events").select("*").eq("box_id", box_id).eq("reversed", False).order("timestamp", desc=True).limit(1).execute()
        
        if latest_result.data and len(latest_result.data) > 0:
            # Apply latest event's state
            latest_event = latest_result.data[0]
            inv_data = {
                "box_id": box_id,
                "status": "IN_STOCK" if latest_event["event_type"] == "IN" else "OUT_OF_WAREHOUSE",
                "last_event_time": latest_event["timestamp"],
                "last_event_type": latest_event["event_type"]
            }
            
            if latest_event["event_type"] == "IN":
                if latest_event.get("location_id"):
                    inv_data["current_location_id"] = latest_event["location_id"]
            elif latest_event["event_type"] == "OUT":
                inv_data["current_location_id"] = None
            elif latest_event["event_type"] == "MOVE":
                if latest_event.get("location_id"):
                    inv_data["current_location_id"] = latest_event["location_id"]
                inv_data["status"] = "IN_STOCK"  # MOVE keeps status as IN_STOCK
        else:
            # No events remain - clear inventory_state
            inv_data = {
                "box_id": box_id,
                "status": "OUT_OF_WAREHOUSE",
                "current_location_id": None,
                "last_event_time": None,
                "last_event_type": None
            }
        
        # Update inventory_state
        supabase.table("inventory_state").upsert(inv_data).execute()
        
        # Get updated box details for response
        box_result = supabase.table("boxes").select("*").eq("box_id", box_id).execute()
        if not box_result.data:
            raise HTTPException(status_code=404, detail="Box not found")
        
        box_data = box_result.data[0]
        
        # Get product
        product_result = supabase.table("products").select("*").eq("product_id", box_data["product_id"]).execute()
        if not product_result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = product_result.data[0]
        
        # Get current location if present
        location = None
        if inv_data.get("current_location_id"):
            loc_result = supabase.table("locations").select("*").eq("location_id", inv_data["current_location_id"]).execute()
            if loc_result.data:
                location = loc_result.data[0]
        
        # Get inventory_state for status
        inv_state_result = supabase.table("inventory_state").select("*").eq("box_id", box_id).execute()
        status = "OUT_OF_WAREHOUSE"
        if inv_state_result.data:
            status = inv_state_result.data[0]["status"]
        
        return {
            "success": True,
            "message": "Event undone successfully",
            "box_id": box_id,
            "product": {
                "brand": product["brand"],
                "name": product["name"],
                "size": product.get("size")
            },
            "lot_code": box_data.get("lot_code"),
            "status": status,
            "current_location": location
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
