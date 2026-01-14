#!/bin/bash

echo "Refreshing app icon cache..."

APP_PATH="$HOME/Desktop/Inventory App.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ App not found at: $APP_PATH"
    exit 1
fi

# Touch the app to trigger icon refresh
touch "$APP_PATH"

# Remove icon cache for this app
/usr/bin/touch "$APP_PATH"

# Force Finder to refresh
killall Finder 2>/dev/null || true

echo "✅ Icon cache refreshed!"
echo ""
echo "The icon should now be visible on your Desktop."
echo "If not, try:"
echo "  1. Right-click the app → Get Info"
echo "  2. Click the icon at the top"
echo "  3. Drag the icon from icon-assets/app-icon-512.png onto it"
