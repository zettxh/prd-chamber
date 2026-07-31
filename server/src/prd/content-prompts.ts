// PRD Content Prompts — per-section generation
import type { ChatMessage } from '../llm/client.js'

export interface PrdSection {
  id: string
  name: string
  description: string
  priority: number
  is_mandatory: boolean
}

export interface StructurePhase {
  phase_number: number
  phase_name: string
  features: Array<{
    name: string
    description: string
    complexity?: string
    sub_features?: string[]
  }>
}

export interface ClarifyAnswers {
  [key: string]: string | string[] | null
}

export interface OutlineContext {
  tier: number
  tier_reason: string
  flags: string[]
  sections: PrdSection[]
  skipped_sections: Array<{ id: string; reason: string }>
}

function formatStructure(structureData: { phases: StructurePhase[] } | null): string {
  if (!structureData) return '(none)'
  return structureData.phases.map(phase => {
    const features = phase.features.map(f => {
      const subs = (f.sub_features || []).map(s => `  - ${s}`).join('\n')
      return `  ${f.name}${f.description ? `: ${f.description}` : ''}${subs ? '\n' + subs : ''}`
    }).join('\n')
    return `[Fase ${phase.phase_number}] ${phase.phase_name}\n${features}`
  }).join('\n\n')
}

function formatAnswers(answers: ClarifyAnswers): string {
  return Object.entries(answers)
    .map(([key, value]) => {
      if (value === null || value === undefined) return `${key}: (tidak dijawab)`
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
      return `${key}: ${value}`
    })
    .join('\n')
}

/**
 * Build prompt for generating a single PRD section.
 * All previously generated sections are passed as context to maintain consistency.
 */
export function buildSectionPrompt(
  section: PrdSection,
  industry: string,
  description: string | null | undefined,
  clarificationAnswers: ClarifyAnswers,
  structureData: { phases: StructurePhase[] } | null,
  previousSections: Array<{ id: string; name: string; content: string }>
): ChatMessage[] {
  const industryContext = description
    ? `${industry} — ${description}`
    : industry

  // Build context from previously generated sections
  const previousContext = previousSections.length > 0
    ? `\n\nSECTIONS THAT HAVE BEEN GENERATED (use these for consistency):\n${previousSections.map(s => `--- ${s.name} ---\n${s.content}`).join('\n\n')}`
    : ''

  // === SYSTEM PROMPT ===
  const systemPrompt = [
    'You are a technical writer. Write the content for ONE section of a PRD document.',
    '',
    'SECTION TO GENERATE:',
    `- Name: ${section.name}`,
    `- Description: ${section.description}`,
    `- Priority: ${section.priority}${section.is_mandatory ? ' (mandatory)' : ''}`,
    '',
    'OUTPUT REQUIREMENTS:',
    '- Write in Bahasa Indonesia (Indonesian language)',
    '- Minimum 200 words per section',
    '- Use proper Markdown formatting (headings, lists, tables where appropriate)',
    '- Do NOT add duplicate section titles/headings at the top — the section name will be used as the heading',
    '- Be specific and actionable — avoid generic filler content',
    '- Maintain consistent terminology and detail level with other sections' + previousContext,
    '',
    'MARKDOWN FORMATTING RULES:',
    '',
    '## Headings',
    '- Use ## for main sub-section headings (NOT # — reserved for page title)',
    '- Use ### for sub-sub-headings',
    '- Do NOT use #### or deeper headings in PRD content',
    '',
    '## Tables',
    'Use standard GFM markdown tables:',
    '| Kolom 1 | Kolom 2 |',
    '|----------|---------|',
    '| Nilai 1  | Nilai 2  |',
    '',
    '## Code blocks',
    'Use triple backticks with language tag:',
    '```sql',
    'CREATE TABLE users (',
    '  id UUID PRIMARY KEY,',
    '  email VARCHAR(255) UNIQUE NOT NULL',
    ');',
    '```',
    '',
    '## Unordered lists',
    'Use - for list items:',
    '- Item satu',
    '- Item dua',
    '',
    '## Ordered lists',
    'Use 1. 2. 3. for numbered steps:',
    '1. Langkah pertama',
    '2. Langkah kedua',
    '',
    '## Mermaid Diagrams',
    'Only include if genuinely useful. Follow these EXACT syntax rules.',
    '',
    '### ER Diagram (for database schema)',
    'Two parts: RELATIONSHIPS first, then ENTITY BLOCKS.',
    '',
    'RELATIONSHIPS (go FIRST, one per line):',
    '```mermaid',
    'erDiagram',
    '  USERS ||--o{ DOCUMENTS : creates',
    '  USERS ||--o{ FOLDERS : owns',
    '  DOCUMENTS }o--o| FOLDERS : belongs_to',
    '```',
    '',
    'ENTITY BLOCKS (go AFTER relationships, each entity in its own block):',
    '```mermaid',
    'erDiagram',
    '  USERS {',
    '    uuid id PK',
    '    string email UK',
    '    string password_hash',
    '    timestamp created_at',
    '  }',
    '  DOCUMENTS {',
    '    uuid id PK',
    '    uuid user_id FK',
    '    string title',
    '    text content',
    '    timestamp created_at',
    '  }',
    '```',
    '',
    'ER DIAGRAM STRICT RULES:',
    '- Valid types ONLY: string, int, integer, float, boolean, text, timestamp, datetime, uuid, bigint, numeric',
    '- Key constraints: PK (primary key), FK (foreign key), UK (unique key)',
    '- Cardinality: || (exactly one), o{ (one or many), }o (zero or one), }|{ (many to many)',
    '- Entity names: UPPERCASE_WITH_UNDERSCORES or CamelCase — no spaces',
    '- Relationships MUST come before entity blocks',
    '- Relationship syntax: ENTITY1 cardinality--cardinality ENTITY2 : label',
    '- NO inline attributes on relationship lines — define entities separately in { } blocks',
    '- DO NOT mix relationships and entity blocks on the same line',
    '',
    '### Flowchart (for user flows, system architecture)',
    '```mermaid',
    'flowchart TD',
    '  A[Start] --> B{Decision}',
    '  B -->|Yes| C[Action 1]',
    '  B -->|No| D[Action 2]',
    '  C --> E((End))',
    '  D --> E',
    '```',
    '',
    'FLOWCHART STRICT RULES:',
    '- Start with: flowchart TD (top-down) or flowchart LR (left-right)',
    '- Node shapes: [text] rectangle, (text) rounded, {text} diamond, [[text]] subroutine',
    '- Arrows: --> (normal), -.-> (dotted), --text--> (labeled)',
    '- Node IDs: single words only (A, node1, UserFlow) — NO spaces in IDs',
    '- Node labels: [My Label] — spaces allowed inside brackets only',
    '',
    '## DO NOT include a diagram unless the section genuinely benefits from it.',
    '',
    'PREVIOUSLY GENERATED SECTIONS (for reference):',
    previousSections.length > 0
      ? previousSections.map(s => `[${s.name}]: Already generated with consistent style.`).join('\n')
      : '(None — this is the first section)',
  ].join('\n')

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: `PROJECT: ${industryContext}

CLARIFICATION ANSWERS:
${formatAnswers(clarificationAnswers)}

FEATURE STRUCTURE:
${formatStructure(structureData)}

Generate the "${section.name}" section now. Output ONLY the section content in Markdown format.`,
    },
  ]
}
