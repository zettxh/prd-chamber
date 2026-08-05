#!/bin/bash
# ============================================================================
# PRD Chamber Deploy Script
# Brain: VPS Zermes (43.163.93.190) — git push only
# Production: VPS Web Chamber (43.133.35.217) — build + run + test
# ============================================================================

set -e

# --- Config ---
WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"
PROJECT_DIR="/home/prdchamber/prd-chamber"
BRANCH="master"
DRY_RUN=false

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Parse Args ---
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--dry-run] [--branch BRANCH]"
            exit 1
            ;;
    esac
done

# --- Functions ---
log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        warn "[DRY RUN] $1"
    else
        log "$1"
        eval "$1"
    fi
}

# ============================================================================
# STEP 0: Pre-flight Checks
# ============================================================================
log "=== PRD Chamber Deploy ==="
log "Brain: VPS Zermes | Production: VPS Web Chamber ($WEB_CHAMBER_HOST)"

# Check SSH key
if [ ! -f "${SSH_KEY/#\~/$HOME}" ]; then
    error "SSH key not found: $SSH_KEY"
    exit 1
fi

# ============================================================================
# STEP 1: Git Push from Zermes (Brain)
# ============================================================================
log "=== Step 1: Git Push (VPS Zermes) ==="

# Check uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log "Uncommitted changes:"
    git status --short
    read -p "Commit? [Y/n] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        read -p "Commit message: " MSG
        MSG=${MSG:-"chore: deploy $(date '+%Y-%m-%d %H:%M')"}
        run_cmd "git add -A && git commit -m '$MSG'"
    fi
fi

# Push to GitHub
run_cmd "git push origin $BRANCH"
success "Pushed to GitHub"

# ============================================================================
# STEP 2: Deploy to VPS Web Chamber (Production)
# ============================================================================
log "=== Step 2: Build & Deploy (VPS Web Chamber) ==="

SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $WEB_CHAMBER_USER@$WEB_CHAMBER_HOST"

# Pull latest from GitHub
run_cmd "$SSH_CMD 'cd $PROJECT_DIR && git pull origin $BRANCH'"

# Clean build (MANDATORY — vite cache staleness)
log "Building on Web Chamber..."
run_cmd "$SSH_CMD 'cd $PROJECT_DIR && rm -rf dist && npm run build'"

BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
    error "Build failed on Web Chamber!"
    exit 1
fi
success "Build successful"

# ============================================================================
# STEP 3: Restart Services (Web Chamber)
# ============================================================================
log "=== Step 3: Restart Services ==="

# Kill stale processes
run_cmd "$SSH_CMD 'pkill -f \"vite preview\" 2>/dev/null || true'"
run_cmd "$SSH_CMD 'pkill -f \"node.*dist/index\" 2>/dev/null || true'"
run_cmd "$SSH_CMD 'fuser -k 4173/tcp 2>/dev/null || true'"
run_cmd "$SSH_CMD 'fuser -k 3000/tcp 2>/dev/null || true'"
sleep 2

# Restart backend
log "Restarting backend..."
run_cmd "$SSH_CMD 'cd $PROJECT_DIR/server && nohup node dist/index.js > /tmp/backend.log 2>&1 &'"
sleep 2

# Restart frontend
log "Restarting frontend..."
run_cmd "$SSH_CMD 'cd $PROJECT_DIR && nohup node_modules/.bin/vite preview --host 0.0.0.0 --port 4173 > /tmp/frontend.log 2>&1 &'"
sleep 3

success "Services restarted"

# ============================================================================
# STEP 4: Health Check
# ============================================================================
log "=== Step 4: Health Check ==="

# Backend
BACKEND=$($SSH_CMD 'curl -s --max-time 5 http://localhost:3000/api/health' 2>/dev/null || echo "FAILED")
if [[ "$BACKEND" == *"ok"* ]] || [[ "$BACKEND" == *"healthy"* ]]; then
    success "Backend: $BACKEND"
else
    warn "Backend: $BACKEND"
fi

# Frontend
FRONTEND=$($SSH_CMD 'curl -s --max-time 5 http://localhost:4173 | head -c 50' 2>/dev/null || echo "FAILED")
if [[ "$FRONTEND" == *"<"* ]]; then
    success "Frontend: Responding"
else
    warn "Frontend: $FRONTEND"
fi

# Get build hash
BUILD_HASH=$($SSH_CMD 'curl -s http://localhost:4173 | grep -o "index-[a-zA-Z0-9_]*\.js" | head -1' 2>/dev/null || echo "unknown")
success "Build: $BUILD_HASH"

# ============================================================================
# DONE
# ============================================================================
echo ""
success "=== Deploy Complete ==="
log "URL: http://$WEB_CHAMBER_HOST:4173"
log "Backend logs: ssh $WEB_CHAMBER_USER@$WEB_CHAMBER_HOST 'tail /tmp/backend.log'"
log "Frontend logs: ssh $WEB_CHAMBER_USER@$WEB_CHAMBER_HOST 'tail /tmp/frontend.log'"
