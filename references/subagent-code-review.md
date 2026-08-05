# PRD Chamber Subagent Code Review

## Workflow Overview

```
Zain: "Tambah fitur X"
  → Zermes: Write code
  → 3 Subagents review parallel:
      - Security Reviewer
      - Quality Reviewer
      - Test Generator
  → All passed → Deploy to Web Chamber
  → Report to Zain
```

## Subagent Roles

### 1. Security Reviewer
**Focus:** Vulnerabilities, secrets, injection attacks

**Checklist:**
- [ ] No hardcoded passwords/API keys
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] No eval() usage
- [ ] Environment variables properly used
- [ ] Input validation present

**Tools:** grep, sed, regex patterns

### 2. Quality Reviewer
**Focus:** Code quality, best practices, maintainability

**Checklist:**
- [ ] TypeScript compilation passes
- [ ] No console.log in production code
- [ ] No TODO/FIXME in critical paths
- [ ] Proper error handling (try/catch)
- [ ] Clean imports (no unused)
- [ ] Consistent naming conventions
- [ ] Proper async/await usage

**Tools:** tsc, grep, eslint patterns

### 3. Test Generator
**Focus:** Test coverage, edge cases

**Checklist:**
- [ ] New functions have unit tests
- [ ] API endpoints have integration tests
- [ ] Critical paths covered
- [ ] Edge cases tested
- [ ] Playwright E2E tests pass

**Tools:** Jest/Vitest patterns, Playwright

## Execution Flow

### Manual (via scripts)
```bash
# Full code review pipeline
./scripts/subagent-review.sh

# Quick check
./scripts/code-review.sh
```

### Via Hermes Subagent (AI-powered)
```python
# 3 subagents run in parallel
delegate_task([
    {
        "goal": "Security review for changed files",
        "context": "Files: {changed_files}\nCheck: secrets, injection, XSS",
        "role": "leaf"
    },
    {
        "goal": "Quality review for changed files",
        "context": "Files: {changed_files}\nCheck: typescript, patterns, best practices",
        "role": "leaf"
    },
    {
        "goal": "Test coverage review",
        "context": "Files: {changed_files}\nCheck: test existence, coverage",
        "role": "leaf"
    }
])
```

## PRD Chamber Specific Rules

### Security Rules
- Never log secrets or API keys
- Use environment variables for all credentials
- Validate all user inputs
- Sanitize HTML output (no dangerouslySetInnerHTML without sanitization)

### Quality Rules
- All components must be TypeScript (no `any`)
- Use Zustand for state management
- Follow existing component patterns
- No `console.log` in production

### Test Rules
- New API handlers need tests
- New components need Playwright tests
- Run `npm run build` before any PR

## Integration with Deploy Pipeline

```
Code Change
    ↓
Security Review (subagent)
    ↓
Quality Review (subagent)
    ↓
Test Coverage Check (subagent)
    ↓
All Passed?
    ↓
Deploy to Web Chamber (via deploy-quick.sh)
    ↓
Playwright Tests on Web Chamber
    ↓
Report to Zain
```

## Usage

```bash
# From VPS Zermes (Brain)
cd ~/prd-chamber

# Full subagent review
./scripts/subagent-review.sh

# If all pass, deploy
./scripts/deploy-quick.sh
```

## When to Use

| Situation | Action |
|-----------|--------|
| New feature | Full review (all 3 agents) |
| Bug fix | Security + Quality only |
| Dependency update | Quick security check |
| Pre-merge | Full review + tests |
