#!/bin/bash

echo "🛑 Stopping Inventory System servers..."
echo ""

# Stop backend
if [ -f /tmp/inventory-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/inventory-backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    else
        echo "⚠️  Backend already stopped"
    fi
    rm -f /tmp/inventory-backend.pid
else
    echo "⚠️  Backend PID file not found"
fi

# Stop frontend
if [ -f /tmp/inventory-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/inventory-frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo "⚠️  Frontend already stopped"
    fi
    rm -f /tmp/inventory-frontend.pid
else
    echo "⚠️  Frontend PID file not found"
fi

# Also try to kill by process name (backup method)
pkill -f "uvicorn.*app.main:app" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo ""
echo "✅ All servers stopped!"
echo ""
echo "Note: If servers don't stop, run:"
echo "   pkill -f uvicorn"
echo "   pkill -f 'next dev'"
