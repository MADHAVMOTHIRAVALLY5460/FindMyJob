import { useState } from 'react'
import { API_BASE_URL } from '../config/api'

function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('Applied AI & Engineering')
  const [location, setLocation] = useState('Remote / San Francisco, CA')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [salary, setSalary] = useState('$160,000 - $210,000 + Equity')
  const [aboutRole, setAboutRole] = useState('')
  const [whatYoullDo, setWhatYoullDo] = useState(
    'Architect and scale multi-agent decision pipelines.\nImplement deterministic validation guardrails and latency benchmarks.\nCollaborate across engineering to deploy production microservices.'
  )
  const [whatWereLookingFor, setWhatWereLookingFor] = useState(
    '3+ years experience with Python backend frameworks.\nHands-on experience with LLM agent state machines (LangGraph, CrewAI).\nStrong understanding of structured evaluation and testing.'
  )
  const [whatRoleIsNot, setWhatRoleIsNot] = useState(
    'This is NOT a basic prompt engineering or wrapper role. You will build resilient distributed systems with rigorous evaluation telemetry.'
  )
  const [skills, setSkills] = useState('Python, FastAPI, Multi-Agent Systems, Vector Search (RAG), Docker')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a Job Title.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        employmentType: employmentType.trim(),
        salary: salary.trim(),
        aboutRole: aboutRole.trim() || `We are seeking an experienced ${title.trim()} to join our high-growth engineering team.`,
        whatYoullDo: whatYoullDo.split('\n').map(s => s.trim()).filter(Boolean),
        whatWereLookingFor: whatWereLookingFor.split('\n').map(s => s.trim()).filter(Boolean),
        whatRoleIsNot: whatRoleIsNot.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create job position.')
      }

      if (onJobCreated) {
        onJobCreated(result.job)
      }
      onClose()
    } catch (err) {
      console.error('Create job error:', err)
      setError(err.message || 'Error submitting job opening.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-job-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <header className="flex items-start justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-sm shadow-xs">
              +
            </div>
            <div>
              <h2 id="create-job-modal-title" className="text-xl font-bold text-zinc-900">
                Create New Job Position
              </h2>
              <p className="text-xs text-zinc-600">
                Define the requirements, evaluation criteria, and tech stack for the AI panel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close job creation modal"
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          >
            <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Error Notification */}
        {error && (
          <div role="alert" className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {/* Row 1: Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-title" className="block font-semibold text-zinc-800 mb-1.5">
                Job Position Title <span className="text-orange-600" aria-hidden="true">*</span>
              </label>
              <input
                id="job-title"
                name="title"
                type="text"
                required
                placeholder="e.g. Senior AI Infrastructure Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
              />
            </div>
            <div>
              <label htmlFor="job-department" className="block font-semibold text-zinc-800 mb-1.5">
                Department / Team
              </label>
              <input
                id="job-department"
                name="department"
                type="text"
                placeholder="e.g. Core AI & Systems"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
              />
            </div>
          </div>

          {/* Row 2: Location, Employment Type & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="job-location" className="block font-semibold text-zinc-800 mb-1.5">
                Location
              </label>
              <input
                id="job-location"
                name="location"
                type="text"
                placeholder="e.g. Remote / San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
              />
            </div>
            <div>
              <label htmlFor="job-employment-type" className="block font-semibold text-zinc-800 mb-1.5">
                Employment Type
              </label>
              <select
                id="job-employment-type"
                name="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label htmlFor="job-salary" className="block font-semibold text-zinc-800 mb-1.5">
                Salary / Compensation
              </label>
              <input
                id="job-salary"
                name="salary"
                type="text"
                placeholder="e.g. $160,000 - $210,000 + Equity"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
              />
            </div>
          </div>

          {/* About the Role */}
          <div>
            <label htmlFor="job-about-role" className="block font-semibold text-zinc-800 mb-1.5">
              About the Role & Mission
            </label>
            <textarea
              id="job-about-role"
              name="aboutRole"
              rows={2}
              placeholder="High-level description of what the role entails and why it matters..."
              value={aboutRole}
              onChange={(e) => setAboutRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all resize-none"
            />
          </div>

          {/* What You'll Do */}
          <div>
            <label htmlFor="job-what-youll-do" className="block font-semibold text-zinc-800 mb-1.5">
              Key Responsibilities / What You'll Do <span className="text-zinc-500 font-normal">(1 item per line)</span>
            </label>
            <textarea
              id="job-what-youll-do"
              name="whatYoullDo"
              rows={3}
              placeholder="Enter responsibilities, one per line..."
              value={whatYoullDo}
              onChange={(e) => setWhatYoullDo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
            />
          </div>

          {/* What We're Looking For */}
          <div>
            <label htmlFor="job-qualifications" className="block font-semibold text-zinc-800 mb-1.5">
              Qualifications / What We're Looking For <span className="text-zinc-500 font-normal">(1 item per line)</span>
            </label>
            <textarea
              id="job-qualifications"
              name="whatWereLookingFor"
              rows={3}
              placeholder="Enter qualifications and technical signals..."
              value={whatWereLookingFor}
              onChange={(e) => setWhatWereLookingFor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
            />
          </div>

          {/* What This Role Is NOT */}
          <div>
            <label htmlFor="job-role-is-not" className="block font-semibold text-zinc-800 mb-1.5">
              "What This Role Is NOT" Guardrail Callout
            </label>
            <textarea
              id="job-role-is-not"
              name="whatRoleIsNot"
              rows={2}
              placeholder="Clarify common misconceptions about the role to help filter candidates..."
              value={whatRoleIsNot}
              onChange={(e) => setWhatRoleIsNot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200/80 bg-orange-50/40 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all resize-none"
            />
          </div>

          {/* Skills & Tech Stack */}
          <div>
            <label htmlFor="job-skills" className="block font-semibold text-zinc-800 mb-1.5">
              Required Tech Stack & Skills <span className="text-zinc-500 font-normal">(comma-separated)</span>
            </label>
            <input
              id="job-skills"
              name="skills"
              type="text"
              placeholder="e.g. Python, FastAPI, Docker, Multi-Agent Systems, LangGraph"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-900 text-xs transition-all"
            />
          </div>

          {/* Modal Footer Actions */}
          <footer className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Publish Job Position</span>
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default CreateJobModal
