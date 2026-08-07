#!/bin/bash
# post-push hook — Trigger chronicle on push
# Location: ~/.git-template/hooks/ or project .git/hooks/

PROJECT=$(basename "$(git rev-parse --show-toplevel)")
BRANCH=$(git branch --show-current)
PUSHED_COMMITS=$(git rev-list --count HEAD@{1}..HEAD@{0})

# Detect push type
if [ "$BRANCH" = "master" ] || [ "$BRANCH" = "main" ]; then
    PUSH_TYPE="production"
elif echo "$BRANCH" | grep -qi "deploy"; then
    PUSH_TYPE="staging"
else
    PUSH_TYPE="feature"
fi

# Log to chronicle
if [ -f "$HOME/prd-chamber/scripts/chronicle-trigger.sh" ]; then
    bash "$HOME/prd-chamber/scripts/chronicle-trigger.sh" --trigger=push \
        --project="$PROJECT" \
        --branch="$BRANCH" \
        --commits="$PUSHED_COMMITS" \
        --type="$PUSH_TYPE"
fi

echo "✓ Chronicle triggered for push to $BRANCH ($PUSHED_COMMITS commits)"
