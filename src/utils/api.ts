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
