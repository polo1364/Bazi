import type { BaziChart } from '../types'
import { pillarsToArray } from '../lib/bazi'

const ELEMENT_COLORS: Record<string, string> = {
  木: '#4ade80',
  火: '#fb7185',
  土: '#fbbf24',
  金: '#e2e8f0',
  水: '#60a5fa',
}

const ELEMENT_GLOW: Record<string, string> = {
  木: '#22c55e',
  火: '#ef4444',
  土: '#d97706',
  金: '#94a3b8',
  水: '#3b82f6',
}

const NODE_POSITIONS = [
  { x: 200, y: 62 },
  { x: 338, y: 200 },
  { x: 200, y: 338 },
  { x: 62, y: 200 },
]

interface Props {
  chart: BaziChart
}

export default function ChartCircle({ chart }: Props) {
  const pillars = pillarsToArray(chart)
  const cx = 200
  const cy = 200

  return (
    <div className="chart-circle-wrap">
      <svg viewBox="0 0 400 400" className="chart-circle-svg" aria-label="命盤結構圖">
        <defs>
          <radialGradient id="chartBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0c1527" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#070d1a" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0c040" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#f0c040" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f0c040" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f0c040" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          {pillars.map((p, i) => {
            const pos = NODE_POSITIONS[i]
            return (
              <linearGradient key={`line-${p.label}`} id={`lineGrad-${i}`} gradientUnits="userSpaceOnUse"
                x1={cx} y1={cy} x2={pos.x} y2={pos.y}>
                <stop offset="0%" stopColor="#f0c040" stopOpacity="0.55" />
                <stop offset="100%" stopColor={ELEMENT_GLOW[p.stemElement]} stopOpacity="0.85" />
              </linearGradient>
            )
          })}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={198} fill="url(#chartBgGlow)" />
        <circle cx={cx} cy={cy} r={188} fill="none" stroke="rgba(240,192,64,0.12)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={168} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth={1} strokeDasharray="6 8" />
        <circle cx={cx} cy={cy} r={128} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={1} />

        {['木', '火', '土', '金', '水'].map((el, i) => {
          const a = (i * 72 - 90) * (Math.PI / 180)
          const dotX = cx + Math.cos(a) * 176
          const dotY = cy + Math.sin(a) * 176
          const textX = cx + Math.cos(a) * 194
          const textY = cy + Math.sin(a) * 194
          return (
            <g key={el}>
              <circle cx={dotX} cy={dotY} r={11} fill="rgba(0,0,0,0.35)" stroke={ELEMENT_COLORS[el]} strokeWidth={1.5} />
              <circle cx={dotX} cy={dotY} r={5} fill={ELEMENT_COLORS[el]} opacity={0.95} />
              <text x={textX} y={textY + 4} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={600}>{el}</text>
            </g>
          )
        })}

        {pillars.map((p, i) => {
          const { x, y } = NODE_POSITIONS[i]
          const stemColor = ELEMENT_COLORS[p.stemElement]
          const branchColor = ELEMENT_COLORS[p.branchElement]

          return (
            <g key={p.label} filter="url(#nodeGlow)">
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={`url(#lineGrad-${i})`} strokeWidth={2.5} strokeLinecap="round" />
              <rect x={x - 30} y={y - 58} width={60} height={20} rx={10} fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.15)" />
              <text x={x} y={y - 44} textAnchor="middle" fill="#f8fafc" fontSize={11} fontWeight={600}>{p.label}</text>
              <circle cx={x} cy={y} r={42} fill="rgba(7,13,26,0.92)" stroke={stemColor} strokeWidth={2.5} />
              <circle cx={x} cy={y} r={36} fill="none" stroke={branchColor} strokeWidth={1} opacity={0.45} />
              <text x={x} y={y - 6} textAnchor="middle" fill={stemColor} fontSize={22} fontWeight="bold">{p.stem}</text>
              <text x={x} y={y + 18} textAnchor="middle" fill={branchColor} fontSize={22} fontWeight="bold">{p.branch}</text>
              <rect x={x - 34} y={y + 46} width={68} height={20} rx={10} fill="rgba(0,0,0,0.5)" stroke="rgba(253,230,138,0.25)" />
              <text x={x} y={y + 60} textAnchor="middle" fill="#fde68a" fontSize={10} fontWeight={600}>{p.tenGod}</text>
            </g>
          )
        })}

        <circle cx={cx} cy={cy} r={72} fill="url(#centerGlow)" />
        <circle cx={cx} cy={cy} r={64} fill="#0c1527" stroke="url(#ringGold)" strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={56} fill="none" stroke="rgba(240,192,64,0.2)" strokeWidth={1} />
        <text x={cx} y={cy - 12} textAnchor="middle" fill="#cbd5e1" fontSize={12} fontWeight={600}>日主</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#fde68a" fontSize={34} fontWeight="bold">{chart.dayMaster}</text>
        <text x={cx} y={cy + 36} textAnchor="middle" fill={ELEMENT_COLORS[chart.dayMasterElement]} fontSize={11} fontWeight={600}>
          {chart.dayMasterElement}
        </text>
      </svg>

      <div className="chart-circle-legend">
        {pillars.map((p) => (
          <span key={p.label} className="chart-circle-legend-item">
            <span className="chart-circle-legend-dot" style={{ background: ELEMENT_COLORS[p.stemElement] }} />
            {p.label} {p.stem}{p.branch}
          </span>
        ))}
      </div>
    </div>
  )
}
