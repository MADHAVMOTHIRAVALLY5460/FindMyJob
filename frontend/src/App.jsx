import { useState } from 'react'
import LoginForm from './components/LoginForm'
import StepIndicator from './components/StepIndicator'
import JobDetails from './components/JobDetails'
import ResumeUpload from './components/ResumeUpload'
import ResultModal from './components/ResultModal'
import EmployerDashboard from './components/EmployerDashboard'

function App() {
  const [user, setUser] = useState(null) // null | { email, role: 'applicant' | 'employer', name }
  const [currentStep, setCurrentStep] = useState(0) // 0: Job Details, 1: Upload Resume
  const [file, setFile] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentStep(0)
  }

  const handleLogout = () => {
    setUser(null)
    setFile(null)
    setSelectedApplicant(null)
    setCurrentStep(0)
  }

  const handleReset = () => {
    setFile(null)
    setSubmittedData(null)
    setSelectedApplicant(null)
    setCurrentStep(0)
  }

  const handleOpenModal = (applicantData = null) => {
    setSelectedApplicant(applicantData || submittedData)
    setShowResultModal(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* Top Application Bar (Visible when logged in) */}
      {user && (
        <header className="w-full max-w-4xl mb-4 flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              FMJ
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 leading-tight block">
                FindMyJob Portal
              </span>
              <span className="text-[11px] text-zinc-400 leading-tight block">
                {user.email} • {user.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${user.role === 'employer'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}
            >
              {user.role === 'employer' ? 'Employer / Recruiter' : 'Applicant'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </header>
      )}

      {/* Main View Router */}
      {!user ? (
        /* 1. Login & Create Account Screen (First Display) */
        <LoginForm onLogin={handleLogin} />
      ) : user.role === 'employer' ? (
        /* 2. Employer Dashboard */
        <EmployerDashboard
          submittedData={submittedData}
          setSelectedApplicant={setSelectedApplicant}
          onViewResult={() => setShowResultModal(true)}
        />
      ) : (
        /* 3. Applicant View (Job Details -> Upload Resume with Swipe Transition) */
        <div className="w-full max-w-2xl my-4">
          {/* Step Indicator Header */}
          <StepIndicator currentStep={currentStep} />

          {/* Sliding Viewport Container with Smooth Swipe Transition */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div
              className="flex w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              {/* Step 1: Job Description Screen */}
              <JobDetails
                onNext={() => setCurrentStep(1)}
                onViewResult={() => handleOpenModal(submittedData)}
                submittedData={submittedData}
                hasResults={!!submittedData}
              />

              {/* Step 2: Upload Resume Screen */}
              <ResumeUpload
                file={file}
                setFile={setFile}
                submittedData={submittedData}
                setSubmittedData={setSubmittedData}
                onBack={() => setCurrentStep(0)}
                onReset={handleReset}
                onViewResult={() => handleOpenModal(submittedData)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Extracted Profile Modal */}
      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        submittedData={selectedApplicant || submittedData}
      />
    </div>
  )
}

export default App
