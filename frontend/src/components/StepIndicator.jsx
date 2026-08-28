function StepIndicator({ currentStep }) {
  return (
    <nav aria-label="Application steps progress" className="mb-6 flex items-center justify-between px-2">
      <ol className="flex items-center gap-3 list-none p-0 m-0">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-orange-600 text-white shadow-sm ring-4 ring-orange-100'
                : 'bg-zinc-200 text-zinc-800'
            }`}
          >
            1
          </span>
          <span
            aria-current={currentStep === 0 ? 'step' : undefined}
            className={`text-sm font-semibold transition-colors ${
              currentStep === 0 ? 'text-zinc-900' : 'text-zinc-500'
            }`}
          >
            Job Details
          </span>
        </li>

        <li aria-hidden="true">
          <svg className="w-4 h-4 text-zinc-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </li>

        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
              currentStep === 1
                ? 'bg-orange-600 text-white shadow-sm ring-4 ring-orange-100'
                : 'bg-zinc-200 text-zinc-800'
            }`}
          >
            2
          </span>
          <span
            aria-current={currentStep === 1 ? 'step' : undefined}
            className={`text-sm font-semibold transition-colors ${
              currentStep === 1 ? 'text-zinc-900' : 'text-zinc-500'
            }`}
          >
            Upload Resume
          </span>
        </li>
      </ol>

      <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
        {currentStep === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}
      </span>
    </nav>
  )
}

export default StepIndicator
