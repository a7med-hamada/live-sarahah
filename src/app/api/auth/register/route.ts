import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, password, email, bigTitle, subtitle, topicTitle, topicNotice, avatarUrl } = body;

    if (!username || !username.trim()) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف إنجليزية على الأقل' }, { status: 400 });
    }

    const existing = Storage.getUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مأخوذ بالفعل، اختر اسماً آخر' }, { status: 400 });
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      displayName: displayName?.trim() || cleanUsername,
      bigTitle: bigTitle?.trim() || `${displayName || cleanUsername} Live`,
      password: password || '123',
      email: email || '',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      subtitle: subtitle?.trim() || 'ابعتلي أي حاجة في دماغك من غير اسم. سؤال، رأي، اعتراف... محدش هيعرف إنت مين.',
      topicTitle: topicTitle?.trim() || 'مشاكل عاطفية',
      topicNotice: topicNotice?.trim() || 'أي رسالة برا الموضوع ده، مش هتظهر في اللايف 👀',
      isLive: true,
      liveBadgeText: '• LIVE',
      createdAt: Date.now(),
    };

    Storage.saveUser(newUser);

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
