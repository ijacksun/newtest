import { X, Flag, Trash2 } from "lucide-react";
import { Bookmark } from "../App";

interface BookmarksModalProps {
  bookmarks: Bookmark[];
  onClose: () => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export function BookmarksModal({ bookmarks, onClose, onDeleteBookmark }: BookmarksModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] relative flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* Header */}
        <div className="text-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-900">Meus Marcadores</h2>
          <p className="text-sm text-gray-600 mt-1">
            {bookmarks.length} {bookmarks.length === 1 ? 'marcador salvo' : 'marcadores salvos'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum marcador salvo</p>
              <p className="text-gray-400 text-sm mt-2">
                Crie seu primeiro marcador usando o botão Plus
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Flag
                      className="w-5 h-5"
                      style={{ color: bookmark.color }}
                      fill={bookmark.color}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{bookmark.title}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(bookmark.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteBookmark(bookmark.id)}
                    className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                    title="Excluir marcador"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}