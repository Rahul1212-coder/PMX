import { NextResponse } from 'next/server';
import { generateLearningMaterialWithGemini } from '@/lib/learning/geminiGenerator';
import { GenerateMaterialRequest } from '@/types/learning';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateMaterialRequest;
    const { type, topic, category, difficulty, contextOrNotes, userId } = body;

    if (!userId || userId === 'guest' || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to generate learning materials with VerseAI.' },
        { status: 401 }
      );
    }

    if (!type || !topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Type (concept, case_study, teardown) and topic are required' },
        { status: 400 }
      );
    }

    const { material, source } = await generateLearningMaterialWithGemini({
      type,
      topic: topic.trim(),
      category: category || 'Product Thinking',
      difficulty: difficulty || 'intermediate',
      contextOrNotes: contextOrNotes?.trim(),
    });

    return NextResponse.json({
      success: true,
      material,
      source,
    });
  } catch (error: any) {
    console.error('Failed to generate learning material:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate learning material' },
      { status: 500 }
    );
  }
}
