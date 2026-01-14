#!/bin/bash

echo "=========================================="
echo "   DATABASE SETUP HELPER"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "This script will help you set up your Supabase database."
echo ""
echo "Prerequisites:"
echo "  1. ✅ Supabase account (free tier works)"
echo "  2. ✅ Supabase project created"
echo "  3. ✅ Backend .env file configured with credentials"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found!${NC}"
    echo ""
    echo "Please create backend/.env with:"
    echo "  SUPABASE_URL=https://your-project.supabase.co"
    echo "  SUPABASE_ANON_KEY=your-anon-key-here"
    echo ""
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "backend/supabase/migrations" ]; then
    echo -e "${RED}❌ Error: Migration files not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration files found${NC}"
echo ""

echo "=========================================="
echo "   STEP 1: Open Migration Files"
echo "=========================================="
echo ""
echo "Migration files to run:"
echo -e "  ${BLUE}1.${NC} backend/supabase/migrations/001_initial_schema.sql"
echo -e "  ${BLUE}2.${NC} backend/supabase/migrations/002_seed_receiving_location.sql"
echo ""

# Check if files exist
MIGRATION_1="backend/supabase/migrations/001_initial_schema.sql"
MIGRATION_2="backend/supabase/migrations/002_seed_receiving_location.sql"

if [ ! -f "$MIGRATION_1" ]; then
    echo -e "${RED}❌ $MIGRATION_1 not found!${NC}"
    exit 1
fi

if [ ! -f "$MIGRATION_2" ]; then
    echo -e "${RED}❌ $MIGRATION_2 not found!${NC}"
    exit 1
fi

echo "=========================================="
echo "   STEP 2: Instructions"
echo "=========================================="
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in the left sidebar"
echo "4. Click 'New query' button"
echo "5. Copy the contents of: ${BLUE}$MIGRATION_1${NC}"
echo "6. Paste into SQL Editor and click 'Run'"
echo "7. Wait for 'Success' message"
echo ""
echo -e "${YELLOW}Press Enter to open the first migration file...${NC}"
read

# Open migration file in default editor
if command -v code &> /dev/null; then
    code "$MIGRATION_1"
elif command -v nano &> /dev/null; then
    nano "$MIGRATION_1"
elif command -v vim &> /dev/null; then
    vim "$MIGRATION_1"
else
    cat "$MIGRATION_1"
fi

echo ""
echo -e "${YELLOW}After running migration 1, press Enter to see migration 2...${NC}"
read

# Show second migration
echo ""
echo "Now run the second migration:"
echo "1. In Supabase SQL Editor, click 'New query' again"
echo "2. Copy the contents of: ${BLUE}$MIGRATION_2${NC}"
echo "3. Paste and run"
echo ""
echo -e "${YELLOW}Press Enter to open the second migration file...${NC}"
read

if command -v code &> /dev/null; then
    code "$MIGRATION_2"
elif command -v nano &> /dev/null; then
    nano "$MIGRATION_2"
elif command -v vim &> /dev/null; then
    vim "$MIGRATION_2"
else
    cat "$MIGRATION_2"
fi

echo ""
echo "=========================================="
echo "   STEP 3: Verify Setup"
echo "=========================================="
echo ""
echo -e "${YELLOW}After running both migrations, press Enter to verify...${NC}"
read

echo "Testing database connection..."
echo ""

# Test database connection
DB_TEST=$(curl -s http://localhost:8000/products 2>&1)

if echo "$DB_TEST" | grep -q "Could not find the table"; then
    echo -e "${RED}❌ Tables still not found!${NC}"
    echo ""
    echo "Please check:"
    echo "  1. Both migrations ran successfully in Supabase"
    echo "  2. You're using the correct Supabase project"
    echo "  3. Backend .env has correct credentials"
    echo "  4. Backend server is running"
    exit 1
elif echo "$DB_TEST" | grep -q "PGRST\|connection\|error"; then
    echo -e "${RED}❌ Database connection error${NC}"
    echo "Response: $DB_TEST"
    echo ""
    echo "Check your backend/.env file has correct Supabase credentials"
    exit 1
else
    echo -e "${GREEN}✅ Database is set up correctly!${NC}"
    echo "Response: ${DB_TEST:0:200}..."
    echo ""
    echo "=========================================="
    echo -e "   ${GREEN}✅ DATABASE READY!${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Create products: http://localhost:3000/products"
    echo "  2. Create locations: http://localhost:3000/locations"
    echo "  3. Start scanning: http://localhost:3000/scan"
    echo ""
fi
