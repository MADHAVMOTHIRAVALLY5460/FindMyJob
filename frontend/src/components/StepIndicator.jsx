function StepIndicator({ currentStep }) {
  return (
    <div className="mb-6 flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
            currentStep === 0
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20 ring-4 ring-orange-100'
              : 'bg-zinc-200 text-zinc-700'
          }`}
        >
          1
        </span>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep === 0 ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
          }`}
        >
          Job Details
        </span>

        <svg className="w-4 h-4 text-zinc-300 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
            currentStep === 1
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20 ring-4 ring-orange-100'
              : 'bg-zinc-200 text-zinc-600'
          }`}
        >
          2
        </span>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep === 1 ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
          }`}
        >
          Upload Resume
        </span>
      </div>

      <span className="text-xs font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
        {currentStep === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}
      </span>
    </div>
  )
}

export default StepIndicator
