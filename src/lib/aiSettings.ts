export interface AiSettings {
  enabled: boolean
  apiKey: string
  baseUrl: string
  model: string
}

const STORAGE_KEY = 'character-ai-settings'

const DEFAULTS: AiSettings = {
  enabled: false,
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
}

/** Railway 部署時設 VITE_AI_PROXY=true，API Key 放 DEEPSEEK_API_KEY 環境變數 */
export function useAiProxy(): boolean {
  return import.meta.env.VITE_AI_PROXY === 'true'
}

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isAiConfigured(): boolean {
  const s = loadAiSettings()
  if (!s.enabled) return false
  if (useAiProxy()) return true
  return s.apiKey.trim().length > 0
}
