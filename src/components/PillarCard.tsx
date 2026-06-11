import type { Pillar } from '../types'
import { ELEMENT_BG, ELEMENT_CLASS } from '../lib/constants'

interface Props {
  pillar: Pillar
}

export default function PillarCard({ pillar }: Props) {
  return (
    <div className={`pillar-card group ${ELEMENT_BG[pillar.stemElement]}`}>
      <span className="pillar-label">{pillar.label}</span>
      <span className={`pillar-char ${ELEMENT_CLASS[pillar.stemElement]}`}>{pillar.stem}</span>
      <div className="pillar-divider" />
      <span className={`pillar-char ${ELEMENT_CLASS[pillar.branchElement]}`}>{pillar.branch}</span>
      <div className="pillar-meta">
        <span className="pillar-hidden">
          藏干 {pillar.hiddenStemTenGods.map((h) => `${h.stem}${h.tenGod}`).join(' ')}
        </span>
        {pillar.nayin && (
          <span className="pillar-nayin">{pillar.nayin}</span>
        )}
      </div>
      <span className="pillar-tengod">{pillar.stemTenGod}</span>
    </div>
  )
}
