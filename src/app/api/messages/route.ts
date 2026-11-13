import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const messages = Storage.getMessagesForUser(username);
    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, content } = body;

    if (!username || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'الرسالة واسم المستلم مطلوبان' },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = Storage.getUserByUsername(username);
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'المستلم غير موجود' },
        { status: 404 }
      );
    }

    if (content.trim().length > 1500) {
      return NextResponse.json(
        { success: false, error: 'الرسالة طويلة جداً (الحد الأقصى 1500 حرف)' },
        { status: 400 }
      );
    }

    // Add message without touching activeOverlayMessageId so current live card never shifts!
    const message = Storage.addMessage(username, content);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
