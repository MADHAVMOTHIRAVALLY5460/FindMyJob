import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Universal Database Adapter (SQLite when available, resilient In-Memory Store on Serverless / Node 20)
let sqliteDb = null;
let useMemoryStore = true;

// In-Memory Storage Fallback (for Vercel Serverless / Node < 22)
const memoryUsers = new Map();
const memoryApplications = [];
let nextUserId = 1;
let nextAppId = 1;

try {
  // Dynamically attempt to load node:sqlite
  const sqliteModule = await import('node:sqlite').catch(() => null);
  if (sqliteModule && sqliteModule.DatabaseSync) {
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const dbDir = isVercel ? '/tmp' : __dirname;
    const dbPath = path.join(dbDir, 'promptwars.db');
    
    sqliteDb = new sqliteModule.DatabaseSync(dbPath);
    sqliteDb.exec(`
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
    useMemoryStore = false;
    console.log(`[DB] Using SQLite database at: ${dbPath}`);
  } else {
    console.log('[DB] node:sqlite not available in this Node runtime. Using in-memory storage adapter.');
  }
} catch (err) {
  console.warn('[DB] SQLite init warning, falling back to in-memory store:', err.message);
  useMemoryStore = true;
}

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
  const normalizedEmail = email.trim().toLowerCase();

  if (!useMemoryStore && sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (name, email, password_hash, salt, role, company_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name.trim(), normalizedEmail, hash, salt, role, companyName ? companyName.trim() : null);
      return {
        id: Number(result.lastInsertRowid),
        name: name.trim(),
        email: normalizedEmail,
        role,
        companyName: companyName ? companyName.trim() : null
      };
    } catch (err) {
      console.warn('[DB] SQLite write failed, routing to memory store:', err.message);
    }
  }

  // In-Memory User Creation
  const existing = Array.from(memoryUsers.values()).find(u => u.email === normalizedEmail);
  if (existing) {
    const error = new Error('UNIQUE constraint failed: users.email');
    error.code = 'SQLITE_CONSTRAINT';
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

  if (!useMemoryStore && sqliteDb) {
    try {
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
      const user = stmt.get(normalizedEmail);
      if (user) return user;
    } catch (err) {
      console.warn('[DB] SQLite read failed:', err.message);
    }
  }

  // In-Memory Search
  return Array.from(memoryUsers.values()).find(u => u.email === normalizedEmail) || null;
}

/**
 * Find user by ID
 */
export function getUserById(id) {
  if (!useMemoryStore && sqliteDb) {
    try {
      const stmt = sqliteDb.prepare('SELECT id, name, email, role, company_name, created_at FROM users WHERE id = ?');
      const user = stmt.get(id);
      if (user) return user;
    } catch (err) {
      console.warn('[DB] SQLite read failed:', err.message);
    }
  }

  return memoryUsers.get(Number(id)) || null;
}

/**
 * Save parsed resume application
 */
export function saveApplication({ candidateId, userId = null, candidateName, fileName, fileSize, parsedJson }) {
  const jsonStr = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson);

  if (!useMemoryStore && sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        INSERT INTO applications (candidate_id, user_id, candidate_name, file_name, file_size, parsed_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(candidateId, userId, candidateName, fileName, fileSize, jsonStr);
      return Number(result.lastInsertRowid);
    } catch (err) {
      console.warn('[DB] SQLite saveApplication failed:', err.message);
    }
  }

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
  if (!useMemoryStore && sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        SELECT id, candidate_id, user_id, candidate_name, file_name, file_size, parsed_json, created_at
        FROM applications
        ORDER BY created_at DESC
      `);
      const rows = stmt.all();
      return rows.map((r) => ({
        ...r,
        parsed: JSON.parse(r.parsed_json)
      }));
    } catch (err) {
      console.warn('[DB] SQLite getAllApplications failed:', err.message);
    }
  }

  return memoryApplications.map((r) => ({
    ...r,
    parsed: typeof r.parsed_json === 'string' ? JSON.parse(r.parsed_json) : r.parsed_json
  }));
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
