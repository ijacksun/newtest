import './firebaseSync';
import { useState, useEffect } from "react";
import { HomePage } from "./components/HomePage";
import { NotesInterface } from "./components/NotesInterface";

export interface FolderNode {
  id: string;
  name: string;
  subfolders: FolderNode[];
  notes: { 
    id: string; 
    title: string; 
    content: string; 
    createdAt?: string;
    modifiedAt?: string;
    lastOpenedAt?: string;
  }[];
  isPinned?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  color: string;
  createdAt: string;
}

export interface TrashItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'folder';
  originalPath: string[];
  deletedAt: string;
  folderId?: string; // Para pastas
  subfolders?: FolderNode[]; // Para pastas que foram excluídas
  notes?: { 
    id: string; 
    title: string; 
    content: string; 
    createdAt?: string;
    modifiedAt?: string;
    lastOpenedAt?: string;
  }[]; // Para pastas que foram excluídas
}

export interface TodoItem {
  id: string;
  title: string;
  task: string;
  date: Date;
  time: string;
  color: string;
  completed: boolean;
  createdAt: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'notes'>('home');
  const [selectedFolderPath, setSelectedFolderPath] = useState<string[]>([]);
  const [folderStructure, setFolderStructure] = useState<FolderNode[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);


  // Carregar estrutura de pastas do localStorage ao inicializar
  useEffect(() => {
    const savedStructure = localStorage.getItem('stride-folder-structure');
    if (savedStructure) {
      try {
        const parsedStructure = JSON.parse(savedStructure);
        setFolderStructure(parsedStructure);
      } catch (error) {
        console.error('Erro ao carregar estrutura de pastas do localStorage:', error);
      }
    }

    // Carregar marcadores do localStorage
    const savedBookmarks = localStorage.getItem('stride-bookmarks');
    if (savedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(savedBookmarks);
        setBookmarks(parsedBookmarks);
      } catch (error) {
        console.error('Erro ao carregar marcadores do localStorage:', error);
      }
    }

    // Carregar itens da lixeira do localStorage
    const savedTrashItems = localStorage.getItem('stride-trash-items');
    if (savedTrashItems) {
      try {
        const parsedTrashItems = JSON.parse(savedTrashItems);
        setTrashItems(parsedTrashItems);
      } catch (error) {
        console.error('Erro ao carregar itens da lixeira do localStorage:', error);
      }
    }

    // Carregar TODOs do localStorage
    const savedTodoItems = localStorage.getItem('stride-todo-items');
    if (savedTodoItems) {
      try {
        const parsedTodoItems = JSON.parse(savedTodoItems).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setTodoItems(parsedTodoItems);
      } catch (error) {
        console.error('Erro ao carregar TODOs do localStorage:', error);
      }
    }
  }, []);

  // Salvar estrutura de pastas no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('stride-folder-structure', JSON.stringify(folderStructure));
  }, [folderStructure]);

  // Salvar marcadores no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('stride-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Salvar itens da lixeira no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('stride-trash-items', JSON.stringify(trashItems));
  }, [trashItems]);

  // Salvar TODOs no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('stride-todo-items', JSON.stringify(todoItems));
  }, [todoItems]);

  // Limpeza automática da lixeira (itens mais antigos que 15 dias)
  useEffect(() => {
    const cleanupTrash = () => {
      const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
      setTrashItems(prev => prev.filter(item => 
        new Date(item.deletedAt).getTime() > fifteenDaysAgo
      ));
    };

    // Executa a limpeza na inicialização
    cleanupTrash();

    // Executa a limpeza a cada hora
    const interval = setInterval(cleanupTrash, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Função para encontrar uma nota por ID em toda a estrutura
  const findNoteById = (noteId: string): { note: any; path: string[] } | null => {
    const searchInFolders = (folders: FolderNode[], currentPath: string[]): { note: any; path: string[] } | null => {
      for (const folder of folders) {
        const folderPath = [...currentPath, folder.name];
        
        // Procurar nas notas da pasta atual
        const note = folder.notes.find(n => n.id === noteId);
        if (note) {
          return { note, path: folderPath };
        }
        
        // Procurar recursivamente nas subpastas
        const result = searchInFolders(folder.subfolders, folderPath);
        if (result) {
          return result;
        }
      }
      return null;
    };
    
    return searchInFolders(folderStructure, []);
  };

  // Função para navegar para uma nota por ID
  const navigateToNoteById = (noteId: string) => {
    console.log('navigateToNoteById chamado com noteId:', noteId);
    console.log('Estrutura de pastas atual:', folderStructure);
    
    const result = findNoteById(noteId);
    console.log('Resultado da busca por nota:', result);
    
    if (result) {
      console.log('Nota encontrada, navegando para:', result.path);
      
      // Atualizar o timestamp da nota
      updateNoteLastOpened(result.path, noteId);
      
      // Navegar para a pasta da nota
      setSelectedFolderPath(result.path);
      
      // Ir para a página de notas
      setCurrentPage('notes');
      
      console.log('Navegação concluída');
    } else {
      console.error('Nota não encontrada com ID:', noteId);
      alert(`Nota não encontrada (ID: ${noteId}). A nota pode ter sido movida ou excluída.`);
    }
  };

  // Função para atualizar o timestamp de lastOpenedAt quando uma nota é aberta
  const updateNoteLastOpened = (notePath: string[], noteId: string) => {
    const updateFolderNotes = (folders: FolderNode[], path: string[], targetNoteId: string): FolderNode[] => {
      if (path.length === 0) return folders;
      
      const [currentFolder, ...remainingPath] = path;
      
      return folders.map(folder => {
        if (folder.name === currentFolder) {
          if (remainingPath.length === 0) {
            // Estamos na pasta correta, atualizar a nota
            return {
              ...folder,
              notes: folder.notes.map(note => 
                note.id === targetNoteId 
                  ? { ...note, lastOpenedAt: new Date().toISOString() }
                  : note
              )
            };
          } else {
            // Continuar navegando
            return {
              ...folder,
              subfolders: updateFolderNotes(folder.subfolders, remainingPath, targetNoteId)
            };
          }
        }
        return folder;
      });
    };

    setFolderStructure(prev => updateFolderNotes(prev, notePath, noteId));
  };

  if (currentPage === 'home') {
    return (
      <HomePage 
        folderStructure={folderStructure}
        setFolderStructure={setFolderStructure}
        bookmarks={bookmarks}
        setBookmarks={setBookmarks}
        trashItems={trashItems}
        setTrashItems={setTrashItems}
        todoItems={todoItems}
        setTodoItems={setTodoItems}
        onFolderClick={(folderName) => {
          setSelectedFolderPath([folderName]);
          setCurrentPage('notes');
        }}
        onNavigateToNote={(notePath, noteId) => {
          updateNoteLastOpened(notePath, noteId);
          setSelectedFolderPath(notePath);
          setCurrentPage('notes');
        }}
        onNavigateToFolder={(folderPath) => {
          setSelectedFolderPath(folderPath);
          setCurrentPage('notes');
        }}
      />
    );
  }

  if (currentPage === 'notes') {
    return (
      <NotesInterface 
        selectedFolderPath={selectedFolderPath}
        setSelectedFolderPath={setSelectedFolderPath}
        folderStructure={folderStructure}
        setFolderStructure={setFolderStructure}
        trashItems={trashItems}
        setTrashItems={setTrashItems}
        onNavigateToNoteById={navigateToNoteById}
        onBack={() => {
          // Se estamos no primeiro nível (pasta raiz), volta para HomePage
          if (selectedFolderPath.length === 1) {
            setSelectedFolderPath([]);
            setCurrentPage('home');
          } else {
            // Se estamos em subpastas, volta um nível
            setSelectedFolderPath(prev => prev.slice(0, -1));
          }
        }}
      />
    );
  }

  // App sempre inicia na HomePage
  return (
    <HomePage 
      folderStructure={folderStructure}
      setFolderStructure={setFolderStructure}
      bookmarks={bookmarks}
      setBookmarks={setBookmarks}
      trashItems={trashItems}
      setTrashItems={setTrashItems}
      todoItems={todoItems}
      setTodoItems={setTodoItems}
      onFolderClick={(folderName) => {
        setSelectedFolderPath([folderName]);
        setCurrentPage('notes');
      }}
      onNavigateToNote={(notePath, noteId) => {
        updateNoteLastOpened(notePath, noteId);
        setSelectedFolderPath(notePath);
        setCurrentPage('notes');
      }}
      onNavigateToFolder={(folderPath) => {
        setSelectedFolderPath(folderPath);
        setCurrentPage('notes');
      }}
    />
  );
}