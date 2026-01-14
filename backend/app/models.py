"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# Product Models
class ProductCreate(BaseModel):
    brand: str
    name: str
    size: Optional[str] = None


class ProductResponse(BaseModel):
    product_id: UUID
    brand: str
    name: str
    size: Optional[str] = None
    created_at: datetime


# Box Models
class BoxCreate(BaseModel):
    product_id: UUID
    lot_code: Optional[str] = None


class BoxResponse(BaseModel):
    box_id: str
    qr_value: str
    product: dict
    lot_code: Optional[str] = None


# Event Models
class EventCreate(BaseModel):
    client_event_id: UUID
    event_type: str = Field(..., pattern="^(IN|OUT|MOVE)$")
    box_id: str
    location_code: Optional[str] = None
    mode: str = Field(..., pattern="^(INBOUND|OUTBOUND|MOVE)$")
    source_type: str = Field(default="PHONE", pattern="^(PHONE|INBOUND_STATION|OUTBOUND_STATION|API)$")
    source_id: Optional[str] = None


class EventResponse(BaseModel):
    event_id: UUID
    success: bool
    message: str
    warning: Optional[str] = None
    exception_type: Optional[str] = None
    is_duplicate: bool = False
    changed: Optional[bool] = True  # True if location/status changed, False if already at location
    box_id: str
    product: dict
    lot_code: Optional[str] = None


# Location Models
class LocationCreate(BaseModel):
    zone: str
    aisle: str
    rack: str
    shelf: str


class LocationResponse(BaseModel):
    location_id: UUID
    location_code: str
    zone: str
    aisle: str
    rack: str
    shelf: str
    is_system_location: bool
    created_at: datetime


# Inventory Models
class InventoryItem(BaseModel):
    box_id: str
    status: str
    current_location: Optional[dict] = None
    last_event_time: Optional[datetime] = None
    product: dict
    lot_code: Optional[str] = None


# Box Details Models
class BoxDetailsResponse(BaseModel):
    box_id: str
    product: dict
    lot_code: Optional[str] = None
    status: str
    current_location: Optional[dict] = None
    events: list
