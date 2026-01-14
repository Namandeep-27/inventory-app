"""Stats router."""
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.rules_engine import get_receiving_location_id
from datetime import date, datetime, timedelta, timezone
import time

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/today")
async def get_stats_today():
    """Get today's workflow statistics for operators."""
    try:
        # Get start and end of today in local server timezone
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
        
        # Format as ISO strings for Supabase
        today_start_str = today_start_utc.isoformat()
        tomorrow_start_str = tomorrow_start_utc.isoformat()
        
        
        # Helper function to query events - try with reversed, fallback without
        # This matches the exact query structure used in inventory.py
        def query_events_distinct_box_ids(event_type: str):
            try:
                # Try with reversed filter first (matches inventory.py exactly)
                events_result = supabase.table("events").select("box_id").eq("event_type", event_type).eq("reversed", False).gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            except Exception:
                # Fallback if reversed column doesn't exist (matches inventory.py exactly)
                events_result = supabase.table("events").select("box_id").eq("event_type", event_type).gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            
            # Extract box_ids and return as set (matches inventory.py logic)
            # Handle case where data might be None or empty
            if not events_result.data:
                return set()
            box_ids = set(event["box_id"] for event in events_result.data if event.get("box_id"))
            return box_ids
        
        # Received today: COUNT(DISTINCT box_id) from events where event_type='IN' AND timestamp is today
        try:
            received_box_ids = query_events_distinct_box_ids("IN")
            received_today = len(received_box_ids)
            
            # Debug: Also check total IN events (without date filter) to verify query works
            try:
                all_in_events = supabase.table("events").select("box_id").eq("event_type", "IN").eq("reversed", False).execute()
                print(f"DEBUG: Total IN events (not reversed, all time): {len(all_in_events.data)}")
            except:
                pass
                
        except Exception as e:
            print(f"Error querying received events: {e}")
            import traceback
            traceback.print_exc()
            received_today = 0
        
        # To put away: COUNT(*) from inventory_state where status='IN_STOCK' AND current_location_id = RECEIVING
        receiving_location_id = get_receiving_location_id()
        to_put_away = 0
        if receiving_location_id:
            try:
                to_put_away_result = supabase.table("inventory_state").select("box_id", count="exact").eq("status", "IN_STOCK").eq("current_location_id", receiving_location_id).execute()
                to_put_away = to_put_away_result.count if to_put_away_result.count is not None else 0
            except Exception as e:
                print(f"Error querying to_put_away: {e}")
                to_put_away = 0
        
        # Moved today: COUNT(DISTINCT box_id) from events where event_type='MOVE' AND timestamp is today
        try:
            moved_box_ids = query_events_distinct_box_ids("MOVE")
            moved_today = len(moved_box_ids)
        except Exception as e:
            print(f"Error querying moved events: {e}")
            moved_today = 0
        
        # Shipped today: COUNT(DISTINCT box_id) from events where event_type='OUT' AND timestamp is today
        try:
            shipped_box_ids = query_events_distinct_box_ids("OUT")
            shipped_today = len(shipped_box_ids)
        except Exception as e:
            print(f"Error querying shipped events: {e}")
            shipped_today = 0
        
        # Exceptions today
        try:
            try:
                exceptions_result = supabase.table("events").select("event_id", count="exact").not_.is_("exception_type", "null").eq("reversed", False).gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            except Exception:
                exceptions_result = supabase.table("events").select("event_id", count="exact").not_.is_("exception_type", "null").gte("timestamp", today_start_str).lt("timestamp", tomorrow_start_str).execute()
            exceptions_today = exceptions_result.count if exceptions_result.count is not None else 0
        except Exception as e:
            print(f"Error querying exceptions: {e}")
            exceptions_today = 0
        
        # Get waiting put-away preview (top 5 boxes with product info)
        waiting_putaway_preview = []
        if receiving_location_id and to_put_away > 0:
            try:
                # Get boxes at RECEIVING location (oldest first for FIFO queue)
                waiting_boxes_result = supabase.table("inventory_state").select("box_id, last_event_time").eq("status", "IN_STOCK").eq("current_location_id", receiving_location_id).order("last_event_time", desc=False).limit(5).execute()
                
                if waiting_boxes_result.data:
                    box_ids = [box["box_id"] for box in waiting_boxes_result.data]
                    
                    # Get the actual IN event timestamp for each box (when it was received)
                    # This is more accurate than last_event_time which could be from a MOVE event
                    in_events_result = supabase.table("events").select("box_id, timestamp").eq("event_type", "IN").in_("box_id", box_ids).eq("reversed", False).order("timestamp", desc=False).execute()
                    in_events_dict = {}
                    if in_events_result.data:
                        # Group by box_id and take the first (oldest) IN event
                        for event in in_events_result.data:
                            box_id = event["box_id"]
                            if box_id not in in_events_dict:
                                in_events_dict[box_id] = event["timestamp"]
                    
                    # Get box details
                    boxes_result = supabase.table("boxes").select("box_id, product_id, lot_code").in_("box_id", box_ids).execute()
                    boxes_dict = {box["box_id"]: box for box in boxes_result.data} if boxes_result.data else {}
                    
                    # Get product details
                    product_ids = list(set(box.get("product_id") for box in boxes_dict.values() if box.get("product_id")))
                    products_dict = {}
                    if product_ids:
                        products_result = supabase.table("products").select("product_id, brand, name, size").in_("product_id", product_ids).execute()
                        products_dict = {p["product_id"]: p for p in products_result.data} if products_result.data else {}
                    
                    # Build preview list
                    for box_data in waiting_boxes_result.data:
                        box_id = box_data["box_id"]
                        box_info = boxes_dict.get(box_id, {})
                        product = products_dict.get(box_info.get("product_id"), {})
                        
                        # Use IN event timestamp if available, otherwise fall back to last_event_time
                        received_at = in_events_dict.get(box_id, box_data.get("last_event_time"))
                        
                        waiting_putaway_preview.append({
                            "box_id": box_id,
                            "product": {
                                "brand": product.get("brand", ""),
                                "name": product.get("name", ""),
                                "size": product.get("size")
                            },
                            "lot_code": box_info.get("lot_code"),
                            "last_event_time": received_at
                        })
            except Exception as e:
                print(f"Error querying waiting put-away preview: {e}")
                waiting_putaway_preview = []
        
        # Get recent events (last 5 events)
        recent_events = []
        try:
            events_result = supabase.table("events").select("event_id, timestamp, event_type, box_id, location_id").order("timestamp", desc=True).limit(5).execute()
            
            if events_result.data:
                # Filter out reversed events
                filtered_events = [e for e in events_result.data if not e.get("reversed", False)]
                
                if filtered_events:
                    box_ids = list(set(e["box_id"] for e in filtered_events))
                    
                    # Get box details
                    boxes_result = supabase.table("boxes").select("box_id, product_id, lot_code").in_("box_id", box_ids).execute()
                    boxes_dict = {box["box_id"]: box for box in boxes_result.data} if boxes_result.data else {}
                    
                    # Get product details
                    product_ids = list(set(box.get("product_id") for box in boxes_dict.values() if box.get("product_id")))
                    products_dict = {}
                    if product_ids:
                        products_result = supabase.table("products").select("product_id, brand, name, size").in_("product_id", product_ids).execute()
                        products_dict = {p["product_id"]: p for p in products_result.data} if products_result.data else {}
                    
                    # Get location details
                    location_ids = list(set(e.get("location_id") for e in filtered_events if e.get("location_id")))
                    locations_dict = {}
                    if location_ids:
                        locs_result = supabase.table("locations").select("location_id, location_code").in_("location_id", location_ids).execute()
                        locations_dict = {l["location_id"]: l for l in locs_result.data} if locs_result.data else {}
                    
                    # Build recent events list
                    for event in filtered_events[:5]:
                        box_id = event["box_id"]
                        box_info = boxes_dict.get(box_id, {})
                        product = products_dict.get(box_info.get("product_id"), {})
                        location = locations_dict.get(event.get("location_id"))
                        
                        recent_events.append({
                            "event_id": event["event_id"],
                            "timestamp": event["timestamp"],
                            "event_type": event["event_type"],
                            "box_id": box_id,
                            "product": {
                                "brand": product.get("brand", ""),
                                "name": product.get("name", ""),
                                "size": product.get("size")
                            },
                            "lot_code": box_info.get("lot_code"),
                            "location_code": location.get("location_code") if location else None
                        })
        except Exception as e:
            print(f"Error querying recent events: {e}")
            recent_events = []
        
        # Return UTC time for consistency
        now_utc = datetime.now(timezone.utc)
        return {
            "received_today": received_today,
            "to_put_away": to_put_away,
            "moved_today": moved_today,
            "shipped_today": shipped_today,
            "exceptions_today": exceptions_today,
            "server_time": now_utc.isoformat(),
            "waiting_putaway_preview": waiting_putaway_preview,
            "recent_events": recent_events,
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
