import { NextResponse } from 'next/server';
import { getAttemptById } from '@/lib/assessment/repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    const attempt = await getAttemptById(id);
    if (!attempt) {
      return NextResponse.json({ error: 'Assessment attempt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessment attempt' },
      { status: 500 }
    );
  }
}
