import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  FolderOpen, 
  X, 
  Plus,
  MoreVertical,
  Link,
  Copy,
  Download,
  Save,
  FolderPlus,
  Trash2,
  Home,
  ChevronRight as BreadcrumbArrow,
  Search
} from "lucide-react";
import { Button } from "./ui/button";
import { FolderNode, TrashItem } from "../App";

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-yellow-600 text-black px-1 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  modifiedAt?: string;
  lastOpenedAt?: string;
}

interface NotesInterfaceProps {
  selectedFolderPath: string[];
  setSelectedFolderPath: React.Dispatch<React.SetStateAction<string[]>>;
  folderStructure: FolderNode[];
  setFolderStructure: React.Dispatch<React.SetStateAction<FolderNode[]>>;
  trashItems: TrashItem[];
  setTrashItems: React.Dispatch<React.SetStateAction<TrashItem[]>>;
  onBack: () => void;
}

export function NotesInterface({ 
  selectedFolderPath, 
  setSelectedFolderPath, 
  folderStructure, 
  setFolderStructure, 
  trashItems,
  setTrashItems,
  onBack 
}: NotesInterfaceProps) {
  const [openTabs, setOpenTabs] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; noteId?: string; folderId?: string; type: 'note' | 'folder' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para encontrar a pasta atual baseada no path
  const getCurrentFolder = (): FolderNode | null => {
    if (selectedFolderPath.length === 0) return null;
    
    let current: FolderNode[] = folderStructure;
    let folder: FolderNode | null = null;

    for (const folderName of selectedFolderPath) {
      folder = current.find(f => f.name === folderName) || null;
      if (!folder) return null;
      current = folder.subfolders;
    }

    return folder;
  };

  // Função para atualizar uma pasta na estrutura
  const updateFolderInStructure = (path: string[], updater: (folder: FolderNode) => FolderNode): void => {
    setFolderStructure(prev => {
      if (path.length === 0) {
        // Se o path está vazio, não podemos atualizar uma pasta específica
        return prev;
      }

      const updateRecursive = (folders: FolderNode[], currentPath: string[]): FolderNode[] => {
        return folders.map(folder => {
          if (folder.name === currentPath[0]) {
            if (currentPath.length === 1) {
              return updater(folder);
            } else {
              return {
                ...folder,
                subfolders: updateRecursive(folder.subfolders, currentPath.slice(1))
              };
            }
          }
          return folder;
        });
      };

      return updateRecursive(prev, path);
    });
  };

  // Initialize with a new note only when the folder is empty (no notes)
  useEffect(() => {
    const currentFolder = getCurrentFolder();
    if (currentFolder && currentFolder.notes.length === 0 && openTabs.length === 0) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: "Nova Nota",
        content: ""
      };

      updateFolderInStructure(selectedFolderPath, folder => ({
        ...folder,
        notes: [...folder.notes, newNote]
      }));

      setOpenTabs([newNote]);
      setActiveTab(newNote.id);
    }
  }, [selectedFolderPath]);

  const createNewNote = () => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Nova Nota",
      content: "",
      createdAt: now,
      modifiedAt: now,
      lastOpenedAt: now
    };

    updateFolderInStructure(selectedFolderPath, folder => ({
      ...folder,
      notes: [...folder.notes, newNote]
    }));

    setOpenTabs(prevTabs => {
      if (!prevTabs.find(tab => tab.id === newNote.id)) {
        return [...prevTabs, newNote];
      }
      return prevTabs;
    });
    setActiveTab(newNote.id);
  };

  const createNewFolder = () => {
    const folderName = prompt("Nome da nova pasta:");
    if (folderName && folderName.trim()) {
      const trimmedName = folderName.trim();
      
      const currentFolder = getCurrentFolder();
      if (currentFolder) {
        // Verificar se já existe uma subpasta com esse nome
        if (currentFolder.subfolders.some(subfolder => subfolder.name === trimmedName)) {
          alert("Já existe uma pasta com este nome. Escolha um nome diferente.");
          return;
        }
        
        const newFolder: FolderNode = {
          id: Date.now().toString(),
          name: trimmedName,
          subfolders: [],
          notes: []
        };
        
        updateFolderInStructure(selectedFolderPath, folder => ({
          ...folder,
          subfolders: [...folder.subfolders, newFolder]
        }));
        
        console.log("Pasta criada com sucesso:", trimmedName);
      } else {
        console.error("Pasta atual não encontrada. Path:", selectedFolderPath);
        alert("Erro: Pasta atual não encontrada. Tente navegar novamente para esta pasta.");
      }
    }
  };

  const openNote = (note: Note) => {
    const now = new Date().toISOString();
    
    // Atualizar lastOpenedAt na estrutura de pastas
    updateFolderInStructure(selectedFolderPath, folder => ({
      ...folder,
      notes: folder.notes.map(n => 
        n.id === note.id ? { ...n, lastOpenedAt: now } : n
      )
    }));

    // Atualizar o objeto note com o novo timestamp
    const updatedNote = { ...note, lastOpenedAt: now };

    setOpenTabs(prevTabs => {
      if (!prevTabs.find(tab => tab.id === note.id)) {
        return [...prevTabs, updatedNote];
      }
      // Se a aba já existe, atualizar com o novo timestamp
      return prevTabs.map(tab => 
        tab.id === note.id ? updatedNote : tab
      );
    });
    setActiveTab(note.id);
  };



  const closeTab = (noteId: string) => {
    setOpenTabs(prevTabs => {
      const filteredTabs = prevTabs.filter(tab => tab.id !== noteId);
      if (activeTab === noteId) {
        setActiveTab(filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1].id : null);
      }
      return filteredTabs;
    });
  };

  const updateNoteContent = (noteId: string, content: string) => {
    const now = new Date().toISOString();
    updateFolderInStructure(selectedFolderPath, folder => ({
      ...folder,
      notes: folder.notes.map(note => 
        note.id === noteId ? { ...note, content, modifiedAt: now } : note
      )
    }));

    setOpenTabs(prevTabs => prevTabs.map(tab => 
      tab.id === noteId ? { ...tab, content, modifiedAt: now } : tab
    ));
  };

  const updateNoteTitle = (noteId: string, title: string) => {
    const now = new Date().toISOString();
    updateFolderInStructure(selectedFolderPath, folder => ({
      ...folder,
      notes: folder.notes.map(note => 
        note.id === noteId ? { ...note, title, modifiedAt: now } : note
      )
    }));

    setOpenTabs(prevTabs => prevTabs.map(tab => 
      tab.id === noteId ? { ...tab, title, modifiedAt: now } : tab
    ));
  };

  const handleNoteContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, noteId, type: 'note' });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId, type: 'folder' });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const deleteNote = (noteId: string) => {
    if (confirm("Tem certeza que deseja mover esta nota para a lixeira?")) {
      // Encontrar a nota que será movida para a lixeira
      const currentFolder = getCurrentFolder();
      const noteToDelete = currentFolder?.notes.find(note => note.id === noteId);
      
      if (noteToDelete) {
        // Adicionar à lixeira
        const trashItem: TrashItem = {
          id: noteToDelete.id,
          title: noteToDelete.title,
          content: noteToDelete.content,
          type: 'note',
          originalPath: [...selectedFolderPath],
          deletedAt: new Date().toISOString()
        };
        
        setTrashItems(prev => [...prev, trashItem]);
        
        // Remover da estrutura atual
        updateFolderInStructure(selectedFolderPath, folder => ({
          ...folder,
          notes: folder.notes.filter(note => note.id !== noteId)
        }));
        
        // Fechar a aba se estiver aberta
        setOpenTabs(prevTabs => {
          const filteredTabs = prevTabs.filter(tab => tab.id !== noteId);
          if (activeTab === noteId) {
            setActiveTab(filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1].id : null);
          }
          return filteredTabs;
        });
      }
    }
    closeContextMenu();
  };

  const duplicateNote = (noteId: string) => {
    const currentFolder = getCurrentFolder();
    if (currentFolder) {
      const noteToClone = currentFolder.notes.find(n => n.id === noteId);
      if (noteToClone) {
        const now = new Date().toISOString();
        const newNote: Note = {
          id: Date.now().toString(),
          title: `${noteToClone.title} - Cópia`,
          content: noteToClone.content,
          createdAt: now,
          modifiedAt: now,
          lastOpenedAt: now
        };

        updateFolderInStructure(selectedFolderPath, folder => ({
          ...folder,
          notes: [...folder.notes, newNote]
        }));
      }
    }
    closeContextMenu();
  };

  const deleteFolder = (folderName: string) => {
    if (confirm("Tem certeza que deseja mover esta pasta e todo seu conteúdo para a lixeira?")) {
      // Encontrar a pasta que será movida para a lixeira
      const currentFolder = getCurrentFolder();
      const folderToDelete = currentFolder?.subfolders.find(folder => folder.name === folderName);
      
      if (folderToDelete) {
        // Adicionar à lixeira
        const trashItem: TrashItem = {
          id: `folder-${Date.now()}`,
          title: folderToDelete.name,
          content: `Pasta com ${folderToDelete.notes.length} nota(s) e ${folderToDelete.subfolders.length} subpasta(s)`,
          type: 'folder',
          originalPath: [...selectedFolderPath],
          deletedAt: new Date().toISOString(),
          folderId: folderToDelete.id,
          subfolders: folderToDelete.subfolders,
          notes: folderToDelete.notes
        };
        
        setTrashItems(prev => [...prev, trashItem]);
        
        // Remover da estrutura atual
        updateFolderInStructure(selectedFolderPath, folder => ({
          ...folder,
          subfolders: folder.subfolders.filter(f => f.name !== folderName)
        }));
      }
    }
    closeContextMenu();
  };

  const renameFolder = (folderName: string) => {
    const newName = prompt("Novo nome da pasta:", folderName);
    if (newName && newName.trim() && newName.trim() !== folderName) {
      const trimmedName = newName.trim();
      
      const currentFolder = getCurrentFolder();
      if (currentFolder && currentFolder.subfolders.some(f => f.name === trimmedName && f.name !== folderName)) {
        alert("Já existe uma pasta com este nome. Escolha um nome diferente.");
        return;
      }
      
      updateFolderInStructure(selectedFolderPath, folder => ({
        ...folder,
        subfolders: folder.subfolders.map(f => 
          f.name === folderName ? { ...f, name: trimmedName } : f
        )
      }));
    }
    closeContextMenu();
  };

  const navigateToFolder = (folderName: string) => {
    setSelectedFolderPath(prev => [...prev, folderName]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setSelectedFolderPath(prev => prev.slice(0, index + 1));
  };

  // Função para pesquisar recursivamente em todas as pastas
  const searchInStructure = (folders: FolderNode[], term: string): Array<{type: 'folder', item: FolderNode, path: string[]} | {type: 'note', item: Note, path: string[]}> => {
    const results: Array<{type: 'folder', item: FolderNode, path: string[]} | {type: 'note', item: Note, path: string[]}> = [];
    
    const searchRecursive = (folders: FolderNode[], currentPath: string[]) => {
      folders.forEach(folder => {
        const folderPath = [...currentPath, folder.name];
        
        // Buscar na pasta
        if (folder.name.toLowerCase().includes(term.toLowerCase())) {
          results.push({ type: 'folder', item: folder, path: currentPath });
        }
        
        // Buscar nas notas da pasta
        folder.notes.forEach(note => {
          if (note.title.toLowerCase().includes(term.toLowerCase()) || 
              note.content.toLowerCase().includes(term.toLowerCase())) {
            results.push({ type: 'note', item: note, path: folderPath });
          }
        });
        
        // Buscar recursivamente nas subpastas
        searchRecursive(folder.subfolders, folderPath);
      });
    };
    
    searchRecursive(folders, []);
    return results;
  };

  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    return searchInStructure(folderStructure, searchTerm);
  };

  const navigateToSearchResult = (result: {type: 'folder' | 'note', item: FolderNode | Note, path: string[]}) => {
    // Limpar a pesquisa primeiro
    setSearchTerm("");
    
    if (result.type === 'note') {
      // Para notas: navegar para a pasta que contém a nota
      const notePath = result.path; // Path completo até a pasta que contém a nota
      const note = result.item as Note;
      
      // Navegar para a pasta que contém a nota
      setSelectedFolderPath(notePath);
      
      // Abrir a nota nas abas diretamente com a instância da nota encontrada
      setTimeout(() => {
        setOpenTabs(prevTabs => {
          if (!prevTabs.find(tab => tab.id === note.id)) {
            return [...prevTabs, note];
          }
          return prevTabs;
        });
        setActiveTab(note.id);
      }, 100);
      
    } else {
      // Para pastas: navegar para a pasta
      const folder = result.item as FolderNode;
      const folderPath = [...result.path, folder.name];
      
      // Navegar para a pasta encontrada
      setSelectedFolderPath(folderPath);
    }
  };

  const currentFolder = getCurrentFolder();
  const activeNote = openTabs.find(tab => tab.id === activeTab);
  const searchResults = getSearchResults();
  const showSearchResults = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-800 text-white flex" onClick={closeContextMenu}>
      {/* Sidebar */}
      <div className="w-72 bg-gray-900 border-r border-gray-700">
        {/* Header with Breadcrumbs */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium text-gray-200">Pastas & Notas</h2>
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
              title={selectedFolderPath.length === 1 ? "Voltar para HomePage" : "Voltar um nível"}
            >
              ←
            </Button>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1 text-sm text-gray-400 overflow-x-auto">
            <button 
              onClick={onBack}
              className="hover:text-white transition-colors"
              title="Voltar para HomePage"
            >
              <Home className="w-4 h-4" />
            </button>
            {selectedFolderPath.map((folderName, index) => (
              <div key={index} className="flex items-center space-x-1">
                <BreadcrumbArrow className="w-3 h-3" />
                <button 
                  onClick={() => navigateToBreadcrumb(index)}
                  className="hover:text-white transition-colors truncate"
                >
                  {folderName}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar pastas e notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  Resultados da pesquisa
                </h3>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum resultado encontrado</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => navigateToSearchResult(result)}
                      className="flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer rounded transition-colors duration-200 hover:bg-blue-800/30"
                    >
                      {result.type === 'folder' ? (
                        <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 truncate">
                          <HighlightText 
                            text={result.type === 'folder' ? result.item.name : (result.item as Note).title}
                            highlight={searchTerm}
                          />
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.type === 'note' 
                            ? `Em: ${result.path.length > 0 ? result.path.join(' > ') : 'Pasta Raiz'}`
                            : `Localização: ${result.path.length > 0 ? result.path.join(' > ') : 'Nível Raiz'}`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Create buttons */}
            <div className="p-4 border-b border-gray-700 space-y-2">
              <button
                onClick={createNewFolder}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova pasta
              </button>
              <button
                onClick={createNewNote}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova nota
              </button>
            </div>

            {/* Folders and Notes */}
            <div className="flex-1 overflow-y-auto">
              {/* Current folder content */}
              {currentFolder && (
                <div className="p-4">
                  {/* Subfolders */}
                  {currentFolder.subfolders.map((subfolder) => (
                    <div key={subfolder.id} className="select-none group mb-2">
                      <div
                        onClick={() => navigateToFolder(subfolder.name)}
                        onContextMenu={(e) => handleFolderContextMenu(e, subfolder.name)}
                        className="flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer rounded"
                      >
                        <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-300 truncate flex-1">{subfolder.name}</span>
                        <BreadcrumbArrow className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  ))}

                  {/* Notes */}
                  {currentFolder.notes.map((note) => (
                    <div key={note.id} className="select-none group mb-1">
                      <div
                        onClick={() => openNote(note)}
                        onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
                        className={`flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer rounded ${
                          activeTab === note.id ? 'bg-gray-800' : ''
                        }`}
                      >
                        <FileText className="w-3 h-3 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-400 truncate">{note.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="flex border-b border-gray-700 bg-gray-900">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer group max-w-xs ${
                  activeTab === tab.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                <input
                  type="text"
                  value={tab.title}
                  onChange={(e) => updateNoteTitle(tab.id, e.target.value)}
                  className="bg-transparent text-sm text-gray-300 truncate border-none outline-none mr-2 flex-1"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-gray-700 p-1 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <>
              <div className="p-6 border-b border-gray-700">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNoteTitle(activeNote.id, e.target.value)}
                  className="text-2xl font-medium bg-transparent text-white border-none outline-none w-full"
                  placeholder="Título da nota"
                />
              </div>
              <div className="flex-1 p-6">
                <textarea
                  ref={textareaRef}
                  value={activeNote.content}
                  onChange={(e) => updateNoteContent(activeNote.id, e.target.value)}
                  placeholder="Digite algo para criar uma nota |"
                  className="w-full h-full bg-transparent text-gray-300 border-none outline-none resize-none text-base leading-relaxed"
                  style={{ minHeight: 'calc(100vh - 200px)' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Selecione uma nota ou crie uma nova</p>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'note' && contextMenu.noteId && (
            <>
              <button className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                <Link className="w-4 h-4 mr-3" />
                Copiar Link
              </button>
              <button 
                onClick={() => duplicateNote(contextMenu.noteId!)}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
              >
                <Copy className="w-4 h-4 mr-3" />
                Duplicar
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                <Download className="w-4 h-4 mr-3" />
                Exportar como
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                <Save className="w-4 h-4 mr-3" />
                Salvar
              </button>
              <hr className="border-gray-600 my-1" />
              <button 
                onClick={() => deleteNote(contextMenu.noteId!)}
                className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Excluir
              </button>
            </>
          )}
          
          {contextMenu.type === 'folder' && contextMenu.folderId && (
            <>
              <button 
                onClick={() => renameFolder(contextMenu.folderId!)}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
              >
                <FileText className="w-4 h-4 mr-3" />
                Renomear
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                <Copy className="w-4 h-4 mr-3" />
                Duplicar
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                <Link className="w-4 h-4 mr-3" />
                Copiar Link
              </button>
              <hr className="border-gray-600 my-1" />
              <button 
                onClick={() => deleteFolder(contextMenu.folderId!)}
                className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Excluir pasta
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}