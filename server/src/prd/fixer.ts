// Mermaid Diagram Fixer Service
// Fixes common invalid mermaid syntax in PRD section content.
// Falls back to LLM-assisted fix for unrecognizable patterns.

export interface FixResult {
  original: string
  fixed: string
  changes: FixChange[]
  method: 'none' | 'regex' | 'llm'
  errors: string[]
}

export interface FixChange {
  type: string
  description: string
  before: string
  after: string
}

interface FixOptions {
  useLlm?: boolean
}

// ─── Pattern Fixers ───────────────────────────────────────────────────────────

/**
 * Fix 1: Missing erDiagram directive
 * Lines like `USER ||--o{ ORDER : places` without preceding `erDiagram` header.
 */
function fixMissingErDirective(content: string): { fixed: string; changes: FixChange[] } {
  const changes: FixChange[] = []
  const erRelPattern = /^(\s*)([A-Z][A-Za-z0-9_]*\s*(?:\|\||\}o|o\{|o\{|\}\||\}\|)\s*(?:\|o|\|\{|\}\|)?\s*[A-Z][A-Za-z0-9_]*\s*:\s*)/m
  // Also fix ```mer (broken: space before "mer", no newline after opening)
  const brokenMermaidRe = /```mer(\n|[\s])/gi
  if (brokenMermaidRe.test(content)) {
    content = content.replace(brokenMermaidRe, '```mermaid\n')
    changes.push({
      type: 'broken-mermaid-tag',
      description: 'Fixed ` ```mer ` → ` ```mermaid `',
      before: '```mer',
      after: '```mermaid',
    })
  }

  const erDiagramExists = /^\s*erDiagram/m.test(content)

  if (!erDiagramExists && erRelPattern.test(content)) {
    content = 'erDiagram\n' + content
    changes.push({
      type: 'missing-er-diagram',
      description: 'Added missing `erDiagram` directive',
      before: '(missing)',
      after: 'erDiagram',
    })
  }

  return { fixed: content, changes }
}

/**
 * Fix 2: Inline attributes on ER relationship lines
 * Mermaid ER syntax: attributes MUST be inside the entity block, NOT on the relationship line.
 * BAD:  `USER ||--o{ ORDER : places` (correct — this IS valid)
 * BAD:  `USER { string id } ||--o{ ORDER : places` (attributes on relationship line)
 */
function fixInlineAttributesOnRelations(content: string): { fixed: string; changes: FixChange[] } {
  const changes: FixChange[] = []

  // Remove attribute blocks that appear inline in entity definitions on relationship lines
  // Pattern: entity name followed by `{ ... }` on the same line as `||--o{` or similar
  const re = /^(\s*)([A-Z][A-Za-z0-9_]*)\s*\{[^}]*\}\s*(\|\|--o\{|\}\|--o\{|\|\|--\|\{|\|\|--o\||\}\|--\|\||o\{--o\{|\}\|--o\||\}\|--|\}\|\.\.|\|\|\.\.).+$/gm

  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    const fullMatch = match[0]
    const indent = match[1]
    const entityName = match[2]
    const relation = match[3]
    const rest = fullMatch.slice(match[0].indexOf(relation) + relation.length)

    const fixed = `${indent}${entityName} ${relation}${rest}`
    content = content.replace(fullMatch, fixed)
    changes.push({
      type: 'inline-attrs-on-relation',
      description: `Removed inline attributes from ${entityName} relationship line`,
      before: fullMatch.trim(),
      after: fixed.trim(),
    })
  }

  return { fixed: content, changes }
}

/**
 * Fix 3: Flowchart node IDs with spaces (surround with quotes)
 * BAD:  `A[First Node] --> B[Second Node]`
 * Fixed equivalent is actually valid; the real issue is:
 * BAD:  `My Node --> Other Node` (no brackets, spaces in ID)
 */
function fixFlowchartNodeSpaces(content: string): { fixed: string; changes: FixChange[] } {
  const changes: FixChange[] = []

  // Only fix inside flowchart blocks
  const flowchartRegex = /```mermaid\nflowchart (TB|TD|BT|RL|LR)\n([\s\S]*?)```/gi

  content = content.replace(flowchartRegex, (_, direction: string, body: string): string => {
    const lines = body.split('\n')
    const fixedLines: string[] = []

    for (const line of lines) {
      // Fix bare node IDs with spaces (not inside brackets, no arrows)
      const trimmed = line.trim()
      if (trimmed && !trimmed.includes('-->') && !trimmed.includes('---')
          && !trimmed.includes('[') && !trimmed.includes('(') && trimmed.includes(' ')) {
        const indent = line.match(/^(\s*)/)![1]
        const fixedName = trimmed.replace(/\s+/g, '_')
        changes.push({
          type: 'flowchart-node-spaces',
          description: `Replaced spaces with underscores in node ID: "${trimmed}"`,
          before: trimmed,
          after: fixedName,
        })
        fixedLines.push(indent + fixedName)
      } else {
        fixedLines.push(line)
      }
    }

    return '```mermaid\nflowchart ' + direction + '\n' + fixedLines.join('\n') + '```'
  })

  return { fixed: content, changes }
}

/**
 * Fix 4: Strip MermaidWrapper component blocks (if any leaked from earlier transforms)
 */
function fixWrapperBlocks(content: string): { fixed: string; changes: FixChange[] } {
  const changes: FixChange[] = []

  // Strip <MermaidWrapper>...</MermaidWrapper> if present
  const wrapperRe = /<MermaidWrapper[^>]*>\s*([\s\S]*?)\s*<\/MermaidWrapper>/gi
  if (wrapperRe.test(content)) {
    content = content.replace(wrapperRe, (_, inner) => inner)
    changes.push({
      type: 'remove-wrapper',
      description: 'Removed MermaidWrapper component wrapper',
      before: '<MermaidWrapper>...</MermaidWrapper>',
      after: '(inline mermaid block)',
    })
  }

  return { fixed: content, changes }
}

// ─── Main Fix Function (No LLM) ─────────────────────────────────────────────

function applyRegexFixes(content: string): FixResult {
  let fixed = content
  const allChanges: FixChange[] = []

  const fixers = [
    fixMissingErDirective,
    fixInlineAttributesOnRelations,
    fixFlowchartNodeSpaces,
    fixWrapperBlocks,
  ]

  for (const fixer of fixers) {
    const result = fixer(fixed)
    fixed = result.fixed
    allChanges.push(...result.changes)
  }

  return {
    original: content,
    fixed,
    changes: allChanges,
    method: allChanges.length > 0 ? 'regex' : 'none',
    errors: [],
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function fixMermaidDiagrams(content: string, options: FixOptions = {}): FixResult {
  const regexResult = applyRegexFixes(content)

  if (regexResult.method === 'regex') {
    return regexResult
  }

  // No regex fixes found — if useLlm is set, try LLM
  if (options.useLlm) {
    return {
      original: content,
      fixed: content, // LLM call deferred to handler
      changes: [],
      method: 'llm',
      errors: [],
    }
  }

  return regexResult
}
