import { useState } from 'react'
import JudgeVerdictBanner from './JudgeVerdictBanner'
import EvaluatorGrid from './EvaluatorGrid'

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <header className="flex items-start justify-between pb-5 border-b border-zinc-100 gap-4">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              FMJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="result-modal-title" className="text-xl font-bold text-zinc-900">
                  {candidateName}
                </h2>
                <span className="font-mono text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded">
                  {submittedData?.id || 'cand_01'}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                AI Panel Evaluation • 4 Evaluator Agents & Chief Judge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate evaluation modal"
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          >
            <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Tab Navigation */}
        <nav aria-label="Evaluation modal views" className="flex items-center gap-2 mt-5 p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80" role="tablist">
          <button
            type="button"
            role="tab"
            id="tab-debate"
            aria-selected={activeTab === 'debate'}
            aria-controls="panel-debate"
            onClick={() => setActiveTab('debate')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              activeTab === 'debate'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            5-Agent Debate & Remarks
          </button>
          <button
            type="button"
            role="tab"
            id="tab-resume"
            aria-selected={activeTab === 'resume'}
            aria-controls="panel-resume"
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              activeTab === 'resume'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Candidate Profile & Raw Schema
          </button>
        </nav>

        {/* Tab Content */}
        {activeTab === 'debate' ? (
          <section id="panel-debate" role="tabpanel" aria-labelledby="tab-debate" className="mt-6 space-y-6">
            {/* Judge's Executive Verdict Banner */}
            <JudgeVerdictBanner
              judge={judge}
              remarks={remarks}
              candidateName={candidateName}
              score={score}
              isShortlisted={isShortlisted}
            />

            {/* 4 Agent Evaluators Detailed Remarks */}
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                The 4 Evaluator Agent Verdicts & Decisive Remarks
              </h3>
              <EvaluatorGrid remarks={remarks} compact={false} />
            </div>
          </section>
        ) : (
          /* Tab 2: Resume Details & Structured Data */
          <section id="panel-resume" role="tabpanel" aria-labelledby="tab-resume" className="mt-6 space-y-5 text-sm">
            {submittedData?.skills?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Extracted Skills ({submittedData.skills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {submittedData.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-950"
                    >
                      {s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {submittedData?.experience?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Experience History ({submittedData.experience.length})
                </h3>
                <div className="space-y-2.5">
                  {submittedData.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 bg-white">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-zinc-900">{exp.title}</span>
                        <span className="text-xs text-zinc-600 font-medium">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-zinc-700 font-medium mt-0.5">{exp.org}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Raw JSON Schema Output
              </h3>
              <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto max-h-48" tabIndex={0} aria-label="Raw extracted candidate JSON structure">
                {JSON.stringify(submittedData?.rawResult || submittedData, null, 2)}
              </pre>
            </div>
          </section>
        )}

        {/* Modal Footer */}
        <footer className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ResultModal
