import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { verifyPassword, sanitizeUsername, toSafeUser, generateSessionToken } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const clean = sanitizeUsername(username);
    const user = Storage.getUserByUsername(clean);

    if (!user) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم غير مسجل، يمكنك إنشاء حساب جديد' }, { status: 404 });
    }

    // Secure timing-safe password check
    if (user.password && !verifyPassword(password, user.password)) {
      return NextResponse.json({ success: false, error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Generate secure stateless signed session token (valid for 30 days across all lambdas)
    const sessionToken = generateSessionToken(clean);
    const sessionExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    Storage.updateUserProfile(clean, {
      sessionToken,
      sessionExpiresAt,
    });

    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      data: toSafeUser(user),
    });

    // Also set httpOnly-friendly cookie
    response.cookies.set('session_token', sessionToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false, // Accessible to client for header injection if needed
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
