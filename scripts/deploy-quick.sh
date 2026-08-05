#!/bin/bash
# ============================================================================
# PRD Chamber Quick Deploy Script
# Minimal prompts, fast iteration
# Target: VPS Web Chamber (43.133.35.217)
# ============================================================================

set -e

WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"
PROJECT_DIR="/home/prdchamber/prd-chamber"

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[PRD Chamber] Quick Deploy${NC}"

# 1. Local build
echo "Building..."
cd ~/prd-chamber
rm -rf dist && npm run build

# 2. Push
echo "Pushing..."
git add -A && git commit -m "chore: quick deploy $(date '+%H:%M')" && git push origin master

# 3. Deploy to VPS
echo "Deploying to $WEB_CHAMBER_HOST..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$WEB_CHAMBER_USER@$WEB_CHAMBER_HOST" << 'ENDSSH'
cd /home/prdchamber/prd-chamber
git pull origin master
rm -rf dist && npm run build
pkill -f "vite preview" 2>/dev/null || true
pkill -f "node.*dist/index" 2>/dev/null || true
fuser -k 4173/tcp 2>/dev/null || true
sleep 2
cd server && nohup node dist/index.js > /tmp/backend.log 2>&1 &
cd ..
nohup node_modules/.bin/vite preview --host 0.0.0.0 --port 4173 > /tmp/frontend.log 2>&1 &
sleep 3
echo "Backend: $(curl -s --max-time 3 http://localhost:3000/api/health)"
ENDSSH

echo -e "${GREEN}[Done]${NC} http://$WEB_CHAMBER_HOST:4173"
