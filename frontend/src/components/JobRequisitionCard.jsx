function JobRequisitionCard({ job }) {
  if (!job) return null

  return (
    <article className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between" aria-label={`Job position: ${job.title}`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-xs text-zinc-900 line-clamp-1">{job.title}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-950 flex-shrink-0">
            Active
          </span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-2">
          <span>{job.location || 'Remote'}</span>
          <span>•</span>
          <span>{job.employmentType || 'Full-time'}</span>
          <span>•</span>
          <span className="text-orange-700 font-semibold">{job.salary || 'Competitive'}</span>
        </p>
        <p className="text-xs text-zinc-700 mt-2 line-clamp-2 leading-relaxed">
          {job.aboutRole}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
        {(job.skills || []).slice(0, 3).map((sk, sIdx) => (
          <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-semibold">
            {sk}
          </span>
        ))}
        {(job.skills || []).length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>
    </article>
  )
}

export default JobRequisitionCard
