// PRD Outline Prompt — TIER classification + section recommendation
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

export interface ClarifyAnswers {
  [key: string]: string | string[] | null
}

export function buildOutlinePrompt(
  industry: string,
  description: string | null | undefined,
  clarificationAnswers: ClarifyAnswers,
  structureData: { phases: StructurePhase[] } | null
): ChatMessage[] {
  const answersStr = Object.entries(clarificationAnswers)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value ?? ''}`)
    .join('\n')

  const structureStr = structureData
    ? JSON.stringify(structureData, null, 2)
    : '(none)'

  const industryContext = description
    ? `${industry} — ${description}`
    : industry

  return [
    {
      role: 'system',
      content: `You are a product architect. Classify the project type and recommend PRD sections.

TIER CLASSIFICATION RULES (apply in order — pick the FIRST matching tier):
- TIER 1 — Tool/Web: single-page, static, no backend (e.g. landing page, calculator, portfolio)
- TIER 2 — Web App: server-rendered pages, simple database (e.g. blog, CMS, basic CRUD)
- TIER 3 — Full-Stack App: auth, REST/GraphQL API, complex DB schema (e.g. SaaS, marketplace)
- TIER 4 — Platform: multi-tenant, third-party integrations, payment (e.g. platforms, B2B SaaS)
- TIER 5 — Consumer App: mobile-first, offline support, push notifications (e.g. mobile app)
- TIER 6 — Enterprise/Internal: complex permissions, compliance, audit trail (e.g. internal tools)

SPECIAL FLAGS (additive — mark all that apply):
- has_payments: payment gateway, billing, subscription
- has_notifications: email, SMS, push, in-app notifications
- has_file_uploads: media storage, document handling, CDN
- has_i18n: multi-language support
- has_real_time: WebSocket, live updates, chat, collaboration
- has_ai_ml: AI features, ML model integration, LLM usage
- has_multi_tenant: multi-tenant / multi-org support
- has_analytics: dashboards, reports, user tracking
- has_export: data export (PDF, CSV, Excel)

SECTION RECOMMENDATIONS (3-8 sections based on tier + flags):
- TIER 1: Executive Summary, Core Features, User Flow, Implementation Notes
- TIER 2: + Functional Requirements, System Architecture
- TIER 3: + Database Schema, API Design
- TIER 4: + Security Considerations, Scalability Notes, Third-Party Integrations
- TIER 5: + Mobile Spec, Offline-First Strategy, App Store Considerations
- TIER 6: + Compliance & Security, Deployment Strategy, User Permissions

MANDATORY: Executive Summary is ALWAYS included (is_mandatory: true, priority: 1).

OUTPUT SCHEMA (valid JSON only, no markdown, no explanation):
{
  "tier": 1-6,
  "tier_reason": "short explanation why this tier was chosen",
  "flags": ["flag1", "flag2"],
  "sections": [
    {
      "id": "section-id",
      "name": "Section Name in Indonesian",
      "description": "Brief description of what this section covers (1-2 sentences)",
      "priority": 1-10,
      "is_mandatory": false
    }
  ],
  "skipped_sections": [
    {
      "id": "section-id",
      "reason": "Why this section is not needed for this project"
    }
  ]
}

RULES:
- Section count: 3-8 sections total (tier baseline + flag additions)
- Executive Summary: is_mandatory=true, priority=1
- Every section must have a unique id (kebab-case, e.g. "system-architecture")
- Use Indonesian language for section names and descriptions
- Output ONLY valid JSON — no markdown, no code blocks, no explanation
- Be accurate and deterministic — no creative free-form`,
    },
    {
      role: 'user',
      content: `Industry: ${industryContext}

Clarification Answers:
${answersStr || '(not answered)'}

Feature Structure:
${structureStr}`,
    },
  ]
}
