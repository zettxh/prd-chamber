#!/bin/bash
# post-commit hook — Trigger chronicle on commit
# Location: ~/.git-template/hooks/ or project .git/hooks/

PROJECT=$(basename "$(git rev-parse --show-toplevel)")
COMMIT_MSG=$(git log -1 --pretty=%B | head -n1)
COMMIT_HASH=$(git log -1 --pretty=%h)
FILES_CHANGED=$(git diff --name-only HEAD~1..HEAD | head -5)

# Detect milestone type from commit message
MILESTONE_TYPE=""
if echo "$COMMIT_MSG" | grep -qi "feat:"; then
    MILESTONE_TYPE="feature_complete"
elif echo "$COMMIT_MSG" | grep -qi "fix:"; then
    MILESTONE_TYPE="bug_fixed"
elif echo "$COMMIT_MSG" | grep -qi "refactor:"; then
    MILESTONE_TYPE="revision"
elif echo "$COMMIT_MSG" | grep -qi "docs:"; then
    MILESTONE_TYPE="deploy"  # Documentation updates
fi

# Log to chronicle
if [ -f "$HOME/prd-chamber/scripts/chronicle-trigger.sh" ]; then
    bash "$HOME/prd-chamber/scripts/chronicle-trigger.sh" --trigger=commit \
        --project="$PROJECT" \
        --commit="$COMMIT_HASH" \
        --message="$COMMIT_MSG" \
        --milestone="$MILESTONE_TYPE"
fi

echo "✓ Chronicle triggered for commit $COMMIT_HASH"
