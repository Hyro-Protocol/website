#!/bin/bash

# Build and restart script for hyr0.xyz
# Rebuilds Next.js application and restarts PM2 service

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Building and Restarting Application ===${NC}"
echo ""

# Navigate to project directory
cd /root/hyro/website

# Add Bun to PATH
export PATH="$HOME/.bun/bin:$PATH"

# Build the application
echo -e "${YELLOW}Building Next.js application...${NC}"
bun install
bun run build

# Restart PM2 service
echo -e "${YELLOW}Restarting PM2 service...${NC}"
pm2 restart hyro-website

# Show status
echo ""
echo -e "${GREEN}=== Build and Restart Complete ===${NC}"
echo ""
pm2 status
echo ""
echo -e "View logs with: ${YELLOW}pm2 logs hyro-website${NC}"
echo ""



