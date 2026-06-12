import { getTengodCategories, getTengodGods } from '../lib/dataStore'

const CATEGORIES = [
  { name: '財星', color: 'from-yellow-600/80 to-amber-700/80', dot: 'bg-yellow-400' },
  { name: '官殺', color: 'from-red-700/80 to-rose-800/80', dot: 'bg-red-400' },
  { name: '印星', color: 'from-blue-700/80 to-indigo-800/80', dot: 'bg-blue-400' },
  { name: '比劫', color: 'from-slate-600/80 to-slate-700/80', dot: 'bg-slate-300' },
  { name: '食傷', color: 'from-green-700/80 to-emerald-800/80', dot: 'bg-green-400' },
] as const

export default function TenGodLegend() {
  const gods = getTengodGods()
  const categories = getTengodCategories()
  const order = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '七殺', '正官', '偏印', '正印']

  return (
    <div className="card h-fit overflow-hidden">
      <div className="panel-header mx-4 mt-4 sm:mx-5 sm:mt-5">
        <h3 className="section-title !mb-0">十神總表</h3>
      </div>
      <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {order.map((godName) => {
          const item = gods[godName]
          const category = CATEGORIES.find((c) => c.name === item?.category) ?? CATEGORIES[0]
          return (
          <div key={godName} className="rounded-xl border border-white/5 bg-black/20 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${category.dot}`} />
              <span className={`inline-block rounded-md bg-gradient-to-r ${category.color} px-2 py-0.5 text-xs font-medium text-white`}>
                {godName}
              </span>
              <span className="text-[10px] text-muted">{item?.category}</span>
            </div>
            <dl className="space-y-1.5 text-xs leading-relaxed">
              <div>
                <dt className="inline text-[#f0c040]">基本代表：</dt>
                <dd className="inline text-secondary">{item?.basic || item?.nature}</dd>
              </div>
              <div>
                <dt className="inline text-[#f0c040]">人事象徵：</dt>
                <dd className="inline text-secondary">{item?.persons || item?.desc}</dd>
              </div>
              <div>
                <dt className="inline text-[#f0c040]">性格/現象：</dt>
                <dd className="inline text-secondary">{item?.traits || item?.desc}</dd>
              </div>
            </dl>
          </div>
        )})}
      </div>
      <div className="border-t border-white/5 px-4 py-3 sm:px-5">
        {CATEGORIES.map(({ name, color, dot }) => (
          <div key={name} className="mb-2 flex items-start gap-3 last:mb-0">
            <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
            <div>
              <span className={`inline-block rounded-md bg-gradient-to-r ${color} px-2 py-0.5 text-xs font-medium text-white`}>
                {name}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-muted">{categories[name] || ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
