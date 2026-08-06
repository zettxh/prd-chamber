#!/usr/bin/env python3
"""
update-handoff.py — Auto-update handoff Zone A on milestone

PROJECT-AGNOSTIC: Works on any project. Not tied to PRD Chamber.

Usage:
    # Auto-detect project from current directory
    python3 scripts/update-handoff.py --milestone="feature_complete" --detail="Auth system"

    # Explicit project name
    python3 scripts/update-handoff.py --project="my-app" --milestone="bug_fixed" --detail="Login bug"

    # Override handoff path
    python3 scripts/update-handoff.py --handoff-path="~/zermes-vault/40-strategy/my-app-handoff.md" --milestone="deploy" --detail="v2.0"

    # Dry run (preview without writing)
    python3 scripts/update-handoff.py --milestone="revision" --detail="UI update" --dry-run

Milestone Types:
    feature_complete  - Feature fully implemented + tested
    bug_fixed         - Bug verified working
    revision          - Rework, improvement
    step_skipped      - Feature intentionally skipped
    breaking_change   - API/config change
    deploy            - Successful deployment

Handoff Path (auto-detected):
    ~/zermes-vault/40-strategy/{project}-handoff.md

Script Location:
    ~/prd-chamber/scripts/update-handoff.py (shared for all projects)
"""

import argparse
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Configuration
VAULT_BASE = Path.home() / "zermes-vault"
ZONE_A_START = "<!-- ZONE_A_START -->"
ZONE_A_END = "<!-- ZONE_A_END -->"
ZONE_B_START = "<!-- ZONE_B_START -->"
ZONE_B_END = "<!-- ZONE_B_END -->"


def get_current_time():
    """Get current time in HH:MM format"""
    return datetime.now().strftime("%H:%M")


def get_latest_commit():
    """Get latest git commit hash and message"""
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-1"],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except:
        return "unknown"


def get_git_root():
    """Get git root directory"""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True
        )
        return Path(result.stdout.strip())
    except:
        return Path.cwd()


def build_status_table_entry(milestone_type, detail):
    """Build status table entry based on milestone type"""
    timestamp = get_current_time()
    
    entries = {
        "feature_complete": f"| {detail} | ✅ DONE | {timestamp} |",
        "bug_fixed": f"| {detail} | ✅ FIXED | {timestamp} |",
        "revision": f"| {detail} | 🔄 REVISED | {timestamp} |",
        "step_skipped": f"| {detail} | ⏭️ SKIPPED | {timestamp} |",
        "breaking_change": f"| {detail} | ⚠️ BREAKING | {timestamp} |",
        "deploy": f"| {detail} | 🚀 DEPLOYED | {timestamp} |",
    }
    return entries.get(milestone_type, f"| {detail} | ✅ DONE | {timestamp} |")


def build_whats_working_entry(milestone_type, detail):
    """Build What's Working entry based on milestone type"""
    timestamp = get_current_time()
    
    entries = {
        "feature_complete": f"- **{detail}** — ✅ COMPLETE ({timestamp})",
        "bug_fixed": f"- **Bug fixed:** {detail} — ✅ WORKING ({timestamp})",
        "revision": f"- **{detail}** — 🔄 REVISED ({timestamp})",
        "step_skipped": f"- **{detail}** — ⏭️ SKIPPED ({timestamp})",
        "breaking_change": f"- **{detail}** — ⚠️ BREAKING CHANGE ({timestamp})",
        "deploy": f"- **Last deploy:** {detail} ({timestamp})",
    }
    return entries.get(milestone_type, f"- {detail} ({timestamp})")


def parse_status_table(content):
    """Parse existing status table from handoff"""
    # Find status table section
    match = re.search(r"(## Current Status.*?)(?=##|\Z)", content, re.DOTALL)
    if not match:
        return content, []
    
    section = match.group(0)
    lines = section.split("\n")
    
    # Find table header and rows (skip the markdown header line "| Aspect | Status |")
    status_lines = []
    in_table = False
    for line in lines:
        # Skip the markdown table header line
        if "| Aspect | Status |" in line or "|--------|--------|--------|" in line:
            continue
        if "|" in line and ("✅" in line or "⏭️" in line or "🔄" in line or "⚠️" in line or "🚀" in line):
            status_lines.append(line)
    
    return section, status_lines


def update_zone_a(current_zone_a, milestone_type, detail, latest_commit):
    """Build new Zone A content"""
    timestamp = get_current_time()
    
    # Parse current status table
    _, current_rows = parse_status_table(current_zone_a)
    
    # Build new entry
    new_status = build_status_table_entry(milestone_type, detail)
    new_working = build_whats_working_entry(milestone_type, detail)
    
    # Update status table
    new_rows = current_rows.copy() if current_rows else []
    
    # Check if this item already exists in status
    detail_short = detail.split("(")[0].strip() if "(" in detail else detail
    updated = False
    for i, row in enumerate(new_rows):
        if detail_short.lower() in row.lower():
            # Update existing row
            new_rows[i] = new_status
            updated = True
            break
    
    if not updated:
        new_rows.append(new_status)
    
    # Build status table
    status_table = "| Aspect | Status | Updated |\n|--------|--------|---------|\n"
    status_table += "\n".join(new_rows)
    
    # Find What's Working section
    working_match = re.search(r"(## What's Working.*?)(?=##|\Z)", current_zone_a, re.DOTALL)
    if working_match:
        working_section = working_match.group(0)
        # Add new item to beginning
        lines = working_section.split("\n")
        insert_idx = 2  # After header
        lines.insert(insert_idx, new_working)
        new_working_section = "\n".join(lines)
        current_zone_a = current_zone_a.replace(working_section, new_working_section)
    else:
        # Add What's Working section
        current_zone_a += f"\n\n## What's Working\n{new_working}\n"
    
    # Update status table in Zone A
    # Match "## Current Status" with optional "(AUTO)" or similar
    status_match = re.search(r"(## Current Status[^\n]*\n.*?)(?=## What's Working|## What's Pending|<!-- ZONE)", current_zone_a, re.DOTALL)
    if status_match:
        current_zone_a = current_zone_a.replace(status_match.group(1), f"## Current Status\n{status_table}\n\n")
    else:
        current_zone_a = f"## Current Status\n{status_table}\n\n" + current_zone_a
    
    # Update Latest Commit
    if latest_commit and latest_commit != "unknown":
        current_zone_a = re.sub(
            r"\*\*Latest Commit:\*\* `[a-f0-9]+`.*",
            f"**Latest Commit:** `{latest_commit.split()[0]}` ({timestamp})",
            current_zone_a
        )
    
    return current_zone_a


def read_handoff(handoff_path):
    """Read handoff file, return Zone A and Zone B separately"""
    with open(handoff_path, 'r') as f:
        content = f.read()
    
    # Split by zones
    zone_a_match = re.search(rf"{ZONE_A_START}(.*?){ZONE_A_END}", content, re.DOTALL)
    zone_b_match = re.search(rf"{ZONE_B_START}(.*?){ZONE_B_END}", content, re.DOTALL)
    
    zone_a = zone_a_match.group(1).strip() if zone_a_match else ""
    zone_b = zone_b_match.group(1).strip() if zone_b_match else ""
    
    # Fallback: if no Zone markers, use whole content as Zone A
    if not zone_a and not zone_b:
        zone_a = content
        zone_b = ""
    
    return content, zone_a, zone_b


def write_handoff(handoff_path, zone_a, zone_b):
    """Write updated handoff with Zone markers"""
    content = f"""---
type: project-handoff
status: active
date: {datetime.now().strftime('%Y-%m-%d')}
updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
source: zermes
tags:
  - handoff
  - chronicle
---

<!-- ZONE_A_START -->
{zone_a}
<!-- ZONE_A_END -->

<!-- ZONE_B_START -->
{zone_b}
<!-- ZONE_B_END -->
"""
    
    with open(handoff_path, 'w') as f:
        f.write(content)


def main():
    parser = argparse.ArgumentParser(description="Auto-update handoff Zone A on milestone (project-agnostic)")
    parser.add_argument("--milestone", required=True, 
                       choices=["feature_complete", "bug_fixed", "revision", "step_skipped", "breaking_change", "deploy"],
                       help="Type of milestone")
    parser.add_argument("--detail", required=True, help="Description of what changed")
    parser.add_argument("--project", default=None, help="Project name (auto-detected from cwd if not provided)")
    parser.add_argument("--handoff-path", help="Override handoff file path")
    parser.add_argument("--dry-run", action="store_true", help="Show what would change without writing")
    
    args = parser.parse_args()
    
    # Auto-detect project from current directory if not provided
    if not args.project:
        git_root = get_git_root()
        args.project = git_root.name
        if args.project == "zermes-vault":
            # Try parent directory
            args.project = git_root.parent.name
    
    # Determine handoff path
    if args.handoff_path:
        handoff_path = Path(args.handoff_path)
    else:
        handoff_path = VAULT_BASE / "40-strategy" / f"{args.project}-handoff.md"
        
        # Fallback to dated version if not found
        if not handoff_path.exists():
            dated_path = VAULT_BASE / "40-strategy" / f"2026-08-05-{args.project}-handoff.md"
            if dated_path.exists():
                handoff_path = dated_path
    
    if not handoff_path.exists():
        print(f"❌ FAILED: Handoff not found at {handoff_path}")
        print(f"   Create handoff first: {VAULT_BASE / '40-strategy' / f'{args.project}-handoff.md'}")
        sys.exit(1)
    
    # Get latest commit
    git_root = get_git_root()
    latest_commit = "unknown"
    
    # Check if we're in the right repo
    project_dir = git_root / args.project
    if project_dir.exists():
        try:
            result = subprocess.run(
                ["git", "log", "--oneline", "-1"],
                cwd=project_dir,
                capture_output=True, text=True, check=True
            )
            latest_commit = result.stdout.strip()
        except:
            pass
    elif git_root.name == args.project or git_root.name == "zermes-vault":
        latest_commit = get_latest_commit()
    
    # Read current handoff
    full_content, current_zone_a, current_zone_b = read_handoff(handoff_path)
    
    # If no Zone markers, show warning
    if not current_zone_a:
        print(f"⚠️  WARNING: No ZONE_A markers found in {handoff_path}")
        print("   Add markers to enable auto-update:")
        print(f"   <!-- ZONE_A_START --> ... <!-- ZONE_A_END -->")
        print("   Will update inline content instead...")
    
    # Update Zone A
    new_zone_a = update_zone_a(current_zone_a, args.milestone, args.detail, latest_commit)
    
    # Dry run output
    if args.dry_run:
        print("=" * 60)
        print("DRY RUN — No changes written")
        print("=" * 60)
        print(f"\nMilestone: {args.milestone}")
        print(f"Detail: {args.detail}")
        print(f"Handoff: {handoff_path}")
        print(f"\n--- NEW ZONE A ---")
        print(new_zone_a[:1000] + "..." if len(new_zone_a) > 1000 else new_zone_a)
        print("--- END DRY RUN ---")
        return
    
    # Write updated handoff
    write_handoff(handoff_path, new_zone_a, current_zone_b)
    
    # Git sync
    try:
        subprocess.run(["git", "add", str(handoff_path)], cwd=VAULT_BASE, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"docs: handoff update — {args.milestone}: {args.detail}"],
            cwd=VAULT_BASE,
            capture_output=True, check=True
        )
        subprocess.run(["git", "push"], cwd=VAULT_BASE, capture_output=True, check=True)
        git_status = "✅ Git synced"
    except subprocess.CalledProcessError as e:
        git_status = f"⚠️ Git sync skipped: {e}"
    except Exception as e:
        git_status = f"⚠️ Git sync skipped: {e}"
    
    print(f"""
✅ Handoff Updated — {args.milestone}

Detail: {args.detail}
Handoff: {handoff_path.name}
Latest Commit: {latest_commit}
{git_status}

Next: Resume will show updated status automatically.
""")


if __name__ == "__main__":
    main()
