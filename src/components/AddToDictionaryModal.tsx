import { useState } from "react";
import { X } from "lucide-react";

interface AddToDictionaryModalProps {
  word: string;
  onAdd: (definition: string) => void;
  onClose: () => void;
}

export function AddToDictionaryModal({ word, onAdd, onClose }: AddToDictionaryModalProps) {
  const [definition, setDefinition] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (definition.trim()) {
      onAdd(definition.trim());
      onClose();
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
          <h2 className="text-xl font-medium text-gray-900">Adicionar ao Dicionário</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palavra
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
              placeholder="Digite a definição da palavra..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[100px] resize-vertical text-gray-900 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!definition.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 Esta definição aparecerá em um tooltip ao passar o mouse sobre a palavra na nota.
          </p>
        </div>
      </div>
    </div>
  );
}