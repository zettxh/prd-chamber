#!/bin/bash
# install-git-hooks.sh — Install git hooks for project
# Usage: bash scripts/install-git-hooks.sh [project-path]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="${1:-.}"

echo "Installing git hooks for: $PROJECT_PATH"

# Create hooks directory
mkdir -p "$PROJECT_PATH/.git/hooks"

# Copy hooks
cp "$SCRIPT_DIR/post-commit-hook.sh" "$PROJECT_PATH/.git/hooks/post-commit"
cp "$SCRIPT_DIR/post-push-hook.sh" "$PROJECT_PATH/.git/hooks/post-merge"  # Also on merge

# Make executable
chmod +x "$PROJECT_PATH/.git/hooks/post-commit"
chmod +x "$PROJECT_PATH/.git/hooks/post-merge"

echo "✓ Git hooks installed"
echo ""
echo "Installed hooks:"
echo "  - .git/hooks/post-commit"
echo "  - .git/hooks/post-merge"
echo ""
echo "To uninstall: rm .git/hooks/post-commit .git/hooks/post-merge"
