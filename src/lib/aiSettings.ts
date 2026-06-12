import type { AiTone } from '../types'

export interface AiSettings {
  enabled: boolean
  apiKey: string
  baseUrl: string
  model: string
  tone: AiTone
}

const STORAGE_KEY = 'character-ai-settings'

const DEFAULTS: AiSettings = {
  enabled: false,
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  tone: 'plain',
}

/** Railway 部署時設 VITE_AI_PROXY=true，API Key 放 DEEPSEEK_API_KEY 環境變數 */
export function useAiProxy(): boolean {
  return import.meta.env.VITE_AI_PROXY === 'true'
}

export function loadAiSettings(): AiSettings {
  const proxyDefaults = useAiProxy() ? { ...DEFAULTS, enabled: true } : DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...proxyDefaults }
    const settings = { ...proxyDefaults, ...JSON.parse(raw) }
    return useAiProxy() ? { ...settings, enabled: true, apiKey: '' } : settings
  } catch {
    return { ...proxyDefaults }
  }
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isAiConfigured(): boolean {
  if (useAiProxy()) return true
  const s = loadAiSettings()
  if (!s.enabled) return false
  return s.apiKey.trim().length > 0
}
