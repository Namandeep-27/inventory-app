#!/bin/bash

echo "=========================================="
echo "   SYSTEM STATUS CHECK"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Backend Health
echo "1. Backend Server (Port 8000):"
BACKEND_HEALTH=$(curl -s http://localhost:8000/health 2>&1)
if echo "$BACKEND_HEALTH" | grep -q "healthy"; then
    echo -e "   ${GREEN}✅ Running${NC} - $BACKEND_HEALTH"
else
    echo -e "   ${RED}❌ Not responding${NC}"
    echo "   Response: $BACKEND_HEALTH"
fi
echo ""

# Check Frontend
echo "2. Frontend Server (Port 3000):"
FRONTEND_RESPONSE=$(curl -sL -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "307" ] || [ "$FRONTEND_RESPONSE" = "308" ]; then
    echo -e "   ${GREEN}✅ Running${NC} - HTTP $FRONTEND_RESPONSE"
elif [ "$FRONTEND_RESPONSE" = "000" ]; then
    echo -e "   ${YELLOW}⚠️  May be starting...${NC}"
else
    echo -e "   ${RED}❌ Not responding${NC} - HTTP $FRONTEND_RESPONSE"
fi
echo ""

# Check Database Connection
echo "3. Database Connection (Supabase):"
DB_TEST=$(curl -s http://localhost:8000/products 2>&1)
if echo "$DB_TEST" | grep -q "Could not find the table"; then
    echo -e "   ${RED}❌ Tables missing!${NC}"
    echo "   → Run database migrations in Supabase SQL Editor"
    echo "   → Files: backend/supabase/migrations/001_initial_schema.sql"
    echo "   → Files: backend/supabase/migrations/002_seed_receiving_location.sql"
elif echo "$DB_TEST" | grep -q "PGRST\|connection\|error"; then
    echo -e "   ${RED}❌ Connection error${NC}"
    echo "   → Check backend/.env has correct Supabase credentials"
else
    echo -e "   ${GREEN}✅ Connected${NC}"
    echo "   Response: ${DB_TEST:0:100}..."
fi
echo ""

# Check Running Processes
echo "4. Running Processes:"
BACKEND_PROC=$(ps aux | grep -E "uvicorn.*app.main" | grep -v grep | wc -l | tr -d ' ')
FRONTEND_PROC=$(ps aux | grep -E "next dev" | grep -v grep | wc -l | tr -d ' ')

if [ "$BACKEND_PROC" -gt 0 ]; then
    echo -e "   Backend:  ${GREEN}✅ Running${NC} ($BACKEND_PROC process(es))"
else
    echo -e "   Backend:  ${RED}❌ Not running${NC}"
fi

if [ "$FRONTEND_PROC" -gt 0 ]; then
    echo -e "   Frontend: ${GREEN}✅ Running${NC} ($FRONTEND_PROC process(es))"
else
    echo -e "   Frontend: ${RED}❌ Not running${NC}"
fi
echo ""

# Check Environment Files
echo "5. Configuration Files:"
if [ -f "backend/.env" ]; then
    if grep -q "SUPABASE_URL" backend/.env && grep -q "SUPABASE_ANON_KEY" backend/.env; then
        echo -e "   backend/.env: ${GREEN}✅ Present${NC}"
    else
        echo -e "   backend/.env: ${YELLOW}⚠️  Missing Supabase credentials${NC}"
    fi
else
    echo -e "   backend/.env: ${RED}❌ Not found${NC}"
fi

if [ -f "frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.local; then
        echo -e "   frontend/.env.local: ${GREEN}✅ Present${NC}"
    else
        echo -e "   frontend/.env.local: ${YELLOW}⚠️  Missing API URL${NC}"
    fi
else
    echo -e "   frontend/.env.local: ${YELLOW}⚠️  Not found (optional)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "   QUICK ACCESS"
echo "=========================================="
echo "Frontend:    http://localhost:3000"
echo "Backend:     http://localhost:8000"
echo "API Docs:    http://localhost:8000/docs"
echo "Health:      http://localhost:8000/health"
echo ""

# Overall Status
echo "=========================================="
if [ "$BACKEND_PROC" -gt 0 ] && [ "$FRONTEND_PROC" -gt 0 ]; then
    echo -e "Overall: ${GREEN}✅ SERVERS RUNNING${NC}"
    if echo "$DB_TEST" | grep -q "Could not find the table"; then
        echo -e "Action needed: ${YELLOW}⚠️  Run database migrations${NC}"
    else
        echo -e "Status: ${GREEN}✅ Ready to use!${NC}"
    fi
else
    echo -e "Overall: ${RED}❌ SERVERS NOT RUNNING${NC}"
    echo "Run: ./START-SERVERS.sh"
fi
echo "=========================================="
