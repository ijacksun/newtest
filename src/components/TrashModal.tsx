import { useState } from 'react';
import { X, RotateCcw, Trash2, Eye, Square, CheckSquare } from 'lucide-react';
import { TrashItem, FolderNode } from '../App';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashItems: TrashItem[];
  setTrashItems: React.Dispatch<React.SetStateAction<TrashItem[]>>;
  folderStructure: FolderNode[];
  setFolderStructure: React.Dispatch<React.SetStateAction<FolderNode[]>>;
}

export function TrashModal({ 
  isOpen, 
  onClose, 
  trashItems, 
  setTrashItems,
  folderStructure,
  setFolderStructure
}: TrashModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === trashItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(trashItems.map(item => item.id));
    }
  };

  const restoreItem = (item: TrashItem) => {
    // Função recursiva para encontrar ou criar a pasta no caminho correto
    const findOrCreateFolder = (folders: FolderNode[], path: string[], currentIndex: number = 0): FolderNode[] => {
      if (currentIndex >= path.length) return folders;
      
      const folderName = path[currentIndex];
      let targetFolder = folders.find(folder => folder.name === folderName);
      
      if (!targetFolder) {
        // Criar pasta se não existir
        targetFolder = {
          id: `folder-${Date.now()}-${Math.random()}`,
          name: folderName,
          subfolders: [],
          notes: []
        };
        folders.push(targetFolder);
      }
      
      if (currentIndex === path.length - 1) {
        // Esta é a pasta de destino final
        if (item.type === 'note') {
          const noteExists = targetFolder.notes.some(note => note.id === item.id);
          if (!noteExists) {
            targetFolder.notes.push({
              id: item.id,
              title: item.title,
              content: item.content
            });
          }
        } else if (item.type === 'folder') {
          const folderExists = targetFolder.subfolders.some(folder => folder.id === item.folderId);
          if (!folderExists && item.folderId) {
            targetFolder.subfolders.push({
              id: item.folderId,
              name: item.title,
              subfolders: item.subfolders || [],
              notes: item.notes || []
            });
          }
        }
      } else {
        // Continuar navegando no caminho
        targetFolder.subfolders = findOrCreateFolder(targetFolder.subfolders, path, currentIndex + 1);
      }
      
      return folders;
    };

    setFolderStructure(prev => {
      const newStructure = [...prev];
      if (item.originalPath.length === 0) {
        // Item estava na raiz
        if (item.type === 'note') {
          // Verificar se a nota já existe na raiz
          const noteExists = newStructure.some(folder => 
            folder.notes.some(note => note.id === item.id)
          );
          if (!noteExists) {
            // Criar uma pasta padrão se necessário ou adicionar à primeira pasta existente
            if (newStructure.length === 0) {
              newStructure.push({
                id: `folder-${Date.now()}`,
                name: 'Notas',
                subfolders: [],
                notes: [{
                  id: item.id,
                  title: item.title,
                  content: item.content
                }]
              });
            } else {
              newStructure[0].notes.push({
                id: item.id,
                title: item.title,
                content: item.content
              });
            }
          }
        } else if (item.type === 'folder' && item.folderId) {
          // Restaurar pasta na raiz
          const folderExists = newStructure.some(folder => folder.id === item.folderId);
          if (!folderExists) {
            newStructure.push({
              id: item.folderId,
              name: item.title,
              subfolders: item.subfolders || [],
              notes: item.notes || []
            });
          }
        }
      } else {
        // Item estava em uma subpasta
        findOrCreateFolder(newStructure, item.originalPath);
      }
      return newStructure;
    });

    // Remover item da lixeira
    setTrashItems(prev => prev.filter(trashItem => trashItem.id !== item.id));
    setSelectedItems(prev => prev.filter(id => id !== item.id));
  };

  const deleteItemPermanently = (itemId: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const restoreSelectedItems = () => {
    selectedItems.forEach(itemId => {
      const item = trashItems.find(item => item.id === itemId);
      if (item) {
        restoreItem(item);
      }
    });
  };

  const deleteSelectedItemsPermanently = () => {
    setTrashItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl">Lixeira</h1>
          {trashItems.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {selectedItems.length === trashItems.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedItems.length === trashItems.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={restoreSelectedItems}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar ({selectedItems.length})
              </button>
              <button
                onClick={deleteSelectedItemsPermanently}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Permanentemente ({selectedItems.length})
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {trashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Trash2 className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg">A lixeira está vazia</p>
            <p className="text-sm">Os itens excluídos aparecerão aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trashItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 relative border border-gray-200">
                {/* Checkbox Superior Esquerdo */}
                <button
                  onClick={() => handleSelectItem(item.id)}
                  className="absolute top-3 left-3 p-1 hover:bg-gray-200 rounded"
                >
                  {selectedItems.includes(item.id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Botão Expandir Superior Direito */}
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>

                {/* Conteúdo Central */}
                <div className="mt-8 mb-8 text-center">
                  <h3 className="font-medium text-gray-900 mb-2 px-8">{item.title}</h3>
                  <p className="text-xs text-gray-500">
                    {item.originalPath.length > 0 ? item.originalPath.join(' > ') : 'Raiz'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Excluído em {formatDate(item.deletedAt)}
                  </p>
                </div>

                {/* Botões Inferiores */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <button
                    onClick={() => restoreItem(item)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Restaurar"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => deleteItemPermanently(item.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Excluir Permanentemente"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Conteúdo Expandido */}
                {expandedItem === item.id && (
                  <div className="absolute inset-0 bg-white rounded-lg border-2 border-blue-500 p-4 z-10 max-h-80 overflow-auto">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <button
                        onClick={() => setExpandedItem(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {item.content || 'Sem conteúdo'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}