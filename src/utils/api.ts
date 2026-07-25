const API_BASE = '/api'

export interface ApiSettings {
  llmProvider: string
  llmApiKey: string
  llmModel: string
  llmCustomEndpoint?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

function getToken(): string | null {
  return localStorage.getItem('prd_token')
}

function setToken(token: string) {
  localStorage.setItem('prd_token', token)
}

function clearToken() {
  localStorage.removeItem('prd_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(res => {
      setToken(res.token)
      localStorage.setItem('prd_user', JSON.stringify(res.user))
      return res.user
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }).then(() => {
      clearToken()
      localStorage.removeItem('prd_user')
    }),

  me: (): Promise<AuthUser> =>
    request<{ user: AuthUser }>('/auth/me').then(res => res.user),

  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem('prd_user')
    return raw ? JSON.parse(raw) : null
  },

  isLoggedIn: (): boolean => !!getToken(),
}

// Settings
export const settings = {
  get: (): Promise<ApiSettings | null> =>
    request<ApiSettings>('/settings').catch(() => null),

  save: (data: ApiSettings) =>
    request<{ message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Projects
export interface Project {
  id: string
  name: string
  industry: string
  description?: string | null
  isArchived?: number
  createdAt: string
  updatedAt: string
}

export const projects = {
  list: (archived = false): Promise<{ projects: Project[] }> =>
    request<{ projects: Project[] }>(`/projects${archived ? '?archived=true' : ''}`),

  create: (data: { name: string; industry: string; description?: string }) =>
    request<{ id: string; name: string; industry: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    request<{ project: Project; versions: unknown[]; clarificationAnswers: unknown }>(`/projects/${id}`),

  archive: (id: string, archived: boolean) =>
    request<{ message: string }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived: archived }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
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

export interface StructureData {
  phases: StructurePhase[]
}

export const structure = {
  get: (projectId: string): Promise<{ structure: StructureData | null }> =>
    request<{ structure: StructureData | null }>(`/projects/${projectId}/structure`),

  generate: (projectId: string): Promise<{ structure: StructureData }> =>
    request<{ structure: StructureData }>(`/projects/${projectId}/structure/generate`, {
      method: 'POST',
    }),

  save: (projectId: string, structure: StructureData): Promise<{ message: string }> =>
    request<{ message: string }>(`/projects/${projectId}/structure`, {
      method: 'PATCH',
      body: JSON.stringify({ structure }),
    }),
}

// Clarification
export interface ClarifyQuestion {
  id: string
  type: 'text' | 'radio' | 'chip'
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

export const clarify = {
  generate: (projectId: string): Promise<{ questions: ClarifyQuestion[] }> =>
    request<{ questions: ClarifyQuestion[] }>(`/projects/${projectId}/clarify/generate`, {
      method: 'POST',
    }),

  save: (projectId: string, answers: Record<string, string | string[] | null>, skipped: string[]) =>
    request<{ message: string }>(`/projects/${projectId}/clarify`, {
      method: 'POST',
      body: JSON.stringify({ answers, skipped }),
    }),

  get: (projectId: string) =>
    request<{ questions: ClarifyQuestion[]; answers: Record<string, string | string[] | null> | null; skipped: string[] }>(
      `/projects/${projectId}/clarify`
    ),
}

// ─── PRD — Dynamic Sections ────────────────────────────────────────

export interface PrdSection {
  id: string
  name: string
  description: string
  priority: number
  is_mandatory: boolean
  content: string | null
  order: number
}

export interface PrdData {
  tier: number
  tier_reason: string
  flags: string[]
  sections: PrdSection[]
  skipped_sections: Array<{ id: string; reason: string }>
}

export interface SSEEventMap {
  outline_confirmed: { section_count: number; sections: Array<{ id: string; name: string }> }
  generating: { current_section: string; section_name: string; progress: number }
  section_complete: { section_id: string; content: string }
  section_error: { section_id: string; error: string; retryable: boolean }
  complete: { project_id: string; sections_generated: number; total_sections: number }
  fatal_error: { code: string; message: string; action: string }
}

export type SSEEventType = keyof SSEEventMap

export const prd = {
  get: (projectId: string): Promise<{ prdData: PrdData | null; status: string }> =>
    request<{ prdData: PrdData | null; status: string }>(`/projects/${projectId}/prd`),

  generateOutline: (projectId: string): Promise<{ prdData: PrdData }> =>
    request<{ prdData: PrdData }>(`/projects/${projectId}/prd/outline`, {
      method: 'POST',
    }),

  updateSections: (projectId: string, sections: PrdSection[]): Promise<{ message: string }> =>
    request<{ message: string }>(`/projects/${projectId}/prd/sections`, {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    }),

  /**
   * SSE stream via fetch + ReadableStream — more reliable than EventSource
   * Supports POST (can pass data), proper error handling with HTTP status
   */
  generateContent: (
    projectId: string,
    handlers: Partial<{
      [K in SSEEventType]: (data: SSEEventMap[K]) => void
    }>
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const token = localStorage.getItem('prd_token')

      try {
        const res = await fetch(`/api/projects/${projectId}/prd/generate${token ? `?token=${encodeURIComponent(token)}` : ''}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        })

        if (!res.ok) {
          let msg = `HTTP ${res.status}`
          try {
            const body = await res.json()
            msg = body.error || msg
          } catch {}
          reject(new Error(msg))
          return
        }

        if (!res.body) {
          reject(new Error('SSE connection error: no response body'))
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let currentEventType: SSEEventType | '' = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEventType = line.slice(7).trim() as SSEEventType
              continue
            }
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (!data || !currentEventType) continue

              try {
                const parsed = JSON.parse(data)
                switch (currentEventType) {
                  case 'outline_confirmed':
                    handlers.outline_confirmed?.(parsed as SSEEventMap['outline_confirmed'])
                    break
                  case 'generating':
                    handlers.generating?.(parsed as SSEEventMap['generating'])
                    break
                  case 'section_complete':
                    handlers.section_complete?.(parsed as SSEEventMap['section_complete'])
                    break
                  case 'section_error':
                    handlers.section_error?.(parsed as SSEEventMap['section_error'])
                    break
                  case 'complete':
                    handlers.complete?.(parsed as SSEEventMap['complete'])
                    break
                  case 'fatal_error':
                    handlers.fatal_error?.(parsed as SSEEventMap['fatal_error'])
                    break
                }
              } catch {}
            }
          }
        }

        resolve()
      } catch (err) {
        reject(new Error(err instanceof Error ? err.message : 'SSE connection error'))
      }
    })
  },

  updateSectionContent: (projectId: string, sectionId: string, content: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/projects/${projectId}/prd/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  reviseSection: (
    projectId: string,
    sectionId: string,
    type: 'add' | 'remove' | 'modify',
    description: string
  ): Promise<{ proposed_content: string; section_id: string }> =>
    request<{ proposed_content: string; section_id: string }>(
      `/projects/${projectId}/prd/sections/${sectionId}/revise`,
      {
        method: 'POST',
        body: JSON.stringify({ type, description }),
      }
    ),

  regenerateOutline: (projectId: string): Promise<{ prdData: PrdData }> =>
    request<{ prdData: PrdData }>(`/projects/${projectId}/prd/regenerate-outline`, {
      method: 'POST',
    }),
}

