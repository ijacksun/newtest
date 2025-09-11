import { useState, useRef, useEffect } from "react";
import { Search, X, Plus, Pin, PinOff, Trash2, MoreVertical } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface DictionaryEntry {
  id: string;
  word: string;
  definition: string;
  isPinned?: boolean;
  originalOrder?: number;
}

interface DictionaryModalProps {
  onClose: () => void;
}

export function DictionaryModal({ onClose }: DictionaryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entryId: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carregar entradas do localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('stride-dictionary-entries');
    console.log("Carregando entradas do localStorage:", savedEntries);
    
    if (savedEntries && savedEntries !== 'null' && savedEntries !== '[]') {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        if (Array.isArray(parsedEntries) && parsedEntries.length > 0) {
          // Garantir que entradas antigas tenham as novas propriedades
          const updatedEntries = parsedEntries.map((entry: any, index: number) => ({
            ...entry,
            isPinned: entry.isPinned || false,
            originalOrder: entry.originalOrder !== undefined ? entry.originalOrder : index
          }));
          setEntries(updatedEntries);
          if (updatedEntries.length > 0) {
            setSelectedEntry(updatedEntries[0]);
          }
          console.log("Entradas carregadas:", updatedEntries.length);
        }
      } catch (error) {
        console.error('Erro ao carregar entradas do dicionário:', error);
      }
    } else {
      console.log("Nenhuma entrada encontrada no localStorage");
    }
    setIsLoaded(true);
  }, []);

  // Salvar entradas no localStorage sempre que houver mudanças
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('stride-dictionary-entries', JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  // Auto-focus no campo de busca
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filtrar e ordenar entradas baseado na pesquisa
  const filteredEntries = entries
    .filter(entry => entry.word.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Palavras fixadas primeiro
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Dentro de cada grupo (fixadas ou não fixadas), ordenar alfabeticamente
      return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
    });

  // Adicionar nova entrada
  const handleAddEntry = () => {
    if (newWord.trim() && newDefinition.trim()) {
      const newEntry: DictionaryEntry = {
        id: Date.now().toString(),
        word: newWord.trim(),
        definition: newDefinition.trim(),
        isPinned: false,
        originalOrder: entries.length
      };
      
      console.log("Adicionando nova palavra:", newEntry);
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      setSelectedEntry(newEntry);
      setNewWord("");
      setNewDefinition("");
      setShowAddModal(false);
      
      // Salvar imediatamente no localStorage
      localStorage.setItem('stride-dictionary-entries', JSON.stringify(updatedEntries));
      console.log("Palavras salvas no localStorage:", updatedEntries.length);
    }
  };

  // Fixar/desfixar palavra
  const togglePin = (entryId: string) => {
    setEntries(prev => {
      const updatedEntries = prev.map(entry => {
        if (entry.id === entryId) {
          return { ...entry, isPinned: !entry.isPinned };
        }
        return entry;
      });
      
      // Ordenar: fixadas primeiro, depois alfabeticamente dentro de cada grupo
      const sortedEntries = updatedEntries.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
      });
      
      // Salvar imediatamente no localStorage
      localStorage.setItem('stride-dictionary-entries', JSON.stringify(sortedEntries));
      
      return sortedEntries;
    });
    setContextMenu(null);
  };

  // Apagar palavra
  const deleteEntry = (entryId: string) => {
    setEntries(prev => {
      const filtered = prev.filter(entry => entry.id !== entryId);
      // Se a palavra selecionada foi apagada, selecionar a primeira disponível
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(filtered.length > 0 ? filtered[0] : null);
      }
      
      // Salvar imediatamente no localStorage
      localStorage.setItem('stride-dictionary-entries', JSON.stringify(filtered));
      console.log("Palavra apagada, entradas restantes:", filtered.length);
      
      return filtered;
    });
    setContextMenu(null);
  };

  // Fechar menu de contexto ao clicar fora
  const handleContextMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu(null);
  };

  // Cancelar adição
  const handleCancelAdd = () => {
    setNewWord("");
    setNewDefinition("");
    setShowAddModal(false);
  };

  // Fechar modal ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fechar menu de contexto ao clicar em qualquer lugar
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  return (
    <>
      {/* Main Dictionary Modal */}
      <div 
        className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Dicionário</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Word List */}
            <div className="w-80 bg-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-300">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquise uma palavra"
                    className="pl-10 h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 bg-white"
                  />
                </div>
              </div>

              {/* Word List */}
              <div className="flex-1 overflow-y-auto max-h-[300px] dictionary-scroll">
                {filteredEntries.length > 0 ? (
                  <div className="p-2">
                    {filteredEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`relative group rounded-lg mb-1 transition-colors ${
                          selectedEntry?.id === entry.id 
                            ? 'bg-white shadow-sm' 
                            : 'hover:bg-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="w-full text-left p-3 pr-8"
                        >
                          <div className="flex items-center space-x-2">
                            {entry.isPinned && (
                              <Pin className="w-3 h-3 text-blue-600" />
                            )}
                            <span className="font-medium text-gray-900">{entry.word}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {entry.definition.length > 50 
                              ? `${entry.definition.substring(0, 50)}...` 
                              : entry.definition
                            }
                          </div>
                        </button>
                        
                        {/* Context Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              entryId: entry.id
                            });
                          }}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-400 rounded transition-opacity"
                        >
                          <MoreVertical className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhuma palavra encontrada' : 'Nenhuma palavra no dicionário'}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <div className="p-4 border-t border-gray-300">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="w-full h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Palavra</span>
                </Button>
              </div>
            </div>

            {/* Right Content - Definition */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
              {selectedEntry ? (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {selectedEntry.word}
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    {selectedEntry.definition}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <p>Selecione uma palavra para ver sua definição</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-70"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: 'translate(-50%, -10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {entries.find(e => e.id === contextMenu.entryId)?.isPinned ? (
              <button
                onClick={() => togglePin(contextMenu.entryId)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <PinOff className="w-4 h-4" />
                <span>Desfixar</span>
              </button>
            ) : (
              <button
                onClick={() => togglePin(contextMenu.entryId)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Pin className="w-4 h-4" />
                <span>Fixar</span>
              </button>
            )}
            <button
              onClick={() => deleteEntry(contextMenu.entryId)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Apagar</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-white flex items-center justify-center z-60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelAdd();
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Nova Palavra</h3>
              <button 
                onClick={handleCancelAdd}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="newWord" className="text-sm font-medium text-gray-700 mb-2 block">
                  Palavra
                </label>
                <Input
                  id="newWord"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Digite a palavra..."
                  className="w-full"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="newDefinition" className="text-sm font-medium text-gray-700 mb-2 block">
                  Definição
                </label>
                <textarea
                  id="newDefinition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Digite a definição..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelAdd}
                  className="px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white"
                  disabled={!newWord.trim() || !newDefinition.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}