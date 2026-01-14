import { CardWithCitations, formatCitationReference } from './citations';

export interface ExportOptions {
  includeWhy?: boolean;
  includeCitations?: boolean;
  format: 'anki' | 'quizlet';
}

export function exportToAnkiCSV(cards: CardWithCitations[], options: ExportOptions = { format: 'anki' }): string {
  const lines: string[] = [];

  cards.forEach((card) => {
    let front = escapeCSVField(card.front);
    let back = escapeCSVField(card.back);

    if (options.includeWhy && card.why) {
      back += `<br><br><i>Why: ${escapeCSVField(card.why)}</i>`;
    }

    if (options.includeCitations && card.citations.length > 0) {
      const citationText = card.citations
        .map((c, idx) => formatCitationReference(c, idx))
        .join(', ');
      back += `<br><br><small>${escapeCSVField(citationText)}</small>`;
    }

    // Anki uses tab-separated values by default
    lines.push(`${front}\t${back}`);
  });

  return lines.join('\n');
}

export function exportToQuizletCSV(cards: CardWithCitations[], options: ExportOptions = { format: 'quizlet' }): string {
  const lines: string[] = [];

  cards.forEach((card) => {
    let front = card.front.replace(/"/g, '""');
    let back = card.back.replace(/"/g, '""');

    if (options.includeWhy && card.why) {
      back += ` (${card.why.replace(/"/g, '""')})`;
    }

    if (options.includeCitations && card.citations.length > 0) {
      const citationText = card.citations
        .map((c, idx) => formatCitationReference(c, idx))
        .join(', ');
      back += ` [${citationText.replace(/"/g, '""')}]`;
    }

    // Quizlet uses comma-separated with quotes
    lines.push(`"${front}","${back}"`);
  });

  return lines.join('\n');
}

function escapeCSVField(field: string): string {
  // Replace newlines with HTML breaks for Anki
  return field
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '    ')
    .replace(/"/g, '&quot;');
}

export function generateExportFilename(packTitle: string, format: 'anki' | 'quizlet'): string {
  const sanitized = packTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'anki' ? 'tsv' : 'csv';
  return `${sanitized}-${format}-${timestamp}.${extension}`;
}
