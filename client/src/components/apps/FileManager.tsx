import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useOS } from "../../contexts/OSContext";
import { FileSystemNode, ContextMenuOption } from "../../types/os.types";
import { title } from "process";

const FileManager: React.FC = () => {
  const { fileSystem, windowManager, showContextMenu, hideContextMenu } =
    useOS();
  const [currentPath, setCurrentPath] = useState("/home/hackos");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(["/home/hackos"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [currentDir, setCurrentDir] = useState<FileSystemNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setCurrentDir(node);
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
      if (node && node.type === "directory") {
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

  // Navigate back in history
  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  };

  // Navigate forward in history
  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  };

  // Navigate up one directory
  const navigateUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length === 0) return; // Already at root

    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}`;
    navigateTo(newPath);
  };

  // Go to home directory
  const navigateToHome = () => {
    navigateTo("/home/hackos");
  };

  // Parse current path into breadcrumb segments
  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    let path = "";

    return [
      { name: "root", path: "/" },
      ...parts.map((part) => {
        path += `/${part}`;
        return { name: part, path };
      })
    ];
  };

  // Get files with useMemo to avoid unnecessary recalculations
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

  // Get file icon based on type and name
  const getFileIcon = (name: string, node: FileSystemNode) => {
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
      if (
        name.endsWith(".sh") ||
        name.endsWith(".py") ||
        name.endsWith(".rb")
      ) {
        return "fa-file-code text-green-400";
      } else if (name.endsWith(".txt") || name.endsWith(".md")) {
        return "fa-file-alt text-gray-300";
      } else if (
        name.endsWith(".jpg") ||
        name.endsWith(".png") ||
        name.endsWith(".gif")
      ) {
        return "fa-file-image text-purple-400";
      } else if (name.endsWith(".pdf")) {
        return "fa-file-pdf text-red-400";
      } else if (
        name.endsWith(".zip") ||
        name.endsWith(".tar") ||
        name.endsWith(".gz")
      ) {
        return "fa-file-archive text-yellow-400";
      } else {
        return "fa-file text-gray-300";
      }
    }
  };

  // Format file size
  const formatFileSize = (size?: number) => {
    if (!size) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  };

  // Handle file/folder double click
  const handleDoubleClick = (name: string, node: FileSystemNode) => {
    if (node.type === "directory") {
      const newPath =
        currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      navigateTo(newPath);
    } else {
      openFile(name, node);
    }
  };

  // Open file with appropriate app
  const openFile = (name: string, node: FileSystemNode) => {
    const filePath =
      currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;

    // Determine which app to use based on file extension
    if (
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      name.endsWith(".py") ||
      name.endsWith(".sh")
    ) {
      windowManager.createWindow("text-editor");
      // In a real implementation, we'd pass the file content to the text editor
    } else {
      console.log(`Opening file: ${filePath}`);
    }
  };

  // Handle file/folder single click (selection)
  const handleClick = (name: string) => {
    setSelectedFile(name === selectedFile ? null : name);
  };

  // Handle file/folder context menu
  const handleContextMenu = (
    e: React.MouseEvent,
    name: string,
    node: FileSystemNode
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedFile(name);

    const filePath =
      currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    const options: ContextMenuOption[] = [];

    if (node.type === "directory") {
      options.push(
        {
          label: "Open",
          icon: "fa-folder-open",
          action: () => handleDoubleClick(name, node)
        },
        {
          label: "Open in New Window",
          icon: "fa-external-link-alt",
          action: () => navigateTo(filePath)
        },
        {
          label: "Open in Terminal",
          icon: "fa-terminal",
          action: () => openInTerminal(filePath)
        }
      );
    } else {
      options.push(
        {
          label: "Open",
          icon: "fa-external-link-alt",
          action: () => openFile(name, node)
        },
        {
          label: "Open With Text Editor",
          icon: "fa-edit",
          action: () => openWithTextEditor(filePath)
        }
      );

      if (node.executable) {
        options.push({
          label: "Execute",
          icon: "fa-play",
          action: () => executeFile(filePath)
        });
      }
    }

    // Common actions
    options.push(
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      {
        label: "Copy",
        icon: "fa-copy",
        action: () => copyFile(filePath)
      },
      {
        label: "Cut",
        icon: "fa-cut",
        action: () => cutFile(filePath)
      },
      {
        label: "Rename",
        icon: "fa-pen",
        action: () => renameFile(filePath)
      },
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      {
        label: "Delete",
        icon: "fa-trash-alt",
        action: () => deleteFile(filePath)
      },
      {
        label: "Properties",
        icon: "fa-info-circle",
        action: () => showProperties(filePath)
      }
    );

    showContextMenu(e.clientX, e.clientY, options);
  };

  // Handle empty space context menu
  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const options: ContextMenuOption[] = [
      {
        label: "New Folder",
        icon: "fa-folder-plus",
        action: () => createNewFolder()
      },
      {
        label: "New Text File",
        icon: "fa-file-alt",
        action: () => createNewFile()
      },
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      {
        label: "Paste",
        icon: "fa-paste",
        action: () => pasteFiles(),
        disabled: true // Would be enabled if clipboard had content
      },
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      {
        label: viewMode === "grid" ? "List View" : "Grid View",
        icon: viewMode === "grid" ? "fa-list" : "fa-th",
        action: () => setViewMode(viewMode === "grid" ? "list" : "grid")
      },
      {
        label: showHiddenFiles ? "Hide Hidden Files" : "Show Hidden Files",
        icon: "fa-eye",
        action: () => setShowHiddenFiles(!showHiddenFiles)
      },
      {
        label: "Sort By",
        icon: "fa-sort",
        action: () => console.log("Sort")
      },
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      {
        label: "Open in Terminal",
        icon: "fa-terminal",
        action: () => openInTerminal(currentPath)
      },
      {
        label: "Properties",
        icon: "fa-info-circle",
        action: () => showProperties(currentPath)
      }
    ];

    showContextMenu(e.clientX, e.clientY, options);
  };

  // File actions
  const openInTerminal = async (path: string) => {
    // Check if node exists and is a directory
    const node = await fileSystem.getNodeFromPath(path);
    if (node && node.type === "directory") {
      // Create terminal window or get existing one
      windowManager.createWindow("terminal");
      // Change directory to the selected path
      await fileSystem.setCurrentPath(path);
    } else {
      // Get parent directory if it's a file
      const parentPath = path.split("/").slice(0, -1).join("/") || "/";
      windowManager.createWindow("terminal");
      await fileSystem.setCurrentPath(parentPath);
    }
  };

  const openWithTextEditor = async (path: string) => {
    // Get the node at the path

    const node = await fileSystem.getNodeFromPath(path);
    if (node && node.type === "file") {
      // Create text editor window and pass file data
      windowManager.createWindow("text-editor", {
        title: `${path.split("/").pop()} - Text Editor`,
        props: {
          filePath: path
        }
      });
    }
  };

  const executeFile = (path: string) => {
    console.log(`Executing file: ${path}`);
  };

  const copyFile = (path: string) => {
    console.log(`Copying file: ${path}`);
  };

  const cutFile = (path: string) => {
    console.log(`Cutting file: ${path}`);
  };

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [fileToRename, setFileToRename] = useState("");
  const [newName, setNewName] = useState("");

  const renameFile = (path: string) => {
    setFileToRename(path);
    // Set default new name to current filename
    setNewName(path.split("/").pop() || "");
    setShowRenameModal(true);
  };

  const submitRename = async () => {
    if (newName && fileToRename) {
      // Extract path without filename
      const dirPath = fileToRename.substring(0, fileToRename.lastIndexOf("/"));
      const newPath = dirPath + "/" + newName;

      // Get node to copy its properties
      const node = await fileSystem.getNodeFromPath(fileToRename);
      if (node) {
        // Create new node with same content but new name
        await fileSystem.writeFile(newPath, node.content || "");
        // Delete the old node
        await fileSystem.deleteNode(fileToRename);

        setShowRenameModal(false);
        // Refresh the file listing
        const refreshedPath = currentPath;
        setCurrentPath("");
        setTimeout(() => setCurrentPath(refreshedPath), 0);
      }
    }
  };

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");

  const deleteFile = useCallback(async (path: string) => {
    setShowDeleteConfirmation(true);
    setFileToDelete(path);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (fileToDelete) {
      setIsLoading(true);
      const success = await fileSystem.deleteNode(fileToDelete);
      setShowDeleteConfirmation(false);
      setFileToDelete("");
      
      if (success) {
        // Refresh current directory
        const updatedDir = await fileSystem.getNodeFromPath(currentPath);
        setCurrentDir(updatedDir);
        setSelectedFile(null);
      }
      setIsLoading(false);
    }
  }, [fileToDelete, currentPath, fileSystem]);

  const pasteFiles = () => {
    console.log(`Pasting files to: ${currentPath}`);
  };

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  const createNewFolder = useCallback(() => {
    setNewFolderName("");
    setShowNewFolderModal(true);
  }, []);

  const submitNewFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      const folderPath = joinPaths(currentPath, newFolderName);
      
      setIsLoading(true);
      const success = await fileSystem.createDirectory(folderPath);
      setShowNewFolderModal(false);
      
      if (success) {
        // Refresh current directory instead of forcing a re-render with path change
        const updatedDir = await fileSystem.getNodeFromPath(currentPath);
        setCurrentDir(updatedDir);
      }
      setIsLoading(false);
    }
  }, [currentPath, newFolderName, fileSystem]);

  const createNewFile = useCallback(() => {
    setNewFileName("");
    setNewFileContent("");
    setShowNewFileModal(true);
  }, []);

  const submitNewFile = useCallback(async () => {
    if (newFileName.trim()) {
      const filePath = joinPaths(currentPath, newFileName);
      
      setIsLoading(true);
      const success = await fileSystem.writeFile(filePath, newFileContent);
      setShowNewFileModal(false);
      
      if (success) {
        // Refresh current directory instead of forcing a re-render with path change
        const updatedDir = await fileSystem.getNodeFromPath(currentPath);
        setCurrentDir(updatedDir);
      }
      setIsLoading(false);
    }
  }, [currentPath, newFileName, newFileContent, fileSystem]);

  // Utility function to join paths correctly
  const joinPaths = (base: string, name: string) => {
    return base === "/" ? `/${name}` : `${base}/${name}`;
  };

  const showProperties = (path: string) => {
    console.log(`Showing properties for: ${path}`);
  };

  return (
    <div className="h-full flex flex-col bg-window">
      {/* Toolbar */}
      <div className="toolbar bg-kali-toolbar p-1 flex items-center space-x-1">
        <button
          className={`p-1 text-sm rounded ${
            historyIndex > 0
              ? "hover:bg-gray-700"
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={navigateBack}
          disabled={historyIndex === 0}
        >
          <i className="fa fa-arrow-left"></i>
        </button>
        <button
          className={`p-1 text-sm rounded ${
            historyIndex < history.length - 1
              ? "hover:bg-gray-700"
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={navigateForward}
          disabled={historyIndex === history.length - 1}
        >
          <i className="fa fa-arrow-right"></i>
        </button>
        <button
          className="p-1 text-sm rounded hover:bg-gray-700"
          onClick={navigateUp}
        >
          <i className="fa fa-arrow-up"></i>
        </button>
        <button
          className="p-1 text-sm rounded hover:bg-gray-700"
          onClick={navigateToHome}
        >
          <i className="fa fa-home"></i>
        </button>

        {/* Location bar with breadcrumbs */}
        <div className="file-breadcrumb flex-1">
          {getBreadcrumbs().map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="file-breadcrumb-separator">/</span>}
              <div
                className="file-breadcrumb-item"
                onClick={() => navigateTo(crumb.path)}
              >
                {i === 0 ? <i className="fa fa-hdd mr-1"></i> : null}
                <span>{crumb.name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <button
          className="p-1 text-sm rounded hover:bg-gray-700"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          <i className={`fa fa-${viewMode === "grid" ? "list" : "th"}`}></i>
        </button>
        <button className="p-1 text-sm rounded hover:bg-gray-700">
          <i className="fa fa-search"></i>
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-gray-900 p-2 overflow-y-auto">
          <div className="text-xs font-bold mb-1 mt-1 text-text">PLACES</div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/home/hackos" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/home/hackos")}
          >
            <i className="fa fa-home text-xs w-5"></i>
            <span className="text-sm text-text">Home</span>
          </div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/home/hackos/Desktop" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/home/hackos/Desktop")}
          >
            <i className="fa fa-desktop text-xs w-5"></i>
            <span className="text-sm text-text">Desktop</span>
          </div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/home/hackos/Downloads" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/home/hackos/Downloads")}
          >
            <i className="fa fa-download text-xs w-5"></i>
            <span className="text-sm text-text">Downloads</span>
          </div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/home/hackos/Documents" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/home/hackos/Documents")}
          >
            <i className="fa fa-file text-xs w-5"></i>
            <span className="text-sm text-text">Documents</span>
          </div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/home/hackos/Pictures" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/home/hackos/Pictures")}
          >
            <i className="fa fa-image text-xs w-5"></i>
            <span className="text-sm text-text">Pictures</span>
          </div>

          <div className="text-xs font-bold mb-1 mt-3 text-text">DEVICES</div>
          <div
            className={`p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center ${
              currentPath === "/" ? "bg-gray-800" : ""
            }`}
            onClick={() => navigateTo("/")}
          >
            <i className="fa fa-hdd text-xs w-5"></i>
            <span className="text-sm text-text">System (/) </span>
          </div>
          <div className="p-1 rounded hover:bg-gray-800 cursor-pointer flex items-center">
            <i className="fa fa-network-wired text-xs w-5"></i>
            <span className="text-sm text-text">Network</span>
          </div>
        </div>

        {/* Files area */}
        <div
          className="flex-1 overflow-auto bg-window p-2"
          onClick={() => setSelectedFile(null)}
          onContextMenu={handleEmptySpaceContextMenu}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-6 gap-2">
                  {files.map(([name, node]) => (
                    <div
                      key={name}
                      className={`file-item text-center p-1 rounded cursor-pointer ${
                        selectedFile === name
                          ? "bg-accent bg-opacity-30"
                          : "hover:bg-gray-800"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(name);
                      }}
                      onDoubleClick={() => handleDoubleClick(name, node)}
                      onContextMenu={(e) => handleContextMenu(e, name, node)}
                    >
                      <i className={`fa ${getFileIcon(name, node)} text-2xl`}></i>
                      <div className="text-xs mt-1 truncate text-text">{name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="flex flex-col space-y-1">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold p-1 border-b border-gray-700">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-1">Size</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Modified</div>
                  </div>
                  {files.map(([name, node]) => (
                    <div
                      key={name}
                      className={`file-browser-item grid grid-cols-12 gap-2 text-sm ${
                        selectedFile === name ? "bg-accent bg-opacity-30" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(name);
                      }}
                      onDoubleClick={() => handleDoubleClick(name, node)}
                      onContextMenu={(e) => handleContextMenu(e, name, node)}
                    >
                      <div className="col-span-6 flex items-center truncate">
                        <i className={`fa ${getFileIcon(name, node)} mr-2`}></i>
                        <span>{name}</span>
                      </div>
                      <div className="col-span-1">
                        {node.type === "directory"
                          ? "--"
                          : formatFileSize(node.size)}
                      </div>
                      <div className="col-span-2">
                        {node.type === "directory"
                          ? "Folder"
                          : node.mimeType || "File"}
                      </div>
                      <div className="col-span-3">
                        {node.lastModified
                          ? node.lastModified.toLocaleString()
                          : "--"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {files.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <i className="fa fa-folder-open text-4xl mb-2"></i>
                  <p>This folder is empty</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar bg-kali-toolbar h-6 text-xs px-2 flex items-center justify-between text-text">
        <div>{files.length} items | Free space: 24.5 GB</div>
        <div>{currentPath}</div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-window border border-accent rounded-md p-4 w-96">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Folder Name
              </label>
              <input
                type="text"
                className="w-full p-2 bg-window border border-gray-600 rounded-md text-text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                onClick={() => setShowNewFolderModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-md"
                onClick={submitNewFolder}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-window border border-accent rounded-md p-4 w-96">
            <h3 className="text-lg font-medium mb-4">Create New File</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                File Name
              </label>
              <input
                type="text"
                className="w-full p-2 bg-window border border-gray-600 rounded-md text-text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                File Content
              </label>
              <textarea
                className="w-full p-2 bg-window border border-gray-600 rounded-md text-text h-32"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                onClick={() => setShowNewFileModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-md"
                onClick={submitNewFile}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-window border border-red-500 rounded-md p-4 w-96">
            <h3 className="text-lg font-medium mb-4 flex items-center text-red-500">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              Delete File
            </h3>
            <div className="mb-6">
              <p>Are you sure you want to delete the following item?</p>
              <p className="font-bold mt-2">{fileToDelete.split("/").pop()}</p>
              <p className="text-xs text-red-400 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-window border border-accent rounded-md p-4 w-96">
            <h3 className="text-lg font-medium mb-4">Rename</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Name</label>
              <input
                type="text"
                className="w-full p-2 bg-window border border-gray-600 rounded-md text-text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-md"
                onClick={submitRename}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
