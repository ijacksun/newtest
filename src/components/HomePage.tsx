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

  // Calcular ofensiva quando há novas atividades
  useEffect(() => {
    const today = new Date().toDateString();
    const hasActivityToday = recentNotes.some(note => {
      const noteDate = new Date(note.timestamp).toDateString();
      return noteDate === today;
    });

    if (hasActivityToday) {
      calculateStreak();
    }
  }, [recentNotes]);

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

  // Separar TODOs pendentes e concluídos
  const pendingTodos = todoItems.filter(
    (todo) => !todo.completed,
  );
  const completedTodos = todoItems.filter(
    (todo) => todo.completed,
  );

  // Funções para gerenciar TODOs concluídos
  const handleRestoreCompleted = (todoId: string) => {
    setTodoItems((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, completed: false }
          : todo,
      ),
    );
  };

  const handleDeleteCompleted = (todoId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir permanentemente esta tarefa?",
      )
    ) {
      setTodoItems((prev) =>
        prev.filter((todo) => todo.id !== todoId),
      );
    }
  };

  const handleCreateWords = () => {
    setShowCreateModal(false);
    setShowCreateWordModal(true);
  };

  const handleCreateWordSubmit = (word: string, definition: string) => {
    // Primeiro, vamos adicionar a palavra ao localStorage do dicionário
    const savedEntries = localStorage.getItem('stride-dictionary-entries');
    let entries = [];
    
    if (savedEntries && savedEntries !== 'null' && savedEntries !== '[]') {
      try {
        entries = JSON.parse(savedEntries);
      } catch (error) {
        console.error('Erro ao carregar entradas do dicionário:', error);
      }
    }

    const newEntry = {
      id: Date.now().toString(),
      word: word,
      definition: definition,
      isPinned: false,
      originalOrder: entries.length
    };

    const updatedEntries = [...entries, newEntry];
    localStorage.setItem('stride-dictionary-entries', JSON.stringify(updatedEntries));
    
    // Fechar modal de criação e abrir dicionário para mostrar a palavra criada
    setShowCreateWordModal(false);
    setShowDictionaryModal(true);
  };

  return (
    <div
      className="min-h-screen bg-white flex flex-col pb-20"
      onClick={closeContextMenu}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative">
        <h1 className="text-center text-xl font-semibold text-gray-900">
          Pastas
        </h1>
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <Grid3X3 className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      
      
      
      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        {/* Folders Section */}
        <div className="mb-8 relative">
          {/* Navigation arrows */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 z-10 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Folders horizontal scroll container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide mx-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="flex gap-4 pb-2"
              style={{ width: "max-content" }}
            >
              {/* Add folder button - sempre aparece primeiro */}
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={addFolder}
                  className="w-28 h-28 bg-gray-300 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 mb-2 cursor-pointer hover:bg-gray-200 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Plus className="w-6 h-6 text-gray-600" />
                  </div>
                </button>
                <p className="text-xs text-gray-600 text-center leading-tight w-28">
                  Clique no + para criar
                  <br />
                  uma pasta
                </p>
              </div>

              {/* Pastas raiz existentes */}
              {folderStructure.map((folder, index) => (
                <div
                  key={folder.id}
                  className="flex flex-col items-center flex-shrink-0"
                >
                  <div
                    onClick={() => onFolderClick(folder.name)}
                    onContextMenu={(e) =>
                      handleFolderContextMenu(e, index)
                    }
                    className="w-28 h-28 bg-gray-300 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 mb-2 cursor-pointer relative group hover:scale-105"
                  >
                    <div className="w-16 h-12 bg-gray-600 rounded-sm relative">
                      <div className="w-4 h-2 bg-gray-600 rounded-t-sm absolute -top-1 left-1"></div>
                    </div>
                    {/* Options button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderContextMenu(e, index);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-900 text-center font-medium leading-tight w-28">
                    {folder.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Recent Notes */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Notas Recentes
            </h2>
            <div className="space-y-3">
              {recentNotes.length > 0 ? (
                <div className="max-h-[240px] overflow-y-auto space-y-3 pr-2 recent-notes-scroll">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => onNavigateToNote(note.path, note.id)}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {note.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                            note.type === 'created' ? 'bg-green-100 text-green-600' :
                            note.type === 'modified' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {note.type === 'created' ? 'Nova' :
                             note.type === 'modified' ? 'Editada' : 'Aberta'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {note.path.join(' → ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(note.timestamp).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma nota recente</p>
                  <p className="text-xs mt-1">Crie suas primeiras notas!</p>
                </div>
              )}

              {/* Streak card */}
              <div 
                className={`bg-gray-100 rounded-lg p-6 mt-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                  isStreakExpanded ? 'pb-6' : 'pb-6'
                }`}
                onClick={toggleStreakExpansion}
              >
                <div className="text-center">
                  {!isStreakExpanded ? (
                    // Vista compacta - apenas contagem
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
                        {selectedRestDays.includes(new Date().getDay()) && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            🛌 Hoje é descanso
                          </p>
                        )}
                        {selectedRestDays.includes(new Date().getDay()) && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            🛌 Dia de descanso hoje
                          </p>
                        )}
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
          </div>

          {/* To-Do */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-300 pb-2">
              To-Do
            </h2>
            <div className="bg-gray-300 rounded-lg p-6 min-h-[400px] relative">
              {/* Plus button */}
              <button
                onClick={() => setShowCreateTodoModal(true)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>

              {/* Todo items */}
              <div className="mt-8">
                {pendingTodos.length > 0 ? (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 todos-scroll">
                    {pendingTodos.map((item) => (
                      <div
                        key={item.id}
                        className={`${item.color} rounded-lg p-4 text-white relative`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white">
                            {item.title}
                          </h3>
                          <button
                            onClick={() =>
                              deleteTodoItem(item.id)
                            }
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <p className="text-sm text-white/80 mb-3">
                          {item.date.toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          às {item.time}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/70">
                            Pendente
                          </span>
                          <button
                            onClick={() =>
                              toggleTodoCompleted(item.id)
                            }
                            className="w-5 h-5 border border-white/50 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
                          ></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-600 mt-16">
                    <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      Nenhuma tarefa criada ainda.
                    </p>
                    <p className="text-xs mt-1">
                      Clique no + para criar sua primeira
                      tarefa!
                    </p>
                  </div>
                )}
              </div>

              {/* Completed tasks button (check icon) */}
              <button
                onClick={() => setShowCompletedTodosModal(true)}
                className={`absolute bottom-4 right-4 w-8 h-8 rounded flex items-center justify-center transition-all ${
                  completedTodos.length > 0
                    ? "bg-green-500 hover:bg-green-600 shadow-md cursor-pointer"
                    : "bg-gray-500 cursor-default"
                }`}
                disabled={completedTodos.length === 0}
              >
                <CheckSquare className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          folderStructure={folderStructure}
          onClose={() => setShowSearchModal(false)}
          onNavigateToNote={onNavigateToNote}
          onNavigateToFolder={onNavigateToFolder}
        />
      )}

      {/* Dictionary Modal */}
      {showDictionaryModal && (
        <DictionaryModal
          onClose={() => setShowDictionaryModal(false)}
        />
      )}

      {/* Folders Modal - Full Screen */}
      {showFoldersModal && (
        <div
          className="fixed inset-0 bg-white z-50 flex flex-col"
          onClick={closeFolderContextMenu}
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Pastas
            </h2>
            <button
              onClick={() => setShowFoldersModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content with custom scrollbar */}
          <div className="flex-1 overflow-y-auto folders-scroll">
            <div className="p-6">
              {allFolders.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                  {allFolders.map(({ folder, path }, index) => (
                    <div
                      key={`${folder.id}-${index}`}
                      className="flex flex-col items-center relative group"
                    >
                      <div className="relative">
                        <button
                          onClick={() => {
                            if (path.length === 1) {
                              // Pasta raiz - usar onFolderClick original
                              onFolderClick(folder.name);
                            } else {
                              // Subpasta - navegar usando o caminho completo
                              onNavigateToFolder(path);
                            }
                            setShowFoldersModal(false);
                          }}
                          className="w-24 h-24 bg-gray-300 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 mb-3 cursor-pointer hover:scale-105 hover:bg-gray-200"
                        >
                          <div className="w-12 h-9 bg-gray-600 rounded-sm relative">
                            <div className="w-3 h-1.5 bg-gray-600 rounded-t-sm absolute -top-0.5 left-1"></div>
                          </div>
                          {/* Pin indicator */}
                          {folder.isPinned && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Pin className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>

                        {/* Options button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              folder,
                              path,
                            });
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-900 text-center font-medium leading-tight w-24 break-words">
                        {folder.name}
                      </p>
                      {path.length > 1 && (
                        <p className="text-xs text-gray-500 text-center leading-tight w-24 break-words mt-1">
                          {path.slice(0, -1).join(" > ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    Nenhuma pasta encontrada
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Crie sua primeira pasta para começar a
                    organizar suas notas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Folder Context Menu */}
          {folderContextMenu && (
            <div
              className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
              style={{
                left: folderContextMenu.x,
                top: folderContextMenu.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  togglePinFolder(
                    folderContextMenu.folder,
                    folderContextMenu.path,
                  )
                }
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {folderContextMenu.folder.isPinned ? (
                  <>
                    <PinOff className="w-4 h-4 mr-3" />
                    Desfixar
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-3" />
                    Fixar
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  renameFolderFromModal(
                    folderContextMenu.folder,
                    folderContextMenu.path,
                  )
                }
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Edit2 className="w-4 h-4 mr-3" />
                Renomear
              </button>
              <hr className="border-gray-200 my-1" />
              <button
                onClick={() =>
                  deleteFolderFromModal(
                    folderContextMenu.folder,
                    folderContextMenu.path,
                  )
                }
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Excluir
              </button>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() =>
              renameFolder(contextMenu.folderIndex)
            }
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <FileText className="w-4 h-4 mr-3" />
            Renomear
          </button>
          <button
            onClick={() =>
              duplicateFolder(contextMenu.folderIndex)
            }
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <Copy className="w-4 h-4 mr-3" />
            Duplicar
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
            <Link className="w-4 h-4 mr-3" />
            Copiar Link
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
            <Download className="w-4 h-4 mr-3" />
            Exportar como
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
            <Save className="w-4 h-4 mr-3" />
            Salvar
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
            <FolderPlus className="w-4 h-4 mr-3" />
            Mover para
          </button>
          <hr className="border-gray-200 my-1" />
          <button
            onClick={() =>
              deleteFolder(contextMenu.folderIndex)
            }
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Excluir
          </button>
        </div>
      )}

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
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewFolder();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelCreate}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewFolder}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white"
                disabled={!newFolderName.trim()}
              >
                Criar Pasta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Modal */}
      <Dialog
        open={showRenameModal}
        onOpenChange={setShowRenameModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
            <DialogDescription>
              Digite o novo nome para a pasta selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="renameFolderName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Nome da pasta
              </label>
              <Input
                id="renameFolderName"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                placeholder="Digite o novo nome da pasta..."
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleRenameFolder();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelRename}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRenameFolder}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white"
                disabled={!newFolderName.trim()}
              >
                Renomear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Folder from Modal */}
      <Dialog
        open={showRenameFolderModal}
        onOpenChange={setShowRenameFolderModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
            <DialogDescription>
              Digite o novo nome para a pasta selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="renameFolderFromModalName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Nome da pasta
              </label>
              <Input
                id="renameFolderFromModalName"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                placeholder="Digite o novo nome da pasta..."
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleRenameFolderFromModal();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelRenameFolderFromModal}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRenameFolderFromModal}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white"
                disabled={!newFolderName.trim()}
              >
                Renomear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Criar
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Pasta */}
              <button
                onClick={handleCreateFolder}
                className="w-full flex items-center px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <FolderPlus className="w-6 h-6 text-gray-600 mr-4" />
                <span className="text-lg font-medium text-gray-800">
                  Pasta
                </span>
              </button>

              {/* Nota */}
              <button
                onClick={handleCreateNote}
                className="w-full flex items-center px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <FileText className="w-6 h-6 text-gray-600 mr-4" />
                <span className="text-lg font-medium text-gray-800">
                  Nota
                </span>
              </button>

              {/* Marcador */}
              <button
                onClick={handleCreateBookmark}
                className="w-full flex items-center px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <BookmarkIcon className="w-6 h-6 text-gray-600 mr-4" />
                <span className="text-lg font-medium text-gray-800">
                  Marcador
                </span>
              </button>

              {/* To-do */}
              <button
                onClick={handleCreateTodo}
                className="w-full flex items-center px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <List className="w-6 h-6 text-gray-600 mr-4" />
                <span className="text-lg font-medium text-gray-800">
                  To-do
                </span>
              </button>

              {/* Palavras */}
              <button
                onClick={handleCreateWords}
                className="w-full flex items-center px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <Book className="w-6 h-6 text-gray-600 mr-4" />
                <span className="text-lg font-medium text-gray-800">
                  Palavras
                </span>
              </button>
            </div>

            {/* Cancel button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          folderStructure={folderStructure}
          onClose={() => setShowSearchModal(false)}
          onNavigateToNote={onNavigateToNote}
          onNavigateToFolder={onNavigateToFolder}
        />
      )}

      {/* Dictionary Modal */}
      {showDictionaryModal && (
        <DictionaryModal
          onClose={() => setShowDictionaryModal(false)}
        />
      )}

      {/* Create Note Modal */}
      {showCreateNoteModal && (
        <CreateNoteModal
          folderStructure={folderStructure}
          onClose={() => setShowCreateNoteModal(false)}
          onCreate={handleCreateNoteSubmit}
        />
      )}

      {/* Create Bookmark Modal */}
      {showCreateBookmarkModal && (
        <CreateBookmarkModal
          onClose={() => setShowCreateBookmarkModal(false)}
          onCreate={handleCreateBookmarkSubmit}
        />
      )}

      {/* Bookmarks Modal */}
      {showBookmarksModal && (
        <BookmarksModal
          bookmarks={bookmarks}
          onClose={() => setShowBookmarksModal(false)}
          onDeleteBookmark={handleDeleteBookmark}
        />
      )}

      {/* Create Todo Modal */}
      {showCreateTodoModal && (
        <CreateTodoModal
          onClose={() => setShowCreateTodoModal(false)}
          onCreate={handleCreateTodoSubmit}
        />
      )}

      {/* Completed Todos Modal */}
      {showCompletedTodosModal && (
        <CompletedTodosModal
          onClose={() => setShowCompletedTodosModal(false)}
          completedTodos={completedTodos}
          onDeleteCompleted={handleDeleteCompleted}
          onRestoreCompleted={handleRestoreCompleted}
        />
      )}

      {/* Create Word Modal */}
      {showCreateWordModal && (
        <CreateWordModal
          onClose={() => setShowCreateWordModal(false)}
          onWordCreated={handleCreateWordSubmit}
        />
      )}

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-400 px-6 py-4 z-50">
        <div className="flex items-center justify-center space-x-8 max-w-md mx-auto">
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-3 rounded-full hover:bg-gray-300 transition-colors"
          >
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="p-3 rounded-full hover:bg-gray-300 transition-colors"
          >
            <FileText className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setShowFoldersModal(true)}
            className="p-3 rounded-full hover:bg-gray-300 transition-colors"
          >
            <FolderOpen className="w-6 h-6 text-gray-600" />
          </button>
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

      {/* Trash Modal */}
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