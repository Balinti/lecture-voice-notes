export interface Citation {
  source: string;
  page?: number;
  snippet: string;
  chunkId?: string;
  documentId?: string;
}

export interface CardWithCitations {
  id: string;
  front: string;
  back: string;
  why?: string;
  citations: Citation[];
  status: 'active' | 'flagged' | 'regenerated';
}

export interface GuideWithCitations {
  content: string;
  citations: Citation[];
}

export function formatCitationReference(citation: Citation, index?: number): string {
  if (citation.page) {
    return `[${citation.source} p.${citation.page}]`;
  }
  return `[${citation.source}${index !== undefined ? ` #${index + 1}` : ''}]`;
}

export function extractCitationsFromMarkdown(markdown: string): { text: string; citations: Citation[] } {
  const citationRegex = /\[([^\]]+)\s+p\.(\d+)\]/g;
  const citations: Citation[] = [];
  let match;

  while ((match = citationRegex.exec(markdown)) !== null) {
    citations.push({
      source: match[1],
      page: parseInt(match[2], 10),
      snippet: '',
    });
  }

  return { text: markdown, citations };
}

export function addCitationsToGuide(guide: string, sources: Array<{ name: string; pages?: number[] }>): string {
  // Add source references at the end of the guide
  if (sources.length === 0) return guide;

  let result = guide + '\n\n---\n\n### Sources\n\n';
  sources.forEach((source, idx) => {
    result += `${idx + 1}. ${source.name}`;
    if (source.pages && source.pages.length > 0) {
      result += ` (pages ${source.pages.join(', ')})`;
    }
    result += '\n';
  });

  return result;
}

export function citationsToJson(citations: Citation[]): string {
  return JSON.stringify(citations);
}

export function parseCitationsJson(json: string): Citation[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
