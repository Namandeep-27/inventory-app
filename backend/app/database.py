"""Supabase database connection."""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# Supabase connection
supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
supabase_key: Optional[str] = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

supabase: Client = create_client(supabase_url, supabase_key)
