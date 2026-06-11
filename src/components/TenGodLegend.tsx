import { TEN_GOD_DESC } from '../lib/constants'

const CATEGORIES = [
  { name: '財星', color: 'from-yellow-600/80 to-amber-700/80', dot: 'bg-yellow-400' },
  { name: '官殺', color: 'from-red-700/80 to-rose-800/80', dot: 'bg-red-400' },
  { name: '印星', color: 'from-blue-700/80 to-indigo-800/80', dot: 'bg-blue-400' },
  { name: '比劫', color: 'from-slate-600/80 to-slate-700/80', dot: 'bg-slate-300' },
  { name: '食傷', color: 'from-green-700/80 to-emerald-800/80', dot: 'bg-green-400' },
] as const

export default function TenGodLegend() {
  return (
    <div className="card h-fit overflow-hidden">
      <div className="panel-header mx-4 mt-4 sm:mx-5 sm:mt-5">
        <h3 className="section-title !mb-0">十神代表什麼</h3>
      </div>
      <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {CATEGORIES.map(({ name, color, dot }) => (
          <div key={name} className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
            <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
            <div>
              <span className={`inline-block rounded-md bg-gradient-to-r ${color} px-2 py-0.5 text-xs font-medium text-white`}>
                {name}
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{TEN_GOD_DESC[name]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
