import { useState } from 'react'
import { API_BASE_URL } from '../config/api'

function LoginForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [role, setRole] = useState('applicant')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setError('')
  }

  const handleModeSwitch = (registerMode) => {
    setIsRegister(registerMode)
    setError('')
    setSuccessMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (isRegister && role === 'employer' && !companyName.trim()) {
      setError('Please enter your company or organization name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please check again.')
        return
      }
    }

    setIsLoading(true)

    try {
      const endpoint = isRegister
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`

      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            role,
            companyName: role === 'employer' ? companyName.trim() : null
          }
        : {
            email: email.trim(),
            password: password.trim(),
            role
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      let data = {}
      const textResponse = await response.text().catch(() => '')
      try {
        data = JSON.parse(textResponse)
      } catch {
        data = { error: textResponse || `Server returned error (${response.status})` }
      }

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (${response.status}).`)
      }

      if (isRegister) {
        setSuccessMsg('Account created successfully! Signing you in...')
        setTimeout(() => {
          onLogin(data.user)
        }, 600)
      } else {
        onLogin(data.user)
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'Server connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Brand Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {isRegister ? 'Create Your Account' : 'Welcome to FindMyJob'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-600">
          {isRegister
            ? 'Join FindMyJob for AI-powered hiring & candidate intelligence'
            : 'Sign in to access job listings or the candidate dashboard'}
        </p>
      </header>

      {/* Auth Card Container */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Mode Switch Tabs: Sign In vs Create Account */}
        <nav aria-label="Authentication mode selector" className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80 mb-6 gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            id="tab-signin"
            aria-selected={!isRegister}
            aria-controls="auth-form-panel"
            onClick={() => handleModeSwitch(false)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              !isRegister
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            id="tab-register"
            aria-selected={isRegister}
            aria-controls="auth-form-panel"
            onClick={() => handleModeSwitch(true)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              isRegister
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Create Account
          </button>
        </nav>

        {/* Role Selector Tabs: Applicant vs Employer */}
        <div className="mb-5">
          <label id="role-selector-label" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            I am an
          </label>
          <div role="radiogroup" aria-labelledby="role-selector-label" className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-50 border border-zinc-200/80 gap-1">
            <button
              type="button"
              role="radio"
              aria-checked={role === 'applicant'}
              onClick={() => handleRoleChange('applicant')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                role === 'applicant'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:text-zinc-900'
              }`}
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Applicant</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={role === 'employer'}
              onClick={() => handleRoleChange('employer')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                role === 'employer'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:text-zinc-900'
              }`}
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Employer</span>
            </button>
          </div>
        </div>

        {/* Role Helper Notice */}
        <aside className="mb-5 px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0" aria-hidden="true"></span>
          <span>
            {role === 'applicant'
              ? 'Applicant: Explore job descriptions & submit resume for AI parsing.'
              : 'Employer: Access candidate evaluations, rankings & job requisition manager.'}
          </span>
        </aside>

        {/* Auth Form */}
        <form id="auth-form-panel" onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {isRegister && (
            <div>
              <label htmlFor="auth-full-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Full Name <span className="text-orange-600" aria-hidden="true">*</span>
              </label>
              <input
                id="auth-full-name"
                name="name"
                type="text"
                required={isRegister}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          )}

          {/* Company Name (Sign Up as Employer only) */}
          {isRegister && role === 'employer' && (
            <div>
              <label htmlFor="auth-company-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Company / Organization <span className="text-orange-600" aria-hidden="true">*</span>
              </label>
              <input
                id="auth-company-name"
                name="company"
                type="text"
                required={isRegister && role === 'employer'}
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Cargonet AI"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Email Address <span className="text-orange-600" aria-hidden="true">*</span>
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'applicant' ? 'applicant@findmyjob.ai' : 'recruiter@cargonet.ai'}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Password {isRegister && <span className="text-zinc-500 font-normal">(min 6 characters)</span>} <span className="text-orange-600" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isRegister && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Confirm Password <span className="text-orange-600" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={isRegister}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Help Box */}
        <section aria-label="Demo credentials helper" className="mt-6 pt-5 border-t border-zinc-100">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                handleModeSwitch(false)
                handleRoleChange('applicant')
                setEmail('applicant@findmyjob.ai')
                setPassword('password123')
              }}
              className="p-2 rounded-xl bg-zinc-50 hover:bg-orange-50 border border-zinc-200 text-left transition-colors cursor-pointer text-zinc-800 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <strong className="block text-zinc-900 font-semibold">Demo Applicant</strong>
              <span className="text-zinc-600 block">applicant@findmyjob.ai</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleModeSwitch(false)
                handleRoleChange('employer')
                setEmail('recruiter@cargonet.ai')
                setPassword('password123')
              }}
              className="p-2 rounded-xl bg-zinc-50 hover:bg-orange-50 border border-zinc-200 text-left transition-colors cursor-pointer text-zinc-800 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <strong className="block text-zinc-900 font-semibold">Demo Recruiter</strong>
              <span className="text-zinc-600 block">recruiter@cargonet.ai</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginForm
