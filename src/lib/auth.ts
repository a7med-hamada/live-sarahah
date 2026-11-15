import { NextRequest } from 'next/server';
import { Storage } from './storage';
import { UserProfile } from './types';
import { verifySignedSessionToken } from './security';

export interface AuthResult {
  authenticated: boolean;
  user: UserProfile | null;
  error?: string;
}

/**
 * Extract session token from Bearer header or x-session-token
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const t = authHeader.substring(7).trim();
    if (t) return t;
  }

  const customHeader = request.headers.get('x-session-token');
  if (customHeader && customHeader.trim()) {
    return customHeader.trim();
  }

  // Also check cookies if available
  const cookieToken = request.cookies.get('session_token')?.value;
  if (cookieToken && cookieToken.trim()) {
    return cookieToken.trim();
  }

  return null;
}

/**
 * Authenticate incoming request for a specific username or any valid active streamer
 */
export function authenticateRequest(
  request: NextRequest,
  targetUsername?: string
): AuthResult {
  const token = extractToken(request);

  if (!token) {
    return {
      authenticated: false,
      user: null,
      error: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذه البيانات',
    };
  }

  // 1. Fast cryptographic stateless verification (works across all Vercel lambdas)
  const signedCheck = verifySignedSessionToken(token, targetUsername);
  if (signedCheck.valid && signedCheck.username) {
    const user = Storage.getUserByUsername(signedCheck.username);
    return { authenticated: true, user };
  }

  // 2. Fallback to stateful user check (for legacy tokens)
  if (targetUsername) {
    const user = Storage.getUserByUsername(targetUsername);
    if (!user) {
      return { authenticated: false, user: null, error: 'المستخدم غير موجود' };
    }

    if (user.sessionToken && user.sessionToken === token) {
      if (user.sessionExpiresAt && Date.now() > user.sessionExpiresAt) {
        return {
          authenticated: false,
          user: null,
          error: 'انتهت صلاحية جلسة الدخول، يرجى تسجيل الدخول مجدداً',
        };
      }
      return { authenticated: true, user };
    }

    return {
      authenticated: false,
      user: null,
      error: 'جلسة الدخول غير صالحة أو منتهية، يرجى تسجيل الدخول مرة أخرى',
    };
  }

  // Look up user by token across all users
  const allUsers = Storage.getAllUsers();
  const matchedUser = allUsers.find(
    (u) =>
      u.sessionToken === token &&
      (!u.sessionExpiresAt || Date.now() <= u.sessionExpiresAt)
  );

  if (!matchedUser) {
    return {
      authenticated: false,
      user: null,
      error: 'رمز الجلسة غير صالح أو منتهي، يرجى تسجيل الدخول',
    };
  }

  return { authenticated: true, user: matchedUser };
}
