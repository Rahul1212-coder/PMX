import { NextResponse } from 'next/server';
import { getAllQuestions, saveQuestion } from '@/lib/assessment/repository';
import { isAuthorizedAdmin } from '@/lib/admin';
import { AssessmentQuestion } from '@/types/assessment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('adminEmail') || '';

    if (!isAuthorizedAdmin(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const levelFilter = searchParams.get('levelId');
    const competencyFilter = searchParams.get('competency');
    const search = searchParams.get('search')?.toLowerCase();

    let questions = await getAllQuestions();

    if (levelFilter && levelFilter !== 'all') {
      questions = questions.filter((q) => q.levelId === levelFilter);
    }
    if (competencyFilter && competencyFilter !== 'all') {
      questions = questions.filter((q) => q.competency === competencyFilter);
    }
    if (search) {
      questions = questions.filter(
        (q) =>
          q.title.toLowerCase().includes(search) ||
          q.questionText.toLowerCase().includes(search) ||
          (q.scenario && q.scenario.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: questions.length,
      questions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, question } = body;

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    if (!question || !question.id || !question.questionText || !question.levelId) {
      return NextResponse.json(
        { error: 'Question data is missing required fields (id, questionText, levelId).' },
        { status: 400 }
      );
    }

    const saved = await saveQuestion(question as AssessmentQuestion);
    return NextResponse.json({ success: true, question: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
