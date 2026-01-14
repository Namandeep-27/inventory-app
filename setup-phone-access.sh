#!/bin/bash

# Script to configure the app for phone access on local WiFi

echo "=========================================="
echo "   Setting up Phone Access"
echo "=========================================="
echo ""

# Get Mac's IP address
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$MAC_IP" ]; then
    echo "❌ Could not find your Mac's IP address"
    echo "   Please check your network connection"
    exit 1
fi

echo "📱 Your Mac's IP address: $MAC_IP"
echo ""

# Update frontend .env.local
FRONTEND_ENV="frontend/.env.local"
echo "Updating frontend configuration..."

# Create or update .env.local
cat > "$FRONTEND_ENV" << EOF
NEXT_PUBLIC_API_URL=http://${MAC_IP}:8000
EOF

echo "✅ Updated $FRONTEND_ENV"
echo "   API URL: http://${MAC_IP}:8000"
echo ""

echo "=========================================="
echo "   Next Steps:"
echo "=========================================="
echo ""
echo "1. Make sure both servers are running:"
echo "   Terminal 1: ./start-backend.sh"
echo "   Terminal 2: ./start-frontend.sh"
echo ""
echo "2. On your phone, open:"
echo "   http://${MAC_IP}:3000"
echo ""
echo "3. The app should now load with data!"
echo ""
echo "⚠️  Note: If your Mac's IP changes, run this script again"
echo ""
