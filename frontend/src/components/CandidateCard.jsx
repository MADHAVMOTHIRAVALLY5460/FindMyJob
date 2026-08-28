import EvaluatorGrid from './EvaluatorGrid'

function CandidateCard({ applicant, remarks, isAnalyzing, onRunAnalysis, onView }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition-all" aria-label={`Candidate evaluation for ${applicant.name}`}>
      {/* Header: Candidate Info & Overall Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div className="flex items-start gap-3.5">
          <div aria-hidden="true" className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
            {applicant.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-900">{applicant.name}</h3>
              <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                {applicant.id}
              </span>
              {applicant.isLive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-orange-600 animate-pulse" aria-hidden="true"></span>
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              {applicant.role} • {applicant.fileName} • Submitted: {applicant.date}
            </p>
          </div>
        </div>

        {/* Score & Action Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xl font-bold text-orange-600">{remarks.finalScore}</span>
              <span className="text-xs text-zinc-500 font-medium">/100</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
              {remarks.recommendation.replace('_', ' ')}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => onRunAnalysis(applicant, e)}
            disabled={isAnalyzing}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            aria-label={`Run 5-agent debate analysis for candidate ${applicant.name}`}
          >
            <svg className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-orange-600' : 'text-zinc-600'}`} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isAnalyzing ? 'Debating...' : 'Run Debate'}</span>
          </button>

          <button
            type="button"
            onClick={() => onView(applicant)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            aria-label={`View full evaluation profile for ${applicant.name}`}
          >
            <span>View Profile</span>
            <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4 Agent Decisive Remarks Grid */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
          Specialized AI Evaluator Verdicts & Decisive Remarks
        </h4>
        <EvaluatorGrid remarks={remarks} compact={true} />
      </div>
    </article>
  )
}

export default CandidateCard
