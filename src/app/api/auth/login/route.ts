import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const clean = username.toLowerCase().trim();
    const user = Storage.getUserByUsername(clean);

    if (!user) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم غير مسجل' }, { status: 404 });
    }

    // Simple password check (if set)
    // Accept user's password, OR default master password '123'
    if (user.password && password && user.password !== password && password !== '123') {
      return NextResponse.json({ success: false, error: 'كلمة المرور غير صحيحة (كلمة المرور الافتراضية: 123)' }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
