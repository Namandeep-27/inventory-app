#!/bin/bash

# Create a simple desktop launcher app
# This starts both servers and opens the browser

echo "Creating desktop app launcher..."

# Get the project directory (where this script is located)
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ask user where to create the app
echo ""
echo "Where would you like to create the app?"
echo "1. Desktop (recommended)"
echo "2. Current project folder"
read -p "Enter choice (1 or 2) [1]: " choice
choice=${choice:-1}

if [ "$choice" = "1" ]; then
    APP_LOCATION="$HOME/Desktop/Inventory App.app"
    echo "✅ Will create app on Desktop"
else
    APP_LOCATION="$PROJECT_DIR/Inventory App.app"
    echo "✅ Will create app in project folder"
fi

# Remove old app if exists
if [ -d "$APP_LOCATION" ]; then
    echo "Removing old app..."
    rm -rf "$APP_LOCATION"
fi

# Create app directory
mkdir -p "$APP_LOCATION/Contents/MacOS"
mkdir -p "$APP_LOCATION/Contents/Resources"

# Copy icon if it exists
if [ -f "$PROJECT_DIR/icon-assets/app-icon.icns" ]; then
    cp "$PROJECT_DIR/icon-assets/app-icon.icns" "$APP_LOCATION/Contents/Resources/app-icon.icns"
    echo "✅ Icon added to app"
elif [ -f "$PROJECT_DIR/icon-assets/app-icon-512.png" ]; then
    cp "$PROJECT_DIR/icon-assets/app-icon-512.png" "$APP_LOCATION/Contents/Resources/app-icon.png"
    echo "✅ PNG icon added to app"
else
    echo "⚠️  No icon found. Run ./create-app-icon.sh first to create an icon"
fi

# Create app directory first
mkdir -p "$APP_LOCATION/Contents/MacOS"
mkdir -p "$APP_LOCATION/Contents/Resources"

# Create launcher script - save to Resources
LAUNCHER_SCRIPT="$APP_LOCATION/Contents/Resources/launcher.sh"
LAUNCHER_ABS_PATH="$APP_LOCATION/Contents/Resources/launcher.sh"
cat > "$LAUNCHER_SCRIPT" << EOF
#!/bin/bash

# Project directory (embedded when app was created)
PROJECT_DIR="$PROJECT_DIR"

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo -e "\${GREEN}==========================================\${NC}"
echo -e "\${GREEN}   Starting Inventory System\${NC}"
echo -e "\${GREEN}==========================================\${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "\$PROJECT_DIR/backend" ]; then
    echo -e "\${RED}❌ Error: backend directory not found!\${NC}"
    echo "Expected: \$PROJECT_DIR/backend"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Start backend
echo -e "\${YELLOW}Starting backend server...\${NC}"
cd "\$PROJECT_DIR/backend"

if [ ! -f "venv/bin/activate" ]; then
    echo -e "\${RED}❌ Error: Virtual environment not found!\${NC}"
    echo "Please run: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    read -p "Press Enter to exit..."
    exit 1
fi

source venv/bin/activate
uvicorn app.main:app --port 8000 > /tmp/inventory-backend.log 2>&1 &
BACKEND_PID=\$!

# Wait for backend
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "\${YELLOW}⚠️  Backend may not have started yet... continuing\${NC}"
    sleep 2
fi

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "\${GREEN}✅ Backend started successfully\${NC}"
else
    echo -e "\${YELLOW}⚠️  Backend may still be starting... continuing anyway\${NC}"
fi

# Start frontend
echo -e "\${YELLOW}Starting frontend server...\${NC}"
cd "\$PROJECT_DIR/frontend"

if [ ! -f "package.json" ]; then
    echo -e "\${RED}❌ Error: Frontend not found!\${NC}"
    echo "Expected: \$PROJECT_DIR/frontend"
    kill \$BACKEND_PID 2>/dev/null
    read -p "Press Enter to exit..."
    exit 1
fi

npm run dev > /tmp/inventory-frontend.log 2>&1 &
FRONTEND_PID=\$!

# Wait for frontend
echo "Waiting for frontend to start..."
sleep 5

echo -e "\${GREEN}✅ Frontend started\${NC}"
echo ""
echo -e "\${GREEN}Opening browser...\${NC}"
open http://localhost:3000

echo ""
echo -e "\${GREEN}==========================================\${NC}"
echo -e "\${GREEN}   Inventory System is Running!\${NC}"
echo -e "\${GREEN}==========================================\${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo -e "\${YELLOW}To stop servers:\${NC} Close this window or press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "\${YELLOW}Stopping servers...\${NC}"
    kill \$BACKEND_PID 2>/dev/null
    kill \$FRONTEND_PID 2>/dev/null
    echo -e "\${GREEN}✅ Servers stopped\${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for user interrupt
wait \$BACKEND_PID \$FRONTEND_PID 2>/dev/null || true

read -p "Press Enter to exit..."
EOF

chmod +x "$LAUNCHER_SCRIPT"

# Create AppleScript wrapper that opens Terminal
# Use a simpler, more reliable approach
cat > "$APP_LOCATION/Contents/MacOS/Inventory App" << EOF
#!/usr/bin/osascript

on run
    -- Get absolute paths
    set appPath to POSIX path of (path to me)
    set launcherPath to appPath & "Contents/Resources/launcher.sh"
    set projectDir to "$PROJECT_DIR"
    
    -- Open Terminal with the launcher script
    tell application "Terminal"
        activate
        do script "cd '" & projectDir & "' && bash '" & launcherPath & "'"
    end tell
end run
EOF

# Make executable
chmod +x "$APP_LOCATION/Contents/MacOS/Inventory App"

# Create Info.plist
cat > "$APP_LOCATION/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Inventory App</string>
    <key>CFBundleIdentifier</key>
    <string>com.inventory.app</string>
    <key>CFBundleName</key>
    <string>Inventory System</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>app-icon</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

echo ""
echo "✅ Desktop app created: $APP_LOCATION"
echo ""
echo "To use:"
echo "  1. Double-click 'Inventory App.app'"
echo "  2. It will start both servers and open your browser"
echo "  3. Close the terminal window to stop servers"
echo ""
echo "To share with others:"
if [ "$choice" = "1" ]; then
    echo "  1. Right-click 'Inventory App.app' on Desktop → Compress"
    echo "  2. Send the zip file"
    echo "  3. They extract and double-click the app"
else
    echo "  1. Compress: zip -r Inventory-App.zip 'Inventory App.app'"
    echo "  2. Send the zip file"
    echo "  3. They extract and double-click the app"
fi
echo ""
echo "Note: The app will always find your project folder at:"
echo "      $PROJECT_DIR"
