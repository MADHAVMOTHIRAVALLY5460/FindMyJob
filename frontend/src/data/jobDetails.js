export const jobDetails = {
  title: 'AI Engineer — Agentic Systems (Freight Operations)',
  department: 'AI & Engineering',
  location: 'Chicago, IL • Hybrid / Remote',
  employmentType: 'Full-Time',
  experienceLevel: 'Mid - Senior Level',
  salary: '$150,000 – $190,000 / year + Equity & Benefits',
  postedDate: 'Posted 1 day ago',
  company: {
    name: 'Cargonet AI',
    tagline: 'Autonomous Freight & Logistics Intelligence',
    industry: 'Freight-Tech & Agentic AI Systems',
    size: '50-100 employees • Series A',
    website: 'cargonet.ai',
    description:
      'Cargonet AI is a freight-tech company running multi-agent AI systems in real production to automate shipment quoting, booking, tracking, document processing, and exception resolution.'
  },
  aboutRole:
    'We need an engineer to help improve our existing AI agent system (think of it as multiple AI workers — a planner, an executor, a reviewer, and specialized agents — working together). This is not a research-only job. You will build real features that go live for real users, mostly by directing AI coding tools (like Claude Code) rather than writing every line by hand — and you’ll be responsible for fixing things when they break in production.',
  whatYoullDo: [
    'Improve the multi-agent AI system (planner, executor, reviewer, and other agents) that powers freight operations: quoting, booking, tracking, document processing, and error handling.',
    'Build features mainly by directing AI coding tools (like Claude Code) — reviewing and guiding their output, not just writing code yourself.',
    'Work on the Python backend (built as small services) and the React.js front-end, using MongoDB as the database, to build clean features and easy-to-use screens for operators.',
    'Improve how the AI is prompted, what tools/memory it has access to, and how it searches for relevant information (RAG / vector search); help decide which AI models to use for the best balance of quality and cost.',
    'Keep the live system running smoothly — find and fix bugs when an AI agent misbehaves, and improve how we test and monitor the system.',
    'Help connect the system to outside tools: carrier/shipping APIs, other business software, and document scanning (OCR) for extracting data from shipping documents like invoices.'
  ],
  whatWereLookingFor: [
    'Solid Python backend skills (building APIs, working with small services).',
    'Some real hands-on experience with AI/LLM systems — not just tutorials (prompt writing, RAG/vector search, and testing how well an AI system performs).',
    'Comfortable taking ownership when something breaks in production, not just when a demo goes well.',
    'Basic React.js skills for building simple front-end screens.',
    'Nice to have: experience with logistics/freight, document scanning (OCR), or connecting different business systems together.'
  ],
  whatRoleIsNot:
    'This is not a “build it once and move on” role. We care as much about keeping things working reliably over time as we do about building the first version.',
  skills: [
    'Python',
    'AI Agent Systems',
    'Claude Code',
    'Prompt Engineering',
    'RAG & Vector Search',
    'React.js',
    'MongoDB',
    'Microservices',
    'OCR / Document Processing',
    'Carrier APIs'
  ]
}
