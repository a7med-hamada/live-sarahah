import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existingMessage = Storage.getMessageById(id);
    if (!existingMessage) {
      return NextResponse.json({ success: false, error: 'الرسالة غير موجودة' }, { status: 404 });
    }

    // High security check: Only the recipient can pin, read, or update the message
    const auth = authenticateRequest(request, existingMessage.recipientUsername);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بتعديل هذه الرسالة' },
        { status: 401 }
      );
    }

    const ok = Storage.updateMessage(id, body);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'تعذر تعديل الرسالة' }, { status: 400 });
    }

    const updated = Storage.getMessageById(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingMessage = Storage.getMessageById(id);
    if (!existingMessage) {
      return NextResponse.json({ success: false, error: 'الرسالة غير موجودة' }, { status: 404 });
    }

    // High security check: Only the recipient can delete their received messages
    const auth = authenticateRequest(request, existingMessage.recipientUsername);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بحذف هذه الرسالة' },
        { status: 401 }
      );
    }

    const ok = Storage.deleteMessage(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'تعذر حذف الرسالة' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
