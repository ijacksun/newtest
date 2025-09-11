import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, FileText, FolderOpen } from "lucide-react";
import { Input } from "./ui/input";
import { FolderNode } from "../App";

interface SearchResult {
  type: 'note' | 'folder';
  id: string;
  title: string;
  content?: string;
  folderPath: string[];
}

interface SearchModalProps {
  folderStructure: FolderNode[];
  onClose: () => void;
  onNavigateToNote: (notePath: string[], noteId: string) => void;
  onNavigateToFolder: (folderPath: string[]) => void;
}

export function SearchModal({ folderStructure, onClose, onNavigateToNote, onNavigateToFolder }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('stride-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico de pesquisa:', error);
      }
    }
  }, []);

  // Salvar histórico no localStorage
  useEffect(() => {
    localStorage.setItem('stride-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Auto-focus no campo de busca
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Função para buscar recursivamente em pastas e notas
  const searchInStructure = (folders: FolderNode[], currentPath: string[] = [], term: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerTerm = term.toLowerCase();

    folders.forEach(folder => {
      const folderPath = [...currentPath, folder.name];
      
      // Buscar no nome da pasta
      if (folder.name.toLowerCase().includes(lowerTerm)) {
        results.push({
          type: 'folder',
          id: folder.id,
          title: folder.name,
          folderPath: currentPath
        });
      }

      // Buscar nas notas da pasta
      folder.notes.forEach(note => {
        if (note.title.toLowerCase().includes(lowerTerm) || 
            note.content.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'note',
            id: note.id,
            title: note.title,
            content: note.content,
            folderPath: folderPath
          });
        }
      });

      // Buscar recursivamente nas subpastas
      const subResults = searchInStructure(folder.subfolders, folderPath, term);
      results.push(...subResults);
    });

    return results;
  };

  // Realizar pesquisa
  const performSearch = (term: string, addToHistory: boolean = false) => {
    if (term.trim()) {
      setIsSearching(true);
      const results = searchInStructure(folderStructure, [], term);
      setSearchResults(results);
      
      // Adicionar ao histórico apenas quando solicitado
      if (addToHistory && !searchHistory.includes(term.trim())) {
        setSearchHistory(prev => [term.trim(), ...prev.slice(0, 9)]); // Manter apenas 10 itens
      }
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Manipular mudança no campo de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce da pesquisa (sem adicionar ao histórico)
    const timeoutId = setTimeout(() => {
      performSearch(value, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Manipular Enter no campo de busca
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      performSearch(searchTerm, true); // Adiciona ao histórico quando pressiona Enter
    }
  };

  // Usar pesquisa do histórico
  const useHistorySearch = (term: string) => {
    setSearchTerm(term);
    performSearch(term, false); // Não adiciona ao histórico novamente
  };

  // Limpar histórico
  const clearHistory = () => {
    setSearchHistory([]);
  };

  // Remover item do histórico
  const removeFromHistory = (term: string) => {
    setSearchHistory(prev => prev.filter(item => item !== term));
  };

  // Navegar para resultado
  const navigateToResult = (result: SearchResult) => {
    if (result.type === 'note') {
      onNavigateToNote(result.folderPath, result.id);
    } else {
      onNavigateToFolder([...result.folderPath, result.title]);
    }
    onClose(); // Fechar modal após navegação
  };

  // Fechar modal ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pesquisar</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="relative mb-6 flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                placeholder="Pesquisar pastas e notas..."
                className="pl-10 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
            </div>
            <button
              onClick={() => searchTerm.trim() && performSearch(searchTerm, true)}
              disabled={!searchTerm.trim()}
              className="px-4 h-12 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Search Results */}
          {searchTerm.trim() && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Resultados da Pesquisa</h3>
              <div className="max-h-60 overflow-y-auto">
                {isSearching ? (
                  <p className="text-gray-500 text-center py-8">Pesquisando...</p>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => navigateToResult(result)}
                        className="flex items-center space-x-3 w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition-colors"
                      >
                        {result.type === 'note' ? (
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        ) : (
                          <FolderOpen className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {result.folderPath.length > 0 ? result.folderPath.join(' / ') : 'Raiz'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum resultado encontrado.</p>
                )}
              </div>
            </div>
          )}

          {/* Search History */}
          {!searchTerm.trim() && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Histórico de Pesquisas</h3>
                {searchHistory.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto">
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map((term, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => useHistorySearch(term)}
                          className="flex items-center space-x-3 flex-1 text-left"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{term}</span>
                        </button>
                        <button
                          onClick={() => removeFromHistory(term)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma pesquisa recente
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}