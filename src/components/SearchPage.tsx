import { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Clock, FileText, FolderOpen, Bell, Trash2, User, Grid3X3, ThumbsUp, MoreVertical, CheckSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FolderNode } from "../App";

interface SearchResult {
  type: 'note' | 'folder';
  id: string;
  title: string;
  content?: string;
  folderPath: string[];
}

interface SearchPageProps {
  folderStructure: FolderNode[];
  onBack: () => void;
  onNavigateToNote: (notePath: string[], noteId: string) => void;
  onNavigateToFolder: (folderPath: string[]) => void;
  onCreateFolder: () => void;
}

export function SearchPage({ folderStructure, onBack, onNavigateToNote, onNavigateToFolder, onCreateFolder }: SearchPageProps) {
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
  const performSearch = (term: string) => {
    if (term.trim()) {
      setIsSearching(true);
      const results = searchInStructure(folderStructure, [], term);
      setSearchResults(results);
      
      // Adicionar ao histórico se não existir
      if (!searchHistory.includes(term.trim())) {
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
    
    // Debounce da pesquisa
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Usar pesquisa do histórico
  const useHistorySearch = (term: string) => {
    setSearchTerm(term);
    performSearch(term);
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
  };

  const [recentNotes] = useState([
    "Modelos de computação",
    "Dispositivos de entrada..."
  ]);

  const [todoItems] = useState([
    { id: 1, title: "Atividades de Programação", subtitle: "Atividades de Estruturas", time: "18:30 - 19:50", color: "bg-gray-500" },
    { id: 2, title: "Trabalho POO", subtitle: "Orientação a objetos", time: "19:50 - 21:00", color: "bg-green-400" }
  ]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative">
        <h1 className="text-center text-xl font-semibold text-gray-900">Pastas</h1>
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <Grid3X3 className="w-5 h-5 text-gray-600" />
        </div>
        <button 
          onClick={onBack}
          className="absolute left-6 top-1/2 transform -translate-y-1/2"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        {/* Create Folder Button */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <button 
              onClick={onCreateFolder}
              className="w-28 h-28 bg-gray-300 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 mb-2 cursor-pointer hover:bg-gray-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
            </button>
            <p className="text-xs text-gray-600 text-center leading-tight">
              Clique no + para criar<br />uma pasta
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Search Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Notas Recentes
            </h2>
            
            {/* Search Container */}
            <div className="bg-gray-300 rounded-lg p-4 min-h-[400px]">
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Pesquisar..."
                  className="pl-10 bg-white border-0"
                />
              </div>

              {/* Histórico Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">Histórico</h3>
                  {searchHistory.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {searchTerm.trim() && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resultados da Pesquisa:</h4>
                    {isSearching ? (
                      <p className="text-sm text-gray-500">Pesquisando...</p>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={`${result.type}-${result.id}-${index}`}
                            onClick={() => navigateToResult(result)}
                            className="flex items-center space-x-2 w-full p-2 bg-white rounded hover:bg-gray-50 text-left"
                          >
                            {result.type === 'note' ? (
                              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {result.folderPath.length > 0 ? result.folderPath.join(' / ') : 'Raiz'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum resultado encontrado.</p>
                    )}
                  </div>
                )}

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="space-y-2">
                    {searchHistory.map((term, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                        <button
                          onClick={() => useHistorySearch(term)}
                          className="flex items-center space-x-2 flex-1 text-left"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{term}</span>
                        </button>
                        <button
                          onClick={() => removeFromHistory(term)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchHistory.length === 0 && !searchTerm.trim() && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Nenhuma pesquisa recente
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* To-Do Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              To-Do
            </h2>
            <div className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative">
              {/* Plus button */}
              <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                <Plus className="w-5 h-5 text-gray-600" />
              </button>

              {/* Todo items */}
              <div className="space-y-4 mt-8">
                {todoItems.map((item) => (
                  <div key={item.id} className={`${item.color} rounded-lg p-4 text-white relative`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <button className="w-6 h-6 flex items-center justify-center">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <p className="text-sm text-white/80 mb-3">{item.subtitle}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/70">{item.time}</span>
                      <div className="w-5 h-5 border border-white/50 rounded flex items-center justify-center">
                        <CheckSquare className="w-3 h-3 text-white/70" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Check icon */}
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-400 px-6 py-4 z-50">
        <div className="flex items-center justify-center space-x-8 max-w-md mx-auto">
          <button className="p-3 rounded-full bg-white shadow-md">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <FileText className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <FolderOpen className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <Trash2 className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <User className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}