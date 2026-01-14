#!/bin/bash

# Create a cartoon-style icon for the inventory app
# This creates an SVG icon with boxes and shelves

echo "Creating app icon..."

# Create Resources directory if it doesn't exist
mkdir -p icon-assets

# Create SVG icon with boxes and shelf
cat > icon-assets/app-icon.svg << 'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#4A90E2" rx="100"/>
  
  <!-- Shelf -->
  <rect x="80" y="300" width="350" height="20" fill="#8B6914" rx="5"/>
  <rect x="80" y="380" width="350" height="20" fill="#8B6914" rx="5"/>
  
  <!-- Shelf supports -->
  <rect x="70" y="300" width="15" height="100" fill="#6B5510"/>
  <rect x="420" y="300" width="15" height="100" fill="#6B5510"/>
  
  <!-- Box 1 - Blue -->
  <rect x="100" y="220" width="90" height="75" fill="#5B9BD5" rx="8" stroke="#4A7A9A" stroke-width="3"/>
  <rect x="105" y="230" width="80" height="8" fill="#4A7A9A" rx="3"/>
  <circle cx="125" cy="265" r="5" fill="#4A7A9A"/>
  <circle cx="165" cy="265" r="5" fill="#4A7A9A"/>
  
  <!-- Box 2 - Green -->
  <rect x="210" y="240" width="90" height="75" fill="#70AD47" rx="8" stroke="#5B8A3A" stroke-width="3"/>
  <rect x="215" y="250" width="80" height="8" fill="#5B8A3A" rx="3"/>
  <line x1="230" y1="280" x2="280" y2="280" stroke="#5B8A3A" stroke-width="2"/>
  
  <!-- Box 3 - Orange -->
  <rect x="320" y="200" width="90" height="75" fill="#FFC000" rx="8" stroke="#CC9900" stroke-width="3"/>
  <rect x="325" y="210" width="80" height="8" fill="#CC9900" rx="3"/>
  <rect x="340" y="245" width="20" height="20" fill="#CC9900" rx="3"/>
  
  <!-- Bottom box - Red -->
  <rect x="100" y="320" width="100" height="60" fill="#E74C3C" rx="8" stroke="#C0392B" stroke-width="3"/>
  <rect x="105" y="330" width="90" height="6" fill="#C0392B" rx="2"/>
  <circle cx="140" cy="355" r="6" fill="#C0392B"/>
  
  <!-- Bottom box 2 - Purple -->
  <rect x="220" y="320" width="100" height="60" fill="#9B59B6" rx="8" stroke="#7D3C98" stroke-width="3"/>
  <rect x="225" y="330" width="90" height="6" fill="#7D3C98" rx="2"/>
  <path d="M 245 355 L 260 340 L 275 355 L 260 370 Z" fill="#7D3C98"/>
  
  <!-- QR Code symbol on one box -->
  <g transform="translate(320, 330)">
    <rect x="0" y="0" width="30" height="30" fill="white" rx="2"/>
    <rect x="2" y="2" width="8" height="8" fill="black"/>
    <rect x="20" y="2" width="8" height="8" fill="black"/>
    <rect x="2" y="20" width="8" height="8" fill="black"/>
    <rect x="12" y="12" width="6" height="6" fill="black"/>
    <rect x="20" y="20" width="6" height="6" fill="black"/>
  </g>
  
  <!-- Decorative stars -->
  <text x="400" y="150" font-family="Arial" font-size="40" fill="#FFD700" opacity="0.8">⭐</text>
  <text x="120" y="150" font-family="Arial" font-size="30" fill="#FFD700" opacity="0.8">✨</text>
</svg>
EOF

echo "✅ SVG icon created: icon-assets/app-icon.svg"

# Check if ImageMagick or sips is available for conversion
if command -v convert &> /dev/null; then
    echo "Converting to PNG using ImageMagick..."
    convert -background none -resize 512x512 icon-assets/app-icon.svg icon-assets/app-icon-512.png
    convert -background none -resize 256x256 icon-assets/app-icon.svg icon-assets/app-icon-256.png
    convert -background none -resize 128x128 icon-assets/app-icon.svg icon-assets/app-icon-128.png
    convert -background none -resize 64x64 icon-assets/app-icon.svg icon-assets/app-icon-64.png
    convert -background none -resize 32x32 icon-assets/app-icon.svg icon-assets/app-icon-32.png
    convert -background none -resize 16x16 icon-assets/app-icon.svg icon-assets/app-icon-16.png
    echo "✅ PNG icons created"
elif command -v sips &> /dev/null; then
    # Convert SVG to PNG using rsvg-convert or qlmanage (macOS)
    if command -v qlmanage &> /dev/null; then
        echo "Converting SVG to PNG using qlmanage..."
        qlmanage -t -s 512 -o icon-assets/ icon-assets/app-icon.svg 2>/dev/null
        mv icon-assets/app-icon.svg.png icon-assets/app-icon-512.png 2>/dev/null || true
        echo "✅ PNG icon created (512x512)"
        echo "Note: For best results, install ImageMagick: brew install imagemagick"
    fi
else
    echo "⚠️  ImageMagick or sips not found. Creating PNG manually..."
    echo "You can:"
    echo "  1. Install ImageMagick: brew install imagemagick"
    echo "  2. Or open icon-assets/app-icon.svg in a browser and save as PNG"
fi

# Create icon.icns if we have PNGs
if [ -f "icon-assets/app-icon-512.png" ] || [ -f "icon-assets/app-icon-256.png" ]; then
    echo ""
    echo "Creating .icns file for macOS..."
    
    # Create iconset directory
    mkdir -p icon-assets/AppIcon.iconset
    
    # Copy/create different sizes for iconset
    if [ -f "icon-assets/app-icon-512.png" ]; then
        cp icon-assets/app-icon-512.png icon-assets/AppIcon.iconset/icon_512x512.png 2>/dev/null || true
        cp icon-assets/app-icon-512.png icon-assets/AppIcon.iconset/icon_256x256@2x.png 2>/dev/null || true
    fi
    if [ -f "icon-assets/app-icon-256.png" ]; then
        cp icon-assets/app-icon-256.png icon-assets/AppIcon.iconset/icon_256x256.png 2>/dev/null || true
        cp icon-assets/app-icon-256.png icon-assets/AppIcon.iconset/icon_128x128@2x.png 2>/dev/null || true
    fi
    if [ -f "icon-assets/app-icon-128.png" ]; then
        cp icon-assets/app-icon-128.png icon-assets/AppIcon.iconset/icon_128x128.png 2>/dev/null || true
        cp icon-assets/app-icon-128.png icon-assets/AppIcon.iconset/icon_64x64@2x.png 2>/dev/null || true
    fi
    if [ -f "icon-assets/app-icon-64.png" ]; then
        cp icon-assets/app-icon-64.png icon-assets/AppIcon.iconset/icon_64x64.png 2>/dev/null || true
        cp icon-assets/app-icon-64.png icon-assets/AppIcon.iconset/icon_32x32@2x.png 2>/dev/null || true
    fi
    if [ -f "icon-assets/app-icon-32.png" ]; then
        cp icon-assets/app-icon-32.png icon-assets/AppIcon.iconset/icon_32x32.png 2>/dev/null || true
        cp icon-assets/app-icon-32.png icon-assets/AppIcon.iconset/icon_16x16@2x.png 2>/dev/null || true
    fi
    if [ -f "icon-assets/app-icon-16.png" ]; then
        cp icon-assets/app-icon-16.png icon-assets/AppIcon.iconset/icon_16x16.png 2>/dev/null || true
    fi
    
    # Convert iconset to icns using iconutil (macOS built-in)
    if command -v iconutil &> /dev/null; then
        iconutil -c icns icon-assets/AppIcon.iconset -o icon-assets/app-icon.icns
        echo "✅ .icns file created: icon-assets/app-icon.icns"
    else
        echo "⚠️  iconutil not found. Creating PNG icon instead..."
    fi
fi

echo ""
echo "✅ Icon creation complete!"
echo ""
echo "Files created:"
ls -lh icon-assets/ 2>/dev/null || echo "Check icon-assets/ directory"
echo ""
echo "Next step: Run ./create-desktop-app.sh to update the app with the new icon!"
