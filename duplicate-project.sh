#!/bin/bash

# Script to duplicate your project for experimentation

PROJECT_DIR="/Users/namandeepsinghnayyar/project"
PARENT_DIR="/Users/namandeepsinghnayyar"

echo "=========================================="
echo "   Project Duplication Tool"
echo "=========================================="
echo ""

# Ask for new project name
echo "What would you like to name the new project?"
echo "Examples: project-v2, project-experimental, inventory-v2"
read -p "New project name [project-v2]: " NEW_PROJECT_NAME
NEW_PROJECT_NAME=${NEW_PROJECT_NAME:-project-v2}

NEW_PROJECT_PATH="$PARENT_DIR/$NEW_PROJECT_NAME"

# Check if name already exists
if [ -d "$NEW_PROJECT_PATH" ]; then
    echo ""
    echo "❌ Error: '$NEW_PROJECT_NAME' already exists!"
    echo "Please choose a different name."
    exit 1
fi

echo ""
echo "Creating copy of project..."
echo "From: $PROJECT_DIR"
echo "To:   $NEW_PROJECT_PATH"
echo ""

# Create the copy
echo "📦 Copying project files..."
rsync -av --progress \
    --exclude='venv' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='icon-assets/AppIcon.iconset' \
    "$PROJECT_DIR/" "$NEW_PROJECT_PATH/" 2>&1 | tail -20

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error copying files. Using alternative method..."
    cp -R "$PROJECT_DIR" "$NEW_PROJECT_PATH"
    
    # Remove heavy folders
    rm -rf "$NEW_PROJECT_PATH/backend/venv"
    rm -rf "$NEW_PROJECT_PATH/frontend/node_modules"
    rm -rf "$NEW_PROJECT_PATH/frontend/.next"
    rm -rf "$NEW_PROJECT_PATH/**/__pycache__"
    find "$NEW_PROJECT_PATH" -name "*.pyc" -delete
    find "$NEW_PROJECT_PATH" -name ".DS_Store" -delete
fi

echo ""
echo "✅ Project files copied!"
echo ""

# Create new virtual environment
echo "🔧 Setting up new backend environment..."
cd "$NEW_PROJECT_PATH/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend environment created"

# Install frontend dependencies
echo "🔧 Setting up new frontend environment..."
cd "$NEW_PROJECT_PATH/frontend"
npm install > /dev/null 2>&1
echo "✅ Frontend dependencies installed"

# Update .env file to point to new project name (optional)
if [ -f "$NEW_PROJECT_PATH/backend/.env" ]; then
    echo ""
    echo "⚠️  Note: Check backend/.env for any project-specific settings"
fi

echo ""
echo "=========================================="
echo "   ✅ Project Duplicated Successfully!"
echo "=========================================="
echo ""
echo "📁 New Project Location:"
echo "   $NEW_PROJECT_PATH"
echo ""
echo "🚀 To use the new project:"
echo "   cd $NEW_PROJECT_PATH"
echo "   ./START-SERVERS.sh"
echo ""
echo "💡 Tips:"
echo "   • Original project: $PROJECT_DIR"
echo "   • New project:      $NEW_PROJECT_PATH"
echo "   • Both projects can run independently"
echo "   • Use different ports if running both at once"
echo ""
echo "🔗 Open in Cursor:"
echo "   cursor $NEW_PROJECT_PATH"
echo ""
