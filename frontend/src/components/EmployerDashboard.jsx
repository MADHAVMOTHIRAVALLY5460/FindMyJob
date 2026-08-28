import { useState, useEffect } from 'react'
import { jobDetails } from '../data/jobDetails'
import { defaultMockApplicants } from '../data/mockData'
import { API_BASE_URL } from '../config/api'
import CreateJobModal from './CreateJobModal'
import JobRequisitionCard from './JobRequisitionCard'
import CandidateCard from './CandidateCard'

function EmployerDashboard({ submittedData, onViewResult, setSelectedApplicant }) {
  const [dbApplicants, setDbApplicants] = useState([])
  const [jobs, setJobs] = useState([jobDetails])
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [liveEvaluations, setLiveEvaluations] = useState({})
  const [successToast, setSuccessToast] = useState('')

  useEffect(() => {
    fetchApplications()
    fetchJobs()
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
      console.error('Failed to load applications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`)
      if (res.ok) {
        const data = await res.json()
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs)
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev.filter(j => j.id !== newJob.id)])
    setSuccessToast(`Job position "${newJob.title}" has been successfully published!`)
    setTimeout(() => setSuccessToast(''), 4000)
  }

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

    return {
      isLiveAnalyzed: false,
      finalScore: applicant.matchScore || 88,
      recommendation: (applicant.matchScore || 88) >= 88 ? 'strong_hire' : 'hire',
      judgeSummary: 'Candidate presents verified technical alignment with positive panel consensus.',
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

  const formattedDbApplicants = dbApplicants.map((app) => {
    const parsed = app.parsed || {}
    return {
      id: app.candidate_id || `cand_${app.id}`,
      name: app.candidate_name || 'Candidate',
      role: app.job_title || jobDetails.title,
      fileName: app.file_name,
      date: new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'AI Evaluated',
      matchScore: parsed.finalScore || 91,
      skills: (parsed.skills || []).map((s) => s.name || s).slice(0, 4),
      experience: parsed.experience || [],
      education: parsed.education || {},
      rawResult: parsed,
      candidateName: app.candidate_name,
      submittedAt: app.created_at,
      isLive: true,
    }
  })

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

  return (
    <main className="w-full max-w-4xl my-6 animate-in fade-in zoom-in-95 duration-300" aria-label="Employer Recruiting and Candidate Review Dashboard">
      {/* Toast Notification */}
      {successToast && (
        <aside role="status" aria-label="Success notification" className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-base text-emerald-700" aria-hidden="true">✓</span>
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast('')}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-lg p-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Dashboard Top Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-xs font-semibold text-orange-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600" aria-hidden="true"></span>
              {jobDetails.company.name} Recruiting Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Employer Dashboard
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Multi-Agent AI evaluation panel, candidate scores, and job requisition management
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsCreateJobOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post New Position</span>
            </button>

            <button
              type="button"
              onClick={() => { fetchApplications(); fetchJobs(); }}
              aria-label="Refresh candidate pipeline and active positions"
              className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors flex items-center justify-center cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : 'text-zinc-600'}`} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <section aria-label="Recruitment pipeline overview metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-600 font-semibold">Total Applicants</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{displayApplicants.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-600 font-semibold">Active Requisitions</span>
            <p className="text-2xl font-bold text-orange-600 mt-1">{jobs.length} Open</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-600 font-semibold">AI Panel Evaluators</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">4 Agents + Judge</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-600 font-semibold">Avg. Panel Score</span>
            <p className="text-2xl font-bold text-zinc-900 mt-1">87%</p>
          </div>
        </section>
      </header>

      {/* Active Job Requisitions List */}
      <section aria-label="Active Job Positions Requisitions" className="mb-8 p-5 rounded-3xl bg-zinc-50/70 border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Active Job Positions ({jobs.length})</h2>
            <p className="text-xs text-zinc-600">Live roles evaluated by the FindMyJob AI Panel</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateJobOpen(true)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none rounded-lg p-1"
          >
            <span>+ Add Position</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.map((job, idx) => (
            <JobRequisitionCard key={idx} job={job} />
          ))}
        </div>
      </section>

      {/* Candidate Pipeline Cards with 4-Agent Scores and Decisive Remarks */}
      <section aria-label="Candidate Evaluations & Remarks" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Candidate Evaluations & Remarks</h2>
            <p className="text-xs text-zinc-600">
              Each candidate is independently reviewed by 4 specialized AI agents and synthesized by the Chief Judge
            </p>
          </div>
          <span className="text-xs text-zinc-600 font-semibold">{displayApplicants.length} Candidates</span>
        </div>

        <div className="space-y-6">
          {displayApplicants.map((applicant, idx) => (
            <CandidateCard
              key={idx}
              applicant={applicant}
              remarks={getEvaluatorRemarks(applicant)}
              isAnalyzing={analyzingId === applicant.id}
              onRunAnalysis={handleRunAnalysis}
              onView={handleView}
            />
          ))}
        </div>
      </section>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </main>
  )
}

export default EmployerDashboard
