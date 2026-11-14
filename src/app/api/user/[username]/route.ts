import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { hashPassword, toSafeUser } from '@/lib/security';
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

    return NextResponse.json({ success: true, data: toSafeUser(user) });
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

    // High security check: Only the account owner can update their profile or card customization
    const auth = authenticateRequest(request, username);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'غير مصرح بتعديل بيانات هذا الحساب' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Prevent overwriting internal security fields
    delete body.sessionToken;
    delete body.sessionExpiresAt;

    // If password is being updated, hash it securely
    if (body.password) {
      body.password = hashPassword(body.password);
    }

    const updated = Storage.updateUserProfile(username, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'تعذر تحديث البيانات' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: toSafeUser(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
