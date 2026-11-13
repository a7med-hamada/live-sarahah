import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const ok = Storage.updateMessage(id, body);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'الرسالة غير موجودة' }, { status: 404 });
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
    const ok = Storage.deleteMessage(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'تعذر حذف الرسالة' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
