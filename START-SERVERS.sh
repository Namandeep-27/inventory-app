#!/bin/bash
echo "🚀 Starting Phone Inventory System..."
echo ""

# Kill existing processes
pkill -f uvicorn 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start Backend
echo "📦 Starting Backend..."
cd /Users/namandeepsinghnayyar/project/backend
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

# Check .env exists
if [ ! -f .env ] || grep -q "your_supabase" .env; then
    echo "⚠️  WARNING: Please edit backend/.env with your Supabase credentials"
    echo "   SUPABASE_URL=your_url"
    echo "   SUPABASE_ANON_KEY=your_key"
fi

# Start backend in background, detached from terminal
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/inventory-backend.pid
echo "   Backend PID: $BACKEND_PID"
echo "   URL: http://localhost:8000"

# Start Frontend  
echo ""
echo "📦 Starting Frontend..."
cd /Users/namandeepsinghnayyar/project/frontend

# Clean install (only if node_modules doesn't exist)
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /tmp/frontend-install.log 2>&1
fi

if [ $? -eq 0 ] || [ -d "node_modules" ]; then
    # Start frontend in background, detached from terminal
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/inventory-frontend.pid
    echo "   Frontend PID: $FRONTEND_PID"
    echo "   URL: http://localhost:3000"
else
    echo "   ❌ Frontend install failed. Check /tmp/frontend-install.log"
fi

echo ""
echo "✅ Servers starting..."
sleep 3

# Check if servers are actually running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
else
    echo "⏳ Backend still starting..."
fi

echo ""
echo "🌐 Opening browser in 2 seconds..."
sleep 2
open http://localhost:3000

echo ""
echo "=========================================="
echo "   ✅ INVENTORY SYSTEM IS RUNNING!"
echo "=========================================="
echo ""
echo "📍 Your app is now available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "💡 Tips:"
echo "   • Keep this terminal window open while using the app"
echo "   • Press Ctrl+C or close this window to stop servers"
echo "   • View logs: tail -f /tmp/backend.log or /tmp/frontend.log"
echo ""
echo "💡 You can now:"
echo "   • Minimize this Terminal window (servers keep running)"
echo "   • Hide this Terminal window (servers keep running)"
echo "   • Close this Terminal window (servers keep running)"
echo ""
echo "To stop servers later, run:"
echo "   ./STOP-SERVERS.sh"
echo "   OR: pkill -f uvicorn && pkill -f 'next dev'"
echo ""
echo "Press Enter to close this window (servers will keep running)..."
read
