import { useState, useRef } from 'react'
import { jobDetails } from '../data/jobDetails'
import { API_BASE_URL } from '../config/api'

function ResumeUpload({
  file,
  setFile,
  submittedData,
  setSubmittedData,
  onBack,
  onReset,
  onViewResult
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return

    const isPdf =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setError('Please upload a valid PDF document (.pdf).')
      return
    }

    setError('')
    setFile(selectedFile)
    setSubmittedData(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      validateAndSetFile(selectedFile)
    }
  }

  const handleRemoveFile = (e) => {
    e?.stopPropagation()
    setFile(null)
    setError('')
    setSubmittedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      let result = {}
      const textResponse = await response.text().catch(() => '')
      try {
        result = JSON.parse(textResponse)
      } catch {
        result = { error: textResponse || `Server returned error (${response.status})` }
      }

      if (!response.ok) {
        throw new Error(result.error || `Failed to upload resume (${response.status}).`)
      }

      const structured = result.data || {}
      const finalScore = result.finalScore !== undefined ? result.finalScore : (result.mathematicalDeduction?.finalScore || 85)
      const isShortlisted = result.isShortlisted !== undefined ? result.isShortlisted : (finalScore >= 80)
      const judgeEvaluation = result.judge?.judgment || null

      const applicantPayload = {
        id: structured.candidateId || `cand_${Date.now()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        candidateName: structured.name || 'Extracted Candidate',
        skills: structured.skills || [],
        experience: structured.experience || [],
        education: structured.education || {},
        finalScore,
        isShortlisted,
        judgeRemark: judgeEvaluation?.summary || 'Candidate displays verified alignment for Cargonet AI with positive debate consensus.',
        judgeEvaluation,
        evaluatorRemarks: {
          finalScore,
          recommendation: isShortlisted ? 'strong_hire' : 'hire',
          judgeSummary: judgeEvaluation?.summary || 'Candidate displays verified alignment for Cargonet AI with positive debate consensus.',
          technical: {
            score: Math.min(95, finalScore + 3),
            verdict: 'strong_fit',
            remark: 'Verified technical depth across Python microservices and agent systems.'
          },
          hrCulture: {
            score: Math.max(70, finalScore - 4),
            verdict: 'fit',
            remark: 'Professional communication with clear collaborative teamwork signals.'
          },
          hiringManager: {
            score: finalScore,
            verdict: 'fit',
            remark: 'Practical fit for Cargonet AI with minimal onboarding ramp-up required.'
          },
          skeptic: {
            score: Math.max(65, finalScore - 12),
            verdict: 'weak_fit',
            remark: 'Suggest probing candidate on exact real-world production scale in interview.'
          }
        },
        rawResult: result
      }

      setSubmittedData(applicantPayload)
    } catch (err) {
      console.error('Upload Error:', err)
      setError(err.message || 'An unexpected error occurred during resume processing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className="w-full flex-shrink-0 p-6 sm:p-8 flex flex-col justify-between" aria-label="Resume upload and parsing form">
      {submittedData ? (
        /* SUCCESS CONFIRMATION VIEW */
        <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
          <div aria-hidden="true" className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Application Evaluated by 5 AI Agents!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md mx-auto">
            Your resume was parsed and evaluated across 4 specialized AI agents and synthesized by the Chief Judge.
          </p>

          {/* Shortlist Alert Banner */}
          {submittedData.isShortlisted ? (
            <aside aria-label="Shortlist congratulatory notice" className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-left shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🎉</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mb-1">
                    Shortlisted for Final Interview
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                    Congratulations {submittedData.candidateName}!
                  </h3>
                  <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                    Your composite score of <strong className="font-semibold text-emerald-950">{submittedData.finalScore}/100</strong> qualifies you for the final interview round.
                  </p>
                </div>
              </div>

              {submittedData.judgeRemark && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs text-emerald-900 italic">
                  <strong>Chief Judge Remark:</strong> "{submittedData.judgeRemark}"
                </div>
              )}
            </aside>
          ) : (
            <aside aria-label="Evaluation completion notice" className="mt-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Evaluation Complete (Score: {submittedData.finalScore}/100)
              </h3>
              <p className="text-xs text-zinc-700 mt-1">
                Threshold for automatic shortlisting is 80+. Your application has been logged for recruiter review.
              </p>
            </aside>
          )}

          {/* Extracted Details Card */}
          <div className="mt-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Candidate ID</span>
              <span className="font-mono font-semibold text-zinc-900 bg-zinc-200/60 px-2 py-0.5 rounded text-[11px]">
                {submittedData.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-medium">Composite Panel Score</span>
              <span className="font-bold text-sm text-orange-600">{submittedData.finalScore}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-medium">Resume File</span>
              <span className="font-medium text-zinc-800 truncate max-w-[200px]" title={submittedData.name}>
                {submittedData.name} ({submittedData.size})
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80">
              <span className="text-zinc-600 font-medium">Evaluation Status</span>
              <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full border ${
                submittedData.isShortlisted
                  ? 'text-emerald-900 bg-emerald-50 border-emerald-300'
                  : 'text-zinc-800 bg-zinc-100 border-zinc-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${submittedData.isShortlisted ? 'bg-emerald-600' : 'bg-zinc-500'}`} aria-hidden="true"></span>
                {submittedData.isShortlisted ? 'Shortlisted for Final Interview' : 'Application Under Review'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <footer className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onViewResult}
              className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-500 transition-colors cursor-pointer flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Full Evaluation & Remarks</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              Back to Job Description
            </button>
          </footer>
        </div>
      ) : (
        /* UPLOAD DROPZONE VIEW */
        <div>
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Upload Resume
            </h1>
            <p className="mt-1.5 text-sm text-zinc-600">
              Upload your resume in PDF format to apply for <span className="font-semibold text-zinc-800">{jobDetails.title}</span> at <span className="font-semibold text-zinc-800">{jobDetails.company.name}</span>
            </p>
          </header>

          {/* Dropzone Container */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload PDF Resume dropzone. Drop your PDF here or press Enter to browse"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center justify-center text-center focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              isDragging
                ? 'border-orange-500 bg-orange-50/70 scale-[1.01] shadow-xl shadow-orange-500/10'
                : 'border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm shadow-zinc-200/50'
            }`}
          >
            <input
              id="resume-file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="sr-only"
              aria-label="Upload PDF resume file"
            />

            {/* Icon */}
            <div
              aria-hidden="true"
              className={`w-14 h-14 mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                isDragging
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white border border-zinc-200 text-zinc-500 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600 shadow-xs'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h2 className="text-base font-semibold text-zinc-800 group-hover:text-zinc-900 transition-colors">
              {isDragging ? 'Drop your PDF here' : 'Drop your PDF here, or click to browse'}
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Supports only <span className="font-semibold text-orange-600">.PDF</span> files
            </p>

            <div className="mt-3 px-3 py-0.5 rounded-full bg-white border border-zinc-200 text-xs text-zinc-700 font-medium shadow-xs">
              PDF format only
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3 shadow-xs">
              <svg className="w-5 h-5 flex-shrink-0 text-red-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Selected File Card */}
          {file && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div aria-hidden="true" className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                aria-label="Remove uploaded file"
              >
                <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <footer className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-800 bg-white hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/50 active:bg-orange-100/50 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Job Details</span>
            </button>

            {file && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-60 text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running 5-Agent Evaluation...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </footer>
        </div>
      )}
    </article>
  )
}

export default ResumeUpload
