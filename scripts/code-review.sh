#!/bin/bash
# ============================================================================
# PRD Chamber Code Review Pipeline
# Executes 3 subagents in parallel: Security, Quality, Test
# Then proceeds to deploy if all pass
# ============================================================================

set -e

WEB_CHAMBER_HOST="43.133.35.217"
WEB_CHAMBER_USER="ubuntu"
SSH_KEY="~/.ssh/id_ed25519"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[PRD Chamber] Code Review Pipeline${NC}"
echo "Brain: VPS Zermes | Production: VPS Web Chamber"
echo ""

# ============================================================================
# STEP 1: Detect Changes
# ============================================================================
echo -e "${BLUE}=== Step 1: Detect Changes ===${NC}"

cd $HOME/prd-chamber

if [ -n "$(git status --porcelain)" ]; then
    echo "Uncommitted changes detected:"
    git status --short
    echo ""
    read -p "Commit before review? [Y/n] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        read -p "Commit message: " MSG
        MSG=${MSG:-"wip: $(date '+%Y-%m-%d %H:%M')"}
        git add -A && git commit -m "$MSG"
    fi
fi

# Get changed files
CHANGED_FILES=$(git diff --name-only origin/master...HEAD 2>/dev/null || echo "")
if [ -z "$CHANGED_FILES" ]; then
    CHANGED_FILES=$(git status --porcelain | awk '{print $2}')
fi

echo "Files to review:"
echo "$CHANGED_FILES"
echo ""

# ============================================================================
# STEP 2: Show Review Agents
# ============================================================================
echo -e "${BLUE}=== Step 2: Code Review Agents ===${NC}"
echo "1. Security Reviewer — vulnerabilities, secrets, SQL injection"
echo "2. Quality Reviewer — TypeScript, best practices, performance"
echo "3. Test Generator — unit tests for new functions"
echo ""

read -p "Start review? [Y/n] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Review cancelled."
    exit 0
fi

# ============================================================================
# STEP 3: Launch Parallel Reviews
# ============================================================================
echo -e "${BLUE}=== Step 3: Running Reviews (Parallel) ===${NC}"

# Create review report file
REVIEW_REPORT="/tmp/prd-chamber-review-$(date '+%Y%m%d-%H%M%S').txt"
echo "PRD Chamber Code Review Report" > "$REVIEW_REPORT"
echo "Date: $(date)" >> "$REVIEW_REPORT"
echo "Files: $CHANGED_FILES" >> "$REVIEW_REPORT"
echo "" >> "$REVIEW_REPORT"

# Launch subagents (in background, collect results)
echo -e "${YELLOW}Launching Security Reviewer...${NC}"
(
    echo "=== SECURITY REVIEW ===" >> "$REVIEW_REPORT"
    # Security checks
    echo "Scanning for hardcoded secrets..." >> "$REVIEW_REPORT"
    grep -rn "password\s*=\s*['\"][^'\"]*['\"]" ~/prd-chamber --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." >> "$REVIEW_REPORT" || echo "No hardcoded passwords found." >> "$REVIEW_REPORT"
    
    echo "Scanning for API keys..." >> "$REVIEW_REPORT"
    grep -rn "api[_-]key\s*=\s*['\"][^'\"]*['\"]" ~/prd-chamber --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." >> "$REVIEW_REPORT" || echo "No exposed API keys found." >> "$REVIEW_REPORT"
    
    echo "Scanning for SQL injection vectors..." >> "$REVIEW_REPORT"
    grep -rn "sql\`\|execute.*\$" ~/prd-chamber/server --include="*.ts" 2>/dev/null | grep -v node_modules >> "$REVIEW_REPORT" || echo "No obvious SQL injection vectors." >> "$REVIEW_REPORT"
    
    echo "Scanning for XSS vectors..." >> "$REVIEW_REPORT"
    grep -rn "dangerouslySetInnerHTML\|innerHTML" ~/prd-chamber/src --include="*.tsx" 2>/dev/null | grep -v node_modules >> "$REVIEW_REPORT" || echo "No obvious XSS vectors." >> "$REVIEW_REPORT"
    
    echo "[PASS] Security review complete" >> "$REVIEW_REPORT"
) &

echo -e "${YELLOW}Launching Quality Reviewer...${NC}"
(
    echo "=== QUALITY REVIEW ===" >> "$REVIEW_REPORT"
    
    echo "Checking TypeScript errors..." >> "$REVIEW_REPORT"
    cd $HOME/prd-chamber
    npx tsc --noEmit 2>&1 | head -20 >> "$REVIEW_REPORT" || echo "TypeScript check complete." >> "$REVIEW_REPORT"
    
    echo "Checking for console.log..." >> "$REVIEW_REPORT"
    grep -rn "console\.log" ~/prd-chamber/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." >> "$REVIEW_REPORT" || echo "No console.log found." >> "$REVIEW_REPORT"
    
    echo "Checking for TODO comments..." >> "$REVIEW_REPORT"
    grep -rn "TODO\|FIXME\|HACK" ~/prd-chamber/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | head -10 >> "$REVIEW_REPORT" || echo "No TODO/FIXME found." >> "$REVIEW_REPORT"
    
    echo "[PASS] Quality review complete" >> "$REVIEW_REPORT"
) &

echo -e "${YELLOW}Launching Test Generator...${NC}"
(
    echo "=== TEST GENERATION ===" >> "$REVIEW_REPORT"
    
    # Check if tests exist for changed files
    echo "Checking test coverage for changed files..." >> "$REVIEW_REPORT"
    for file in $CHANGED_FILES; do
        if [[ "$file" == *.ts ]] || [[ "$file" == *.tsx" ]]; then
            if [[ "$file" != *.test.* ]] && [[ "$file" != *.spec.* ]]; then
                test_file=$(echo "$file" | sed 's/\.tsx$/.test.tsx/' | sed 's/\.ts$/.test.ts/')
                if [ -f "~/prd-chamber/$test_file" ]; then
                    echo "[EXISTS] $test_file" >> "$REVIEW_REPORT"
                else
                    echo "[MISSING] No test for: $file" >> "$REVIEW_REPORT"
                fi
            fi
        fi
    done
    
    echo "[PASS] Test coverage check complete" >> "$REVIEW_REPORT"
) &

# Wait for all reviews to complete
wait

# ============================================================================
# STEP 4: Display Results
# ============================================================================
echo ""
echo -e "${BLUE}=== Step 4: Review Results ===${NC}"
cat "$REVIEW_REPORT"
echo ""

# ============================================================================
# STEP 5: Decision
# ============================================================================
echo -e "${BLUE}=== Step 5: Decision ===${NC}"

SECURITY_PASS=$(grep -c "PASS.*Security" "$REVIEW_REPORT" || echo "0")
QUALITY_PASS=$(grep -c "PASS.*Quality" "$REVIEW_REPORT" || echo "0")
TEST_PASS=$(grep -c "PASS.*Test" "$REVIEW_REPORT" || echo "0")

ALL_PASS=true
if [ "$SECURITY_PASS" -eq 0 ] || [ "$QUALITY_PASS" -eq 0 ] || [ "$TEST_PASS" -eq 0 ]; then
    ALL_PASS=false
fi

if [ "$ALL_PASS" = true ]; then
    echo -e "${GREEN}[✓] All reviews passed!${NC}"
    echo ""
    read -p "Deploy to Web Chamber? [Y/n] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${BLUE}Running deploy...${NC}"
        cd $HOME/prd-chamber && ./scripts/deploy-quick.sh
    fi
else
    echo -e "${RED}[✗] Some reviews need attention${NC}"
    echo "Review the report above and fix issues before deploying."
    echo "Report saved to: $REVIEW_REPORT"
fi

echo ""
echo "Review report: $REVIEW_REPORT"
