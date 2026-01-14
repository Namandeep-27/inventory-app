"""Business rules engine (T1, T2, T3)."""
from typing import Optional, Tuple
from app.database import supabase


def validate_mode_event_type(mode: str, event_type: str) -> bool:
    """Rule T1: Validate mode matches event_type."""
    if mode == "INBOUND" and event_type != "IN":
        return False
    if mode == "OUTBOUND" and event_type != "OUT":
        return False
    if mode == "MOVE" and event_type != "MOVE":
        return False
    return True


def validate_move_requires_location(event_type: str, location_code: Optional[str]) -> bool:
    """Rule T2: MOVE requires location_code."""
    if event_type == "MOVE" and not location_code:
        return False
    return True


def get_box_inventory_status(box_id: str) -> Optional[str]:
    """Get current inventory status for a box."""
    result = supabase.table("inventory_state").select("status").eq("box_id", box_id).execute()
    if result.data:
        return result.data[0]["status"]
    return None


def check_box_has_in_event(box_id: str) -> bool:
    """Check if box has any IN event in history."""
    result = supabase.table("events").select("event_id").eq("box_id", box_id).eq("event_type", "IN").limit(1).execute()
    return len(result.data) > 0


def get_receiving_location_id() -> Optional[str]:
    """Get RECEIVING location_id."""
    result = supabase.table("locations").select("location_id").eq("location_code", "RECEIVING").limit(1).execute()
    if result.data:
        return result.data[0]["location_id"]
    return None


def validate_rules(mode: str, event_type: str, box_id: str, location_code: Optional[str]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate all business rules (T1, T2, T3).
    Returns: (is_valid, error_message, exception_type)
    """
    # T1: Mode matches event_type
    if not validate_mode_event_type(mode, event_type):
        return False, "Mode does not match event type", None
    
    # T2: MOVE requires location_code
    if not validate_move_requires_location(event_type, location_code):
        return False, "MOVE event requires location_code", None
    
    # T3: MOVE only if IN_STOCK
    if event_type == "MOVE":
        status = get_box_inventory_status(box_id)
        if status == "OUT_OF_WAREHOUSE":
            return False, "Cannot move box that is out of warehouse. Please receive box first (INBOUND mode).", "MOVE_WHEN_OUT"
    
    # T3: OUT without IN warning
    if event_type == "OUT":
        has_in = check_box_has_in_event(box_id)
        if not has_in:
            return True, None, "OUT_WITHOUT_IN"
    
    return True, None, None
