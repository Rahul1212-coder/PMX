import { NextResponse } from 'next/server';
import { getLevelsWithUserProgress } from '@/lib/assessment/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const data = await getLevelsWithUserProgress(userId);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch assessment levels' }, { status: 500 });
  }
}
