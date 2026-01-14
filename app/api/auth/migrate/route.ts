import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LocalCourse {
  id: string;
  name: string;
  term?: string;
  examDate?: string;
}

interface LocalStudyPack {
  id: string;
  courseId: string;
  title: string;
  status: string;
}

interface LocalMaterial {
  id: string;
  packId: string;
  type: string;
  filename?: string;
  text: string;
}

interface LocalCard {
  id: string;
  packId: string;
  front: string;
  back: string;
  why?: string;
  citations: Array<{ source: string; page?: number; snippet: string }>;
  status: string;
}

interface LocalGuide {
  id: string;
  packId: string;
  content: string;
  citations: Array<{ source: string; page?: number; snippet: string }>;
}

interface MigrationData {
  courses: LocalCourse[];
  packs: LocalStudyPack[];
  materials: LocalMaterial[];
  cards: LocalCard[];
  guides: LocalGuide[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: MigrationData = await request.json();

    // Map old IDs to new IDs
    const courseIdMap: Record<string, string> = {};
    const packIdMap: Record<string, string> = {};

    // Migrate courses
    for (const course of data.courses || []) {
      const { data: newCourse, error } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          name: course.name,
          term: course.term || null,
          exam_date: course.examDate || null,
        })
        .select()
        .single();

      if (!error && newCourse) {
        courseIdMap[course.id] = newCourse.id;
      }
    }

    // Migrate packs
    for (const pack of data.packs || []) {
      const newCourseId = courseIdMap[pack.courseId];
      if (!newCourseId) continue;

      const { data: newPack, error } = await supabase
        .from('study_packs')
        .insert({
          user_id: user.id,
          course_id: newCourseId,
          title: pack.title,
          status: pack.status,
          is_paid: false,
        })
        .select()
        .single();

      if (!error && newPack) {
        packIdMap[pack.id] = newPack.id;
      }
    }

    // Migrate materials as documents
    for (const material of data.materials || []) {
      const newPackId = packIdMap[material.packId];
      if (!newPackId) continue;

      await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          pack_id: newPackId,
          filename: material.filename || 'Pasted Text',
          mime_type: 'text/plain',
        });
    }

    // Migrate cards
    for (const card of data.cards || []) {
      const newPackId = packIdMap[card.packId];
      if (!newPackId) continue;

      await supabase
        .from('cards')
        .insert({
          pack_id: newPackId,
          type: 'basic',
          front: card.front,
          back: card.back,
          why: card.why || null,
          citations: card.citations || [],
          status: card.status || 'active',
        });
    }

    // Migrate guides
    for (const guide of data.guides || []) {
      const newPackId = packIdMap[guide.packId];
      if (!newPackId) continue;

      await supabase
        .from('study_guides')
        .insert({
          pack_id: newPackId,
          content_md: guide.content,
          citations: guide.citations || [],
        });
    }

    return NextResponse.json({
      success: true,
      migrated: {
        courses: Object.keys(courseIdMap).length,
        packs: Object.keys(packIdMap).length,
        cards: data.cards?.length || 0,
        guides: data.guides?.length || 0,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
