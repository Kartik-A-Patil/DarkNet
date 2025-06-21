import { useState, useEffect, useMemo, useCallback } from "react";
import { useOS } from "../../../contexts/OSContext";
import { FileSystemNode, ContextMenuOption } from "../../../types/os.types";
import { BreadcrumbItem } from "./types";

export const useFileManager = () => {
  const { fileSystem, windowManager, showContextMenu } = useOS();
  
  // State
  const [currentPath, setCurrentPath] = useState("/home/hackos");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(["/home/hackos"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [currentDir, setCurrentDir] = useState<FileSystemNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [fileToDelete, setFileToDelete] = useState("");
  const [fileToRename, setFileToRename] = useState("");
  const [newName, setNewName] = useState("");

  // Reset history when initialized
  useEffect(() => {
    setHistory(["/home/hackos"]);
    setHistoryIndex(0);
  }, []);

  // Load current directory data whenever path changes
  useEffect(() => {
    let mounted = true;
    
    const loadCurrentDirectory = async () => {
      setIsLoading(true);
      try {
        const node = await fileSystem.getNodeFromPath(currentPath);
        if (mounted) {
          setCurrentDir(node as FileSystemNode);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Error loading directory: ${currentPath}`, err);
        if (mounted) {
          setCurrentDir(null);
          setIsLoading(false);
        }
      }
    };
    
    loadCurrentDirectory();
    
    return () => {
      mounted = false;
    };
  }, [currentPath, fileSystem]);

  // Navigation functions
  const navigateTo = useCallback(async (path: string, addToHistory = true) => {
    try {
      const node = await fileSystem.getNodeFromPath(path);
      if (node && (node as any).type === "directory") {
        setCurrentPath(path);
        setSelectedFile(null);

        // Add to history if not navigating through history
        if (addToHistory) {
          // Remove forward history
          const newHistory = history.slice(0, historyIndex + 1);
          setHistory([...newHistory, path]);
          setHistoryIndex(newHistory.length);
        }
      }
    } catch (err) {
      console.error(`Failed to navigate to: ${path}`, err);
    }
  }, [history, historyIndex, fileSystem]);

  const navigateBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  }, [historyIndex, history, navigateTo]);

  const navigateForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  }, [historyIndex, history, navigateTo]);

  const navigateUp = useCallback(() => {
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length === 0) return; // Already at root

    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}`;
    navigateTo(newPath);
  }, [currentPath, navigateTo]);

  const navigateToHome = useCallback(() => {
    navigateTo("/home/hackos");
  }, [navigateTo]);

  // Get breadcrumbs
  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const parts = currentPath.split("/").filter(Boolean);
    let path = "";

    return [
      { name: "root", path: "/" },
      ...parts.map((part) => {
        path += `/${part}`;
        return { name: part, path };
      })
    ];
  }, [currentPath]);

  // Get files with filtering and sorting
  const files = useMemo(() => {
    if (!currentDir || !currentDir.children) return [];
    
    let entries = Object.entries(currentDir.children || {});

    // Filter hidden files if needed
    if (!showHiddenFiles) {
      entries = entries.filter(([name]) => !name.startsWith("."));
    }

    // Sort directories first, then by name
    return entries.sort(([nameA, nodeA], [nameB, nodeB]) => {
      if (nodeA.type === "directory" && nodeB.type !== "directory") return -1;
      if (nodeA.type !== "directory" && nodeB.type === "directory") return 1;
      return nameA.localeCompare(nameB);
    });
  }, [currentDir, showHiddenFiles]);

  // File icon helper
  const getFileIcon = useCallback((name: string, node: FileSystemNode) => {
    if (node.type === "directory") {
      if (name === "Desktop") return "fa-desktop text-blue-400";
      if (name === "Documents") return "fa-file-alt text-blue-400";
      if (name === "Downloads") return "fa-download text-blue-400";
      if (name === "Pictures") return "fa-image text-blue-400";
      if (name === "Music") return "fa-music text-blue-400";
      if (name === "Videos") return "fa-video text-blue-400";
      return "fa-folder text-blue-400";
    } else {
      if (node.executable) return "fa-file-code text-green-500";
      if (name.endsWith(".sh") || name.endsWith(".py") || name.endsWith(".rb")) {
        return "fa-file-code text-green-400";
      } else if (name.endsWith(".txt") || name.endsWith(".md")) {
        return "fa-file-alt text-gray-300";
      } else if (name.endsWith(".html") || name.endsWith(".htm")) {
        return "fa-code text-orange-400";
      } else if (name.endsWith(".jpg") || name.endsWith(".png") || name.endsWith(".gif")) {
        return "fa-file-image text-purple-400";
      } else if (name.endsWith(".pdf")) {
        return "fa-file-pdf text-red-400";
      } else if (name.endsWith(".zip") || name.endsWith(".tar") || name.endsWith(".gz")) {
        return "fa-file-archive text-yellow-400";
      } else {
        return "fa-file text-gray-300";
      }
    }
  }, []);

  // Format file size helper
  const formatFileSize = useCallback((size?: number) => {
    if (!size) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  }, []);

  // Utility function to join paths correctly
  const joinPaths = useCallback((base: string, name: string) => {
    return base === "/" ? `/${name}` : `${base}/${name}`;
  }, []);

  return {
    // State
    currentPath,
    selectedFile,
    history,
    historyIndex,
    viewMode,
    showHiddenFiles,
    currentDir,
    isLoading,
    files,
    
    // Modal states
    showNewFolderModal,
    showNewFileModal,
    showDeleteConfirmation,
    showRenameModal,
    newFolderName,
    newFileName,
    newFileContent,
    fileToDelete,
    fileToRename,
    newName,
    
    // Actions
    setSelectedFile,
    setViewMode,
    setShowHiddenFiles,
    setShowNewFolderModal,
    setShowNewFileModal,
    setShowDeleteConfirmation,
    setShowRenameModal,
    setNewFolderName,
    setNewFileName,
    setNewFileContent,
    setFileToDelete,
    setFileToRename,
    setNewName,
    
    // Navigation
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    navigateToHome,
    getBreadcrumbs,
    
    // Helpers
    getFileIcon,
    formatFileSize,
    joinPaths,
    
    // Context
    fileSystem,
    windowManager,
    showContextMenu,
  };
};
