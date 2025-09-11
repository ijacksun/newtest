import { X, Bold, Italic, Highlighter, Link, BookOpen } from "lucide-react";

interface FormattingHelpModalProps {
  onClose: () => void;
}

export function FormattingHelpModal({ onClose }: FormattingHelpModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Formatação de Texto</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Instruções gerais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Como usar</h3>
            <p className="text-blue-800 text-sm">
              Selecione qualquer texto na nota para ver as opções de formatação. 
              Use o botão de visualização (👁️) para ver como ficará o texto formatado.
            </p>
          </div>

          {/* Tipos de formatação */}
          <div className="grid gap-4">
            {/* Negrito */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Bold className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Negrito</h4>
                  <p className="text-sm text-gray-600">Ctrl+B ou botão na toolbar</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Exemplo: </p>
                <p className="text-gray-800">Este texto está em <strong>negrito</strong>.</p>
              </div>
            </div>

            {/* Itálico */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Italic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Itálico</h4>
                  <p className="text-sm text-gray-600">Ctrl+I ou botão na toolbar</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Exemplo: </p>
                <p className="text-gray-800">Este texto está em <em>itálico</em>.</p>
              </div>
            </div>

            {/* Grifar */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded">
                  <Highlighter className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Grifar</h4>
                  <p className="text-sm text-gray-600">Selecione uma cor da paleta</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Exemplo: </p>
                <p className="text-gray-800">
                  Este texto está 
                  <span className="bg-yellow-300 px-1 rounded text-gray-900"> grifado em amarelo</span>,
                  este está 
                  <span className="bg-green-300 px-1 rounded text-gray-900"> grifado em verde</span>.
                </p>
              </div>
            </div>

            {/* Vincular */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded">
                  <Link className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Vincular a Nota</h4>
                  <p className="text-sm text-gray-600">Conecta texto a outras notas</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Exemplo: </p>
                <p className="text-gray-800">
                  Veja mais detalhes em 
                  <span className="underline text-blue-600 cursor-pointer">minha outra nota</span>.
                </p>
              </div>
            </div>

            {/* Dicionário */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Adicionar ao Dicionário</h4>
                  <p className="text-sm text-gray-600">Cria definições para termos</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Exemplo: </p>
                <p className="text-gray-800">
                  Este é um 
                  <span className="bg-gray-300 px-1 rounded border-b-2 border-dotted border-gray-500 cursor-help">
                    termo técnico
                  </span> 
                  (passe o mouse para ver a definição).
                </p>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">💡 Dicas</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Use Ctrl+B para negrito e Ctrl+I para itálico rapidamente</li>
              <li>• Clique em links sublinhados para navegar entre notas</li>
              <li>• Passe o mouse sobre termos grifados para ver definições</li>
              <li>• Use o botão 👁️ para alternar entre edição e visualização</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}