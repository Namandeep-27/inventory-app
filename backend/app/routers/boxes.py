"""Boxes router."""
from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.models import BoxCreate, BoxResponse
from app.database import supabase
from app.utils.box_id_generator import generate_box_id

router = APIRouter(prefix="/boxes", tags=["boxes"])


@router.post("", response_model=BoxResponse)
async def create_box(box: BoxCreate):
    """Generate a box label with race-safe box_id."""
    try:
        # Generate unique box_id
        box_id = generate_box_id()
        
        # Insert box
        result = supabase.table("boxes").insert({
            "box_id": box_id,
            "product_id": str(box.product_id),
            "lot_code": box.lot_code
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create box")
        
        # Get product info
        product_result = supabase.table("products").select("*").eq("product_id", str(box.product_id)).execute()
        if not product_result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = product_result.data[0]
        
        return BoxResponse(
            box_id=box_id,
            qr_value=f"BOX:{box_id}",
            product={
                "brand": product["brand"],
                "name": product["name"],
                "size": product.get("size")
            },
            lot_code=box.lot_code
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{box_id}")
async def get_box(box_id: str):
    """Get box details with product info and event history."""
    try:
        # Strip prefix if present
        if box_id.startswith("BOX:"):
            box_id = box_id[4:]
        
        # Get box
        box_result = supabase.table("boxes").select("*").eq("box_id", box_id).execute()
        
        if not box_result.data:
            raise HTTPException(status_code=404, detail="Box not found")
        
        box_data = box_result.data[0]
        
        # Get product
        product_result = supabase.table("products").select("*").eq("product_id", box_data["product_id"]).execute()
        if not product_result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = product_result.data[0]
        
        # Get inventory state
        inv_result = supabase.table("inventory_state").select("*").eq("box_id", box_id).execute()
        status = "OUT_OF_WAREHOUSE"
        current_location = None
        
        if inv_result.data:
            inv_data = inv_result.data[0]
            status = inv_data["status"]
            if inv_data.get("current_location_id"):
                # Get location
                loc_result = supabase.table("locations").select("*").eq("location_id", inv_data["current_location_id"]).execute()
                if loc_result.data:
                    current_location = loc_result.data[0]
        
        # Get events
        events_result = supabase.table("events").select("*").eq("box_id", box_id).order("timestamp", desc=False).execute()
        
        # Enrich events with location info
        enriched_events = []
        for event in events_result.data:
            event_data = event.copy()
            if event.get("location_id"):
                loc_result = supabase.table("locations").select("*").eq("location_id", event["location_id"]).execute()
                if loc_result.data:
                    event_data["locations"] = loc_result.data[0]
            enriched_events.append(event_data)
        
        return {
            "box_id": box_id,
            "product": {
                "brand": product["brand"],
                "name": product["name"],
                "size": product.get("size")
            },
            "lot_code": box_data.get("lot_code"),
            "status": status,
            "current_location": current_location,
            "events": enriched_events
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
