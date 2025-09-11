import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateWordModalProps {
  onClose: () => void;
  onWordCreated: (word: string, definition: string) => void;
}

export function CreateWordModal({ onClose, onWordCreated }: CreateWordModalProps) {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  const handleCreate = () => {
    if (word.trim() && definition.trim()) {
      onWordCreated(word.trim(), definition.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Criar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Palavras option (highlighted as selected) */}
          <div className="bg-gray-200 rounded-lg p-4 border-2 border-gray-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center">
                <span className="text-white text-xs">📚</span>
              </div>
              <span className="font-medium text-gray-900">Palavras</span>
            </div>
          </div>

          {/* Word Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              PALAVRA
            </label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Digite sua palavra"
              className="w-full h-10 bg-gray-100 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0"
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          {/* Definition Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              SIGNIFICADO
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Digite o Significado da palavra"
              className="w-full h-32 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCreate}
              disabled={!word.trim() || !definition.trim()}
              className="px-8 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CRIAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}