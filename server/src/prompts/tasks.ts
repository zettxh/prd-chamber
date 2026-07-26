// Task Breakdown Prompt — generate tasks from structure data
import type { ChatMessage } from '../llm/client.js'

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

export function buildTasksPrompt(
  industry: string,
  structureData: { phases: StructurePhase[] } | null
): ChatMessage[] {
  const structureStr = structureData
    ? structureData.phases.map(phase => {
        const features = phase.features.map(f => {
          const subs = (f.sub_features || []).map(s => `  - ${s}`).join('\n')
          return `  ${f.name}${f.description ? `: ${f.description}` : ''}${subs ? '\n' + subs : ''}`
        }).join('\n')
        return `[Fase ${phase.phase_number}] ${phase.phase_name}\n${features}`
      }).join('\n\n')
    : '(none)'

  return [
    {
      role: 'system',
      content: `You are a senior software engineer. Given a feature structure, generate a detailed task breakdown for implementation.

CRITICAL: Output MUST be a valid JSON object with a "tasks" array. Nothing else.

Example format:
{"tasks":[{"id":"1","phase":"Fase 1: Auth","feature":"Login","task":"Buat halaman login","description":"Implement login form","effort":"S","is_done":false}]}

RULES:
- Output ONLY the JSON object — no markdown, no code blocks, no explanation, no text before or after
- effort: "S" or "M" or "L" (S=small <2h, M=medium 2-8h, L=large 8h+)
- Generate 2-5 tasks per feature
- Tasks action-oriented in Indonesian: "Buat...", "Implement...", "Tambahkan...", "Setup..."
- Every sub_feature becomes at least 1 task
- is_done is always false (no quotes — it is a boolean)`,
    },
    {
      role: 'user',
      content: `Industry: ${industry}

Feature Structure:
${structureStr}`,
    },
  ]
}
