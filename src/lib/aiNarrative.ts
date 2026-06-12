import type { AiSections, AnalysisResult, BirthInput } from '../types'
import { pillarsToArray } from './bazi'
import { loadAiSettings, useAiProxy } from './aiSettings'
import { buildPillarNarrative, buildPillarNaturalSummary } from './narrative/pillarNarrative'

export interface AiNarrativeResult {
  summary: string
  detailText: string
  topicAnalysis: string
  sections: AiSections
}

const TONE_TEXT = {
  professional: '專業版：條理清楚、用詞精準，像正式命理報告。',
  plain: '白話版：自然好懂，少用艱深術語，像朋友解釋。',
  elder: '長輩版：語氣溫和穩重，多提醒修心、健康與家庭和諧。',
  master: '命理老師版：可使用命理術語，但每段要落到具體建議。',
} as const

export const AI_FORBIDDEN_TERMS = [
  '金水喜用之年',
  '大利金水',
  '金水旺年',
  '喜用神到位',
  '必定發財',
  '必定成功',
  '必定婚姻不順',
  '必定富貴',
  '必定有財',
  '必定高學歷',
  '必有血光',
  '必定失敗',
  '必定孤獨',
  '必定破財',
  '必有災',
  '必破財',
  '凶煞聚集',
  '元辰必定不好',
  '大耗必定破財',
  '咸池必桃花劫',
  '純正官格',
  '純殺格',
  '喜用神絕對為金水',
  '必定喜金水',
  '身弱必發不了財',
  '身強必富',
  '一定升遷',
  '必定升遷',
  '身弱不能賺錢',
  '保證大吉',
  '姓名保證大吉',
  '財運大爆發',
  '姓名五格皆吉',
  '五格大吉',
  '總格大吉',
  '姓名大吉',
  '三才平和',
  '有助財運穩定',
  '吉神匯聚',
  '辰自刑',
  '申子辰水局',
  '申子辰半合水局',
  '子丑合土',
  '合化土',
  '正月己丑',
  '時支藏癸為水強根',
  '正月庚寅、二月辛卯，金水印星透出',
  '三月壬辰、四月癸巳，水比劫幫身，團隊合作順利',
  '冬月庚子、臘月辛丑，金水印比幫身，年終收尾順利',
  '日柱癸丑正官',
  '日柱癸丑為正官',
  '日干癸為正官',
  '日支丑為正官',
  '年柱丁卯偏財',
  '月柱甲辰傷官',
  '時柱壬子劫財',
  '尚未產生 AI 喜用補強建議',
  '身強弱：偏弱，系統初判',
  '命局水偏旺，土亦重',
  '有助於平衡命局能量',
  '保證開運',
  '必定有效',
  '一定改善',
  '絕對準確',
  '命中注定不可改',
] as const

export const AI_ALLOWED_FACTS = [
  '2026 年為丙午年；對癸水日主而言，丙火 = 正財，午火 = 火旺之地。',
  '2026 只能描述為火旺財星之年、正財透出、財星明顯、財旺亦有耗身與壓力。',
  '若命局為中和偏弱或偏弱初判，財旺可代表收入、薪資、績效、資源機會增加，也代表責任、支出、壓力加重。',
  '2026 年適合本業加薪、績效獎金、制度內爭取資源；不宜過度投機、高槓桿、衝動投資。',
  '2026 丙午年節氣正月必須是庚寅，不得寫己丑。',
  '姓名五格目前標示為待校驗時，需標示待校驗；若 81 數理與三才已由資料表判讀，應寫結果僅供參考，不作保證性結論。',
  '姓名五格目前只允許描述康熙筆畫與五格數值。不得輸出吉凶結論，例如姓名五格皆吉、五格大吉、姓名大吉、三才平和。',
  '姓名學只能根據系統提供的康熙筆畫、五格數理與三才配置結果改寫，不得自行新增吉凶結論。',
  '神煞只能引用系統 shensha.items 中 verified === true 的結果。不得自行新增神煞，不得使用「吉神匯聚」這類總結。',
  '紅鸞、天喜、天德、月德即使成立，也只能保守描述，不得寫必定婚喜、必有喜事、保證逢凶化吉。',
  '福星、祿神、羊刃、學堂、空亡即使成立，也只能保守描述，不得寫必定富貴、必定有財、必有血光、必定高學歷、必定失敗。',
  '學堂採子平日干長生版；羊刃採陽干羊刃版；空亡採日柱旬空版。不得混用其他流派結果。',
  '孤辰、寡宿、亡神、劫煞、災煞、天赦即使命中，也只能保守描述，不得寫必定孤獨、必定婚姻不順、必定破財、必有血光、一定逢凶化吉。',
  '元辰、大耗、咸池等神煞只能引用系統結果。大耗於本系統視為元辰別名，不得自行輸出破財、災禍等絕對斷語。',
  '身強弱、喜用神、格局只能引用 strengthV2Engine 的結果，不得自行改判。',
  '不得將正官格傾向寫成純正官格；格局只作傾向判斷，需配合透干、通根、制化與大運流年。',
  '不得寫「喜用神絕對為金水」，應寫「系統初判喜用金、水，仍需搭配大運流年」。',
  '不得寫「身弱必發不了財」「身強必富」；身強弱不能單獨決定財富結果。',
  '歲運（大運、流年、流月）解讀只能引用 fortuneV2Engine 結果，不得自行改判吉凶。',
  '不得將財星流年直接寫成必定發財、大財年或大利財運；應寫財務機會與耗身壓力並存。',
  '不得將壓力年份或月份寫成必有災、必定破財；風險議題只能保守提示。',
  '不得寫一定升遷、身弱不能賺錢；事業與財務結果需看大運扶身、承接能力與實際情境。',
  '所有姓名學文案必須根據 nameAnalysis 的 verified 狀態判斷；不得使用舊文案稱 81 數理或三才尚未校驗，除非資料真的未驗證。',
  '流年文案必須根據 tenGodNarrativeTemplate，不得讓劫財套用財星文案，不得讓傷官套用官殺文案。',
  '若年度跨越大運切換，必須分段描述，不得整年只用切換後大運。',
  '若年度跨越大運切換，必須以 splitYearByLuckTransition 的 segments 分段描述，不得整年只寫切換後大運。',
  '姓名學若 81 數理與三才已由資料表判讀，不得再寫吉凶待校驗；應寫結果僅供參考，不作保證性結論。',
  '五行簡化模型與旺衰 v2 並存時，正式身強弱以旺衰 v2 為準。',
  '流月段落必須引用 fortuneV2Engine 的 monthImpacts，不得自行泛化為金水印星透出、水比劫幫身、年終順利等籠統結論。',
  '節氣流月干支參考表必須與歲運 v2 的月分類一致，不得一邊說壓力較高，一邊說此月平穩。',
  '描述四柱時，不得將整柱直接簡化為單一十神。請分清天干十神與地支主氣十神。',
  '日柱癸丑不可寫成正官。日干癸為日主；日支丑主氣己土，對癸水為七殺。',
  '描述四柱時，必須使用系統 buildPillarNarrative 的結果。不得寫「年柱丁卯偏財」這種整柱簡化句，應寫「年柱丁卯為偏財坐食神」。',
  '月柱甲辰需寫成傷官坐正官；時柱壬子需寫成劫財坐比肩；日柱癸丑需寫成日主坐七殺之地。',
  '若喜用補強沒有 AI 生成內容，請使用系統 usefulGods fallback，不得輸出「尚未產生 AI 喜用補強建議」。',
  '封面與報告總覽的身強弱必須使用 strengthV2Engine 的 label，不得使用舊版簡化模型 label。',
  '健康段落若提到水較旺，必須說明是五行簡化模型分數較高；正式日主旺衰仍以旺衰 v2 結果為準。',
  '喜用補強只可作生活化參考，不得寫保證開運、必定有效、有助於平衡命局能量等保證性文字。',
  'PDF 最末頁的白話總結必須依 reportData 的實際結果生成，不得只寫通用術語表。',
  '不得重新判斷命理結果，只能引用系統已產生的 strengthV2、fortuneV2、nameAnalysis、shensha 結果。',
  '白話總結要解釋為什麼此命盤判為中和偏弱／身偏弱，為什麼喜用金水，為什麼 2026 是機會與壓力並存，而不是必定發財。',
  '白話總結要像有人用白話解釋報告，每段最多 3 到 5 句，避免連續堆疊命理術語。',
  '白話總結不要使用亦、故、宜、此命、原局等文言感較重的詞；能寫壓力就不要寫官殺壓力，能寫消耗力氣就不要寫耗身。',
  '白話總結不得出現癸水日主，也就是癸水日主、喜用金水重複句或連續句號。',
  '六合只列合，未實作合化條件前不得寫合化或合化五行。',
] as const

export const AI_SELF_CHECK_TEXT = `輸出前請逐字檢查，文案不得包含以下詞句：${AI_FORBIDDEN_TERMS.join('、')}。若原本想寫以上內容，必須改寫為規則引擎允許的保守版本。`

export function buildAiSafetyPrompt(): string {
  return [
    '【硬性規則，必須遵守】',
    ...AI_ALLOWED_FACTS.map((rule) => `- ${rule}`),
    '- 你只能改寫語氣，不得新增命理結論；四柱、十神、藏干、刑沖合害、五行、身強弱、流年、流月、姓名五格狀態、神煞狀態均以規則引擎資料為準。',
    '- 2026 丙午只能描述為火旺財星之年，不得描述為金水喜用之年。',
    '- 姓名五格目前只允許描述康熙筆畫與五格數值。不得輸出吉凶結論，例如姓名五格皆吉、五格大吉、姓名大吉、三才平和。',
    '- 姓名學只能根據系統提供的康熙筆畫、五格數理與三才配置結果改寫，不得自行新增吉凶結論。',
    '- 不得使用保證性文字，例如必定、一定、保證、大發、必然破財。',
    '- 舊資料不足時仍以「姓名筆畫與字五行尚待校驗，未輸出吉凶定論」表述，不得推估字五行或三才吉凶。',
    '- 如需提及姓名，只能寫「姓名筆畫已依康熙筆畫資料庫計算，五格數值可供參考，吉凶仍待 81 數理與三才表校驗」。',
    '- 神煞只能引用系統 shensha.items 中 verified === true 的結果。不得自行新增神煞，不得使用「吉神匯聚」這類總結。',
    '- 紅鸞、天喜、天德、月德即使成立，也只能保守描述，不得寫必定婚喜、必有喜事、保證逢凶化吉。',
    '- 福星、祿神、羊刃、學堂、空亡即使成立，也只能保守描述，不得寫必定富貴、必定有財、必有血光、必定高學歷、必定失敗。',
    '- 學堂採子平日干長生版；羊刃採陽干羊刃版；空亡採日柱旬空版。不得混用其他流派結果。',
    '- 孤辰、寡宿、亡神、劫煞、災煞、天赦即使命中，也只能保守描述，不得寫必定孤獨、必定婚姻不順、必定破財、必有血光、一定逢凶化吉。',
    '- 元辰、大耗、咸池等神煞只能引用系統結果。大耗於本系統視為元辰別名，不得自行輸出破財、災禍等絕對斷語。',
    '- 未驗證神煞只能寫尚未驗證，不可寫成立。',
    '- 不得寫「辰自刑」。',
    '- 不得寫「申子辰水局」。',
    '- 不得寫「申子辰半合水局」。',
    '- 不得寫「子丑合土」或「合化土」，除非系統資料明確標示合化條件已實作。',
    '- 不得寫「姓名五格皆吉」「五格大吉」「總格大吉」「姓名大吉」「三才平和」「有助財運穩定」「姓名保證大吉」。',
    '- 不得寫「吉神匯聚」。',
    `【自我檢查】${AI_SELF_CHECK_TEXT}`,
  ].join('\n')
}

function escapeControlCharsInJsonStrings(text: string): string {
  let output = ''
  let inString = false
  let escaped = false

  for (const char of text) {
    if (escaped) {
      output += char
      escaped = false
      continue
    }

    if (char === '\\') {
      output += char
      escaped = true
      continue
    }

    if (char === '"') {
      output += char
      inString = !inString
      continue
    }

    if (inString) {
      if (char === '\n') {
        output += '\\n'
        continue
      }
      if (char === '\r') continue
      if (char === '\t') {
        output += '\\t'
        continue
      }
    }

    output += char
  }

  return output.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
}

export function buildChartContext(input: BirthInput, result: AnalysisResult): string {
  const {
    chart, strength, strengthLabel, strengthV2, fortuneV2, favorableElements, elementStats, pattern, relations, shensha,
    liunian, liuyueDetails, dayunDetails, tenYearTrend, elementAdvice, wuge,
  } = result
  const pillars = pillarsToArray(chart)
  const topic = input.topic || '整體運勢'
  const year = input.analysisYear || new Date().getFullYear()

  const lines = [
    `【基本】姓名：${input.name || '未提供'}｜性別：${input.gender || '未提供'}｜分析年份：${year}年｜主題：${topic}`,
    input.query.trim() ? `【自訂問題】${input.query.trim()}` : '',
    `【四柱摘要】${pillars.map((p) => buildPillarNaturalSummary({
      pillarName: p.label,
      stem: p.stem,
      branch: p.branch,
      stemTenGod: p.stemTenGod,
      branchMainQi: p.branchMainQi,
      hiddenStems: p.hiddenStemTenGods,
    })).join('、')}`,
    `【四柱十神明細】${pillars.map((p) => buildPillarNarrative({
      pillarName: p.label,
      stem: p.stem,
      branch: p.branch,
      stemTenGod: p.stemTenGod,
      branchMainQi: p.branchMainQi,
      hiddenStems: p.hiddenStemTenGods,
    })).join('；')}。此處以天干十神與地支主氣十神分開描述，不將整柱簡化為單一十神。`,
    `【日主】${chart.dayMaster}（${chart.dayMasterElement}）｜身${strengthLabel}（約${strength}%）｜喜用：${favorableElements.join('、')}`,
    strengthV2
      ? `【旺衰v2】${strengthV2.label}（可信度${strengthV2.confidence}，系統分數${strengthV2.score}）｜得令：${strengthV2.deLing.status}；得地：${strengthV2.deDi.status}；得勢：${strengthV2.deShi.status}｜系統初判喜用：${strengthV2.usefulGods.useful.join('、')}；需留意：${strengthV2.usefulGods.avoid.map((a) => a.element).join('、')}。身強弱、喜用、格局只能引用此結果，不得自行改判，不得寫純正官格或喜用神絕對為金水。`
      : '',
    strengthV2 ? `【格局傾向】${strengthV2.pattern.patternLabel}（${strengthV2.pattern.warning}）` : '',
    fortuneV2
      ? `【歲運v2·大運】${fortuneV2.luckCycleImpact ? `${fortuneV2.luckCycleImpact.pillar}：${fortuneV2.luckCycleImpact.overall}` : '起運未驗證，僅以流年流月初判'}`
      : '',
    fortuneV2
      ? `【歲運v2·流年】${fortuneV2.yearImpact.year}${fortuneV2.yearImpact.pillar}：${fortuneV2.yearImpact.theme}｜結論：${fortuneV2.yearImpact.conclusion}｜系統等級：${fortuneV2.yearImpact.score.level}（分數${fortuneV2.yearImpact.score.score}）。歲運只能引用此結果，不得自行改判，不得寫必定發財、大財年、必有災、一定升遷。`
      : '',
    fortuneV2
      ? `【歲運v2·流月重點】支持：${fortuneV2.yearSummary.keyMonths.supportive.join('、') || '無'}；壓力：${fortuneV2.yearSummary.keyMonths.pressure.join('、') || '無'}`
      : '',
    fortuneV2?.luckTransition?.hasTransition
      ? `【歲運v2·大運切換】${fortuneV2.yearImpact.year}年跨越大運切換：切換前以${fortuneV2.luckTransition.segments[0]?.luckCycle}大運為背景，切換後以${fortuneV2.luckTransition.segments[1]?.luckCycle}大運為背景。`
      : '',
    result.nameSummary ? `【姓名學】${result.nameSummary}` : '',
    `【格局】${pattern}`,
    `【五行分佈】木${elementStats.木.toFixed(1)} 火${elementStats.火.toFixed(1)} 土${elementStats.土.toFixed(1)} 金${elementStats.金.toFixed(1)} 水${elementStats.水.toFixed(1)}`,
    result.daymasterProfile ? `【日主特性】${result.daymasterProfile}` : '',
    relations.length
      ? `【刑沖合害】${relations.map((r) => `${r.type}：${r.label}（${r.desc}）`).join('；')}`
      : '【刑沖合害】無明顯刑沖',
    shensha.some((s) => s.verified === true)
      ? `【神煞】${shensha.filter((s) => s.verified === true).map((s) => `${s.name}${s.status}：${s.basis}，${s.description || s.desc}`).join('；')}。只能引用此處已驗證結果，不得自行新增神煞或寫吉神匯聚。`
      : '【神煞】公式尚未完整校驗，本次不作神煞吉凶結論',
    `【${year}流年】${liunian.find((l) => l.year === year)?.pillar ?? ''} ${liunian.find((l) => l.year === year)?.tenGod ?? ''} ${liunian.find((l) => l.year === year)?.nayin ?? ''}`,
    dayunDetails.length
      ? `【大運】${dayunDetails.map((d) => `${d.age}${d.pillar}${d.tenGod}(${d.score})`).join('；')}`
      : '',
    tenYearTrend.length
      ? `【十年趨勢】${tenYearTrend.map((t) => `${t.year}${t.pillar}${t.label}${t.score}`).join('、')}`
      : '',
    liuyueDetails.length
      ? `【流月】${liuyueDetails.map((m) => `${m.label}${m.pillar}${m.tenGod}${m.score}`).join('、')}`
      : '',
    elementAdvice.length
      ? `【喜用補強】${elementAdvice.map((a) => `${a.element}：色${a.colors.join('/')}；方${a.directions.join('/')}；職${a.careers.slice(0, 3).join('/')}`).join('；')}`
      : '',
  ]

  if (wuge && wuge.總格 > 0) {
    lines.push(
      `【姓名五格】康熙筆畫已校驗：天${wuge.天格} 人${wuge.人格} 地${wuge.地格} 外${wuge.外格} 總${wuge.總格}。姓名學只能根據以下 81 數理與三才資料改寫，不得自行新增吉凶或保證性結論。`,
    )
    const chars = wuge.chars?.map((c) => `${c.char}${c.verified ? `${c.strokes}劃` : '待校驗'}`).join('、')
    if (chars) lines.push(`【康熙筆畫】${chars}。資料來源：${wuge.source ?? '待校驗'}。`)
    if (wuge.wugeFortune?.verified) {
      const fortuneItems = wuge.wugeFortune.items
      const itemText = [
        `天格${fortuneItems.heaven.number}${fortuneItems.heaven.level}${fortuneItems.heaven.title}`,
        `人格${fortuneItems.personality.number}${fortuneItems.personality.level}${fortuneItems.personality.title}`,
        `地格${fortuneItems.earth.number}${fortuneItems.earth.level}${fortuneItems.earth.title}`,
        `外格${fortuneItems.outer.number}${fortuneItems.outer.level}${fortuneItems.outer.title}`,
        `總格${fortuneItems.total.number}${fortuneItems.total.level}${fortuneItems.total.title}`,
      ].join('、')
      lines.push(`【81 數理】${itemText}。${wuge.wugeFortune.note}`)
    }
    if (wuge.sancai && 'combination' in wuge.sancai) {
      lines.push(`【三才配置】${wuge.sancai.combination}，${wuge.sancai.verified ? wuge.sancai.level : '待校驗'}：${wuge.sancai.summary}。三才表完整性：${wuge.sancai.tableCoverage === 'full' ? '完整' : '部分收錄'}。`)
    }
  } else if (wuge?.status === '待校驗') {
    lines.push(`【姓名五格】待校驗：${wuge.unknownChars.length ? `缺少字 ${wuge.unknownChars.join('、')}；` : ''}不得輸出姓名吉凶定論。`)
  }

  return lines.filter(Boolean).join('\n')
}

function parseAiJson(content: string): AiNarrativeResult {
  let text = content.trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) text = fenced[1].trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) text = jsonMatch[0]

  let parsed: Partial<AiNarrativeResult>
  try {
    parsed = JSON.parse(text) as Partial<AiNarrativeResult>
  } catch {
    const sanitized = escapeControlCharsInJsonStrings(text)
    try {
      parsed = JSON.parse(sanitized) as Partial<AiNarrativeResult>
    } catch {
      const fallback = content.trim()
      return {
        summary: fallback,
        detailText: fallback,
        topicAnalysis: fallback,
        sections: {
          career: fallback,
          wealth: '',
          relationship: '',
          health: '',
          yearly: '',
          nameAdvice: '',
          remedies: '',
        },
      }
    }
  }
  const raw = content.trim()
  const summary = parsed.summary?.trim() || parsed.detailText?.trim() || parsed.topicAnalysis?.trim() || raw
  const detailText = parsed.detailText?.trim() || summary
  const topicAnalysis = parsed.topicAnalysis?.trim() || summary
  const sections = parsed.sections ?? {} as Partial<AiSections>
  return {
    summary,
    detailText,
    topicAnalysis,
    sections: {
      career: sections.career?.trim() || '',
      wealth: sections.wealth?.trim() || '',
      relationship: sections.relationship?.trim() || '',
      health: sections.health?.trim() || '',
      yearly: sections.yearly?.trim() || '',
      nameAdvice: sections.nameAdvice?.trim() || '',
      remedies: sections.remedies?.trim() || '',
    },
  }
}

export async function callDeepSeek(
  settings: ReturnType<typeof loadAiSettings>,
  messages: { role: string; content: string }[],
  options?: { maxTokens?: number; json?: boolean },
): Promise<string> {
  const payload = {
    model: settings.model,
    messages,
    temperature: 0.75,
    max_tokens: options?.maxTokens ?? 2600,
    ...(options?.json === false ? {} : { response_format: { type: 'json_object' } }),
  }

  if (useAiProxy()) {
    const res = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      let message = err.error || `代理 API 錯誤 (${res.status})`
      try {
        const parsed = JSON.parse(message) as { error?: { message?: string } }
        message = parsed.error?.message || message
      } catch {
        // keep upstream text
      }
      throw new Error(message)
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

  if (!proxy && !settings.enabled) {
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
- 語氣風格：${TONE_TEXT[settings.tone]}
- 只使用資料中已有的數據，不得捏造四柱、數值或神煞
- 若資料標示為初判或需確認，請簡短帶過，不要在每段重複「未驗證」
- 可給務實建議，但避免絕對化斷語（如「一定發財」）
- 一律使用繁體中文

${buildAiSafetyPrompt()}`,
    },
    {
      role: 'user',
      content: `請為「${name}」撰寫命盤解讀。

${context}

${buildAiSafetyPrompt()}

請輸出 JSON（純 JSON，不要 markdown 程式碼框）。所有欄位都要存在；若某段沒有資料，請填入空字串，不要省略欄位。格式：
{
  "summary": "命盤總結：3-5 個短段落，用 \\n\\n 分隔。含日主性格、身強弱與喜用、格局與五行重點；姓名若有只能寫康熙筆畫與五格數值，不能寫吉凶。",
  "detailText": "完整解讀：一段較長的連貫文字，整合四柱、生肖、神煞、流年與姓名，約 200-350 字；神煞與姓名吉凶只能用待校驗語氣。",
  "topicAnalysis": "針對「${topic}」主題的專項分析，約 150-250 字，結合 ${input.analysisYear} 流年。",
  "sections": {
    "career": "事業分析，約 120-180 字。",
    "wealth": "財運分析，約 120-180 字。",
    "relationship": "感情、婚姻或人際分析，約 120-180 字。",
    "health": "健康與作息提醒，約 100-160 字。",
    "yearly": "${input.analysisYear} 流年重點與節奏，約 120-180 字。",
    "nameAdvice": "姓名康熙筆畫與五格數值說明；不得輸出姓名吉凶定論。若無姓名，說明可如何補充。",
    "remedies": "喜用神補強建議：顏色、方位、職業、生活習慣。"
  }
}`,
    },
  ]

  const content = await callDeepSeek(settings, messages)
  return parseAiJson(content)
}

export async function askAiQuestion(
  input: BirthInput,
  result: AnalysisResult,
  question: string,
): Promise<string> {
  const settings = loadAiSettings()
  const proxy = useAiProxy()

  if (!proxy && !settings.enabled) {
    throw new Error('尚未啟用 AI 解讀')
  }
  if (!proxy && !settings.apiKey.trim()) {
    throw new Error('尚未設定 DeepSeek API Key')
  }

  const context = buildChartContext(input, result)
  const content = await callDeepSeek(settings, [
    {
      role: 'system',
      content: `你是八字與姓名合參顧問。請用繁體中文回答，語氣風格：${TONE_TEXT[settings.tone]}。不可捏造命盤資料，回答要具體、務實、避免絕對化。

${buildAiSafetyPrompt()}`,
    },
    {
      role: 'user',
      content: `命盤資料如下：\n${context}\n\n${buildAiSafetyPrompt()}\n\n使用者追問：${question}\n\n請直接回答，約 180-320 字，可分 2-4 段。`,
    },
  ], { maxTokens: 1200, json: false })

  return content.trim()
}
