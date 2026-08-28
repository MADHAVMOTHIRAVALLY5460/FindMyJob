import { getVerdictBadgeClass } from '../data/mockData'

function EvaluatorGrid({ remarks, compact = false }) {
  if (!remarks) return null

  const agents = [
    {
      name: 'Technical Evaluator',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      data: remarks.technical || { score: 88, verdict: 'strong_fit', remark: 'Solid technical depth in Python and agent frameworks.' }
    },
    {
      name: 'HR & Culture',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      data: remarks.hrCulture || { score: 82, verdict: 'fit', remark: 'Professional communication tone with teamwork signals.' }
    },
    {
      name: 'Hiring Manager',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      data: remarks.hiringManager || { score: 85, verdict: 'fit', remark: 'High role alignment with manageable ramp-up risk.' }
    },
    {
      name: 'The Skeptic',
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      data: remarks.skeptic || { score: 72, verdict: 'weak_fit', remark: 'Flagged verification points on production scale claims.' }
    }
  ]

  return (
    <div className={`grid ${compact ? 'grid-cols-1 md:grid-cols-2 gap-3' : 'grid-cols-1 gap-3.5'}`}>
      {agents.map((agent, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border border-zinc-200/80 transition-colors ${
            compact ? 'p-3.5 bg-zinc-50/60 hover:bg-zinc-50' : 'p-4 bg-white shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${agent.color}`}></span>
              <span className="text-xs font-bold text-zinc-900">{agent.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${agent.textColor}`}>{agent.data.score}/100</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getVerdictBadgeClass(agent.data.verdict)}`}>
                {agent.data.verdict?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed italic">
            "{agent.data.remark}"
          </p>
        </div>
      ))}
    </div>
  )
}

export default EvaluatorGrid
