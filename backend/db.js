import crypto from 'node:crypto';

// In-Memory Storage Adapter (100% crash-proof across all Node versions & Serverless environments)
const memoryUsers = new Map();
const memoryApplications = [];
let nextUserId = 1;
let nextAppId = 1;

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
export function saveApplication({ candidateId, userId = null, candidateName, fileName, fileSize, parsedJson }) {
  const jsonStr = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson);

  const app = {
    id: nextAppId++,
    candidate_id: candidateId,
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

export default {
  createUser,
  getUserByEmail,
  getUserById,
  saveApplication,
  getAllApplications,
  hashPassword,
  verifyPassword
};
