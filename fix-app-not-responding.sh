#!/bin/bash

APP_PATH="$HOME/Desktop/Inventory App.app"

echo "Fixing 'not responding' issue..."
echo ""

# Step 1: Remove all extended attributes
echo "1. Removing quarantine and security attributes..."
xattr -cr "$APP_PATH" 2>/dev/null

# Step 2: Make absolutely sure it's executable
echo "2. Setting executable permissions..."
chmod +x "$APP_PATH/Contents/MacOS/Inventory App"
chmod +R "$APP_PATH" 2>/dev/null

# Step 3: Touch to refresh
echo "3. Refreshing app..."
touch "$APP_PATH"

# Step 4: Kill any hanging processes
echo "4. Checking for hanging processes..."
pkill -f "Inventory App" 2>/dev/null

echo ""
echo "✅ App fixed!"
echo ""
echo "NOW TRY:"
echo "  1. Right-click 'Inventory App.app' → Get Info"
echo "  2. UNCHECK 'Open using Rosetta' if it's checked"
echo "  3. Close Get Info"
echo "  4. Double-click the app"
echo ""
echo "If it STILL says 'not responding', try:"
echo "  - Control-click (right-click) → Open (to bypass Gatekeeper)"
echo "  - Or open Terminal manually and run:"
echo "    cd ~/Desktop && open 'Inventory App.app'"
