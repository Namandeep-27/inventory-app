"""Products router."""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models import ProductCreate, ProductResponse
from app.database import supabase
from uuid import UUID

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    """Create a new product."""
    try:
        result = supabase.table("products").insert({
            "brand": product.brand,
            "name": product.name,
            "size": product.size
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create product")
        
        return ProductResponse(**result.data[0])
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[ProductResponse])
async def get_products():
    """Get all products."""
    try:
        result = supabase.table("products").select("*").order("brand", desc=False).order("name", desc=False).execute()
        return [ProductResponse(**item) for item in result.data]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
