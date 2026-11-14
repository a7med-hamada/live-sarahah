import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { verifyPassword, sanitizeUsername, toSafeUser } from '@/lib/security';

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

    return NextResponse.json({ success: true, data: toSafeUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
