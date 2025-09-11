import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Highlighter, Link, BookOpen, X } from "lucide-react";
import { FolderNode } from "../App";

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface DictionaryEntry {
  id: string;
  word: string;
  definition: string;
}

interface FormattedText {
  type: 'text' | 'bold' | 'italic' | 'highlight' | 'link' | 'dictionary';
  content: string;
  color?: string;
  noteId?: string;
  noteTitle?: string;
  definitionId?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  folderStructure: FolderNode[];
  noteId: string;
}

interface ColorPaletteProps {
  onColorSelect: (color: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

interface NoteLinkModalProps {
  onNoteSelect: (noteId: string, noteTitle: string) => void;
  onClose: () => void;
  folderStructure: FolderNode[];
  currentNoteId: string;
}

interface AddToDictionaryModalProps {
  word: string;
  onAdd: (definition: string) => void;
  onClose: () => void;
}

interface TooltipProps {
  content: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const HIGHLIGHT_COLORS = [
  '#ffeb3b', // Amarelo
  '#4caf50', // Verde
  '#2196f3', // Azul
  '#ff9800', // Laranja
  '#9c27b0', // Roxo
  '#f44336', // Vermelho
  '#00bcd4', // Ciano
  '#795548', // Marrom
];

// Tooltip Component
function Tooltip({ content, position, onClose }: TooltipProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleScroll = () => onClose();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [onClose]);

  return (
    <div
      className="fixed bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  );
}

// Color Palette Component
function ColorPalette({ onColorSelect, onClose, position }: ColorPaletteProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%) translateY(10px)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-2">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
            style={{ backgroundColor: color }}
            title={`Grifar com ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

// Note Link Modal Component
function NoteLinkModal({ onNoteSelect, onClose, folderStructure, currentNoteId }: NoteLinkModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Função para buscar todas as notas recursivamente
  const getAllNotes = useCallback(() => {
    const notes: Array<{ id: string; title: string; path: string[] }> = [];
    
    const searchRecursive = (folders: FolderNode[], path: string[]) => {
      folders.forEach(folder => {
        const currentPath = [...path, folder.name];
        
        // Adicionar notas da pasta atual (exceto a nota atual)
        folder.notes.forEach(note => {
          if (note.id !== currentNoteId) {
            notes.push({
              id: note.id,
              title: note.title,
              path: currentPath
            });
          }
        });
        
        // Buscar recursivamente nas subpastas
        searchRecursive(folder.subfolders, currentPath);
      });
    };
    
    searchRecursive(folderStructure, []);
    return notes;
  }, [folderStructure, currentNoteId]);

  const allNotes = getAllNotes();
  const filteredNotes = allNotes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.path.join(' > ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Vincular a uma nota</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Pesquisar notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        
        <div className="max-h-60 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            <div className="space-y-2">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onNoteSelect(note.id, note.title)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="font-medium text-gray-900">{note.title}</div>
                  <div className="text-sm text-gray-500">{note.path.join(' > ')}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota disponível'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add to Dictionary Modal Component
function AddToDictionaryModal({ word, onAdd, onClose }: AddToDictionaryModalProps) {
  const [definition, setDefinition] = useState("");

  const handleSubmit = () => {
    if (definition.trim()) {
      onAdd(definition.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Adicionar ao Dicionário</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palavra/Texto
          </label>
          <input
            type="text"
            value={word}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Definição
          </label>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Digite a definição..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!definition.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Rich Text Editor Component
export function RichTextEditor({ value, onChange, placeholder, folderStructure, noteId }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showNoteLinkModal, setShowNoteLinkModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [tooltip, setTooltip] = useState<{ content: string; position: { x: number; y: number } } | null>(null);

  // Função para detectar seleção de texto
  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      setShowToolbar(false);
      setSelection(null);
      return;
    }

    const selectedText = value.substring(start, end);
    setSelection({ start, end, text: selectedText });

    // Calcular posição da toolbar
    const rect = textarea.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setToolbarPosition({
      x: rect.left + scrollLeft + (rect.width / 2),
      y: rect.top + scrollTop - 60
    });
    
    setShowToolbar(true);
  }, [value]);

  // Função para aplicar formatação
  const applyFormatting = (type: 'bold' | 'italic' | 'highlight' | 'link' | 'dictionary', options?: any) => {
    if (!selection) return;

    const { start, end, text } = selection;
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    let formattedText = '';
    
    switch (type) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'highlight':
        formattedText = `<highlight color="${options.color}">${text}</highlight>`;
        break;
      case 'link':
        formattedText = `<link noteId="${options.noteId}" noteTitle="${options.noteTitle}">${text}</link>`;
        break;
      case 'dictionary':
        // Adicionar ao dicionário primeiro
        const dictionaryEntry = {
          id: Date.now().toString(),
          word: text,
          definition: options.definition
        };
        
        // Salvar no dicionário
        const existingEntries = JSON.parse(localStorage.getItem('stride-dictionary-entries') || '[]');
        const updatedEntries = [...existingEntries, dictionaryEntry];
        localStorage.setItem('stride-dictionary-entries', JSON.stringify(updatedEntries));
        
        formattedText = `<dictionary id="${dictionaryEntry.id}">${text}</dictionary>`;
        break;
    }
    
    const newValue = before + formattedText + after;
    onChange(newValue);
    
    setShowToolbar(false);
    setSelection(null);
    setShowColorPalette(false);
    setShowNoteLinkModal(false);
    setShowDictionaryModal(false);
  };

  // Função para renderizar texto formatado
  const renderFormattedText = () => {
    let processedText = value;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex patterns para diferentes formatações
    const patterns = [
      { type: 'bold', regex: /\*\*(.*?)\*\*/g, component: (text: string) => <strong key={Math.random()}>{text}</strong> },
      { type: 'italic', regex: /\*(.*?)\*/g, component: (text: string) => <em key={Math.random()}>{text}</em> },
      { 
        type: 'highlight', 
        regex: /<highlight color="([^"]*)">(.*?)<\/highlight>/g, 
        component: (text: string, color: string) => (
          <span key={Math.random()} style={{ backgroundColor: color, padding: '0 2px' }}>{text}</span>
        )
      },
      { 
        type: 'link', 
        regex: /<link noteId="([^"]*)" noteTitle="([^"]*)">(.*?)<\/link>/g, 
        component: (text: string, noteId: string, noteTitle: string) => (
          <span 
            key={Math.random()} 
            className="underline text-blue-600 cursor-pointer hover:text-blue-800"
            onClick={() => {
              // Aqui você pode implementar a navegação para a nota vinculada
              console.log('Navegar para nota:', noteId, noteTitle);
            }}
            title={`Ir para: ${noteTitle}`}
          >
            {text}
          </span>
        )
      },
      { 
        type: 'dictionary', 
        regex: /<dictionary id="([^"]*)">(.*?)<\/dictionary>/g, 
        component: (text: string, id: string) => (
          <span 
            key={Math.random()} 
            className="bg-gray-200 px-1 rounded cursor-help"
            onMouseEnter={(e) => {
              // Buscar definição no dicionário
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
            {text}
          </span>
        )
      }
    ];

    // Esta é uma implementação simplificada. Em uma implementação real,
    // você poderia usar um parser mais sofisticado
    return (
      <div className="whitespace-pre-wrap">
        {value.split('\n').map((line, index) => (
          <div key={index}>
            {line}
            {index < value.split('\n').length - 1 && <br />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextSelection}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        placeholder={placeholder}
        className="w-full h-full bg-transparent text-gray-300 border-none outline-none resize-none text-base leading-relaxed"
        style={{ minHeight: 'calc(100vh - 200px)' }}
      />

      {/* Selection Toolbar */}
      {showToolbar && selection && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg px-2 py-1 z-40 flex items-center space-x-1"
          style={{
            left: toolbarPosition.x,
            top: toolbarPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Bold */}
          <button
            onClick={() => applyFormatting('bold')}
            className="p-2 hover:bg-gray-700 rounded text-white"
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            onClick={() => applyFormatting('italic')}
            className="p-2 hover:bg-gray-700 rounded text-white"
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Highlight */}
          <button
            onClick={() => setShowColorPalette(true)}
            className="p-2 hover:bg-gray-700 rounded text-white"
            title="Grifar"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Link to Note */}
          <button
            onClick={() => setShowNoteLinkModal(true)}
            className="p-2 hover:bg-gray-700 rounded text-white"
            title="Vincular a nota"
          >
            <Link className="w-4 h-4" />
          </button>

          {/* Add to Dictionary */}
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="p-2 hover:bg-gray-700 rounded text-white"
            title="Adicionar ao dicionário"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Color Palette */}
      {showColorPalette && (
        <ColorPalette
          onColorSelect={(color) => applyFormatting('highlight', { color })}
          onClose={() => setShowColorPalette(false)}
          position={toolbarPosition}
        />
      )}

      {/* Note Link Modal */}
      {showNoteLinkModal && (
        <NoteLinkModal
          onNoteSelect={(noteId, noteTitle) => applyFormatting('link', { noteId, noteTitle })}
          onClose={() => setShowNoteLinkModal(false)}
          folderStructure={folderStructure}
          currentNoteId={noteId}
        />
      )}

      {/* Dictionary Modal */}
      {showDictionaryModal && selection && (
        <AddToDictionaryModal
          word={selection.text}
          onAdd={(definition) => applyFormatting('dictionary', { definition })}
          onClose={() => setShowDictionaryModal(false)}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <Tooltip
          content={tooltip.content}
          position={tooltip.position}
          onClose={() => setTooltip(null)}
        />
      )}
    </div>
  );
}