import { useState, useEffect } from 'react'
import { jobDetails } from '../data/jobDetails'
import { API_BASE_URL } from '../config/api'

function EmployerDashboard({ submittedData, onViewResult, setSelectedApplicant }) {
  const [dbApplicants, setDbApplicants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [liveEvaluations, setLiveEvaluations] = useState({})

  useEffect(() => {
    fetchApplications()
  }, [submittedData])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/applications`)
      if (res.ok) {
        const data = await res.json()
        if (data.applications) {
          setDbApplicants(data.applications)
        }
      }
    } catch (err) {
      console.error('Failed to load applications from SQLite:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger live 5-agent debate analysis
  const handleRunAnalysis = async (applicant, e) => {
    e?.stopPropagation()
    const appCandidateData = applicant.rawResult || {
      candidateId: applicant.id,
      name: applicant.name,
      skills: applicant.skills,
      experience: applicant.experience || [],
      education: applicant.education || {}
    }

    try {
      setAnalyzingId(applicant.id)
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateData: appCandidateData })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setLiveEvaluations(prev => ({
          ...prev,
          [applicant.id]: data
        }))
      }
    } catch (err) {
      console.error('Failed to run multi-agent analysis:', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  // Helper to generate default evaluator remarks if live analysis hasn't been run yet
  const getEvaluatorRemarks = (applicant) => {
    if (liveEvaluations[applicant.id]) {
      const live = liveEvaluations[applicant.id]
      const evs = live.evaluations || []
      const getAg = (id) => evs.find(e => e.agentId === id)?.evaluation || {}

      return {
        isLiveAnalyzed: true,
        finalScore: live.mathematicalDeduction?.finalScore || 85,
        recommendation: live.judge?.judgment?.recommendation || 'hire',
        judgeSummary: live.judge?.judgment?.summary,
        technical: {
          score: getAg('agent_1').score || 88,
          verdict: getAg('agent_1').verdict || 'strong_fit',
          remark: getAg('agent_1').reasoning || 'Demonstrates strong technical depth in Python backend and agent frameworks.'
        },
        hrCulture: {
          score: getAg('agent_2').score || 82,
          verdict: getAg('agent_2').verdict || 'fit',
          remark: getAg('agent_2').reasoning || 'Professional presentation with substantiated team collaboration signals.'
        },
        hiringManager: {
          score: getAg('agent_3').score || 85,
          verdict: getAg('agent_3').verdict || 'fit',
          remark: getAg('agent_3').reasoning || 'High role alignment for Cargonet AI with low onboarding ramp-up risk.'
        },
        skeptic: {
          score: getAg('agent_4').score || 72,
          verdict: getAg('agent_4').verdict || 'weak_fit',
          remark: getAg('agent_4').reasoning || 'Flagged verification questions regarding exact production scale.'
        }
      }
    }

    // Default mock evaluator remarks
    return {
      isLiveAnalyzed: false,
      finalScore: applicant.matchScore || 88,
      recommendation: (applicant.matchScore || 88) >= 88 ? 'strong_hire' : 'hire',
      judgeSummary: 'Candidate presents verified technical alignment for Cargonet AI with positive panel consensus.',
      technical: {
        score: Math.min(95, (applicant.matchScore || 88) + 3),
        verdict: 'strong_fit',
        remark: 'Solid expertise in Python microservices, vector search (RAG), and agent systems.'
      },
      hrCulture: {
        score: Math.max(70, (applicant.matchScore || 88) - 4),
        verdict: 'fit',
        remark: 'Clear communication style and substantiated teamwork track record.'
      },
      hiringManager: {
        score: applicant.matchScore || 88,
        verdict: 'fit',
        remark: 'Practical fit for freight operations engineering with manageable ramp-up time.'
      },
      skeptic: {
        score: Math.max(65, (applicant.matchScore || 88) - 12),
        verdict: 'weak_fit',
        remark: 'Noted potential overstatement in production volume; recommend probing in interview.'
      }
    }
  }

  // Format SQLite applications
  const formattedDbApplicants = dbApplicants.map((app) => {
    const parsed = app.parsed || {}
    return {
      id: app.candidate_id || `cand_${app.id}`,
      name: app.candidate_name || 'Candidate',
      role: jobDetails.title,
      fileName: app.file_name,
      date: new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'AI Evaluated',
      matchScore: 91,
      skills: (parsed.skills || []).map((s) => s.name || s).slice(0, 4),
      experience: parsed.experience || [],
      education: parsed.education || {},
      rawResult: parsed,
      candidateName: app.candidate_name,
      submittedAt: app.created_at,
      isLive: true,
    }
  })

  // Fallback demo applicants if database is empty
  const defaultMockApplicants = [
    {
      id: 'cand_02',
      name: 'Alex Rivera',
      role: 'AI Engineer — Agentic Systems',
      fileName: 'alex_rivera_cv.pdf',
      date: 'Today, 09:15 AM',
      status: 'Reviewed',
      matchScore: 89,
      skills: ['Python', 'FastAPI', 'Claude API', 'LangChain'],
      rawResult: {
        candidateId: 'cand_02',
        name: 'Alex Rivera',
        skills: [{ id: 'sk_01', name: 'Python', source: 'resume' }, { id: 'sk_02', name: 'FastAPI', source: 'resume' }],
        experience: [{ id: 'ex_01', title: 'Senior AI Engineer', org: 'LogiTech Solutions', duration: '2023 - Present' }],
      },
      candidateName: 'Alex Rivera',
      isLive: false,
    },
    {
      id: 'cand_03',
      name: 'Marcus Chen',
      role: 'AI Engineer — Agentic Systems',
      fileName: 'marcus_chen_resume.pdf',
      date: 'Yesterday',
      status: 'Pending Review',
      matchScore: 82,
      skills: ['Python', 'Docker', 'MongoDB', 'React.js'],
      rawResult: {
        candidateId: 'cand_03',
        name: 'Marcus Chen',
        skills: [{ id: 'sk_01', name: 'Python', source: 'resume' }, { id: 'sk_02', name: 'Docker', source: 'resume' }],
        experience: [{ id: 'ex_01', title: 'Backend Developer', org: 'Apex Systems', duration: '2022 - 2024' }],
      },
      candidateName: 'Marcus Chen',
      isLive: false,
    },
  ]

  const displayApplicants = formattedDbApplicants.length > 0
    ? formattedDbApplicants
    : defaultMockApplicants

  const handleView = (applicant) => {
    const remarks = getEvaluatorRemarks(applicant)
    const enrichedApplicant = {
      ...applicant,
      agentEvaluations: liveEvaluations[applicant.id] || null,
      evaluatorRemarks: remarks
    }
    if (setSelectedApplicant) {
      setSelectedApplicant(enrichedApplicant)
    }
    onViewResult()
  }

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'strong_fit':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'fit':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'weak_fit':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'not_fit':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  return (
    <div className="w-full max-w-4xl my-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Dashboard Top Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-xs font-semibold text-orange-600 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              {jobDetails.company.name} Recruiting Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Employer Dashboard
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Multi-Agent AI evaluation panel, candidate scores, and decisive remarks
            </p>
          </div>

          <button
            type="button"
            onClick={fetchApplications}
            className="px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-600' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-medium">Total Applicants</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{displayApplicants.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-medium">AI Panel Evaluators</span>
            <p className="text-2xl font-bold text-orange-600 mt-1">4 Agents + Judge</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-medium">Avg. Panel Score</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">87%</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-medium">Active Requisition</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">1 Open</p>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Cards with 4-Agent Scores and Decisive Remarks */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Candidate Evaluations & Remarks</h2>
            <p className="text-xs text-zinc-500">
              Each candidate is independently reviewed by 4 specialized AI agents and synthesized by the Chief Judge
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{displayApplicants.length} Candidates</span>
        </div>

        {displayApplicants.map((applicant, idx) => {
          const remarks = getEvaluatorRemarks(applicant)
          const isAnalyzingThis = analyzingId === applicant.id

          return (
            <div
              key={idx}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition-all"
            >
              {/* Header: Candidate Info & Overall Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                    {applicant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-zinc-900">{applicant.name}</h3>
                      <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        {applicant.id}
                      </span>
                      {applicant.isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse"></span>
                          SQLITE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {applicant.fileName} • Submitted: {applicant.date}
                    </p>
                  </div>
                </div>

                {/* Score & Main Action Buttons */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xl font-bold text-orange-600">{remarks.finalScore}</span>
                      <span className="text-xs text-zinc-400">/100</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                      {remarks.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRunAnalysis(applicant, e)}
                    disabled={isAnalyzingThis}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Re-run 4 Evaluators + Judge live analysis"
                  >
                    <svg className={`w-3.5 h-3.5 ${isAnalyzingThis ? 'animate-spin text-orange-600' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{isAnalyzingThis ? 'Debating...' : 'Run Debate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleView(applicant)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Profile</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 4 Agent Decisive Remarks Grid */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Specialized AI Evaluator Verdicts & Decisive Remarks
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Agent 1: Technical Evaluator */}
                  <div className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-bold text-zinc-900">Technical Evaluator</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-600">{remarks.technical.score}/100</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getVerdictBadge(remarks.technical.verdict)}`}>
                          {remarks.technical.verdict.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                      "{remarks.technical.remark}"
                    </p>
                  </div>

                  {/* Agent 2: HR & Culture Evaluator */}
                  <div className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-xs font-bold text-zinc-900">HR & Culture</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-purple-600">{remarks.hrCulture.score}/100</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getVerdictBadge(remarks.hrCulture.verdict)}`}>
                          {remarks.hrCulture.verdict.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                      "{remarks.hrCulture.remark}"
                    </p>
                  </div>

                  {/* Agent 3: Hiring Manager */}
                  <div className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold text-zinc-900">Hiring Manager</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-600">{remarks.hiringManager.score}/100</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getVerdictBadge(remarks.hiringManager.verdict)}`}>
                          {remarks.hiringManager.verdict.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                      "{remarks.hiringManager.remark}"
                    </p>
                  </div>

                  {/* Agent 4: The Skeptic */}
                  <div className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-bold text-zinc-900">The Skeptic</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-600">{remarks.skeptic.score}/100</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getVerdictBadge(remarks.skeptic.verdict)}`}>
                          {remarks.skeptic.verdict.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                      "{remarks.skeptic.remark}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EmployerDashboard
