import { useState } from 'react'
import LoginForm from './components/LoginForm'
import StepIndicator from './components/StepIndicator'
import JobDetails from './components/JobDetails'
import ResumeUpload from './components/ResumeUpload'
import ResultModal from './components/ResultModal'
import EmployerDashboard from './components/EmployerDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
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
      {/* Top Application Bar */}
      {user && (
        <header className="w-full max-w-4xl mb-4 flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-zinc-200 shadow-xs" aria-label="FindMyJob application header">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              FMJ
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 leading-tight block">
                FindMyJob Portal
              </span>
              <span className="text-[11px] text-zinc-500 leading-tight block">
                {user.email} • {user.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                user.role === 'employer'
                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                  : 'bg-orange-50 text-orange-950 border-orange-300'
              }`}
            >
              {user.role === 'employer' ? 'Employer / Recruiter' : 'Applicant'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out of FindMyJob"
              className="text-xs font-semibold text-zinc-700 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </header>
      )}

      {/* Main View Router */}
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : user.role === 'employer' ? (
        <EmployerDashboard
          submittedData={submittedData}
          setSelectedApplicant={setSelectedApplicant}
          onViewResult={() => setShowResultModal(true)}
        />
      ) : (
        <main className="w-full max-w-2xl my-4" aria-label="Job application flow">
          <StepIndicator currentStep={currentStep} />

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div
              className="flex w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              <JobDetails
                onNext={() => setCurrentStep(1)}
                onViewResult={() => handleOpenModal(submittedData)}
                submittedData={submittedData}
                hasResults={!!submittedData}
              />

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
        </main>
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
