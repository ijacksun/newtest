import { X, CheckSquare, Trash2 } from "lucide-react";
import { TodoItem } from "../App";

interface CompletedTodosModalProps {
  onClose: () => void;
  completedTodos: TodoItem[];
  onDeleteCompleted: (todoId: string) => void;
  onRestoreCompleted: (todoId: string) => void;
}

export function CompletedTodosModal({ onClose, completedTodos, onDeleteCompleted, onRestoreCompleted }: CompletedTodosModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tarefas Concluídas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedTodos.length > 0 ? (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {completedTodos.map((todo) => (
                <div key={todo.id} className={`${todo.color} rounded-lg p-4 text-white relative opacity-80`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white line-through">{todo.title}</h3>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => onRestoreCompleted(todo.id)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                        title="Restaurar tarefa"
                      >
                        <CheckSquare className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={() => onDeleteCompleted(todo.id)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                        title="Excluir permanentemente"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-3">
                    Concluída em {todo.date.toLocaleDateString('pt-BR')} às {todo.time}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70">Concluída</span>
                    <div className="w-5 h-5 bg-white/30 rounded flex items-center justify-center">
                      <CheckSquare className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma tarefa concluída ainda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {completedTodos.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {completedTodos.length} tarefa{completedTodos.length !== 1 ? 's' : ''} concluída{completedTodos.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}