import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Highlighter, Link, BookOpen, X, Eye, Edit, HelpCircle } from "lucide-react";
import { FolderNode } from "../App";
import { FormattedTextRenderer } from "./FormattedTextRenderer";
import { FormattingHelpModal } from "./FormattingHelpModal";
import { ColorPalette } from "./ColorPalette";
import { NoteLinkModal } from "./NoteLinkModal";
import { AddToDictionaryModal } from "./AddToDictionaryModal";

interface TextSelection {
  start: number;
  end: number;
  text: string;
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
  onNavigateToNote: (noteId: string) => void;
}

export function RichTextEditor({ value, onChange, placeholder, folderStructure, noteId, onNavigateToNote }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showNoteLinkModal, setShowNoteLinkModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isEditing, setIsEditing] = useState(!value); // Inicia em edição se não há conteúdo

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
    
    // Resetar estado
    resetSelectionState();
    
    // Refocar na textarea após aplicar formatação
    setTimeout(() => {
      textareaRef.current?.focus();
      // Posicionar cursor após o texto formatado
      const newPosition = start + formattedText.length;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 100);
  };

  // Função para resetar estado de seleção
  const resetSelectionState = () => {
    setShowToolbar(false);
    setSelection(null);
    setShowColorPalette(false);
    setShowNoteLinkModal(false);
    setShowDictionaryModal(false);
  };

  // Ajustar modo de edição baseado no conteúdo
  useEffect(() => {
    if (!value && !isEditing) {
      setIsEditing(true);
    }
  }, [value, isEditing]);

  return (
    <div className="relative w-full h-full">
      {/* Botões de controle */}
      <div className="absolute top-2 right-2 z-50 flex space-x-2">
        {/* Botão de ajuda */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
          title="Ajuda sobre formatação"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Botão para alternar entre edição e visualização */}
        {value && (
          <button
            onClick={() => {
              const newEditingState = !isEditing;
              setIsEditing(newEditingState);
              if (newEditingState) {
                setTimeout(() => textareaRef.current?.focus(), 0);
              }
            }}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
            title={isEditing ? "Visualizar formatação" : "Editar texto"}
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Container principal */}
      <div className="relative w-full h-full">
        {/* Camada de edição - textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onSelect={handleTextSelection}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          onKeyDown={(e) => {
            // Atalhos de teclado
            if (e.ctrlKey || e.metaKey) {
              if (e.key === 'b') {
                e.preventDefault();
                if (selection) {
                  applyFormatting('bold');
                }
              } else if (e.key === 'i') {
                e.preventDefault();
                if (selection) {
                  applyFormatting('italic');
                }
              }
            }
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setTimeout(() => {
              if (!showColorPalette && !showNoteLinkModal && !showDictionaryModal && !showHelpModal) {
                setIsEditing(false);
                setShowToolbar(false);
              }
            }, 200);
          }}
          onClick={() => setIsEditing(true)}
          placeholder={placeholder}
          className={`w-full h-full border-none outline-none resize-none text-base leading-relaxed z-20 relative ${
            isEditing ? 'bg-transparent text-gray-300' : 'bg-transparent text-transparent pointer-events-none'
          }`}
          style={{ 
            minHeight: 'calc(100vh - 200px)',
            fontFamily: 'inherit'
          }}
          spellCheck={false}
        />

        {/* Camada de visualização - sobreposta quando não está editando */}
        {!isEditing && value && (
          <div 
            className="absolute inset-0 cursor-text z-30"
            style={{ 
              minHeight: 'calc(100vh - 200px)',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              fontFamily: 'inherit',
              padding: '0',
              pointerEvents: 'auto'
            }}
          >
            <div 
              className="w-full h-full"
              onClick={(e) => {
                // Se clicou em um link ou elemento interativo, não ativar edição
                const target = e.target as Element;
                const interactiveElement = target.closest('[data-interactive="true"]');
                
                if (interactiveElement) {
                  // Se é um elemento interativo, deixar o evento original acontecer
                  return;
                }
                
                if (target.closest('span[class*="cursor-pointer"]') || 
                    target.closest('span[class*="cursor-help"]')) {
                  return;
                }
                
                setIsEditing(true);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
            >
              <FormattedTextRenderer 
                text={value} 
                onNavigateToNote={onNavigateToNote}
              />
            </div>
          </div>
        )}

        {/* Placeholder quando vazio */}
        {!value && (
          <div 
            className="absolute inset-0 pointer-events-none text-gray-500 text-base z-10"
            style={{ 
              lineHeight: 'inherit',
              padding: '0'
            }}
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Selection Toolbar */}
      {showToolbar && selection && (
        <div
          className="fixed bg-gray-900 border border-gray-600 rounded-lg shadow-xl px-3 py-2 z-40 flex items-center space-x-1"
          style={{
            left: toolbarPosition.x,
            top: toolbarPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Bold */}
          <button
            onClick={() => applyFormatting('bold')}
            className="p-2 hover:bg-gray-700 rounded-md text-white transition-colors group"
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Italic */}
          <button
            onClick={() => applyFormatting('italic')}
            className="p-2 hover:bg-gray-700 rounded-md text-white transition-colors group"
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Highlight */}
          <button
            onClick={() => setShowColorPalette(true)}
            className="p-2 hover:bg-gray-700 rounded-md text-yellow-400 hover:text-yellow-300 transition-colors group"
            title="Grifar texto"
          >
            <Highlighter className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Link to Note */}
          <button
            onClick={() => setShowNoteLinkModal(true)}
            className="p-2 hover:bg-gray-700 rounded-md text-blue-400 hover:text-blue-300 transition-colors group"
            title="Vincular a outra nota"
          >
            <Link className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Add to Dictionary */}
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="p-2 hover:bg-gray-700 rounded-md text-green-400 hover:text-green-300 transition-colors group"
            title="Adicionar ao dicionário"
          >
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
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

      {/* Help Modal */}
      {showHelpModal && (
        <FormattingHelpModal
          onClose={() => setShowHelpModal(false)}
        />
      )}

    </div>
  );
}