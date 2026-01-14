"""Exceptions router."""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import supabase

router = APIRouter(prefix="/exceptions", tags=["exceptions"])


@router.get("")
async def get_exceptions(exception_type: Optional[str] = None, limit: int = 100):
    """Get events with exceptions/warnings."""
    try:
        query = supabase.table("events").select("*").not_.is_("exception_type", "null")
        
        if exception_type:
            query = query.eq("exception_type", exception_type)
        
        query = query.order("timestamp", desc=True).limit(limit)
        
        result = query.execute()
        
        exceptions = []
        for event in result.data:
            # Get box and product
            box_result = supabase.table("boxes").select("*").eq("box_id", event["box_id"]).execute()
            product = None
            
            if box_result.data:
                box_data = box_result.data[0]
                product_result = supabase.table("products").select("*").eq("product_id", box_data["product_id"]).execute()
                if product_result.data:
                    product = product_result.data[0]
            
            exceptions.append({
                "event_id": event["event_id"],
                "timestamp": event["timestamp"],
                "box_id": event["box_id"],
                "event_type": event["event_type"],
                "exception_type": event["exception_type"],
                "warning": event.get("warning"),
                "product": {
                    "brand": product["brand"],
                    "name": product["name"],
                    "size": product.get("size")
                } if product else None
            })
        
        return exceptions
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
