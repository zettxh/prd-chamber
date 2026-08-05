#!/bin/bash
# ============================================================================
# PRD Chamber Test Runner Script
# Brain: VPS Zermes — push test code to GitHub
# Production: VPS Web Chamber — install Playwright + execute tests
# ============================================================================

set -e

WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"
PROJECT_DIR="/home/prdchamber/prd-chamber"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[PRD Chamber] Test Runner${NC}"
echo "Brain: VPS Zermes | Production: VPS Web Chamber"
echo ""

# Check if running on Zermes (Brain) or Web Chamber
SSH_CONNECTION=$(ssh -o ConnectTimeout=5 -o BatchMode=yes -i "$SSH_KEY" "$WEB_CHAMBER_USER@$WEB_CHAMBER_HOST" "echo ok" 2>/dev/null || echo "not_reachable")

if [ "$1" == "--local" ]; then
    # Running on Web Chamber directly
    echo -e "${YELLOW}Running tests on Web Chamber...${NC}"
    MODE="web_chamber"
else
    # Running from Zermes - SSH to Web Chamber
    echo -e "${YELLOW}Executing tests via SSH to Web Chamber...${NC}"
    MODE="remote"
fi

case "$MODE" in
    web_chamber)
        echo ""
        echo -e "${BLUE}=== Step 1: Verify Services Running ===${NC}"
        
        # Check backend
        BACKEND_STATUS=$(curl -s --max-time 5 http://localhost:3000/api/health || echo "DOWN")
        if [[ "$BACKEND_STATUS" == *"ok"* ]] || [[ "$BACKEND_STATUS" == *"healthy"* ]]; then
            echo -e "${GREEN}[✓]${NC} Backend: $BACKEND_STATUS"
        else
            echo -e "${RED}[✗]${NC} Backend: $BACKEND_STATUS"
            echo "Start services first: pkill -f vite && pkill -f node && cd $PROJECT_DIR && nohup node server/dist/index.js &"
            exit 1
        fi
        
        # Check frontend
        FRONTEND_STATUS=$(curl -s --max-time 5 http://localhost:4173 | head -c 100 || echo "DOWN")
        if [[ "$FRONTEND_STATUS" == *"<"* ]]; then
            echo -e "${GREEN}[✓]${NC} Frontend: Running"
        else
            echo -e "${RED}[✗]${NC} Frontend: Not responding"
            exit 1
        fi
        
        echo ""
        echo -e "${BLUE}=== Step 2: Install/Update Dependencies ===${NC}"
        
        # Install Playwright if not exists
        if ! command -v npx &> /dev/null; then
            echo -e "${RED}[✗]${NC} npx not found"
            exit 1
        fi
        
        # Install Playwright browsers
        echo "Installing Playwright Chromium..."
        npx playwright install chromium --with-deps 2>&1 | tail -5
        
        echo ""
        echo -e "${BLUE}=== Step 3: Run Tests ===${NC}"
        
        # Run tests
        cd "$PROJECT_DIR"
        
        echo "Running E2E tests..."
        npx playwright test --reporter=list 2>&1 | tee /tmp/test-results.txt
        
        TEST_EXIT_CODE=${PIPESTATUS[0]}
        
        echo ""
        echo -e "${BLUE}=== Step 4: Results ===${NC}"
        
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            echo -e "${GREEN}[✓] All tests passed!${NC}"
        else
            echo -e "${RED}[✗] Some tests failed${NC}"
            echo "Full results saved to: /tmp/test-results.txt"
        fi
        
        exit $TEST_EXIT_CODE
        ;;
    
    remote)
        # SSH to Web Chamber and run tests
        echo "Connecting to $WEB_CHAMBER_HOST..."
        
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$WEB_CHAMBER_USER@$WEB_CHAMBER_HOST" << 'ENDSSH'
cd /home/prdchamber/prd-chamber

echo ""
echo "=== Verify Services Running ==="

BACKEND_STATUS=$(curl -s --max-time 5 http://localhost:3000/api/health || echo "DOWN")
if [[ "$BACKEND_STATUS" == *"ok"* ]] || [[ "$BACKEND_STATUS" == *"healthy"* ]]; then
    echo "[✓] Backend: $BACKEND_STATUS"
else
    echo "[✗] Backend: $BACKEND_STATUS"
    echo "Start services first!"
    exit 1
fi

FRONTEND_STATUS=$(curl -s --max-time 5 http://localhost:4173 | head -c 100 || echo "DOWN")
if [[ "$FRONTEND_STATUS" == *"<"* ]]; then
    echo "[✓] Frontend: Running"
else
    echo "[✗] Frontend: Not responding"
    exit 1
fi

echo ""
echo "=== Install/Update Playwright ==="
npx playwright install chromium --with-deps 2>&1 | tail -3

echo ""
echo "=== Running E2E Tests ==="
npx playwright test --reporter=list 2>&1 | tee /tmp/test-results.txt
TEST_EXIT=$?

echo ""
echo "=== Results ==="
if [ $TEST_EXIT -eq 0 ]; then
    echo "[✓] All tests passed!"
else
    echo "[✗] Some tests failed"
fi

exit $TEST_EXIT
ENDSSH
        
        SSH_EXIT=$?
        
        echo ""
        if [ $SSH_EXIT -eq 0 ]; then
            echo -e "${GREEN}[✓] Test execution completed${NC}"
        else
            echo -e "${RED}[✗] Test execution failed${NC}"
        fi
        
        exit $SSH_EXIT
        ;;
esac
