#!/bin/bash

# Create a simpler, more reliable launcher that definitely works

APP_PATH="$HOME/Desktop/Inventory App.app"
PROJECT_DIR="/Users/namandeepsinghnayyar/project"

# Remove old app
rm -rf "$APP_PATH"

# Create app structure
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Create a very simple AppleScript that just opens Terminal with a command
cat > "$APP_PATH/Contents/MacOS/Inventory App" << 'APPLESCRIPT'
#!/usr/bin/osascript

on run
    set projectDir to "/Users/namandeepsinghnayyar/project"
    
    tell application "Terminal"
        activate
        set newWindow to do script "cd '" & projectDir & "' && ./START-SERVERS.sh || (cd backend && source venv/bin/activate && uvicorn app.main:app --port 8000 > /tmp/backend.log 2>&1 & cd ../frontend && npm run dev > /tmp/frontend.log 2>&1 & sleep 5 && open http://localhost:3000 && echo 'Servers started! Close this window to stop.' && wait)"
    end tell
end run
APPLESCRIPT

chmod +x "$APP_PATH/Contents/MacOS/Inventory App"

# Copy icon
if [ -f "$PROJECT_DIR/icon-assets/app-icon.icns" ]; then
    cp "$PROJECT_DIR/icon-assets/app-icon.icns" "$APP_PATH/Contents/Resources/app-icon.icns"
fi

# Create Info.plist
cat > "$APP_PATH/Contents/Info.plist" << 'PLIST'
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
</dict>
</plist>
PLIST

# Remove quarantine
xattr -cr "$APP_PATH" 2>/dev/null

echo "✅ Simple launcher app created at: $APP_PATH"
echo ""
echo "This version:"
echo "  - Uses simpler AppleScript"
echo "  - Opens Terminal directly"
echo "  - Runs START-SERVERS.sh if available"
echo "  - Otherwise starts servers manually"
echo ""
echo "Try double-clicking it now!"
