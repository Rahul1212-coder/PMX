import fs from 'fs';
import path from 'path';
import { getSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/client';
import { LearningItem, LearningItemType, LearningCategory, LearningDifficulty } from '@/types/learning';
import { INITIAL_LEARNING_ITEMS } from './initialData';

const CACHE_DIR = path.join(process.cwd(), 'src/data/.learning_cache');
const CUSTOM_ITEMS_FILE = path.join(CACHE_DIR, 'custom_materials.json');

// Ensure local cache directory exists
function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Unable to create learning cache directory:', err);
  }
}

// Read custom published materials from local cache
function getLocalCustomMaterials(): LearningItem[] {
  try {
    ensureCacheDir();
    if (!fs.existsSync(CUSTOM_ITEMS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(CUSTOM_ITEMS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read local learning custom materials:', err);
    return [];
  }
}

// Save custom published material to local cache
function saveLocalCustomMaterial(item: LearningItem) {
  try {
    ensureCacheDir();
    const existing = getLocalCustomMaterials();
    const index = existing.findIndex((e) => e.id === item.id || e.slug === item.slug);
    if (index >= 0) {
      existing[index] = item;
    } else {
      existing.unshift(item);
    }
    fs.writeFileSync(CUSTOM_ITEMS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save local learning custom material:', err);
  }
}

// Convert Supabase DB row to LearningItem
function mapDbRowToItem(row: any): LearningItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as LearningItemType,
    category: row.category as LearningCategory,
    difficulty: row.difficulty as LearningDifficulty,
    readTimeMinutes: Number(row.read_time_minutes) || 5,
    summary: row.summary,
    tags: Array.isArray(row.tags) ? row.tags : [],
    conceptDetail: row.concept_detail || undefined,
    caseStudyDetail: row.case_study_detail || undefined,
    teardownDetail: row.teardown_detail || undefined,
    author: row.author || { name: 'PMVerse Editorial', role: 'Staff PM' },
    isPublished: row.is_published !== false,
    isCustom: Boolean(row.is_custom),
    likesCount: Number(row.likes_count) || 0,
    viewsCount: Number(row.views_count) || 0,
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
  };
}

export interface GetLearningMaterialsFilter {
  type?: LearningItemType | 'all';
  category?: LearningCategory | 'all';
  difficulty?: LearningDifficulty | 'all';
  searchQuery?: string;
  limit?: number;
}

/**
 * Fetch all learning materials with optional filters, merging DB + Initial + Cache
 */
export async function getLearningMaterials(
  filters: GetLearningMaterialsFilter = {}
): Promise<LearningItem[]> {
  const { type, category, difficulty, searchQuery, limit } = filters;
  const itemsMap = new Map<string, LearningItem>();

  // 1. Seed with hardcoded canonical curriculum
  for (const item of INITIAL_LEARNING_ITEMS) {
    itemsMap.set(item.slug, item);
  }

  // 2. Load from local cache fallback
  const localCustom = getLocalCustomMaterials();
  for (const item of localCustom) {
    itemsMap.set(item.slug, item);
  }

  // 3. Attempt query from Supabase database if configured
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('learning_materials').select('*').eq('is_published', true);

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (difficulty && difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        for (const row of data) {
          const item = mapDbRowToItem(row);
          itemsMap.set(item.slug, item);
        }
      }
    }
  } catch (err) {
    // Graceful fallback to cached & pre-seeded items
    console.warn('Supabase learning query skipped/fallback:', (err as any)?.message);
  }

  let results = Array.from(itemsMap.values());

  // 4. Apply client filters
  if (type && type !== 'all') {
    results = results.filter((item) => item.type === type);
  }
  if (category && category !== 'all') {
    results = results.filter((item) => item.category === category);
  }
  if (difficulty && difficulty !== 'all') {
    results = results.filter((item) => item.difficulty === difficulty);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (limit && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Fetch a single learning material by its slug or ID
 */
export async function getLearningMaterialBySlug(slugOrId: string): Promise<LearningItem | null> {
  const all = await getLearningMaterials();
  const match = all.find((item) => item.slug === slugOrId || item.id === slugOrId);
  return match || null;
}

/**
 * Publish a new or edited learning material (persists to Supabase + local cache)
 */
export async function publishLearningMaterial(
  item: LearningItem
): Promise<{ success: boolean; item: LearningItem }> {
  // Ensure required fields
  const prepared: LearningItem = {
    ...item,
    id: item.id || `lm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    publishedAt: item.publishedAt || new Date().toISOString(),
    isPublished: true,
    isCustom: true,
  };

  // 1. Save to local cache immediately
  saveLocalCustomMaterial(prepared);

  // 2. Upsert to Supabase if available
  try {
    const admin = getSupabaseAdminClient() || getSupabaseClient();
    if (admin) {
      await admin.from('learning_materials').upsert({
        id: prepared.id,
        slug: prepared.slug,
        title: prepared.title,
        type: prepared.type,
        category: prepared.category,
        difficulty: prepared.difficulty,
        read_time_minutes: prepared.readTimeMinutes,
        summary: prepared.summary,
        tags: prepared.tags,
        concept_detail: prepared.conceptDetail || null,
        case_study_detail: prepared.caseStudyDetail || null,
        teardown_detail: prepared.teardownDetail || null,
        author: prepared.author,
        is_published: prepared.isPublished,
        is_custom: true,
        published_at: prepared.publishedAt,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Unable to persist to Supabase learning_materials, cached locally:', err);
  }

  return { success: true, item: prepared };
}
