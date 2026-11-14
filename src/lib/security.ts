import crypto from 'crypto';
import { UserProfile } from './types';

/**
 * Cryptographically secure password hashing using PBKDF2 with SHA-512 & unique 16-byte salt
 */
export function hashPassword(password: string): string {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

/**
 * Timing-safe password verification to protect against timing attacks
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // New secure format: pbkdf2$salt$hash
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(originalHash));
    } catch {
      return false;
    }
  }

  // Legacy plain-text fallback (if any older accounts exist)
  return storedHash === password;
}

/**
 * Sanitize username to prevent path traversal or injection
 */
export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
}

/**
 * Sanitize user input text to prevent XSS
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return '';
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Strip sensitive credentials (password, session tokens) before sending to client
 */
export function toSafeUser(user: UserProfile): Omit<UserProfile, 'password' | 'sessionToken' | 'sessionExpiresAt'> {
  const { password, sessionToken, sessionExpiresAt, ...safe } = user;
  return safe;
}
