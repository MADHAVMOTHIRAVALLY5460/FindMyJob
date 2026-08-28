import { getVerdictBadgeClass } from '../data/mockData'

function JudgeVerdictBanner({ judge, remarks, candidateName, score, isShortlisted }) {
  const recommendation = judge?.recommendation || remarks?.recommendation || 'hire'
  const summary = judge?.summary || remarks?.judgeSummary || 'Candidate demonstrated verified technical alignment.'

  return (
    <div className="space-y-4">
      {/* Shortlist Hero Callout */}
      {isShortlisted ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300/80 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl">🎉</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mb-1">
                Final Interview Shortlisted
              </span>
              <h4 className="text-base sm:text-lg font-bold text-emerald-950">
                Congratulations {candidateName}! You are shortlisted!
              </h4>
              <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                Your composite score of <strong className="font-bold text-emerald-950">{score}/100</strong> exceeds the 80-point threshold.
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0 self-end sm:self-center">
            <span className="text-2xl font-bold text-emerald-800">{score}/100</span>
            <p className="text-[10px] font-semibold text-emerald-700">Composite Score</p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Application Evaluation Complete</h4>
            <p className="text-xs text-zinc-500">Composite Score: {score}/100 (Threshold: 80+)</p>
          </div>
          <span className="text-lg font-bold text-orange-600">{score}/100</span>
        </div>
      )}

      {/* Chief Judge Executive Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 to-zinc-50 border border-orange-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-200/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Chief Judge Agent Official Remark
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Panel Recommendation:</span>
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full border uppercase ${getVerdictBadgeClass(recommendation)}`}>
              {recommendation.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-orange-100 text-xs text-zinc-800 leading-relaxed italic">
          "{summary}"
        </div>

        {/* Strengths & Concerns */}
        {judge && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-orange-200/60">
            {judge.strengths?.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Substantiated Strengths
                </span>
                <ul className="space-y-1 text-xs text-zinc-600">
                  {judge.strengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span> {st}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {judge.concerns?.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Skeptic Concerns
                </span>
                <ul className="space-y-1 text-xs text-zinc-600">
                  {judge.concerns.map((cn, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">⚠</span> {cn}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JudgeVerdictBanner
