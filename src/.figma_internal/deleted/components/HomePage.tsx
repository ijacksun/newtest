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
      lastActiveDate
    };
    localStorage.setItem('stride-streak-data', JSON.stringify(streakData));
  }, [selectedRestDays, currentStreak, lastActiveDate]);

  // Função para calcular ofensiva considerando dias de descanso
  const calculateStreak = () => {
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
  }, [selectedRestDays]);

  // Calcular ofensiva quando há mudanças na estrutura de pastas
  useEffect(() => {
    const today = new Date().toDateString();
    const recentNotes = getRecentNotes();
    const hasActivityToday = recentNotes.some(note => {
      const noteDate = new Date(note.timestamp).toDateString();
      return noteDate === today;
    });

    if (hasActivityToday) {
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



  // Função para alternar expansão do card de ofensivas
  const toggleStreakExpansion = () => {
    setIsStreakExpanded(!isStreakExpanded);
  };

  // Definir cores disponíveis para TODOs
  const todoColors = [
    "bg-gray-500",
    "bg-green-400",
    "bg-blue-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
  ];

  const addFolder = () => {
    setShowNewFolderModal(true);
  };

  const handleCreateNewFolder = () => {
    if (newFolderName && newFolderName.trim()) {
      const trimmedName = newFolderName.trim();
      if (
        folderStructure.some(
          (folder) => folder.name === trimmedName,
        )
      ) {
        alert(
          "Já existe uma pasta com este nome. Escolha um nome diferente.",
        );
        return;
      }

      const newFolder: FolderNode = {
        id: Date.now().toString(),
        name: trimmedName,
        subfolders: [],
        notes: [],
      };

      setFolderStructure((prev) => [...prev, newFolder]);
      setNewFolderName("");
      setShowNewFolderModal(false);
    }
  };

  const handleCancelCreate = () => {
    setNewFolderName("");
    setShowNewFolderModal(false);
  };

  const handleFolderContextMenu = (
    e: React.MouseEvent,
    folderIndex: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderIndex });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const deleteFolder = (folderIndex: number) => {
    if (
      confirm(
        "Tem certeza que deseja mover esta pasta para a lixeira?",
      )
    ) {
      const folderToDelete = folderStructure[folderIndex];

      if (folderToDelete) {
        // Adicionar à lixeira
        const trashItem: TrashItem = {
          id: `folder-${Date.now()}`,
          title: folderToDelete.name,
          content: `Pasta com ${folderToDelete.notes.length} nota(s) e ${folderToDelete.subfolders.length} subpasta(s)`,
          type: "folder",
          originalPath: [], // Pasta raiz
          deletedAt: new Date().toISOString(),
          folderId: folderToDelete.id,
          subfolders: folderToDelete.subfolders,
          notes: folderToDelete.notes,
        };

        setTrashItems((prev) => [...prev, trashItem]);

        // Remover da estrutura atual
        setFolderStructure((prev) =>
          prev.filter((_, index) => index !== folderIndex),
        );
      }
    }
    closeContextMenu();
  };

  const duplicateFolder = (folderIndex: number) => {
    const originalFolder = folderStructure[folderIndex];
    const newFolder: FolderNode = {
      ...originalFolder,
      id: Date.now().toString(),
      name: `${originalFolder.name} - Cópia`,
    };
    setFolderStructure((prev) => [...prev, newFolder]);
    closeContextMenu();
  };

  const renameFolder = (folderIndex: number) => {
    setRenamingFolderIndex(folderIndex);
    setNewFolderName(folderStructure[folderIndex].name);
    setShowRenameModal(true);
    closeContextMenu();
  };

  const handleRenameFolder = () => {
    if (
      renamingFolderIndex !== null &&
      newFolderName &&
      newFolderName.trim()
    ) {
      const trimmedName = newFolderName.trim();
      const currentName =
        folderStructure[renamingFolderIndex].name;

      if (trimmedName !== currentName) {
        if (
          folderStructure.some(
            (folder) => folder.name === trimmedName,
          )
        ) {
          alert(
            "Já existe uma pasta com este nome. Escolha um nome diferente.",
          );
          return;
        }

        setFolderStructure((prev) => {
          const updated = [...prev];
          updated[renamingFolderIndex] = {
            ...updated[renamingFolderIndex],
            name: trimmedName,
          };
          return updated;
        });
      }

      setNewFolderName("");
      setRenamingFolderIndex(null);
      setShowRenameModal(false);
    }
  };

  const handleCancelRename = () => {
    setNewFolderName("");
    setRenamingFolderIndex(null);
    setShowRenameModal(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300, // Scroll 300px para a esquerda
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300, // Scroll 300px para a direita
        behavior: "smooth",
      });
    }
  };

  // Função para coletar todas as pastas (incluindo subpastas)
  const getAllFolders = (
    folders: FolderNode[],
    currentPath: string[] = [],
  ): { folder: FolderNode; path: string[] }[] => {
    const allFolders: { folder: FolderNode; path: string[] }[] =
      [];

    folders.forEach((folder) => {
      const folderPath = [...currentPath, folder.name];
      allFolders.push({ folder, path: folderPath });

      // Recursivamente adicionar subpastas
      if (folder.subfolders.length > 0) {
        allFolders.push(
          ...getAllFolders(folder.subfolders, folderPath),
        );
      }
    });

    return allFolders;
  };

  const allFolders = getAllFolders(folderStructure).sort(
    (a, b) => {
      // Pastas fixadas primeiro
      if (a.folder.isPinned && !b.folder.isPinned) return -1;
      if (!a.folder.isPinned && b.folder.isPinned) return 1;
      // Dentro de cada grupo, ordenar alfabeticamente
      return a.folder.name
        .toLowerCase()
        .localeCompare(b.folder.name.toLowerCase());
    },
  );

  // Função para encontrar e atualizar uma pasta na estrutura
  const updateFolderInStructure = (
    structure: FolderNode[],
    targetPath: string[],
    updates: Partial<FolderNode>,
  ): FolderNode[] => {
    if (targetPath.length === 0) return structure;

    const [currentFolder, ...remainingPath] = targetPath;

    return structure.map((folder) => {
      if (folder.name === currentFolder) {
        if (remainingPath.length === 0) {
          // Chegamos na pasta alvo
          return { ...folder, ...updates };
        } else {
          // Continuar buscando nas subpastas
          return {
            ...folder,
            subfolders: updateFolderInStructure(
              folder.subfolders,
              remainingPath,
              updates,
            ),
          };
        }
      }
      return folder;
    });
  };

  // Função para remover uma pasta da estrutura
  const removeFolderFromStructure = (
    structure: FolderNode[],
    targetPath: string[],
  ): FolderNode[] => {
    if (targetPath.length === 0) return structure;

    const [currentFolder, ...remainingPath] = targetPath;

    if (remainingPath.length === 0) {
      // Remover a pasta atual
      return structure.filter(
        (folder) => folder.name !== currentFolder,
      );
    }

    return structure.map((folder) => {
      if (folder.name === currentFolder) {
        return {
          ...folder,
          subfolders: removeFolderFromStructure(
            folder.subfolders,
            remainingPath,
          ),
        };
      }
      return folder;
    });
  };

  // Fixar/desfixar pasta
  const togglePinFolder = (
    folder: FolderNode,
    path: string[],
  ) => {
    const updatedStructure = updateFolderInStructure(
      folderStructure,
      path,
      {
        isPinned: !folder.isPinned,
      },
    );
    setFolderStructure(updatedStructure);
    setFolderContextMenu(null);
  };

  // Excluir pasta
  const deleteFolderFromModal = (
    folder: FolderNode,
    path: string[],
  ) => {
    if (
      confirm(
        `Tem certeza que deseja mover a pasta "${folder.name}" e todo seu conteúdo para a lixeira?`,
      )
    ) {
      // Adicionar à lixeira
      const trashItem: TrashItem = {
        id: `folder-${Date.now()}`,
        title: folder.name,
        content: `Pasta com ${folder.notes.length} nota(s) e ${folder.subfolders.length} subpasta(s)`,
        type: "folder",
        originalPath: path.slice(0, -1), // Caminho até a pasta pai
        deletedAt: new Date().toISOString(),
        folderId: folder.id,
        subfolders: folder.subfolders,
        notes: folder.notes,
      };

      setTrashItems((prev) => [...prev, trashItem]);

      // Remover da estrutura atual
      const updatedStructure = removeFolderFromStructure(
        folderStructure,
        path,
      );
      setFolderStructure(updatedStructure);
    }
    setFolderContextMenu(null);
  };

  // Renomear pasta
  const renameFolderFromModal = (
    folder: FolderNode,
    path: string[],
  ) => {
    setRenamingFolder({ folder, path });
    setNewFolderName(folder.name);
    setShowRenameFolderModal(true);
    setFolderContextMenu(null);
  };

  const handleRenameFolderFromModal = () => {
    if (
      renamingFolder &&
      newFolderName &&
      newFolderName.trim()
    ) {
      const trimmedName = newFolderName.trim();

      if (trimmedName !== renamingFolder.folder.name) {
        // Verificar se já existe uma pasta com esse nome no mesmo nível
        const parentPath = renamingFolder.path.slice(0, -1);
        let siblingFolders: FolderNode[] = folderStructure;

        // Navegar até o nível pai para verificar duplicatas
        for (const folderName of parentPath) {
          const parentFolder = siblingFolders.find(
            (f) => f.name === folderName,
          );
          if (parentFolder) {
            siblingFolders = parentFolder.subfolders;
          }
        }

        const nameExists = siblingFolders.some(
          (f) =>
            f.name === trimmedName &&
            f.id !== renamingFolder.folder.id,
        );

        if (nameExists) {
          alert(
            "Já existe uma pasta com este nome neste local. Escolha um nome diferente.",
          );
          return;
        }

        const updatedStructure = updateFolderInStructure(
          folderStructure,
          renamingFolder.path,
          {
            name: trimmedName,
          },
        );
        setFolderStructure(updatedStructure);
      }

      setNewFolderName("");
      setRenamingFolder(null);
      setShowRenameFolderModal(false);
    }
  };

  const handleCancelRenameFolderFromModal = () => {
    setNewFolderName("");
    setRenamingFolder(null);
    setShowRenameFolderModal(false);
  };

  // Fechar menu contextual
  const closeFolderContextMenu = () => {
    setFolderContextMenu(null);
  };

  // Handlers para as opções do modal Criar
  const handleCreateFolder = () => {
    setShowCreateModal(false);
    setShowNewFolderModal(true);
  };

  const handleCreateNote = () => {
    setShowCreateModal(false);
    setShowCreateNoteModal(true);
  };

  // Função para adicionar uma nova nota a uma pasta específica
  const addNoteToFolder = (
    folderPath: string[],
    folderId: string,
    noteTitle: string,
  ) => {
    const findFolderById = (
      folders: FolderNode[],
      targetId: string,
    ): FolderNode | null => {
      for (const folder of folders) {
        if (folder.id === targetId) {
          return folder;
        }
        const found = findFolderById(
          folder.subfolders,
          targetId,
        );
        if (found) return found;
      }
      return null;
    };

    const updateFolderWithNote = (
      folders: FolderNode[],
      targetId: string,
    ): FolderNode[] => {
      return folders.map((folder) => {
        if (folder.id === targetId) {
          const now = new Date().toISOString();
          const newNote = {
            id: Date.now().toString(),
            title: noteTitle,
            content: "",
            createdAt: now,
            modifiedAt: now,
            lastOpenedAt: now,
          };
          return {
            ...folder,
            notes: [...folder.notes, newNote],
          };
        }
        return {
          ...folder,
          subfolders: updateFolderWithNote(
            folder.subfolders,
            targetId,
          ),
        };
      });
    };

    setFolderStructure((prev) =>
      updateFolderWithNote(prev, folderId),
    );
  };

  const handleCreateNoteSubmit = (noteData: {
    title: string;
    folderPath: string[];
    folderId: string;
  }) => {
    addNoteToFolder(
      noteData.folderPath,
      noteData.folderId,
      noteData.title,
    );
    setShowCreateNoteModal(false);
  };

  const handleCreateBookmark = () => {
    setShowCreateModal(false);
    setShowCreateBookmarkModal(true);
  };

  const handleCreateBookmarkSubmit = (bookmarkData: {
    title: string;
    color: string;
  }) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      title: bookmarkData.title,
      color: bookmarkData.color,
      createdAt: new Date().toISOString(),
    };

    setBookmarks((prev) => [newBookmark, ...prev]);
    setShowCreateBookmarkModal(false);
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.id !== bookmarkId),
    );
  };

  const handleCreateTodo = () => {
    setShowCreateModal(false);
    setShowCreateTodoModal(true);
  };

  const handleCreateTodoSubmit = (todoData: {
    title: string;
    date: Date;
    time: string;
  }) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: todoData.title,
      task: todoData.title, // Usar o título como task também
      date: todoData.date,
      time: todoData.time,
      color:
        todoColors[
          Math.floor(Math.random() * todoColors.length)
        ], // Cor aleatória
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodoItems((prev) => [newTodo, ...prev]);
    setShowCreateTodoModal(false);
  };

  const toggleTodoCompleted = (todoId: string) => {
    setTodoItems((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, completed: !todo.completed }
          : todo,
      ),
    );
  };

  const deleteTodoItem = (todoId: string) => {
    if (
      confirm("Tem certeza que deseja excluir esta tarefa?")
    ) {
      setTodoItems((prev) =>
        prev.filter((todo) => todo.id !== todoId),
      );
    }
  };

  const getCompletedTodosCount = () => {
    return todoItems.filter((todo) => todo.completed).length;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  // Função para obter tarefas do dia atual
  const getTodayTodos = () => {
    const today = new Date();
    const todayDateString = today.toDateString();

    return todoItems.filter(todo => {
      const todoDateString = todo.date.toDateString();
      return todoDateString === todayDateString && !todo.completed;
    }).slice(0, 5); // Limitar a 5 tarefas
  };

  const todayTodos = getTodayTodos();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-black font-bold">Stride</h1>
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
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Pastas
            </h2>
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
                        <span className="text-black font-medium">{folder.name}</span>
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
                  <p className="text-black">Nenhuma pasta criada ainda</p>
                  <p className="text-sm text-gray-600">Clique no + para criar uma pasta</p>
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
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Ofensivas
            </h2>
            <div 
              className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative cursor-pointer"
              onClick={toggleStreakExpansion}
            >
              <div className="space-y-4">
                {!isStreakExpanded ? (
                  // Vista compacta
                  <div className="flex flex-col items-center justify-center h-full min-h-[352px]">
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
                  </div>
                ) : (
                  // Vista expandida - seleção de dias
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
              </div>
            </div>
          </div>

          {/* To-Do */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              To-Do
            </h2>
            <div className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative">
              {todayTodos.length > 0 ? (
                <div className="space-y-3 todos-scroll max-h-[300px] overflow-y-auto">
                  {todayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleTodoCompleted(todo.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? `${todo.color} border-transparent`
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {todo.completed && (
                            <CheckSquare className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-black font-medium truncate ${
                            todo.completed ? "line-through text-gray-500" : ""
                          }`}>
                            {todo.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(todo.date)} às {formatTime(todo.time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${todo.color}`}
                          title="Cor da tarefa"
                        />
                        <button
                          onClick={() => deleteTodoItem(todo.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                          title="Excluir tarefa"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <CheckSquare className="w-12 h-12 mb-4" />
                  <p className="text-black">Nenhuma tarefa para hoje</p>
                  <p className="text-sm text-gray-600">Suas tarefas aparecerão aqui</p>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={() => setShowCompletedTodosModal(true)}
                  className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title={`Ver ${getCompletedTodosCount()} tarefas concluídas`}
                >
                  <List className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleCreateTodo}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Notas Recentes
          </h2>
          <div className="bg-gray-300 rounded-lg p-6">
            {recentNotes.length > 0 ? (
              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div
                  ref={scrollContainerRef}
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 px-8"
                >
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="min-w-[250px] bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onNavigateToNote(note.path, note.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-black font-medium truncate flex-1 mr-2">
                          {note.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            note.type === 'created' ? 'bg-green-100 text-green-600' :
                            note.type === 'modified' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {note.type === 'created' ? 'Criado' :
                             note.type === 'modified' ? 'Editado' : 'Aberto'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {note.content || "Nota sem conteúdo"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{note.path.join(' > ')}</span>
                        <span>
                          {new Date(note.timestamp).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-black">Nenhuma nota criada ainda</p>
                <p className="text-sm text-gray-600">Suas notas recentes aparecerão aqui</p>
              </div>
            )}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={closeContextMenu}
        >
          <button
            onClick={() => renameFolder(contextMenu.folderIndex)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Renomear</span>
          </button>
          <button
            onClick={() => duplicateFolder(contextMenu.folderIndex)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicar</span>
          </button>
          <button
            onClick={() => deleteFolder(contextMenu.folderIndex)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Mover para lixeira</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>O que você gostaria de criar?</DialogTitle>
            <DialogDescription>
              Escolha uma das opções abaixo para começar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleCreateFolder}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <FolderPlus className="w-8 h-8" />
              <span>Nova Pasta</span>
            </Button>
            <Button
              onClick={handleCreateNote}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <FileText className="w-8 h-8" />
              <span>Nova Nota</span>
            </Button>
            <Button
              onClick={handleCreateBookmark}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <BookmarkIcon className="w-8 h-8" />
              <span>Marcador</span>
            </Button>
            <Button
              onClick={handleCreateTodo}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <CheckSquare className="w-8 h-8" />
              <span>To-Do</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog
        open={showNewFolderModal}
        onOpenChange={setShowNewFolderModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
            <DialogDescription>
              Digite o nome da nova pasta que você deseja criar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="folderName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Nome da pasta
              </label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                placeholder="Digite o nome da pasta..."
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewFolder();
                  } else if (e.key === "Escape") {
                    handleCancelCreate();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelCreate}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateNewFolder}>
                Criar Pasta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Modal */}
      <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
            <DialogDescription>
              Digite o novo nome para a pasta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="renameFolderName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Novo nome da pasta
              </label>
              <Input
                id="renameFolderName"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                placeholder="Digite o novo nome..."
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameFolder();
                  } else if (e.key === "Escape") {
                    handleCancelRename();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelRename}
              >
                Cancelar
              </Button>
              <Button onClick={handleRenameFolder}>
                Renomear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        folderStructure={folderStructure}
        onNavigateToNote={onNavigateToNote}
        onNavigateToFolder={onNavigateToFolder}
      />

      {/* Dictionary Modal */}
      <DictionaryModal
        isOpen={showDictionaryModal}
        onClose={() => setShowDictionaryModal(false)}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        folderStructure={folderStructure}
        onCreateNote={handleCreateNoteSubmit}
      />

      {/* Create Bookmark Modal */}
      <CreateBookmarkModal
        isOpen={showCreateBookmarkModal}
        onClose={() => setShowCreateBookmarkModal(false)}
        onCreateBookmark={handleCreateBookmarkSubmit}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={showBookmarksModal}
        onClose={() => setShowBookmarksModal(false)}
        bookmarks={bookmarks}
        onDeleteBookmark={handleDeleteBookmark}
      />

      {/* Trash Modal */}
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        trashItems={trashItems}
        setTrashItems={setTrashItems}
        folderStructure={folderStructure}
        setFolderStructure={setFolderStructure}
      />

      {/* Create Todo Modal */}
      <CreateTodoModal
        isOpen={showCreateTodoModal}
        onClose={() => setShowCreateTodoModal(false)}
        onCreateTodo={handleCreateTodoSubmit}
      />

      {/* Completed Todos Modal */}
      <CompletedTodosModal
        isOpen={showCompletedTodosModal}
        onClose={() => setShowCompletedTodosModal(false)}
        completedTodos={todoItems.filter(todo => todo.completed)}
        onRestoreCompleted={toggleTodoCompleted}
        onDeleteCompleted={deleteTodoItem}
      />

      {/* Rename Folder Modal */}
      <Dialog
        open={showRenameFolderModal}
        onOpenChange={setShowRenameFolderModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
            <DialogDescription>
              Digite o novo nome para a pasta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="renameFolderModalName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Novo nome da pasta
              </label>
              <Input
                id="renameFolderModalName"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                placeholder="Digite o novo nome..."
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameFolderFromModal();
                  } else if (e.key === "Escape") {
                    handleCancelRenameFolderFromModal();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelRenameFolderFromModal}
              >
                Cancelar
              </Button>
              <Button onClick={handleRenameFolderFromModal}>
                Renomear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Word Modal */}
      <CreateWordModal
        isOpen={showCreateWordModal}
        onClose={() => setShowCreateWordModal(false)}
      />

      {/* Click outside handler for context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}

      {/* Click outside handler for folder context menu */}
      {folderContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeFolderContextMenu}
        />
      )}
    </div>
  );
}