'use client';

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

interface StudyGuideProps {
  content: string;
  onCitationClick: (citation: Citation) => void;
}

export function StudyGuide({ content, onCitationClick }: StudyGuideProps) {
  // Parse markdown-like content with citations
  const renderContent = () => {
    // Split into paragraphs and handle basic markdown
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc pl-6 mb-4 space-y-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-700">{renderLine(item)}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const renderLine = (line: string) => {
      // Handle citations like [Source p.X]
      const citationRegex = /\[([^\]]+?)(?:\s+p\.(\d+))?\]/g;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = citationRegex.exec(line)) !== null) {
        // Add text before citation
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }

        // Add citation link
        const source = match[1];
        const page = match[2] ? parseInt(match[2], 10) : undefined;
        parts.push(
          <button
            key={match.index}
            onClick={() => onCitationClick({ source, page, snippet: '' })}
            className="text-blue-600 hover:underline text-sm"
          >
            [{source}{page ? ` p.${page}` : ''}]
          </button>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return parts.length > 0 ? parts : line;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={idx} className="text-xl font-semibold mt-6 mb-3 text-gray-900">
            {trimmed.slice(3)}
          </h2>
        );
      }
      // Heading 3
      else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={idx} className="text-lg font-medium mt-4 mb-2 text-gray-800">
            {trimmed.slice(4)}
          </h3>
        );
      }
      // List item
      else if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.slice(2));
      }
      // Horizontal rule
      else if (trimmed === '---') {
        flushList();
        elements.push(<hr key={idx} className="my-6 border-gray-200" />);
      }
      // Paragraph
      else if (trimmed.length > 0) {
        flushList();
        elements.push(
          <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
            {renderLine(trimmed)}
          </p>
        );
      }
      // Empty line
      else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="prose-study max-w-none">
        {renderContent()}
      </div>
    </div>
  );
}
