"""Inventory router."""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models import InventoryItem
from app.database import supabase
from datetime import datetime, timezone, timedelta
import time

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("")
async def get_inventory(
    status: Optional[str] = None,
    location_id: Optional[str] = None,
    search: Optional[str] = None,
    event_type_today: Optional[str] = None,  # "IN", "MOVE", or "OUT"
    date_from: Optional[str] = None,  # ISO date string (YYYY-MM-DD)
    date_to: Optional[str] = None  # ISO date string (YYYY-MM-DD)
):
    """Get inventory list with product info."""
    try:
        # If filtering by event type today, get box_ids from events first
        box_ids_from_events = None
        if event_type_today:
            # Get start and end of today in local server timezone (matches stats endpoint)
            # Use local time for "today" calculation so it matches user expectations
            # Get local timezone offset
            local_tz_offset = time.timezone if (time.daylight == 0) else time.altzone
            local_tz = timezone(timedelta(seconds=-local_tz_offset))
            
            now_local = datetime.now(local_tz)
            today_local = now_local.date()
            today_start_local = datetime.combine(today_local, datetime.min.time(), tzinfo=local_tz)
            tomorrow_start_local = today_start_local + timedelta(days=1)
            
            # Convert to UTC for database query (PostgreSQL timestamps are typically UTC)
            today_start_utc = today_start_local.astimezone(timezone.utc)
            tomorrow_start_utc = tomorrow_start_local.astimezone(timezone.utc)
            
            today_start_str = today_start_utc.isoformat()
            tomorrow_start_str = tomorrow_start_utc.isoformat()
            
            # Query events for today with this event type
            try:
                events_result = supabase.table("events").select("box_id").eq("event_type", event_type_today).eq("reversed", False).gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            except Exception:
                # Fallback if reversed column doesn't exist
                events_result = supabase.table("events").select("box_id").eq("event_type", event_type_today).gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            
            box_ids_from_events = set(event["box_id"] for event in events_result.data)
            if not box_ids_from_events:
                return []  # No events today, return empty list
        
        # Build query
        query = supabase.table("inventory_state").select("*")
        
        if status:
            query = query.eq("status", status)
        
        if location_id:
            query = query.eq("current_location_id", location_id)
        
        result = query.execute()
        
        inventory = []
        for item in result.data:
            # If filtering by event type today, skip boxes not in the set
            if box_ids_from_events is not None and item["box_id"] not in box_ids_from_events:
                continue
            
            # Get box
            box_result = supabase.table("boxes").select("*").eq("box_id", item["box_id"]).execute()
            if not box_result.data:
                continue
            
            box_data = box_result.data[0]
            
            # Get product
            product_result = supabase.table("products").select("*").eq("product_id", box_data["product_id"]).execute()
            if not product_result.data:
                continue
            
            product = product_result.data[0]
            
            # Get location if present
            location = None
            if item.get("current_location_id"):
                loc_result = supabase.table("locations").select("*").eq("location_id", item["current_location_id"]).execute()
                if loc_result.data:
                    location = loc_result.data[0]
            
            # Apply search filter if provided
            if search:
                search_lower = search.lower()
                if (search_lower not in item["box_id"].lower() and
                    search_lower not in product.get("brand", "").lower() and
                    search_lower not in product.get("name", "").lower()):
                    continue
            
            # Apply date filter if provided (filter by last_event_time)
            if date_from or date_to:
                last_event_time = item.get("last_event_time")
                if not last_event_time:
                    continue  # Skip items without last_event_time
                
                # Parse last_event_time and convert to local timezone for date comparison
                # This ensures "Today" and "Yesterday" match user expectations
                try:
                    # Get local timezone (same logic as stats endpoint)
                    local_tz_offset = time.timezone if (time.daylight == 0) else time.altzone
                    local_tz = timezone(timedelta(seconds=-local_tz_offset))
                    
                    # Parse last_event_time (assume it's ISO format, typically UTC)
                    if 'T' in str(last_event_time) or '+' in str(last_event_time) or 'Z' in str(last_event_time):
                        # Parse as UTC if it has timezone info
                        event_time_utc = datetime.fromisoformat(str(last_event_time).replace('Z', '+00:00'))
                        if event_time_utc.tzinfo is None:
                            # If no timezone, assume UTC
                            event_time_utc = event_time_utc.replace(tzinfo=timezone.utc)
                        # Convert to local timezone
                        event_time_local = event_time_utc.astimezone(local_tz)
                        event_date = event_time_local.date()
                    else:
                        # If it's just a date string, parse it directly
                        event_date = datetime.fromisoformat(str(last_event_time)).date()
                    
                    # Parse date filters (these should be YYYY-MM-DD format, representing local dates)
                    if date_from:
                        from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                        if event_date < from_date:
                            continue
                    
                    if date_to:
                        to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        if event_date > to_date:
                            continue
                except (ValueError, AttributeError) as e:
                    # If parsing fails, skip this item
                    continue
            
            inventory.append({
                "box_id": item["box_id"],
                "status": item["status"],
                "current_location": location,
                "last_event_time": item.get("last_event_time"),
                "product": {
                    "brand": product["brand"],
                    "name": product["name"],
                    "size": product.get("size")
                },
                "lot_code": box_data.get("lot_code")
            })
        
        return inventory
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
