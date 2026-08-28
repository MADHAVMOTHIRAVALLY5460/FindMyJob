import crypto from 'node:crypto';

// In-Memory Storage Adapter (100% crash-proof across all Node versions & Serverless environments)
const memoryUsers = new Map();
const memoryApplications = [];
const memoryJobs = [];
let nextUserId = 1;
let nextAppId = 1;
let nextJobId = 1;

/**
 * Hash password using crypto.scrypt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex')
  };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password, storedHash, salt) {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

/**
 * Register a new user
 */
export function createUser({ name, email, password, role, companyName = null }) {
  const { salt, hash } = hashPassword(password);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = Array.from(memoryUsers.values()).find(u => u.email === normalizedEmail);
  if (existing) {
    const error = new Error('An account with this email already exists.');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const user = {
    id: nextUserId++,
    name: name.trim(),
    email: normalizedEmail,
    password_hash: hash,
    salt,
    role,
    company_name: companyName ? companyName.trim() : null,
    created_at: new Date().toISOString()
  };
  memoryUsers.set(user.id, user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.company_name
  };
}

/**
 * Find user by email
 */
export function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return Array.from(memoryUsers.values()).find(u => u.email === normalizedEmail) || null;
}

/**
 * Find user by ID
 */
export function getUserById(id) {
  return memoryUsers.get(Number(id)) || null;
}

/**
 * Save parsed resume application
 */
export function saveApplication({ candidateId, jobId = 'job_01', userId = null, candidateName, fileName, fileSize, parsedJson }) {
  const jsonStr = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson);

  const app = {
    id: nextAppId++,
    candidate_id: candidateId,
    job_id: jobId,
    user_id: userId,
    candidate_name: candidateName,
    file_name: fileName,
    file_size: fileSize,
    parsed_json: jsonStr,
    created_at: new Date().toISOString()
  };
  memoryApplications.unshift(app);
  return app.id;
}

/**
 * Retrieve all applications (for Employer dashboard)
 */
export function getAllApplications() {
  return memoryApplications.map((r) => ({
    ...r,
    parsed: typeof r.parsed_json === 'string' ? JSON.parse(r.parsed_json) : r.parsed_json
  }));
}

/**
 * Create a new job requisition / position
 */
export function createJob({
  title,
  company = { name: 'Cargonet AI', industry: 'Logistics Tech', size: '50-100 employees' },
  department = 'Engineering',
  location = 'Remote / San Francisco, CA',
  employmentType = 'Full-time',
  salary = '$150k - $190k • Equity',
  aboutRole = '',
  whatYoullDo = [],
  whatWereLookingFor = [],
  whatRoleIsNot = '',
  skills = []
}) {
  const job = {
    id: `job_${String(nextJobId++).padStart(2, '0')}`,
    title: title.trim(),
    company: typeof company === 'string' ? { name: company, industry: 'Tech', size: '50-100 employees' } : company,
    department: department.trim(),
    location: location.trim(),
    employmentType: employmentType.trim(),
    salary: salary.trim(),
    aboutRole: aboutRole.trim(),
    whatYoullDo: Array.isArray(whatYoullDo) ? whatYoullDo : [whatYoullDo],
    whatWereLookingFor: Array.isArray(whatWereLookingFor) ? whatWereLookingFor : [whatWereLookingFor],
    whatRoleIsNot: whatRoleIsNot.trim(),
    skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean),
    status: 'Open',
    applicantCount: 0,
    createdAt: new Date().toISOString()
  };

  memoryJobs.unshift(job);
  return job;
}

/**
 * Retrieve all job listings
 */
export function getAllJobs() {
  return memoryJobs;
}

/**
 * Get job by ID
 */
export function getJobById(id) {
  return memoryJobs.find(j => j.id === id) || null;
}

// Pre-seed demo accounts
try {
  createUser({
    name: 'Demo Applicant',
    email: 'applicant@findmyjob.ai',
    password: 'password123',
    role: 'applicant'
  });
  createUser({
    name: 'Cargonet Recruiter',
    email: 'recruiter@cargonet.ai',
    password: 'password123',
    role: 'employer',
    companyName: 'Cargonet AI'
  });
} catch {
  // Ignored
}

// Pre-seed default Cargonet AI job
createJob({
  title: 'AI Engineer — Agentic Systems',
  company: {
    name: 'Cargonet AI',
    industry: 'Logistics & Supply Chain Tech',
    size: '50-150 employees'
  },
  department: 'Applied AI & Core Engineering',
  location: 'Remote (US/EU) / San Francisco',
  employmentType: 'Full-time',
  salary: '$160,000 - $210,000 + Equity',
  aboutRole: 'Cargonet AI is building the next-generation autonomous logistics operating system. We are looking for an AI Engineer specializing in agentic workflows to build, evaluate, and scale autonomous dispatch and rate-negotiation agents.',
  whatYoullDo: [
    'Architect multi-agent coordination pipelines for freight matching and automated pricing negotiation.',
    'Build reliable LLM evaluation benchmarks and deterministic fallback guardrails.',
    'Integrate vector search (RAG) over structured transportation contracts and tariff tables.',
    'Collaborate directly with product and operations to deploy resilient microservices into production.'
  ],
  whatWereLookingFor: [
    '3+ years experience building production software with Python (FastAPI, asyncio) and modern backend frameworks.',
    'Hands-on experience deploying LLM agent frameworks (LangGraph, AutoGen, CrewAI, or bespoke state machines).',
    'Demonstrated understanding of deterministic validation, structured output schemas, and latency optimization.',
    'Clear, humble communication with high agency in fast-paced startup environments.'
  ],
  whatRoleIsNot: 'This is NOT a prompt engineering or basic wrapper role. You will be building resilient distributed systems with rigorous evaluation harnesses, telemetry, and automated unit testing.',
  skills: ['Python', 'FastAPI', 'Multi-Agent Systems', 'Vector Search (RAG)', 'Docker', 'PostgreSQL / SQLite', 'LangGraph', 'REST APIs']
});

export default {
  createUser,
  getUserByEmail,
  getUserById,
  saveApplication,
  getAllApplications,
  createJob,
  getAllJobs,
  getJobById,
  hashPassword,
  verifyPassword
};
