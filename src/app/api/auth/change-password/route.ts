import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { verifyPassword, hashPassword, sanitizeUsername } from '@/lib/security';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة (اسم المستخدم، كلمة المرور الحالية، كلمة المرور الجديدة)' },
        { status: 400 }
      );
    }

    const cleanUsername = sanitizeUsername(username);

    // 1. Authenticate that the caller is logged in as this user
    const auth = authenticateRequest(request, cleanUsername);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بتغيير كلمة المرور، يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const user = Storage.getUserByUsername(cleanUsername);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // 2. Strict Check: Verify current (old) password
    if (!user.password || !verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الحالية (القديمة) غير صحيحة ❌' },
        { status: 400 }
      );
    }

    // 3. Validate new password length
    if (newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' },
        { status: 400 }
      );
    }

    // 4. Hash and save new password securely
    const newPasswordHash = hashPassword(newPassword.trim());
    Storage.updateUserProfile(cleanUsername, {
      password: newPasswordHash,
    });

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور وتأمين حسابك بنجاح! 🔒',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
