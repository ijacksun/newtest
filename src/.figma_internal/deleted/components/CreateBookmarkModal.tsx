import { useState } from "react";
import { X, Bookmark as BookmarkIcon, Flag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateBookmarkModalProps {
  onClose: () => void;
  onCreate: (bookmarkData: { title: string; color: string }) => void;
}

export function CreateBookmarkModal({ onClose, onCreate }: CreateBookmarkModalProps) {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ff6b6b");

  const colors = [
    "#ff6b6b", "#ff8e3c", "#ffcc5c", "#96ceb4", 
    "#6fcf97", "#4ecdc4", "#45b7d1", "#5b8ff9", 
    "#786fa6", "#f8b500", "#e056fd", "#ff6b9d"
  ];

  const handleContinue = () => {
    if (title.trim()) {
      onCreate({
        title: title.trim(),
        color: selectedColor
      });
      onClose();
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
          <h2 className="text-2xl font-semibold text-gray-900">Editar</h2>
        </div>

        {/* Marcador section */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-center px-6 py-4 bg-blue-200 rounded-xl mb-4">
            <BookmarkIcon className="w-6 h-6 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Marcador</span>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Title input */}
          <div>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o Nome do Marcador"
              className="w-full h-12 bg-gray-300 border-0 rounded-xl text-gray-700 font-medium placeholder:text-gray-600"
            />
          </div>

          {/* Color picker */}
          <div className="flex items-center space-x-3">
            {/* Color gradient bar */}
            <div className="flex-1 relative h-8">
              <div 
                className="h-full rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${colors.join(', ')})`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  const colorIndex = Math.round(percentage * (colors.length - 1));
                  setSelectedColor(colors[Math.max(0, Math.min(colorIndex, colors.length - 1))]);
                }}
              />
            </div>

            {/* Flag icon */}
            <div className="p-2">
              <Flag 
                className="w-6 h-6" 
                style={{ color: selectedColor }}
                fill={selectedColor}
              />
            </div>
          </div>
        </div>

        {/* Continue button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleContinue}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
            disabled={!title.trim()}
          >
            CONTINUAR
          </Button>
        </div>
      </div>
    </div>
  );
}