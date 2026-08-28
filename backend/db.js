import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database in backend directory
const dbPath = path.join(__dirname, 'promptwars.db');
const db = new DatabaseSync(dbPath);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('applicant', 'employer')),
    company_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id TEXT NOT NULL,
    user_id INTEGER,
    candidate_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    parsed_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

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
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey);
}

/**
 * Register a new user
 */
export function createUser({ name, email, password, role, companyName = null }) {
  const { salt, hash } = hashPassword(password);
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, salt, role, company_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(name.trim(), email.trim().toLowerCase(), hash, salt, role, companyName ? companyName.trim() : null);
  return {
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    companyName: companyName ? companyName.trim() : null
  };
}

/**
 * Find user by email
 */
export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
  return stmt.get(email.trim().toLowerCase());
}

/**
 * Find user by ID
 */
export function getUserById(id) {
  const stmt = db.prepare('SELECT id, name, email, role, company_name, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

/**
 * Save parsed resume application
 */
export function saveApplication({ candidateId, userId = null, candidateName, fileName, fileSize, parsedJson }) {
  const stmt = db.prepare(`
    INSERT INTO applications (candidate_id, user_id, candidate_name, file_name, file_size, parsed_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const jsonStr = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson);
  const result = stmt.run(candidateId, userId, candidateName, fileName, fileSize, jsonStr);
  return Number(result.lastInsertRowid);
}

/**
 * Retrieve all applications (for Employer dashboard)
 */
export function getAllApplications() {
  const stmt = db.prepare(`
    SELECT id, candidate_id, user_id, candidate_name, file_name, file_size, parsed_json, created_at
    FROM applications
    ORDER BY created_at DESC
  `);
  const rows = stmt.all();
  return rows.map((r) => ({
    ...r,
    parsed: JSON.parse(r.parsed_json)
  }));
}

export default db;
