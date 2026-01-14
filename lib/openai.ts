interface GeneratedContent {
  guide: string;
  cards: Array<{
    front: string;
    back: string;
    why?: string;
    citations: Array<{
      source: string;
      page?: number;
      snippet: string;
    }>;
  }>;
}

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateWithOpenAI(
  text: string,
  title?: string,
  cardCount: number = 10
): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateFallback(text, title, cardCount);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator. Create study materials from the provided text.

Output JSON with this exact structure:
{
  "guide": "A markdown study guide (2-3 paragraphs) with key concepts. Include citations like [Source p.X] when referencing specific facts.",
  "cards": [
    {
      "front": "Question text",
      "back": "Answer text",
      "why": "Brief explanation of why this is important (optional)",
      "citations": [{"source": "Pasted Text", "page": null, "snippet": "relevant quote from source"}]
    }
  ]
}

Create ${cardCount} flashcards covering the main concepts. Focus on:
- Key definitions and terms
- Important relationships and processes
- Critical facts to remember

Each card should test one specific concept. Include citations with relevant snippets from the source material.`,
          },
          {
            role: 'user',
            content: `Create study materials from this text${title ? ` about "${title}"` : ''}:\n\n${text.slice(0, 15000)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return generateFallback(text, title, cardCount);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      guide: content.guide || generateFallbackGuide(text, title),
      cards: content.cards || generateFallbackCards(text, cardCount),
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return generateFallback(text, title, cardCount);
  }
}

function generateFallback(
  text: string,
  title?: string,
  cardCount: number = 10
): GeneratedContent {
  return {
    guide: generateFallbackGuide(text, title),
    cards: generateFallbackCards(text, cardCount),
  };
}

function generateFallbackGuide(text: string, title?: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const keyTerms = extractKeyTerms(text);

  let guide = `## ${title || 'Study Guide'}\n\n`;
  guide += `This material covers ${keyTerms.length} key concepts. `;

  if (keyTerms.length > 0) {
    guide += `The main topics include: **${keyTerms.slice(0, 5).join('**, **')}**.\n\n`;
  }

  if (sentences.length > 0) {
    guide += `### Key Points\n\n`;
    sentences.slice(0, 5).forEach((sentence) => {
      guide += `- ${sentence.trim()} [Source p.1]\n`;
    });
  }

  return guide;
}

function generateFallbackCards(
  text: string,
  cardCount: number
): GeneratedContent['cards'] {
  const keyTerms = extractKeyTerms(text);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 30);
  const cards: GeneratedContent['cards'] = [];

  // Create cards from key terms
  for (let i = 0; i < Math.min(cardCount, keyTerms.length); i++) {
    const term = keyTerms[i];
    const context = sentences.find((s) =>
      s.toLowerCase().includes(term.toLowerCase())
    );

    cards.push({
      front: `What is ${term}?`,
      back: context
        ? context.trim()
        : `${term} is a key concept covered in this material.`,
      why: 'This is a fundamental concept you should understand.',
      citations: [
        {
          source: 'Pasted Text',
          page: undefined,
          snippet: context?.trim().slice(0, 100) || term,
        },
      ],
    });
  }

  // Fill remaining cards with sentence-based questions
  while (cards.length < cardCount && sentences.length > cards.length) {
    const sentence = sentences[cards.length];
    if (sentence) {
      const words = sentence.trim().split(' ');
      if (words.length > 5) {
        cards.push({
          front: `Complete this concept: "${words.slice(0, 5).join(' ')}..."`,
          back: sentence.trim(),
          citations: [
            {
              source: 'Pasted Text',
              page: undefined,
              snippet: sentence.trim().slice(0, 100),
            },
          ],
        });
      }
    }
  }

  return cards;
}

function extractKeyTerms(text: string): string[] {
  // Simple extraction of potential key terms (capitalized phrases, repeated words)
  const words = text.split(/\s+/);
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (clean.length > 4) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });

  // Find capitalized terms (potential proper nouns/concepts)
  const capitalizedTerms = text
    .match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)
    ?.filter((t) => t.length > 3) || [];

  // Combine frequent words and capitalized terms
  const frequentWords = Object.entries(wordFreq)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const combined = [...new Set([...capitalizedTerms.slice(0, 5), ...frequentWords])];
  return combined.slice(0, 15);
}

export async function createEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data[0].embedding;
  } catch {
    return null;
  }
}
