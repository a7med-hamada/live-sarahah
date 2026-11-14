import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Strictly disabled for security & privacy - users list must never be exposed publicly
  return NextResponse.json(
    { success: false, error: 'الوصول محظور لأسباب أمنية لحماية خصوصية الحسابات' },
    { status: 403 }
  );
}
