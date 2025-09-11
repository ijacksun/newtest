import { useState } from "react";
import { X, Search, Folder, FileText } from "lucide-react";
import { FolderNode } from "../App";

interface NoteLinkModalProps {
  onNoteSelect: (noteId: string, noteTitle: string) => void;
  onClose: () => void;
  folderStructure: FolderNode[];
  currentNoteId?: string;
}

export function NoteLinkModal({ onNoteSelect, onClose, folderStructure, currentNoteId }: NoteLinkModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Função para coletar todas as notas recursivamente
  const collectAllNotes = (folders: FolderNode[], path: string[] = []): Array<{ note: any; path: string[] }> => {
    let allNotes: Array<{ note: any; path: string[] }> = [];
    
    for (const folder of folders) {
      const currentPath = [...path, folder.name];
      
      // Adicionar notas da pasta atual (exceto a nota atual)
      folder.notes.forEach(note => {
        if (note.id !== currentNoteId) {
          allNotes.push({ note, path: currentPath });
        }
      });
      
      // Recursivamente coletar das subpastas
      allNotes = [...allNotes, ...collectAllNotes(folder.subfolders, currentPath)];
    }
    
    return allNotes;
  };

  // Função para navegar nas pastas
  const getCurrentFolder = (): FolderNode | null => {
    let current = folderStructure.find(f => f.name === selectedPath[0]);
    if (!current) return null;
    
    for (let i = 1; i < selectedPath.length; i++) {
      current = current.subfolders.find(f => f.name === selectedPath[i]);
      if (!current) return null;
    }
    
    return current;
  };

  const allNotes = collectAllNotes(folderStructure);
  const filteredNotes = searchTerm 
    ? allNotes.filter(({ note }) => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const currentFolder = selectedPath.length > 0 ? getCurrentFolder() : null;
  const foldersToShow = selectedPath.length === 0 ? folderStructure : (currentFolder?.subfolders || []);
  const notesToShow = currentFolder ? currentFolder.notes.filter(note => note.id !== currentNoteId) : [];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900">Vincular a uma nota</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Breadcrumb quando navegando */}
        {selectedPath.length > 0 && (
          <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
            <button
              onClick={() => setSelectedPath([])}
              className="hover:text-blue-600"
            >
              Início
            </button>
            {selectedPath.map((folder, index) => (
              <span key={index} className="flex items-center space-x-2">
                <span>/</span>
                <button
                  onClick={() => setSelectedPath(selectedPath.slice(0, index + 1))}
                  className="hover:text-blue-600"
                >
                  {folder}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Resultados da busca ou navegação por pastas */}
        <div className="flex-1 overflow-y-auto folders-scroll">
          {searchTerm ? (
            // Resultados da busca
            <div className="space-y-2">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(({ note, path }) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onNoteSelect(note.id, note.title);
                      onClose();
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{note.title}</div>
                        <div className="text-sm text-gray-500">{path.join(' / ')}</div>
                        {note.content && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {note.content.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma nota encontrada para "{searchTerm}"
                </div>
              )}
            </div>
          ) : (
            // Navegação por pastas
            <div className="space-y-2">
              {/* Pastas */}
              {foldersToShow.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedPath([...selectedPath, folder.name])}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{folder.name}</span>
                    <span className="text-sm text-gray-500">
                      ({folder.notes.length} notas, {folder.subfolders.length} pastas)
                    </span>
                  </div>
                </button>
              ))}

              {/* Notas */}
              {notesToShow.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    onNoteSelect(note.id, note.title);
                    onClose();
                  }}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{note.title}</div>
                      {note.content && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {/* Mensagem quando pasta está vazia */}
              {foldersToShow.length === 0 && notesToShow.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {selectedPath.length === 0 ? 'Nenhuma pasta encontrada' : 'Pasta vazia'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com informações */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 Dica: Use a busca para encontrar notas rapidamente ou navegue pelas pastas
          </p>
        </div>
      </div>
    </div>
  );
}