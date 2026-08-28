import { useState } from 'react'

function ResultModal({ isOpen, onClose, submittedData }) {
  const [activeTab, setActiveTab] = useState('debate') // 'debate' | 'resume'

  if (!isOpen) return null

  const remarks = submittedData?.evaluatorRemarks || {
    finalScore: submittedData?.finalScore || 88,
    recommendation: submittedData?.isShortlisted ? 'strong_hire' : 'hire',
    judgeSummary: submittedData?.judgeRemark || 'Candidate exhibits verified technical alignment for Cargonet AI with favorable consensus across the evaluator panel.',
    technical: {
      score: 88,
      verdict: 'strong_fit',
      remark: 'Strong proficiency in Python microservices, vector search (RAG), and agent orchestration.'
    },
    hrCulture: {
      score: 82,
      verdict: 'fit',
      remark: 'Clear communication with substantiated team collaboration signals.'
    },
    hiringManager: {
      score: 85,
      verdict: 'fit',
      remark: 'High role alignment for Cargonet AI with low onboarding ramp-up risk.'
    },
    skeptic: {
      score: 72,
      verdict: 'weak_fit',
      remark: 'Flagged verification questions regarding exact production scale in cl_02.'
    }
  }

  const score = submittedData?.finalScore !== undefined ? submittedData.finalScore : remarks.finalScore
  const isShortlisted = submittedData?.isShortlisted !== undefined ? submittedData.isShortlisted : (score >= 80)
  const candidateName = submittedData?.candidateName || submittedData?.name || 'Applicant'
  const judge = submittedData?.agentEvaluations?.judge?.judgment || submittedData?.judgeEvaluation || null

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'strong_fit':
      case 'strong_hire':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'fit':
      case 'hire':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'weak_fit':
      case 'borderline':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'not_fit':
      case 'no_hire':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-zinc-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              FMJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-zinc-900">
                  {candidateName}
                </h3>
                <span className="font-mono text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded">
                  {submittedData?.id || 'cand_01'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                AI Panel Evaluation • 4 Evaluator Agents & Chief Judge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortlisted Congratulations Hero Card */}
        {isShortlisted ? (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300/80 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
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
                  Your evaluation score of <strong className="font-bold text-emerald-950">{score}/100</strong> exceeds the 80-point threshold for Cargonet AI.
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 self-end sm:self-center">
              <span className="text-2xl font-bold text-emerald-800">{score}/100</span>
              <p className="text-[10px] font-semibold text-emerald-700">Composite Score</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Application Evaluation Complete</h4>
              <p className="text-xs text-zinc-500">Composite Score: {score}/100 (Shortlist Threshold: 80+)</p>
            </div>
            <span className="text-lg font-bold text-orange-600">{score}/100</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('debate')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'debate'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            5-Agent Debate & Remarks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Candidate Profile & Raw Schema
          </button>
        </div>

        {/* Modal Content */}
        {activeTab === 'debate' ? (
          <div className="mt-6 space-y-6">
            {/* Judge's Executive Verdict & Remark Banner */}
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
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border uppercase ${getVerdictBadge(judge?.recommendation || remarks.recommendation)}`}>
                    {(judge?.recommendation || remarks.recommendation).replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-orange-100 text-xs text-zinc-800 leading-relaxed italic">
                "{judge?.summary || submittedData?.judgeRemark || remarks.judgeSummary}"
              </div>

              {/* Strengths & Concerns */}
              {judge && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-orange-200/60">
                  {judge.strengths && judge.strengths.length > 0 && (
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

                  {judge.concerns && judge.concerns.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                        Skeptic & Verification Concerns
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

            {/* 4 Agent Evaluators Detailed Remarks Cards */}
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                The 4 Evaluator Agent Verdicts & Decisive Remarks
              </h4>

              <div className="grid grid-cols-1 gap-3.5">
                {/* 1. Technical Evaluator */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-zinc-900">Agent 1: Technical Evaluator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">{remarks.technical.score}/100</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getVerdictBadge(remarks.technical.verdict)}`}>
                        {remarks.technical.verdict.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <strong className="text-zinc-900 block mb-0.5">Decisive Remark:</strong>
                    "{remarks.technical.remark}"
                  </p>
                </div>

                {/* 2. HR & Culture Evaluator */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span className="text-sm font-bold text-zinc-900">Agent 2: HR & Culture Evaluator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-600">{remarks.hrCulture.score}/100</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getVerdictBadge(remarks.hrCulture.verdict)}`}>
                        {remarks.hrCulture.verdict.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <strong className="text-zinc-900 block mb-0.5">Decisive Remark:</strong>
                    "{remarks.hrCulture.remark}"
                  </p>
                </div>

                {/* 3. Hiring Manager */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-sm font-bold text-zinc-900">Agent 3: Hiring Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-600">{remarks.hiringManager.score}/100</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getVerdictBadge(remarks.hiringManager.verdict)}`}>
                        {remarks.hiringManager.verdict.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <strong className="text-zinc-900 block mb-0.5">Decisive Remark:</strong>
                    "{remarks.hiringManager.remark}"
                  </p>
                </div>

                {/* 4. The Skeptic */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-sm font-bold text-zinc-900">Agent 4: The Skeptic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-600">{remarks.skeptic.score}/100</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getVerdictBadge(remarks.skeptic.verdict)}`}>
                        {remarks.skeptic.verdict.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <strong className="text-zinc-900 block mb-0.5">Decisive Remark:</strong>
                    "{remarks.skeptic.remark}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Resume Details & Structured Data */
          <div className="mt-6 space-y-5 text-sm">
            {/* Extracted Skills */}
            {submittedData?.skills && submittedData.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Extracted Skills ({submittedData.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {submittedData.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/70 text-xs font-medium text-orange-800"
                    >
                      {s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {submittedData?.experience && submittedData.experience.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Experience History ({submittedData.experience.length})
                </h4>
                <div className="space-y-2.5">
                  {submittedData.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 bg-white">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-zinc-800">{exp.title}</span>
                        <span className="text-xs text-zinc-500">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">{exp.org}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON viewer */}
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Raw JSON Schema Output
              </h4>
              <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto max-h-48">
                {JSON.stringify(submittedData?.rawResult || submittedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
