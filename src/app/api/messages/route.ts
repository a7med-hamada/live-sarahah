import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { sanitizeText } from '@/lib/security';
import { containsProfanity, censorProfanity } from '@/lib/profanity';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    // High security check: Only the owner of the account can view their private messages
    const auth = authenticateRequest(request, username);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح: لا يمكنك قراءة الرسائل بدون تسجيل الدخول' },
        { status: 401 }
      );
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

    let finalContent = sanitizeText(content, 1500);

    // Anti-Ban Profanity Filter
    const recipientConfig = recipient.cardCustomization || {};
    const isFilterEnabled = recipientConfig.enableProfanityFilter !== false;
    const filterAction = recipientConfig.profanityAction || 'censor';
    const customWords = recipientConfig.customBlockedWords || '';

    if (isFilterEnabled) {
      if (filterAction === 'block') {
        if (containsProfanity(finalContent, customWords)) {
          return NextResponse.json(
            {
              success: false,
              error: 'عذراً، الرسالة تحتوي على ألفاظ غير لائقة، ولا يمكن إرسالها لحماية البث المباشر من البان 🛡️',
            },
            { status: 400 }
          );
        }
      } else {
        // Censor mode: replace bad words with ****
        const { cleanText } = censorProfanity(finalContent, customWords);
        finalContent = cleanText;
      }
    }

    // Add message without touching activeOverlayMessageId so current live card never shifts!
    const message = Storage.addMessage(username, finalContent);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    // High security check: Only the account owner can delete all their messages
    const auth = authenticateRequest(request, username);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بحذف الرسائل' },
        { status: 401 }
      );
    }

    Storage.deleteAllMessagesForUser(username);
    return NextResponse.json({ success: true, message: 'تم مسح جميع الرسائل بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
