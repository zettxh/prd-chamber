#!/bin/bash
# ============================================================================
# PRD Chamber Deploy Script
# Target: VPS Web Chamber (43.133.35.217)
# Usage: ./scripts/deploy-prd-chamber.sh [--dry-run] [--branch BRANCH]
# ============================================================================

set -e  # Exit on error

# --- Config ---
WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
PROJECT_DIR="/home/prdchamber/prd-chamber"
BRANCH="master"
DRY_RUN=false

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
            echo "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--branch BRANCH]"
            exit 1
            ;;
    esac
done

# --- Functions ---
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

run() {
    if [ "$DRY_RUN" = true ]; then
        warn "[DRY RUN] Would execute: $1"
    else
        log "$1"
        eval "$1"
    fi
}

# --- Pre-flight Checks ---
log "=== PRD Chamber Deploy Script ==="
log "Target: $WEB_CHAMBER_HOST"
log "Branch: $BRANCH"
log "Dry Run: $DRY_RUN"
echo ""

# Check git status
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository!"
    exit 1
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    warn "No uncommitted changes. Using existing code."
else
    log "Uncommitted changes detected:"
    git status --short
    echo ""
    read -p "Commit these changes before deploy? [y/N] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Commit message: " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="chore: deploy $(date '+%Y-%m-%d %H:%M')"
        fi
        run "git add -A && git commit -m '$COMMIT_MSG'"
        success "Changes committed"
    fi
fi

# Check SSH key exists
if [ ! -f "${SSH_KEY/#\~/$HOME}" ]; then
    error "SSH key not found: $SSH_KEY"
    exit 1
fi

# ============================================================================
# STEP 1: Local Build Verification
# ============================================================================
log "=== Step 1: Local Build Verification ==="

run "cd ~/prd-chamber && git fetch origin"
run "git log --oneline -3"

# Check if branch is behind
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [ "$LOCAL" != "$REMOTE" ]; then
    warn "Local is behind origin/$BRANCH by $(git rev-list --count origin/$BRANCH..@) commits"
    read -p "Pull latest? [Y/n] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        run "git pull origin $BRANCH"
    fi
fi

# Clean build
log "Running clean build..."
run "cd ~/prd-chamber && rm -rf dist && npm run build"

BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    error "Local build failed!"
    exit 1
fi
success "Local build successful"

# ============================================================================
# STEP 2: Push to GitHub
# ============================================================================
log "=== Step 2: Push to GitHub ==="

run "git push origin $BRANCH"
success "Pushed to GitHub"

# ============================================================================
# STEP 3: Deploy to VPS Web Chamber
# ============================================================================
log "=== Step 3: Deploy to VPS Web Chamber ==="

# SSH and run deploy commands
SSH_CMD="ssh $SSH_OPTS $WEB_CHAMBER_USER@$WEB_CHAMBER_HOST"

# Check Web Chamber connectivity
run "$SSH_CMD 'echo Connection OK'"

# Pull latest
log "Pulling latest from GitHub..."
run "$SSH_CMD 'cd $PROJECT_DIR && git pull origin $BRANCH'"

# Clean rebuild (MANDATORY - vite cache staleness issue)
log "Clean rebuild on Web Chamber..."
run "$SSH_CMD 'cd $PROJECT_DIR && rm -rf dist && npm run build'"

BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    error "Web Chamber build failed!"
    exit 1
fi
success "Web Chamber build successful"

# ============================================================================
# STEP 4: Restart Services
# ============================================================================
log "=== Step 4: Restart Services ==="

# Kill stale processes
log "Killing stale processes..."
run "$SSH_CMD 'pkill -f \"vite preview\" 2>/dev/null || true'"
run "$SSH_CMD 'fuser -k 4173/tcp 2>/dev/null || true'"
run "$SSH_CMD 'pkill -f \"node.*dist/index\" 2>/dev/null || true'"
sleep 2

# Restart backend
log "Restarting backend (port 3000)..."
run "$SSH_CMD 'cd $PROJECT_DIR/server && npm run build 2>/dev/null || true'"
run "$SSH_CMD 'cd $PROJECT_DIR/server && nohup node dist/index.js > /tmp/backend.log 2>&1 &'"
sleep 2

# Restart frontend
log "Restarting frontend (port 4173)..."
run "$SSH_CMD 'cd $PROJECT_DIR && nohup node_modules/.bin/vite preview --host 0.0.0.0 --port 4173 > /tmp/frontend.log 2>&1 &'"
sleep 3

success "Services restarted"

# ============================================================================
# STEP 5: Health Check
# ============================================================================
log "=== Step 5: Health Check ==="

# Backend health
log "Checking backend health..."
BACKEND_HEALTH=$(run "$SSH_CMD 'curl -s --max-time 5 http://localhost:3000/api/health'")
if [ -n "$BACKEND_HEALTH" ]; then
    success "Backend: $BACKEND_HEALTH"
else
    warn "Backend health check failed (may still be starting)"
fi

# Frontend check
log "Checking frontend..."
FRONTEND_CHECK=$(run "$SSH_CMD 'curl -s --max-time 5 http://localhost:4173 | head -c 100'")
if [ -n "$FRONTEND_CHECK" ]; then
    success "Frontend: Responding"
else
    warn "Frontend check failed (may still be starting)"
fi

# ============================================================================
# STEP 6: Verify Build
# ============================================================================
log "=== Step 6: Verify New Build ==="

# Get build hash
BUILD_HASH=$(run "$SSH_CMD 'curl -s http://localhost:4173 | grep -o \"index-[a-zA-Z0-9_]*\\.js\" | head -1'")
if [ -n "$BUILD_HASH" ]; then
    success "Build hash: $BUILD_HASH"
else
    warn "Could not verify build hash"
fi

# ============================================================================
# DONE
# ============================================================================
echo ""
success "=== Deploy Complete ==="
log "App URL: http://$WEB_CHAMBER_HOST:4173"
log "Check logs: ssh $WEB_CHAMBER_USER@$WEB_CHAMBER_HOST 'tail -f /tmp/frontend.log'"
