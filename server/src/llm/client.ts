// LLM client supporting multiple providers
// All API calls use OpenAI-compatible chat completions format

export interface LLMConfig {
  provider: string
  apiKey: string
  model: string
  baseUrl?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  ollama: 'http://localhost:11434/v1',
}

function getBaseUrl(provider: string, customUrl?: string): string {
  if (customUrl) return customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl
  return DEFAULT_BASE_URLS[provider] ?? 'https://api.openai.com/v1'
}

export async function chatCompletion(
  config: LLMConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const baseUrl = getBaseUrl(config.provider, config.baseUrl)

  // Build headers based on provider
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Provider-specific auth
  switch (config.provider) {
    case 'openai':
    case 'groq':
    case 'openrouter':
      headers['Authorization'] = `Bearer ${config.apiKey}`
      break
    case 'anthropic':
      headers['x-api-key'] = config.apiKey
      headers['anthropic-version'] = '2023-06-01'
      break
    case 'ollama':
      headers['Authorization'] = `Bearer ${config.apiKey || 'ollama'}`
      break
    case 'custom':
      headers['Authorization'] = `Bearer ${config.apiKey}`
      break
  }

  // Build request body based on provider
  let body: Record<string, unknown>

  if (config.provider === 'anthropic') {
    // Anthropic uses messages format with extra params
    const systemMsg = messages.find(m => m.role === 'system')
    body = {
      model: config.model,
      messages: messages.filter(m => m.role !== 'system'),
      max_tokens: 4096,
      ...(systemMsg ? { system: systemMsg.content } : {}),
    }
  } else {
    // OpenAI-compatible format
    body = {
      model: config.model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM API error ${res.status}: ${text}`)
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }>; content?: Array<{ text?: string }> }

  // OpenAI-compatible response
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }

  // Anthropic response format (might use content block)
  if (data.content?.[0]?.text) {
    return data.content[0].text
  }

  return ''
}

export function buildClarifyPrompt(industry: string, description?: string): ChatMessage[] {
  const industryContext = description
    ? `Project description: ${description}\nIndustry: ${industry}`
    : `Industry: ${industry}`

  return [
    {
      role: 'system',
      content: `You are an expert PRD consultant. Generate exactly 5 clarification questions for a new project based on the industry and description provided.

Rules:
- Q1 MUST be a text question about the primary goal / problem to solve (required)
- Q2-Q5 should be a mix of radio (single choice) and chip (multiple choice) questions
- Each question must be directly relevant to creating a comprehensive PRD
- Output ONLY valid JSON array matching this schema exactly:
[
  {"id":"q1","type":"text","label":"...","required":true,"placeholder":"..."},
  {"id":"q2","type":"radio","label":"...","required":false,"options":["A","B","C"]},
  {"id":"q3","type":"chip","label":"...","required":false,"options":["A","B","C","D"]},
  {"id":"q4","type":"radio","label":"...","required":false,"options":["A","B","C"]},
  {"id":"q5","type":"chip","label":"...","required":false,"options":["A","B","C","D"]}
]
- No markdown, no code blocks, no explanation — pure JSON array only
- Questions in Indonesian language
- Labels should be specific to the ${industry} industry`,
    },
    {
      role: 'user',
      content: `Generate 5 clarification questions for this project:\n${industryContext}`,
    },
  ]
}
