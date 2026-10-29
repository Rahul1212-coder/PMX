import { NextResponse } from 'next/server';
import { getLearningMaterials, publishLearningMaterial } from '@/lib/learning/repository';
import { LearningItemType, LearningCategory, LearningDifficulty } from '@/types/learning';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'all') as LearningItemType | 'all';
    const category = (searchParams.get('category') || 'all') as LearningCategory | 'all';
    const difficulty = (searchParams.get('difficulty') || 'all') as LearningDifficulty | 'all';
    const searchQuery = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const materials = await getLearningMaterials({
      type,
      category,
      difficulty,
      searchQuery,
      limit,
    });

    return NextResponse.json({
      success: true,
      materials,
      totalCount: materials.length,
    });
  } catch (error: any) {
    console.error('Failed to get learning materials:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch learning materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const materialPayload = body.material || body;

    if (!materialPayload || !materialPayload.title || !materialPayload.type || !materialPayload.category) {
      return NextResponse.json(
        { error: 'Invalid learning material payload: title, type, and category are required' },
        { status: 400 }
      );
    }

    const result = await publishLearningMaterial(materialPayload);

    return NextResponse.json({
      success: true,
      material: result.item,
      item: result.item,
    });
  } catch (error: any) {
    console.error('Failed to publish learning material:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to publish learning material' },
      { status: 500 }
    );
  }
}
