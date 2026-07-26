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

OUTPUT SCHEMA (valid JSON only, no markdown, no code blocks):
{
  "tasks": [
    {
      "id": "1",
      "phase": "Fase N: [Phase Name]",
      "feature": "[Feature Name]",
      "task": "[Action-oriented task description in Indonesian — max 10 words]",
      "description": "[Brief technical description — 1 sentence]",
      "effort": "S",
      "is_done": false
    }
  ]
}

RULES:
- effort: "S" (Small, <2h), "M" (Medium, 2-8h), "L" (Large, 8h+)
- Generate 2-5 tasks per feature
- Tasks must be action-oriented: "Buat...", "Implement...", "Tambahkan...", "Setup..."
- Every sub_feature becomes at least 1 task
- group tasks under their feature and phase
- Output ONLY valid JSON — no markdown, no explanation
- Use Indonesian language for task names and descriptions
- is_done is always false (new tasks)`,
    },
    {
      role: 'user',
      content: `Industry: ${industry}

Feature Structure:
${structureStr}`,
    },
  ]
}
