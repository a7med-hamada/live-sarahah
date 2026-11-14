import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { hashPassword, sanitizeUsername, sanitizeText, toSafeUser } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, password, email, bigTitle, subtitle, topicTitle, topicNotice, avatarUrl } = body;

    if (!username || !username.trim()) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف أو أرقام إنجليزية على الأقل' },
        { status: 400 }
      );
    }

    if (!password || password.length < 3) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 3 خانات على الأقل' },
        { status: 400 }
      );
    }

    const existing = Storage.getUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم مأخوذ بالفعل، اختر اسماً آخر' },
        { status: 400 }
      );
    }

    const securePasswordHash = hashPassword(password);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      displayName: sanitizeText(displayName?.trim() || cleanUsername, 50),
      bigTitle: sanitizeText(bigTitle?.trim() || `${displayName || cleanUsername} Live`, 60),
      password: securePasswordHash,
      email: email ? sanitizeText(email, 100) : '',
      avatarUrl: avatarUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      subtitle: sanitizeText(
        subtitle?.trim() || 'ابعتلي أي حاجة في دماغك من غير اسم. سؤال، رأي، اعتراف... محدش هيعرف إنت مين.',
        300
      ),
      topicTitle: sanitizeText(topicTitle?.trim() || 'مشاكل عاطفية', 100),
      topicNotice: sanitizeText(topicNotice?.trim() || 'أي رسالة برا الموضوع ده، مش هتظهر في اللايف 👀', 200),
      isLive: true,
      liveBadgeText: '• LIVE',
      createdAt: Date.now(),
    };

    Storage.saveUser(newUser);

    return NextResponse.json({ success: true, data: toSafeUser(newUser) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
