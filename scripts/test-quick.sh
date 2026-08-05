#!/bin/bash
# ============================================================================
# PRD Chamber Quick Test Script
# Brain: VPS Zermes — trigger tests via SSH
# Production: VPS Web Chamber — execute tests
# ============================================================================

set -e

WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[PRD Chamber] Quick Test${NC}"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$WEB_CHAMBER_USER@$WEB_CHAMBER_HOST" << 'ENDSSH'
set -e
cd /home/prdchamber/prd-chamber

echo "Checking services..."
curl -s --max-time 3 http://localhost:3000/api/health || { echo "Backend down!"; exit 1; }
curl -s --max-time 3 http://localhost:4173 | head -c 50 || { echo "Frontend down!"; exit 1; }

echo "Running tests..."
npx playwright test --reporter=list 2>&1 | tail -20
ENDSSH

echo -e "${GREEN}[Done]${NC}"
