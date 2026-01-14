import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWithOpenAI } from '@/lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const { correction } = await request.json();

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the card with pack ownership check
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        *,
        study_packs!inner (
          id,
          user_id
        )
      `)
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify ownership
    if (card.study_packs.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Record feedback
    await supabase.from('card_feedback').insert({
      card_id: cardId,
      user_id: user.id,
      feedback_type: 'correction',
      correction,
    });

    // Generate corrected card
    const prompt = `Original question: ${card.front}\nOriginal answer: ${card.back}\nUser correction: ${correction}\n\nPlease regenerate this flashcard incorporating the correction.`;

    const result = await generateWithOpenAI(prompt, 'Card Correction', 1);

    if (result.cards.length === 0) {
      return NextResponse.json({ error: 'Failed to generate corrected card' }, { status: 500 });
    }

    const newCard = result.cards[0];

    // Update the card
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update({
        front: newCard.front,
        back: newCard.back,
        why: newCard.why || null,
        citations: newCard.citations || [],
        status: 'regenerated',
      })
      .eq('id', cardId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error('Card regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate card' },
      { status: 500 }
    );
  }
}
