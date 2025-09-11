import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  FolderOpen,
  Bell,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  CheckSquare,
  Link,
  Copy,
  Download,
  Save,
  FolderPlus,
  X,
  Pin,
  PinOff,
  Edit2,
  Bookmark as BookmarkIcon,
  List,
  Book,
} from "lucide-react";
import { SearchModal } from "./SearchModal";
import { DictionaryModal } from "./DictionaryModal";
import { CreateNoteModal } from "./CreateNoteModal";
import { CreateBookmarkModal } from "./CreateBookmarkModal";
import { BookmarksModal } from "./BookmarksModal";
import { CreateTodoModal } from "./CreateTodoModal";
import { CompletedTodosModal } from "./CompletedTodosModal";
import { CreateWordModal } from "./CreateWordModal";
import { Bookmark, TrashItem, TodoItem } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { FolderNode } from "../App";
import { TrashModal } from "./TrashModal";

interface HomePageProps {
  folderStructure: FolderNode[];
  setFolderStructure: React.Dispatch<
    React.SetStateAction<FolderNode[]>
  >;
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<
    React.SetStateAction<Bookmark[]>
  >;
  trashItems: TrashItem[];
  setTrashItems: React.Dispatch<
    React.SetStateAction<TrashItem[]>
  >;
  todoItems: TodoItem[];
  setTodoItems: React.Dispatch<
    React.SetStateAction<TodoItem[]>
  >;
  onFolderClick: (folderName: string) => void;
  onNavigateToNote: (
    notePath: string[],
    noteId: string,
  ) => void;
  onNavigateToFolder: (folderPath: string[]) => void;
}

export function HomePage({
  folderStructure,
  setFolderStructure,
  bookmarks,
  setBookmarks,
  trashItems,
  setTrashItems,
  todoItems,
  setTodoItems,
  onFolderClick,
  onNavigateToNote,
  onNavigateToFolder,
}: HomePageProps) {
  // Estados para o sistema de ofensivas
  const [isStreakExpanded, setIsStreakExpanded] = useState(false);
  const [selectedRestDays, setSelectedRestDays] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(1);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [isStreakViolated, setIsStreakViolated] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] =
    useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderIndex, setRenamingFolderIndex] =
    useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    folderIndex: number;
  } | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] =
    useState(false);
  const [showFoldersModal, setShowFoldersModal] =
    useState(false);
  const [folderContextMenu, setFolderContextMenu] = useState<{
    x: number;
    y: number;
    folder: FolderNode;
    path: string[];
  } | null>(null);
  const [showRenameFolderModal, setShowRenameFolderModal] =
    useState(false);
  const [renamingFolder, setRenamingFolder] = useState<{
    folder: FolderNode;
    path: string[];
  } | null>(null);
  const [showCreateNoteModal, setShowCreateNoteModal] =
    useState(false);
  const [showCreateBookmarkModal, setShowCreateBookmarkModal] =
    useState(false);
  const [showBookmarksModal, setShowBookmarksModal] =
    useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showCreateTodoModal, setShowCreateTodoModal] =
    useState(false);
  const [showCompletedTodosModal, setShowCompletedTodosModal] =
    useState(false);
  const [showCreateWordModal, setShowCreateWordModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Função para obter notas recentes
  const getRecentNotes = () => {
    const allNotes: Array<{
      id: string;
      title: string;
      content: string;
      path: string[];
      timestamp: string;
      type: 'created' | 'modified' | 'opened';
    }> = [];

    // Recursivamente buscar todas as notas
    const searchNotes = (folders: FolderNode[], currentPath: string[]) => {
      folders.forEach(folder => {
        const folderPath = [...currentPath, folder.name];
        
        // Adicionar notas desta pasta
        folder.notes.forEach(note => {
          const timestamps = [
            { date: note.createdAt, type: 'created' as const },
            { date: note.modifiedAt, type: 'modified' as const },
            { date: note.lastOpenedAt, type: 'opened' as const }
          ].filter(t => t.date);

          if (timestamps.length > 0) {
            // Usar o timestamp mais recente
            const mostRecent = timestamps.sort((a, b) => 
              new Date(b.date!).getTime() - new Date(a.date!).getTime()
            )[0];

            allNotes.push({
              id: note.id,
              title: note.title,
              content: note.content,
              path: folderPath,
              timestamp: mostRecent.date!,
              type: mostRecent.type
            });
          }
        });

        // Buscar em subpastas
        if (folder.subfolders.length > 0) {
          searchNotes(folder.subfolders, folderPath);
        }
      });
    };

    searchNotes(folderStructure, []);

    // Ordenar por timestamp mais recente e retornar apenas as primeiras
    return allNotes
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Manter até 10 notas recentes
  };

  const recentNotes = getRecentNotes();

  // Carregar dados do sistema de ofensivas do localStorage
  useEffect(() => {
    const savedStreakData = localStorage.getItem('stride-streak-data');
    if (savedStreakData) {
      try {
        const data = JSON.parse(savedStreakData);
        setSelectedRestDays(data.selectedRestDays || []);
        setCurrentStreak(data.currentStreak || 1);
        setLastActiveDate(data.lastActiveDate || null);
        setIsStreakViolated(data.isStreakViolated || false);
        
        // Verificar se precisa resetar a ofensiva por inatividade prolongada
        if (data.lastActiveDate) {
          const lastDate = new Date(data.lastActiveDate);
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Se passou mais de 1 dia útil sem atividade, verificar se quebrou a sequência
          if (daysDiff > 1) {
            const restDays = data.selectedRestDays || [];
            let workDaysMissed = 0;
            
            // Contar quantos dias úteis foram perdidos
            for (let i = 1; i <= daysDiff; i++) {
              const checkDate = new Date(today);
              checkDate.setDate(checkDate.getDate() - i);
              if (!restDays.includes(checkDate.getDay())) {
                workDaysMissed++;
              }
            }
            
            // Se perdeu mais de 1 dia útil, resetar
            if (workDaysMissed > 1) {
              setCurrentStreak(1);
              setLastActiveDate(null);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados das ofensivas:', error);
      }
    }
  }, []);

  // Salvar dados do sistema de ofensivas no localStorage
  useEffect(() => {
    const streakData = {
      selectedRestDays,
      currentStreak,
      lastActiveDate,
      isStreakViolated
    };
    localStorage.setItem('stride-streak-data', JSON.stringify(streakData));
  }, [selectedRestDays, currentStreak, lastActiveDate, isStreakViolated]);

  // Função para calcular ofensiva considerando dias de descanso
  const calculateStreak = () => {
    // Se a ofensiva foi violada, não calcular
    if (isStreakViolated) {
      return;
    }

    const today = new Date();
    const todayString = today.toDateString();
    const todayDayOfWeek = today.getDay();
    
    // Se hoje é um dia de descanso, não atualizar a ofensiva
    if (selectedRestDays.includes(todayDayOfWeek)) {
      return;
    }

    // Se já atualizamos hoje, não fazer nada
    if (lastActiveDate === todayString) {
      return;
    }

    // Função para verificar se um dia é de descanso
    const isRestDay = (date: Date) => {
      return selectedRestDays.includes(date.getDay());
    };

    // Encontrar o último dia útil (não de descanso)
    let lastWorkDay = new Date(today);
    lastWorkDay.setDate(lastWorkDay.getDate() - 1);
    
    while (isRestDay(lastWorkDay)) {
      lastWorkDay.setDate(lastWorkDay.getDate() - 1);
    }

    const lastWorkDayString = lastWorkDay.toDateString();

    // Se é a primeira vez usando ou se a última atividade foi no último dia útil
    if (!lastActiveDate) {
      // Primeira vez
      setCurrentStreak(1);
      setLastActiveDate(todayString);
    } else if (lastActiveDate === lastWorkDayString) {
      // Atividade consecutiva
      setCurrentStreak(prev => prev + 1);
      setLastActiveDate(todayString);
    } else {
      // Quebrou a sequência, resetar
      setCurrentStreak(1);
      setLastActiveDate(todayString);
    }
  };

  // Calcular ofensiva ao carregar a página e quando há mudanças nos dias de descanso
  useEffect(() => {
    calculateStreak();
    checkForRestDayViolations();
  }, [selectedRestDays]);

  // Verificar violações e calcular ofensiva quando há mudanças na estrutura de pastas
  useEffect(() => {
    checkForRestDayViolations();
    
    const today = new Date().toDateString();
    const recentNotes = getRecentNotes();
    const hasActivityToday = recentNotes.some(note => {
      const noteDate = new Date(note.timestamp).toDateString();
      return noteDate === today;
    });

    if (hasActivityToday && !isStreakViolated) {
      calculateStreak();
    }
  }, [folderStructure]);

  // Função para alternar dia de descanso (limitado a 2 dias)
  const toggleRestDay = (dayIndex: number) => {
    setSelectedRestDays(prev => {
      if (prev.includes(dayIndex)) {
        // Se o dia já está selecionado, remove
        return prev.filter(day => day !== dayIndex);
      } else {
        // Se o dia não está selecionado, adiciona apenas se tem menos de 2 dias
        if (prev.length < 2) {
          return [...prev, dayIndex];
        } else {
          // Se já tem 2 dias, não permite adicionar mais
          return prev;
        }
      }
    });
  };

  // Função para verificar se houve violação nos dias de descanso
  const checkForRestDayViolations = () => {
    const recentNotes = getRecentNotes();
    
    // Verificar notas modificadas nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const violations = recentNotes.filter(note => {
      // Verificar apenas notas modificadas (não criadas ou apenas abertas)
      if (note.type !== 'modified') return false;
      
      const noteDate = new Date(note.timestamp);
      const noteDayOfWeek = noteDate.getDay();
      
      // Se foi modificada em um dia de descanso selecionado
      if (selectedRestDays.includes(noteDayOfWeek)) {
        // Verificar se foi nos últimos 7 dias
        return noteDate.getTime() >= sevenDaysAgo.getTime();
      }
      
      return false;
    });
    
    // Se encontrou violações, quebrar a ofensiva
    if (violations.length > 0) {
      setIsStreakViolated(true);
      setCurrentStreak(1);
      // Não resetar o lastActiveDate para manter o registro
    } else {
      setIsStreakViolated(false);
    }
  };

  // Função para resetar violação e recomeçar ofensiva
  const resetViolation = () => {
    setIsStreakViolated(false);
    setCurrentStreak(1);
    setLastActiveDate(null);
    // Recalcular a ofensiva imediatamente
    setTimeout(() => {
      calculateStreak();
    }, 100);
  };

  // Função para alternar expansão do card de ofensivas
  const toggleStreakExpansion = () => {
    setIsStreakExpanded(!isStreakExpanded);
  };

  // Rest of the component implementation...
  // (continuing with all the existing functions and JSX)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1>Stride</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Buscar notas"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowDictionaryModal(true)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Dicionário"
              >
                <Book className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pastas */}
          <div>
            <h2>Pastas</h2>
            <div className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative">
              {folderStructure.length > 0 ? (
                <div className="space-y-3">
                  {folderStructure.map((folder, index) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => onFolderClick(folder.name)}
                      onContextMenu={(e) => handleFolderContextMenu(e, index)}
                    >
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <span>{folder.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {folder.notes.length} notas
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FolderOpen className="w-12 h-12 mb-4" />
                  <p>Nenhuma pasta criada ainda</p>
                  <p className="text-sm">Clique no + para criar uma pasta</p>
                </div>
              )}
              
              <button
                onClick={addFolder}
                className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Ofensivas */}
          <div>
            <h2>Ofensivas</h2>
            <div 
              className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative cursor-pointer"
              onClick={toggleStreakExpansion}
            >
              <div className="space-y-4">
                {!isStreakExpanded ? (
                  // Vista compacta
                  <div className="flex flex-col items-center justify-center h-full min-h-[352px]">
                    {isStreakViolated ? (
                      // Vista compacta - ofensiva violada
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto">
                          <ThumbsDown className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                          <span className="text-5xl font-bold text-red-600 block">
                            {currentStreak}
                          </span>
                          <p className="text-lg text-red-600 mt-2">
                            Ofensiva quebrada!
                          </p>
                          <p className="text-sm text-red-500 mt-1">
                            Clique para ver detalhes
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Vista compacta - ofensiva normal
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                          <ThumbsUp className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <span className="text-5xl font-bold text-gray-800 block">
                            {currentStreak}
                          </span>
                          <p className="text-lg text-gray-700 mt-2">
                            {currentStreak === 1 ? 'dia' : 'dias'} de ofensiva
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Clique para configurar
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Vista expandida
                  <>
                    {isStreakViolated ? (
                      // Vista quando ofensiva foi violada - expandida
                      <div className="space-y-4">
                        <div className="bg-red-100 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                              <ThumbsDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-4xl font-bold text-red-600">
                                {currentStreak}
                              </span>
                              <p className="text-sm text-red-600 mt-1">
                                Ofensiva quebrada!
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-red-700 text-center mb-4">
                            ⚠️ Você modificou notas durante seus dias de descanso selecionados. 
                            Isso quebra automaticamente a ofensiva.
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs text-red-600 text-center">
                              Seus dias de descanso atuais:
                            </p>
                            <div className="flex justify-center space-x-2">
                              {[
                                { label: "S", day: 1, name: "Segunda" },
                                { label: "T", day: 2, name: "Terça" },
                                { label: "Q", day: 3, name: "Quarta" },
                                { label: "Q", day: 4, name: "Quinta" },
                                { label: "S", day: 5, name: "Sexta" },
                                { label: "S", day: 6, name: "Sábado" },
                                { label: "D", day: 0, name: "Domingo" }
                              ].map((dayInfo, index) => {
                                const isSelected = selectedRestDays.includes(dayInfo.day);
                                
                                return (
                                  <div
                                    key={index}
                                    className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center ${
                                      isSelected
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                                  >
                                    {dayInfo.label}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetViolation();
                            }}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium mt-4"
                          >
                            Recomeçar ofensiva
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Vista expandida normal - seleção de dias
                      <>
                        <p className="text-sm text-gray-700 mb-2">
                          Escolha quais dias da semana você deseja descansar
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Máximo de 2 dias ({selectedRestDays.length}/2 selecionados)
                        </p>
                        <div className="flex justify-center space-x-2 mb-4">
                          {[
                            { label: "S", day: 1, name: "Segunda" },
                            { label: "T", day: 2, name: "Terça" },
                            { label: "Q", day: 3, name: "Quarta" },
                            { label: "Q", day: 4, name: "Quinta" },
                            { label: "S", day: 5, name: "Sexta" },
                            { label: "S", day: 6, name: "Sábado" },
                            { label: "D", day: 0, name: "Domingo" }
                          ].map((dayInfo, index) => {
                            const isSelected = selectedRestDays.includes(dayInfo.day);
                            const canSelect = isSelected || selectedRestDays.length < 2;
                            
                            return (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canSelect) {
                                    toggleRestDay(dayInfo.day);
                                  }
                                }}
                                title={`${dayInfo.name}${!canSelect ? ' - Limite atingido' : ''}`}
                                disabled={!canSelect}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                  isSelected
                                    ? "bg-gray-800 text-white shadow-md"
                                    : canSelect
                                    ? "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 cursor-pointer"
                                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                }`}
                              >
                                {dayInfo.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <ThumbsUp className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <span className="text-3xl font-semibold text-gray-800">
                              {currentStreak}
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              {currentStreak === 1 ? 'dia' : 'dias'} de ofensiva
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* To-Do */}
          <div>
            <h2>To-Do</h2>
            <div className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative">
              {/* TO-DO content */}
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <CheckSquare className="w-12 h-12 mb-4" />
                <p>Suas tarefas aparecerão aqui</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-300 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setShowTrashModal(true)}
            className="p-3 rounded-full hover:bg-gray-300 transition-colors"
            title="Lixeira"
          >
            <Trash2 className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setShowBookmarksModal(true)}
            className="p-3 rounded-full hover:bg-gray-300 transition-colors"
            title="Meus Marcadores"
          >
            <BookmarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        trashItems={trashItems}
        setTrashItems={setTrashItems}
        folderStructure={folderStructure}
        setFolderStructure={setFolderStructure}
      />
    </div>
  );
}