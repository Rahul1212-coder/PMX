import { NextResponse } from 'next/server';
import { getAdminAssessmentStats } from '@/lib/assessment/repository';
import { isAuthorizedAdmin } from '@/lib/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('adminEmail') || '';

    if (!isAuthorizedAdmin(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const stats = await getAdminAssessmentStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
