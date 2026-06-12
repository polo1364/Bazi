export const TEN_GOD_YEAR_NARRATIVES: Record<string, { theme: string; summary: string }> = {
  比肩: {
    theme: '同輩、自主、競爭與自我主張',
    summary: '比肩代表自我、同輩、競爭與自主性，宜注意合作界線與資源分配。',
  },
  劫財: {
    theme: '同輩競爭、合作分利、資源流動',
    summary: '劫財代表同輩、合作、競爭與資源分流，宜注意財務分配與衝動決策。',
  },
  食神: {
    theme: '表達、作品、享受與穩定輸出',
    summary: '食神代表穩定輸出、作品、口福與生活品質，宜善用專長並維持節奏。',
  },
  傷官: {
    theme: '表達、技術、創意與規範摩擦',
    summary: '傷官代表表達、技術、創意與規範摩擦，也需留意與制度或權威的互動。',
  },
  正財: {
    theme: '正職收入、資源配置、責任與支出管理',
    summary: '正財代表穩定收入、資源配置與實務責任；若身偏弱，財旺也可能形成耗身壓力。',
  },
  偏財: {
    theme: '外部機會、人脈、投資與彈性資源',
    summary: '偏財代表外部機會、人脈與彈性資源；宜重視風險控管，不宜過度投機。',
  },
  正官: {
    theme: '制度、職責、名聲與規範',
    summary: '正官代表制度、職責、名聲與規範，宜穩健承擔責任並重視流程。',
  },
  七殺: {
    theme: '壓力、競爭、挑戰與執行力',
    summary: '七殺代表壓力、挑戰與競爭，也可轉化為行動力；需看制化與承擔能力。',
  },
  正印: {
    theme: '學習、支援、資源與保護',
    summary: '正印代表學習、支援、資源與保護，有助穩定基本盤與吸收新知。',
  },
  偏印: {
    theme: '特殊學習、靈感、策略與非典型資源',
    summary: '偏印代表特殊學習、靈感與非典型資源，宜善用研究力並避免過度封閉。',
  },
}

export function getTenGodYearNarrative(tenGod?: string | null, context: { dayStem?: string; stem?: string; branch?: string } = {}) {
  const item = tenGod ? TEN_GOD_YEAR_NARRATIVES[tenGod] : undefined
  if (!item) {
    return {
      theme: '保守觀察',
      summary: '宜穩健行事，避免只憑單一年份下定論。',
    }
  }
  const prefix = context.stem && context.branch && context.dayStem
    ? `${context.stem}${context.branch}${tenGod}`
    : tenGod
  return {
    theme: item.theme,
    summary: `${prefix}${item.summary.replace(tenGod, '')}`,
  }
}
