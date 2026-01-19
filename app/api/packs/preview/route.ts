import { NextRequest, NextResponse } from 'next/server';
import { generateWithOpenAI } from '@/lib/openai';
import { z } from 'zod';
import { MIN_TEXT_LENGTH, DEFAULT_CARD_COUNT, MAX_CARD_COUNT } from '@/lib/constants';

const previewSchema = z.object({
  text: z.string().min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`),
  title: z.string().optional(),
  cardCount: z.number().min(1).max(MAX_CARD_COUNT).optional().default(DEFAULT_CARD_COUNT),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, title, cardCount } = previewSchema.parse(body);

    // Generate content (uses OpenAI if available, otherwise fallback)
    const result = await generateWithOpenAI(text, title, cardCount);

    return NextResponse.json({
      guide: result.guide,
      cards: result.cards,
    });
  } catch (error) {
    console.error('Preview generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
