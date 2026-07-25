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

  return [
    {
      role: 'system',
      content: `You are a technical writer. Write the content for ONE section of a PRD document.

SECTION TO GENERATE:
- Name: ${section.name}
- Description: ${section.description}
- Priority: ${section.priority}${section.is_mandatory ? ' (mandatory)' : ''}

OUTPUT REQUIREMENTS:
- Write in Bahasa Indonesia (Indonesian language)
- Minimum 200 words per section
- Use proper Markdown formatting (headings, lists, tables where appropriate)
- If this section benefits from a diagram, use Mermaid syntax (flowchart TB, or ER diagram for DB schema)
- If no diagram needed, use only Markdown text
- Do NOT add duplicate section titles/headings at the top — the section name will be used as the heading
- Be specific and actionable — avoid generic filler content
- Maintain consistent terminology and detail level with other sections${previousContext}

PREVIOUSLY GENERATED SECTIONS (for reference):
${previousSections.length > 0
    ? previousSections.map(s => `[${s.name}]: Already generated with consistent style.`)
      .join('\n')
    : '(None — this is the first section)'}`,
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
