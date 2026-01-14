#!/bin/bash

APP_PATH="$HOME/Desktop/Inventory App.app"

echo "Fixing app responsiveness..."

# Remove quarantine if present
xattr -cr "$APP_PATH" 2>/dev/null
echo "✅ Removed quarantine attributes"

# Make sure it's executable
chmod +x "$APP_PATH/Contents/MacOS/Inventory App"
chmod +x "$APP_PATH/Contents/Resources/launcher.sh"
echo "✅ Set executable permissions"

# Touch to refresh
touch "$APP_PATH"
echo "✅ Refreshed app"

echo ""
echo "✅ App fixed! Try double-clicking it now."
echo ""
echo "If it still says 'not responding':"
echo "  1. Right-click the app → Get Info"
echo "  2. Uncheck 'Open using Rosetta' (if checked)"
echo "  3. Close Get Info window"
echo "  4. Try double-clicking again"
