import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWithOpenAI } from '@/lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params;
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

    // Get documents for this pack
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('pack_id', packId);

    // Get document pages
    let allText = '';
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const { data: pages } = await supabase
          .from('document_pages')
          .select('*')
          .eq('document_id', doc.id)
          .order('page_number', { ascending: true });

        if (pages) {
          pages.forEach(page => {
            allText += `\n[Page ${page.page_number}]\n${page.text}\n`;
          });
        }
      }
    }

    if (!allText.trim()) {
      return NextResponse.json(
        { error: 'No content found for this pack' },
        { status: 400 }
      );
    }

    // Determine card limit based on payment status
    const cardLimit = pack.is_paid ? 50 : 10;

    // Generate content
    const result = await generateWithOpenAI(allText, pack.title, cardLimit);

    // Delete existing cards and guide
    await supabase.from('cards').delete().eq('pack_id', packId);
    await supabase.from('study_guides').delete().eq('pack_id', packId);

    // Insert new guide
    await supabase.from('study_guides').insert({
      pack_id: packId,
      content_md: result.guide,
      citations: [],
    });

    // Insert new cards
    const cardsToInsert = result.cards.map(card => ({
      pack_id: packId,
      type: 'basic',
      front: card.front,
      back: card.back,
      why: card.why || null,
      citations: card.citations || [],
      status: 'active',
    }));

    await supabase.from('cards').insert(cardsToInsert);

    // Update pack status
    await supabase
      .from('study_packs')
      .update({ status: 'generated' })
      .eq('id', packId);

    return NextResponse.json({
      success: true,
      guide: result.guide,
      cardsCount: result.cards.length,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
