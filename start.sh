#!/bin/bash

# Smart City Command Platform - Start Script
# Usage: ./start.sh [--install]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏙️  Smart City Command Platform${NC}"
echo "=================================="

# Check if --install flag is passed
if [[ "$1" == "--install" ]]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm run install:all
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
fi

# Check if node_modules exist
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Missing dependencies. Run with --install flag or run 'npm run install:all'${NC}"
    read -p "Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run install:all
    else
        echo -e "${RED}❌ Cannot start without dependencies${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🚀 Starting development servers...${NC}"
echo -e "${YELLOW}   Server: http://localhost:5000${NC}"
echo -e "${YELLOW}   Client: http://localhost:5173${NC}"
echo ""

# Start both server and client concurrently
npm run dev
