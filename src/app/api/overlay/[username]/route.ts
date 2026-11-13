import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

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

    // If none pinned, get latest message
    if (!activeMessage) {
      const all = Storage.getMessagesForUser(username);
      if (all.length > 0) {
        activeMessage = all[0];
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
    const body = await request.json();
    const { messageId } = body;

    const ok = Storage.setActiveOverlayMessage(username, messageId || null);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
