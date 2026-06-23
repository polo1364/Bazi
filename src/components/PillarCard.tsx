import type { Pillar } from '../types'
import { ELEMENT_BG, ELEMENT_CLASS } from '../lib/constants'

interface Props {
  pillar: Pillar
}

export default function PillarCard({ pillar }: Props) {
  return (
    <div className={`pillar-card group ${ELEMENT_BG[pillar.stemElement]}`}>
      <span className="pillar-label">{pillar.label}</span>
      {/* 天干十神標籤 */}
      <span className="pillar-tengod text-[10px] text-[#fde68a] opacity-80">{pillar.stemTenGod}</span>
      <span className={`pillar-char ${ELEMENT_CLASS[pillar.stemElement]}`}>{pillar.stem}</span>
      <div className="pillar-divider" />
      <span className={`pillar-char ${ELEMENT_CLASS[pillar.branchElement]}`}>{pillar.branch}</span>
      {/* 地支主氣十神 */}
      <span className="mt-1 text-[10px] text-secondary">
        主氣 {pillar.branchMainQi.stem}·{pillar.branchMainQi.tenGod}
      </span>
      <div className="pillar-meta">
        <span className="pillar-hidden">
          藏干 {pillar.hiddenStemTenGods.map((h) => `${h.stem}${h.tenGod}`).join(' ')}
        </span>
        {pillar.nayin && (
          <span className="pillar-nayin">{pillar.nayin}</span>
        )}
      </div>
    </div>
  )
}
