import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const user = Storage.getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    let activeMessage = null;
    if (user.activeOverlayMessageId) {
      activeMessage = Storage.getMessageById(user.activeOverlayMessageId);
    }

    // If no active message set, automatically show the newest message
    if (!activeMessage) {
      const userMessages = Storage.getMessagesForUser(username);
      if (userMessages.length > 0) {
        activeMessage = userMessages[0];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          username: user.username,
          displayName: user.displayName,
          bigTitle: user.bigTitle,
          avatarUrl: user.avatarUrl,
          isLive: user.isLive,
          cardCustomization: user.cardCustomization || {},
        },
        message: activeMessage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // High security check: Only the owner can control which message appears on overlay
    const auth = authenticateRequest(request, username);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بالتحكم في شاشة البث' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId } = body;

    const ok = Storage.setActiveOverlayMessage(username, messageId || null);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
