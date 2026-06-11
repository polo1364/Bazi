import type { AnalysisResult, BirthInput } from '../types'
import { pillarsToArray } from './bazi'
import { loadAiSettings, useAiProxy } from './aiSettings'

export interface AiNarrativeResult {
  summary: string
  detailText: string
  topicAnalysis: string
}

function buildChartContext(input: BirthInput, result: AnalysisResult): string {
  const { chart, strength, strengthLabel, favorableElements, elementStats, pattern, relations, shensha, liunian, wuge } = result
  const pillars = pillarsToArray(chart)
  const topic = input.topic || '整體運勢'
  const year = input.analysisYear || new Date().getFullYear()

  const lines = [
    `【基本】姓名：${input.name || '未提供'}｜性別：${input.gender || '未提供'}｜分析年份：${year}年｜主題：${topic}`,
    input.query.trim() ? `【自訂問題】${input.query.trim()}` : '',
    `【四柱】${pillars.map((p) => `${p.label}${p.stem}${p.branch}（${p.tenGod}·${p.nayin}）`).join('、')}`,
    `【日主】${chart.dayMaster}（${chart.dayMasterElement}）｜身${strengthLabel}（約${strength}%）｜喜用：${favorableElements.join('、')}`,
    `【格局】${pattern}`,
    `【五行分佈】木${elementStats.木.toFixed(1)} 火${elementStats.火.toFixed(1)} 土${elementStats.土.toFixed(1)} 金${elementStats.金.toFixed(1)} 水${elementStats.水.toFixed(1)}`,
    result.daymasterProfile ? `【日主特性】${result.daymasterProfile}` : '',
    relations.length
      ? `【刑沖合害】${relations.map((r) => `${r.type}：${r.label}（${r.desc}）`).join('；')}`
      : '【刑沖合害】無明顯刑沖',
    shensha.length
      ? `【神煞】${shensha.map((s) => `${s.name}（${s.type}）${s.desc}`).join('；')}`
      : '',
    `【${year}流年】${liunian.find((l) => l.year === year)?.pillar ?? ''} ${liunian.find((l) => l.year === year)?.tenGod ?? ''} ${liunian.find((l) => l.year === year)?.nayin ?? ''}`,
  ]

  if (wuge && wuge.總格 > 0) {
    lines.push(
      `【姓名五格】天${wuge.天格}(${wuge.luck.天格}) 人${wuge.人格}(${wuge.luck.人格}) 地${wuge.地格}(${wuge.luck.地格}) 外${wuge.外格}(${wuge.luck.外格}) 總${wuge.總格}(${wuge.luck.總格})`,
    )
    if (wuge.sancai) lines.push(`【三才】${wuge.sancai.title}（${wuge.sancai.luck}）${wuge.sancai.meaning}`)
    const chars = wuge.charAnalysis.map((c) => `${c.char}${c.strokes}劃·${c.wuxing}·${c.meaning}`).join('、')
    if (chars) lines.push(`【逐字】${chars}`)
  }

  return lines.filter(Boolean).join('\n')
}

function parseAiJson(content: string): AiNarrativeResult {
  let text = content.trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) text = fenced[1].trim()

  const parsed = JSON.parse(text) as Partial<AiNarrativeResult>
  if (!parsed.summary || !parsed.detailText || !parsed.topicAnalysis) {
    throw new Error('AI 回覆格式不完整')
  }
  return {
    summary: parsed.summary.trim(),
    detailText: parsed.detailText.trim(),
    topicAnalysis: parsed.topicAnalysis.trim(),
  }
}

async function callDeepSeek(
  settings: ReturnType<typeof loadAiSettings>,
  messages: { role: string; content: string }[],
): Promise<string> {
  const payload = {
    model: settings.model,
    messages,
    temperature: 0.75,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  }

  if (useAiProxy()) {
    const res = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(err.error || `代理 API 錯誤 (${res.status})`)
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('AI 未回傳內容')
    return content
  }

  const base = settings.baseUrl.replace(/\/$/, '')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`DeepSeek API 錯誤 (${res.status})${errText ? `：${errText.slice(0, 120)}` : ''}`)
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 未回傳內容')
  return content
}

export async function generateAiNarrative(
  input: BirthInput,
  result: AnalysisResult,
): Promise<AiNarrativeResult> {
  const settings = loadAiSettings()
  const proxy = useAiProxy()

  if (!settings.enabled) {
    throw new Error('尚未啟用 AI 解讀')
  }
  if (!proxy && !settings.apiKey.trim()) {
    throw new Error('尚未設定 DeepSeek API Key')
  }

  const context = buildChartContext(input, result)
  const topic = input.topic || '整體運勢'
  const name = input.name.trim() || '這位朋友'

  const messages = [
    {
      role: 'system',
      content: `你是溫暖、專業的八字與姓名合參顧問。請依提供的命盤資料撰寫解讀：
- 語氣親切自然，像面對面交談，有溫度、具體、不空泛
- 只使用資料中已有的數據，不得捏造四柱、數值或神煞
- 可給務實建議，但避免絕對化斷語（如「一定發財」）
- 一律使用繁體中文`,
    },
    {
      role: 'user',
      content: `請為「${name}」撰寫命盤解讀。

${context}

請輸出 JSON（純 JSON，不要 markdown 程式碼框），格式：
{
  "summary": "命盤總結：3-5 個短段落，用 \\n\\n 分隔。含日主性格、身強弱與喜用、格局與五行重點、姓名五格（若有）。",
  "detailText": "完整解讀：一段較長的連貫文字，整合四柱、生肖、神煞、流年與姓名，約 200-350 字。",
  "topicAnalysis": "針對「${topic}」主題的專項分析，約 150-250 字，結合 ${input.analysisYear} 流年。"
}`,
    },
  ]

  const content = await callDeepSeek(settings, messages)
  return parseAiJson(content)
}
