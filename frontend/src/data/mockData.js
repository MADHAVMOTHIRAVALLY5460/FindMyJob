export const defaultMockApplicants = [
  {
    id: 'cand_02',
    name: 'Alex Rivera',
    role: 'AI Engineer — Agentic Systems',
    fileName: 'alex_rivera_cv.pdf',
    date: 'Today, 09:15 AM',
    status: 'Reviewed',
    matchScore: 89,
    skills: ['Python', 'FastAPI', 'Claude API', 'LangChain'],
    rawResult: {
      candidateId: 'cand_02',
      name: 'Alex Rivera',
      skills: [
        { id: 'sk_01', name: 'Python', source: 'resume' },
        { id: 'sk_02', name: 'FastAPI', source: 'resume' }
      ],
      experience: [
        { id: 'ex_01', title: 'Senior AI Engineer', org: 'LogiTech Solutions', duration: '2023 - Present' }
      ]
    },
    candidateName: 'Alex Rivera',
    isLive: false
  },
  {
    id: 'cand_03',
    name: 'Marcus Chen',
    role: 'AI Engineer — Agentic Systems',
    fileName: 'marcus_chen_resume.pdf',
    date: 'Yesterday',
    status: 'Pending Review',
    matchScore: 82,
    skills: ['Python', 'Docker', 'MongoDB', 'React.js'],
    rawResult: {
      candidateId: 'cand_03',
      name: 'Marcus Chen',
      skills: [
        { id: 'sk_01', name: 'Python', source: 'resume' },
        { id: 'sk_02', name: 'Docker', source: 'resume' }
      ],
      experience: [
        { id: 'ex_01', title: 'Backend Developer', org: 'Apex Systems', duration: '2022 - 2024' }
      ]
    },
    candidateName: 'Marcus Chen',
    isLive: false
  }
];

export function getVerdictBadgeClass(verdict) {
  switch (verdict?.toLowerCase()) {
    case 'strong_fit':
    case 'strong_hire':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'fit':
    case 'hire':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'weak_fit':
    case 'borderline':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'not_fit':
    case 'no_hire':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
}
