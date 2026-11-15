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

const AUTH_SECRET = process.env.AUTH_SECRET || 'live_stream_sarahah_super_secret_jwt_hmac_key_2026';

/**
 * Generate a cryptographically secure random session token or signed stateless token
 */
export function generateSessionToken(username?: string): string {
  if (username) {
    const clean = sanitizeUsername(username);
    const timestamp = Date.now();
    const payload = `${clean}:${timestamp}`;
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    const encodedPayload = Buffer.from(payload).toString('base64url');
    return `live_sess_${encodedPayload}.${signature}`;
  }
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify a cryptographically signed stateless token
 */
export function verifySignedSessionToken(
  token: string,
  expectedUsername?: string
): { valid: boolean; username: string | null } {
  if (!token || !token.startsWith('live_sess_')) {
    return { valid: false, username: null };
  }

  try {
    const raw = token.slice('live_sess_'.length);
    const [encodedPayload, signature] = raw.split('.');
    if (!encodedPayload || !signature) return { valid: false, username: null };

    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const [tokenUser, timestampStr] = payload.split(':');
    if (!tokenUser || !timestampStr) return { valid: false, username: null };

    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    const validSig = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    if (!validSig) return { valid: false, username: null };

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return { valid: false, username: null };
    }

    if (expectedUsername && tokenUser.toLowerCase() !== expectedUsername.toLowerCase()) {
      return { valid: false, username: null };
    }

    return { valid: true, username: tokenUser.toLowerCase() };
  } catch {
    return { valid: false, username: null };
  }
}

/**
 * Strip sensitive credentials (password, session tokens) before sending to client
 */
export function toSafeUser(user: UserProfile): Omit<UserProfile, 'password' | 'sessionToken' | 'sessionExpiresAt'> {
  const { password, sessionToken, sessionExpiresAt, ...safe } = user;
  return safe;
}
