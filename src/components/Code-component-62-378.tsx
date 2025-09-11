import { useState } from "react";

interface FormattedTextRendererProps {
  text: string;
  onNavigateToNote: (noteId: string) => void;
}

interface TooltipState {
  content: string;
  position: { x: number; y: number };
}

export function FormattedTextRenderer({ text, onNavigateToNote }: FormattedTextRendererProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const renderFormattedText = (input: string) => {
    const elements: JSX.Element[] = [];
    let remainingText = input;
    let keyCounter = 0;

    // Padrões de formatação em ordem de prioridade
    const patterns = [
      {
        type: 'dictionary',
        regex: /<dictionary id="([^"]*)">(.*?)<\/dictionary>/,
        render: (match: RegExpMatchArray, before: string, after: string) => {
          const [, id, content] = match;
          return {
            before,
            element: (
              <span
                key={keyCounter++}
                className="bg-gray-200 px-1 rounded cursor-help border-b border-gray-400"
                onMouseEnter={(e) => {
                  const entries = JSON.parse(localStorage.getItem('stride-dictionary-entries') || '[]');
                  const entry = entries.find((e: any) => e.id === id);
                  if (entry) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      content: entry.definition,
                      position: {
                        x: rect.left + rect.width / 2,
                        y: rect.top
                      }
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {content}
              </span>
            ),
            after
          };
        }
      },
      {
        type: 'link',
        regex: /<link noteId="([^"]*)" noteTitle="([^"]*)">(.*?)<\/link>/,
        render: (match: RegExpMatchArray, before: string, after: string) => {
          const [, noteId, noteTitle, content] = match;
          return {
            before,
            element: (
              <span
                key={keyCounter++}
                className="underline text-blue-600 cursor-pointer hover:text-blue-800 border-b border-blue-600"
                onClick={() => onNavigateToNote(noteId)}
                title={`Ir para: ${noteTitle}`}
              >
                {content}
              </span>
            ),
            after
          };
        }
      },
      {
        type: 'highlight',
        regex: /<highlight color="([^"]*)">(.*?)<\/highlight>/,
        render: (match: RegExpMatchArray, before: string, after: string) => {
          const [, color, content] = match;
          return {
            before,
            element: (
              <span
                key={keyCounter++}
                style={{ backgroundColor: color, padding: '0 2px', borderRadius: '2px' }}
              >
                {content}
              </span>
            ),
            after
          };
        }
      },
      {
        type: 'bold',
        regex: /\*\*(.*?)\*\*/,
        render: (match: RegExpMatchArray, before: string, after: string) => {
          const [, content] = match;
          return {
            before,
            element: <strong key={keyCounter++}>{content}</strong>,
            after
          };
        }
      },
      {
        type: 'italic',
        regex: /\*(.*?)\*/,
        render: (match: RegExpMatchArray, before: string, after: string) => {
          const [, content] = match;
          return {
            before,
            element: <em key={keyCounter++}>{content}</em>,
            after
          };
        }
      }
    ];

    while (remainingText.length > 0) {
      let matchFound = false;
      let earliestMatch: { index: number; pattern: any; match: RegExpMatchArray } | null = null;

      // Encontrar a primeira ocorrência de qualquer padrão
      for (const pattern of patterns) {
        const match = remainingText.match(pattern.regex);
        if (match && match.index !== undefined) {
          if (!earliestMatch || match.index < earliestMatch.index) {
            earliestMatch = { index: match.index, pattern, match };
          }
        }
      }

      if (earliestMatch) {
        const { index, pattern, match } = earliestMatch;
        
        // Adicionar texto antes da formatação
        if (index > 0) {
          elements.push(
            <span key={keyCounter++}>
              {remainingText.substring(0, index)}
            </span>
          );
        }

        // Renderizar a formatação
        const before = '';
        const after = remainingText.substring(index + match[0].length);
        const result = pattern.render(match, before, after);
        
        elements.push(result.element);
        
        // Continuar com o texto restante
        remainingText = after;
        matchFound = true;
      } else {
        // Nenhuma formatação encontrada, adicionar o texto restante
        if (remainingText.length > 0) {
          elements.push(<span key={keyCounter++}>{remainingText}</span>);
        }
        break;
      }
    }

    return elements;
  };

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
        {text.split('\n').map((line, lineIndex) => (
          <div key={lineIndex}>
            {line.length > 0 ? renderFormattedText(line) : <br />}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs z-50 pointer-events-none"
          style={{
            left: tooltip.position.x,
            top: tooltip.position.y - 10,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {tooltip.content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}