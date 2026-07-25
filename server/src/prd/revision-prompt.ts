// PRD Revision Prompt — full-context revision engine
import type { ChatMessage } from '../llm/client.js'

export interface RevisionRequest {
  type: 'add' | 'remove' | 'modify'
  description: string
}

export interface PrdSection {
  id: string
  name: string
  description: string
  priority: number
  is_mandatory: boolean
  content: string | null
}

/**
 * Build prompt for revising a single section with FULL document context.
 * This ensures revisions stay consistent with the overall document.
 */
export function buildRevisionPrompt(
  sectionToRevise: PrdSection,
  allSections: PrdSection[],
  request: RevisionRequest
): ChatMessage[] {
  // Compile full document context (all sections except the one being revised)
  const fullContext = allSections
    .filter(s => s.id !== sectionToRevise.id && s.content)
    .map(s => `--- ${s.name} ---\n${s.content ?? ''}`)
    .join('\n\n')

  const changeInstruction = {
    add: `TAMBAH konten baru ke section ini. User meminta:\n"${request.description}"\n\nTambahkan content baru DI DALAM section yang sudah ada — jangan replace seluruh section.`,
    remove: `HAPUS bagian tertentu dari section ini. User meminta:\n"${request.description}"\n\nHapus hanya bagian yang relevan — jangan replace entire section unless specified.`,
    modify: `UBAH konten section ini. User meminta:\n"${request.description}"\n\nUpdate section dengan content baru yang merefleksikan perubahan yang diminta.`,
  }[request.type]

  return [
    {
      role: 'system',
      content: `You are a technical writer. Revise ONE section of an existing PRD document based on a change request.

CRITICAL CONSTRAINT:
- You are ONLY revising ONE section: "${sectionToRevise.name}"
- Do NOT change any other section
- The full document context below is for CONSISTENCY ONLY — to ensure terminology, tone, and detail level match the rest of the document

FULL DOCUMENT CONTEXT (read only — do not modify these):
${fullContext || '(No other sections generated yet)'}

CHANGE REQUEST:
${changeInstruction}

SECTION TO REVISE: "${sectionToRevise.name}"
SECTION ID: ${sectionToRevise.id}
SECTION DESCRIPTION: ${sectionToRevise.description}

CURRENT CONTENT:
${sectionToRevise.content ?? '(Section has no content yet)'}

OUTPUT RULES:
- Return ONLY the revised section content in Markdown format
- Output valid Markdown only — no markdown code fences, no explanation
- Maintain consistent terminology with the full document context
- Keep the same level of detail and formality
- For "add": insert new content naturally within the existing structure
- For "remove": delete targeted content, keep the rest
- For "modify": replace specific parts while keeping relevant existing content`,
    },
    {
      role: 'user',
      content: `Revise the "${sectionToRevise.name}" section based on this change request: "${request.description}"`,
    },
  ]
}
