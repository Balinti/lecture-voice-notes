import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exportToAnkiCSV, exportToQuizletCSV, generateExportFilename } from '@/lib/exporters';
import { CardWithCitations } from '@/lib/citations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params;
    const { format } = await request.json();

    if (!['anki', 'quizlet'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('*')
      .eq('id', packId)
      .eq('user_id', user.id)
      .single();

    if (packError || !pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    // Fetch cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('pack_id', packId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (cardsError || !cards || cards.length === 0) {
      return NextResponse.json({ error: 'No cards to export' }, { status: 400 });
    }

    // Transform cards for export
    const cardsForExport: CardWithCitations[] = cards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      why: card.why || undefined,
      citations: card.citations || [],
      status: card.status as 'active' | 'flagged' | 'regenerated',
    }));

    // Generate export content
    const content = format === 'anki'
      ? exportToAnkiCSV(cardsForExport, { format: 'anki', includeWhy: true, includeCitations: true })
      : exportToQuizletCSV(cardsForExport, { format: 'quizlet', includeWhy: true, includeCitations: true });

    const filename = generateExportFilename(pack.title, format);

    // Save export record
    await supabase.from('exports').insert({
      pack_id: packId,
      type: format,
      content,
    });

    return NextResponse.json({
      content,
      filename,
      cardsCount: cards.length,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}
