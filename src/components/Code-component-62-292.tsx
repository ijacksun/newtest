import { useState } from "react";
import { X, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FolderNode } from "../App";

interface CreateNoteModalProps {
  onClose: () => void;
  onCreate: (noteData: { title: string; folderPath: string[]; folderId: string }) => void;
  folderStructure: FolderNode[];
}

export function CreateNoteModal({ onClose, onCreate, folderStructure }: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");

  // Função para coletar todas as pastas (incluindo subpastas) para o dropdown
  const getAllFolders = (folders: FolderNode[], currentPath: string[] = []): { folder: FolderNode; path: string[]; displayName: string }[] => {
    const allFolders: { folder: FolderNode; path: string[]; displayName: string }[] = [];
    
    folders.forEach(folder => {
      const folderPath = [...currentPath, folder.name];
      const displayName = folderPath.length > 1 ? folderPath.join(" > ") : folder.name;
      allFolders.push({ folder, path: folderPath, displayName });
      
      // Recursivamente adicionar subpastas
      if (folder.subfolders.length > 0) {
        allFolders.push(...getAllFolders(folder.subfolders, folderPath));
      }
    });
    
    return allFolders;
  };

  const allFolders = getAllFolders(folderStructure);

  const handleContinue = () => {
    if (title.trim() && selectedFolderId) {
      const selectedFolder = allFolders.find(item => item.folder.id === selectedFolderId);
      if (selectedFolder) {
        onCreate({
          title: title.trim(),
          folderPath: selectedFolder.path,
          folderId: selectedFolderId
        });
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Criar</h2>
        </div>

        {/* Nota section */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-center px-6 py-4 bg-blue-200 rounded-xl mb-4">
            <FileText className="w-6 h-6 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Nota</span>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Folder dropdown */}
          <div>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger className="w-full h-12 bg-gray-300 border-0 rounded-xl text-gray-700 font-medium">
                <SelectValue placeholder="Escolher Pasta" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {allFolders.length > 0 ? (
                  allFolders.map((item) => (
                    <SelectItem key={item.folder.id} value={item.folder.id}>
                      {item.displayName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-folders" disabled>
                    Nenhuma pasta disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Note title field */}
          <div>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da Nota"
              className="w-full h-12 bg-gray-300 border-0 rounded-xl text-gray-700 font-medium placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Continue button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleContinue}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
            disabled={!title.trim() || !selectedFolderId}
          >
            CONTINUAR
          </Button>
        </div>
      </div>
    </div>
  );
}