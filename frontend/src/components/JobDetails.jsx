import { jobDetails } from '../data/jobDetails'

function JobDetails({ onNext, onViewResult, submittedData, hasResults }) {
  const isShortlisted = submittedData?.isShortlisted || (submittedData?.finalScore >= 80)
  const score = submittedData?.finalScore || submittedData?.evaluatorRemarks?.finalScore || null

  return (
    <article className="w-full flex-shrink-0 p-6 sm:p-8 flex flex-col justify-between" aria-label="Job description and application details">
      <div>
        {/* Employer & Role Header */}
        <header className="border-b border-zinc-100 pb-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-xs font-semibold text-orange-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600" aria-hidden="true"></span>
                {jobDetails.company.name} • {jobDetails.company.industry}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                {jobDetails.title}
              </h1>
            </div>

            <div aria-label="Cargonet AI company logo badge" className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm shadow-orange-600/20">
              CN
            </div>
          </div>

          {/* Position Quick Meta Badges */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <svg className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{jobDetails.location}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <svg className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{jobDetails.salary}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <svg className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{jobDetails.employmentType}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-zinc-600">
              <span>{jobDetails.company.size}</span>
            </span>
          </div>
        </header>

        {/* Shortlist Alert Banner */}
        {hasResults && isShortlisted && (
          <aside aria-label="Shortlist notification" className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3 animate-in fade-in duration-300">
            <span className="text-xl" aria-hidden="true">🎉</span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                You Are Shortlisted for the Final Interview!
              </h2>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                Your AI panel score is <strong className="font-semibold text-emerald-950">{score}/100</strong> (Threshold: 80+). Click <strong>"View Result"</strong> below to see your full AI debate evaluation and Chief Judge remarks.
              </p>
            </div>
          </aside>
        )}

        {/* Job Description & Details */}
        <section aria-label="Job description specifications" className="space-y-6 text-sm text-zinc-700">
          {/* About the Company & Role */}
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
              About Cargonet AI & The Role
            </h2>
            <p className="leading-relaxed text-zinc-700">
              {jobDetails.aboutRole}
            </p>
          </div>

          {/* What You'll Do */}
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
              What You'll Do
            </h2>
            <ul className="space-y-2.5">
              {jobDetails.whatYoullDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-zinc-700 leading-normal">
                  <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What We're Looking For */}
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
              What We're Looking For
            </h2>
            <ul className="space-y-2.5">
              {jobDetails.whatWereLookingFor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-zinc-700 leading-normal">
                  <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What This Role Is NOT (Callout Banner) */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
            <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>What This Role Is NOT</span>
            </h3>
            <p className="text-xs text-orange-900 leading-relaxed">
              {jobDetails.whatRoleIsNot}
            </p>
          </div>

          {/* Skills / Tech Stack */}
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
              Tech Stack & Ecosystem
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {jobDetails.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Action Area */}
      <footer className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={!hasResults}
            onClick={onViewResult}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              hasResults
                ? isShortlisted
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100/70 shadow-xs cursor-pointer'
                  : 'border-zinc-300 bg-white text-zinc-900 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/50 shadow-xs cursor-pointer'
                : 'border-zinc-200 bg-zinc-100/60 text-zinc-400 cursor-not-allowed opacity-50'
            }`}
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              {hasResults
                ? isShortlisted
                  ? `🎉 View Result (${score ? `${score}/100 • Shortlisted` : 'Shortlisted'})`
                  : `View Result (${score ? `${score}/100` : 'Evaluated'})`
                : 'View Result'}
            </span>
            {hasResults && (
              <span className={`w-2 h-2 rounded-full ${isShortlisted ? 'bg-emerald-600' : 'bg-orange-600'} animate-pulse`} aria-hidden="true"></span>
            )}
          </button>
        </div>

        {/* Right-Aligned Next Button */}
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
        >
          <span>{hasResults ? 'Re-upload' : 'Next'}</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </footer>
    </article>
  )
}

export default JobDetails
