#!/bin/bash
# Start backend server

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -d "venv/lib" ] || [ "$(pip list | grep fastapi)" = "" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "SUPABASE_URL=your_supabase_url" > .env
        echo "SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
    fi
    echo "⚠️  Please edit backend/.env with your Supabase credentials"
fi

# Start server
echo "Starting backend server on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
