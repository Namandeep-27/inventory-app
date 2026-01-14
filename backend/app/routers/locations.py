"""Locations router."""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models import LocationCreate, LocationResponse
from app.database import supabase
from uuid import UUID

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=List[LocationResponse])
async def get_locations():
    """Get all locations."""
    try:
        result = supabase.table("locations").select("*").order("zone", desc=False).order("aisle", desc=False).execute()
        return [LocationResponse(**item) for item in result.data]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=LocationResponse)
async def create_location(location: LocationCreate):
    """Create a new location."""
    try:
        # Generate location_code: {ZONE}{AISLE}-{RACK}-{SHELF}
        location_code = f"{location.zone}{location.aisle}-{location.rack}-{location.shelf}"
        
        # Check if system location
        is_system = False
        
        # Insert location
        result = supabase.table("locations").insert({
            "location_code": location_code,
            "zone": location.zone,
            "aisle": location.aisle,
            "rack": location.rack,
            "shelf": location.shelf,
            "is_system_location": is_system
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create location")
        
        return LocationResponse(**result.data[0])
    
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Location code already exists")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{location_id}/occupancy")
async def get_location_occupancy(location_id: UUID):
    """Get occupancy information for a location (boxes currently at this location)."""
    try:
        # Get location details
        location_result = supabase.table("locations").select("*").eq("location_id", str(location_id)).execute()
        if not location_result.data:
            raise HTTPException(status_code=404, detail="Location not found")
        
        location = location_result.data[0]
        
        # Get boxes currently at this location (status=IN_STOCK and current_location_id matches)
        inventory_result = supabase.table("inventory_state").select("box_id, last_event_time").eq("status", "IN_STOCK").eq("current_location_id", str(location_id)).order("last_event_time", desc=True).limit(10).execute()
        
        active_box_count = 0
        boxes = []
        
        if inventory_result.data:
            active_box_count = len(inventory_result.data)
            box_ids = [item["box_id"] for item in inventory_result.data]
            
            # Get box details
            boxes_result = supabase.table("boxes").select("box_id, product_id, lot_code").in_("box_id", box_ids).execute()
            boxes_dict = {box["box_id"]: box for box in boxes_result.data} if boxes_result.data else {}
            
            # Get product details
            product_ids = list(set(box.get("product_id") for box in boxes_dict.values() if box.get("product_id")))
            products_dict = {}
            if product_ids:
                products_result = supabase.table("products").select("product_id, brand, name, size").in_("product_id", product_ids).execute()
                products_dict = {p["product_id"]: p for p in products_result.data} if products_result.data else {}
            
            # Build boxes list
            for inv_item in inventory_result.data:
                box_id = inv_item["box_id"]
                box_info = boxes_dict.get(box_id, {})
                product = products_dict.get(box_info.get("product_id"), {})
                
                boxes.append({
                    "box_id": box_id,
                    "product_name": f"{product.get('brand', '')} - {product.get('name', '')}".strip(' -'),
                    "size": product.get("size"),
                    "lot_code": box_info.get("lot_code"),
                    "last_moved_at": inv_item.get("last_event_time")
                })
        
        return {
            "location_id": str(location_id),
            "location_code": location["location_code"],
            "active_box_count": active_box_count,
            "boxes": boxes
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
