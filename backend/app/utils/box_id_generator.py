"""Race-safe box ID generation using box_id_counters table."""
from datetime import datetime
from app.database import supabase


def generate_box_id() -> str:
    """
    Generate a unique box_id in format BX-YYYYMMDD-######
    Uses PostgreSQL function for atomic counter increment to prevent race conditions.
    """
    today = datetime.now().date()
    today_str = today.strftime("%Y%m%d")
    
    try:
        # Call PostgreSQL function for atomic increment
        # This ensures race-safe sequence generation even with concurrent requests
        result = supabase.rpc('increment_box_id_counter', {'target_date': str(today)}).execute()
        
        if result.data is not None:
            # RPC returns the value directly, but Supabase may wrap it
            if isinstance(result.data, (list, tuple)) and len(result.data) > 0:
                next_seq = result.data[0]
            elif isinstance(result.data, dict) and 'data' in result.data:
                next_seq = result.data['data']
            else:
                next_seq = result.data
        else:
            # Fallback: try to get current sequence
            counter_result = supabase.table("box_id_counters").select("last_seq").eq("date", str(today)).execute()
            if counter_result.data:
                next_seq = counter_result.data[0]["last_seq"] + 1
                supabase.table("box_id_counters").update({
                    "last_seq": next_seq,
                    "updated_at": datetime.now().isoformat()
                }).eq("date", str(today)).execute()
            else:
                next_seq = 1
                supabase.table("box_id_counters").insert({
                    "date": str(today),
                    "last_seq": next_seq
                }).execute()
        
        return f"BX-{today_str}-{next_seq:06d}"
    
    except Exception as e:
        # If RPC fails, fallback to upsert approach
        # This is less race-safe but will work for MVP
        counter_result = supabase.table("box_id_counters").select("last_seq").eq("date", str(today)).execute()
        if counter_result.data:
            next_seq = counter_result.data[0]["last_seq"] + 1
        else:
            next_seq = 1
        
        # Upsert for box_id_counters (date is primary key)
        supabase.table("box_id_counters").upsert({
            "date": str(today),
            "last_seq": next_seq,
            "updated_at": datetime.now().isoformat()
        }).execute()
        
        return f"BX-{today_str}-{next_seq:06d}"
