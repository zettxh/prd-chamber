#!/usr/bin/env python3
"""
compare-decisions-handoff.py — Compare Decision Log vs Handoff, find gaps, update links

PROJECT-AGNOSTIC: Works on any project.

Usage:
    python3 scripts/compare-decisions-handoff.py --project="prd-chamber"
    python3 scripts/compare-decisions-handoff.py --project="my-app" --dry-run
    python3 scripts/compare-decisions-handoff.py --project="prd-chamber" --auto-update

What it does:
1. Load Decision Log: ~/zermes-vault/60-logs/decisions/{project}.md
2. Load Handoff: ~/zermes-vault/40-strategy/{project}-handoff.md
3. Find decisions that need handoff links
4. Find handoff items that need decision context
5. Report gaps
6. Optionally update handoff with decision links
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


def get_project_paths(project):
    """Get paths for decision log and handoff"""
    decision_log = VAULT_BASE / "60-logs" / "decisions" / f"{project}.md"
    handoff = VAULT_BASE / "40-strategy" / f"{project}-handoff.md"
    
    # Fallback to dated handoff
    if not handoff.exists():
        dated = VAULT_BASE / "40-strategy" / f"2026-08-05-{project}-handoff.md"
        if dated.exists():
            handoff = dated
    
    return decision_log, handoff


def extract_decisions(decision_log_path):
    """Extract all decisions from Decision Log"""
    decisions = []
    
    if not decision_log_path.exists():
        return decisions
    
    with open(decision_log_path, 'r') as f:
        content = f.read()
    
    # Find all decision sections
    # Pattern: ## YYYY-MM-DD — Decision Title
    pattern = r'## (\d{4}-\d{2}-\d{2}) — (.+?)\n\n\*\*Type:\*\* (.+?)\n\*\*Status:\*\* (.+?)\n'
    
    for match in re.finditer(pattern, content, re.DOTALL):
        date, title, decision_type, status = match.groups()
        decisions.append({
            'date': date,
            'title': title.strip(),
            'type': decision_type.strip(),
            'status': status.strip(),
            'anchor': f"{date}/{title.strip()}"
        })
    
    return decisions


def extract_handoff_items(handoff_path):
    """Extract items from handoff Zone A"""
    items = []
    
    if not handoff_path.exists():
        return items
    
    with open(handoff_path, 'r') as f:
        content = f.read()
    
    # Extract Zone A content
    zone_a_match = re.search(rf'{ZONE_A_START}(.*?){ZONE_A_END}', content, re.DOTALL)
    if not zone_a_match:
        return items
    
    zone_a = zone_a_match.group(1)
    
    # Find items with decision context
    # Pattern: - Item name\n  ↳ Context\n    Decision: `date/title`
    pattern = r'-\s+(.+?)(?:\n\s+↳\s+(.+?))?\n\s+Decision:\s+`(.+?)`'
    
    for match in re.finditer(pattern, zone_a, re.DOTALL):
        item, context, decision_ref = match.groups()
        items.append({
            'name': item.strip(),
            'context': context.strip() if context else None,
            'decision_ref': decision_ref.strip()
        })
    
    # Find items WITHOUT decision context
    # Pattern: - Item name (in What's Working or What's Pending)
    # that doesn't have "Decision:" after it
    working_pattern = r'## What[\'"]s Working.*?\n(.*?)(?=##|\Z)'
    pending_pattern = r'## What[\'"]s Pending.*?\n(.*?)(?=##|\Z)'
    
    # Extract items that don't have decision links
    for section_pattern in [working_pattern, pending_pattern]:
        section_match = re.search(section_pattern, zone_a, re.DOTALL)
        if section_match:
            section_content = section_match.group(1)
            # Find bullet points
            for bullet_match in re.finditer(r'^\s*-\s+(.+?)(?:\n|$)', section_content, re.MULTILINE):
                item_name = bullet_match.group(1).strip()
                # Check if this item already has a decision link
                if f"Decision: `{item_name}" not in section_content:
                    # Check if already in items list
                    if not any(i['name'] == item_name for i in items):
                        items.append({
                            'name': item_name,
                            'context': None,
                            'decision_ref': None,
                            'needs_decision': True
                        })
    
    return items


def find_gaps(decisions, handoff_items):
    """Find gaps between decisions and handoff"""
    gaps = {
        'handoff_needs_decision': [],  # Handoff items without decision context
        'decisions_not_linked': [],     # Decisions not referenced in handoff
        'potential_matches': []         # Items that might match decisions
    }
    
    # Check handoff items that need decisions
    for item in handoff_items:
        if item.get('needs_decision') or not item.get('decision_ref'):
            # Try to find matching decision
            matched = False
            for decision in decisions:
                # Simple keyword matching
                item_words = set(item['name'].lower().split())
                decision_words = set(decision['title'].lower().split())
                overlap = item_words & decision_words
                
                if len(overlap) >= 2:  # At least 2 common words
                    gaps['potential_matches'].append({
                        'item': item['name'],
                        'decision': decision['anchor'],
                        'match_score': len(overlap)
                    })
                    matched = True
            
            if not matched:
                gaps['handoff_needs_decision'].append(item['name'])
    
    # Check decisions not linked
    for decision in decisions:
        linked = False
        for item in handoff_items:
            if item.get('decision_ref') == decision['anchor']:
                linked = True
                break
        
        if not linked:
            gaps['decisions_not_linked'].append(decision)
    
    return gaps


def generate_update_suggestions(gaps, project):
    """Generate handoff update suggestions"""
    suggestions = []
    
    # Sort potential matches by score
    gaps['potential_matches'].sort(key=lambda x: x['match_score'], reverse=True)
    
    for match in gaps['potential_matches'][:10]:  # Top 10 matches
        suggestions.append(
            f"Link: {match['item']} → Decision: `{match['decision']}`"
        )
    
    if gaps['handoff_needs_decision']:
        suggestions.append("\n📋 Handoff items that may need decision context:")
        for item in gaps['handoff_needs_decision'][:5]:
            suggestions.append(f"  - {item}")
    
    if gaps['decisions_not_linked']:
        suggestions.append("\n📋 Decisions not yet linked to handoff:")
        for decision in gaps['decisions_not_linked'][:5]:
            suggestions.append(f"  - {decision['date']}/{decision['title']}")
    
    return suggestions


def main():
    parser = argparse.ArgumentParser(description="Compare Decision Log vs Handoff")
    parser.add_argument("--project", required=True, help="Project name")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    parser.add_argument("--auto-update", action="store_true", help="Automatically update handoff with best matches")
    parser.add_argument("--silent", action="store_true", help="Only output changes")
    
    args = parser.parse_args()
    
    # Get paths
    decision_log, handoff = get_project_paths(args.project)
    
    if not decision_log.exists():
        print(f"❌ Decision Log not found: {decision_log}")
        print(f"   Create first: {decision_log}")
        sys.exit(1)
    
    if not handoff.exists():
        print(f"❌ Handoff not found: {handoff}")
        sys.exit(1)
    
    # Extract data
    decisions = extract_decisions(decision_log)
    handoff_items = extract_handoff_items(handoff)
    
    # Find gaps
    gaps = find_gaps(decisions, handoff_items)
    
    # Generate report
    print("=" * 60)
    print(f"DECISION ↔ HANDOFF COMPARE — {args.project}")
    print("=" * 60)
    print(f"\n📊 Data extracted:")
    print(f"   Decisions: {len(decisions)}")
    print(f"   Handoff items: {len(handoff_items)}")
    
    print(f"\n🔍 Gap Analysis:")
    print(f"   Handoff items without decision: {len(gaps['handoff_needs_decision'])}")
    print(f"   Decisions not linked: {len(gaps['decisions_not_linked'])}")
    print(f"   Potential matches: {len(gaps['potential_matches'])}")
    
    # Show suggestions
    if gaps['potential_matches'] or gaps['handoff_needs_decision'] or gaps['decisions_not_linked']:
        print(f"\n📝 SUGGESTIONS:")
        suggestions = generate_update_suggestions(gaps, args.project)
        for suggestion in suggestions:
            print(f"   {suggestion}")
    
    # Summary
    total_gaps = len(gaps['handoff_needs_decision']) + len(gaps['decisions_not_linked'])
    
    if total_gaps == 0:
        print(f"\n✅ Decision Log and Handoff are ALLYNED")
    else:
        print(f"\n⚠️  {total_gaps} items need attention")
    
    # Save results to temp file for review
    results = {
        'project': args.project,
        'timestamp': datetime.now().isoformat(),
        'decisions_count': len(decisions),
        'handoff_items_count': len(handoff_items),
        'gaps': {
            'handoff_needs_decision': gaps['handoff_needs_decision'],
            'decisions_not_linked': [d['anchor'] for d in gaps['decisions_not_linked']],
            'potential_matches': gaps['potential_matches'][:20]
        }
    }
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
