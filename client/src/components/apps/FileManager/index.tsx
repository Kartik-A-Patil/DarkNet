import React, { useCallback } from "react";
import { useFileManager } from "./useFileManager";
import { useFileActions } from "./useFileActions";
import FileManagerToolbar from "./FileManagerToolbar";
import FileManagerSidebar from "./FileManagerSidebar";
import FileView from "./FileView";
import FileManagerStatusBar from "./FileManagerStatusBar";
import FileManagerModals from "./FileManagerModals";

const FileManager: React.FC = () => {
  const {
    // State
    currentPath,
    selectedFile,
    history,
    historyIndex,
    viewMode,
    showHiddenFiles,
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
    currentDir,
  } = useFileManager();

  // Refresh directory helper
  const refreshDirectory = useCallback(async () => {
    // Force reload current directory
    const updatedDir = await fileSystem.getNodeFromPath(currentPath);
    // This would be handled by the useEffect in useFileManager
  }, [fileSystem, currentPath]);

  const {
    openFile,
    openInTerminal,
    openWithTextEditor,
    openWithBrowser,
    executeFile,
    copyFile,
    cutFile,
    renameFile,
    deleteFile,
    createNewFolder,
    createNewFile,
    createNewHtmlFile,
    createNewCssFile,
    createNewJsFile,
    createNewMarkdownFile,
    showProperties,
    handleContextMenu,
    handleEmptySpaceContextMenu,
  } = useFileActions(
    fileSystem,
    windowManager,
    showContextMenu,
    currentPath,
    setShowNewFolderModal,
    setShowNewFileModal,
    setShowDeleteConfirmation,
    setShowRenameModal,
    setFileToDelete,
    setFileToRename,
    setNewName,
    setNewFolderName,
    setNewFileName,
    setNewFileContent,
    refreshDirectory
  );

  // Handle file click
  const handleClick = useCallback((name: string) => {
    setSelectedFile(name === selectedFile ? null : name);
  }, [selectedFile, setSelectedFile]);

  // Handle file double click
  const handleDoubleClick = useCallback((name: string, node: any) => {
    if ((node as any).type === "directory") {
      const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      navigateTo(newPath);
    } else {
      openFile(name, node);
    }
  }, [currentPath, navigateTo, openFile]);

  // Modal handlers
  const submitNewFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      const folderPath = joinPaths(currentPath, newFolderName);
      const success = await fileSystem.createDirectory(folderPath);
      setShowNewFolderModal(false);
      if (success) {
        refreshDirectory();
      }
    }
  }, [currentPath, newFolderName, fileSystem, joinPaths, setShowNewFolderModal, refreshDirectory]);

  const submitNewFile = useCallback(async () => {
    if (newFileName.trim()) {
      const filePath = joinPaths(currentPath, newFileName);
      const success = await fileSystem.writeFile(filePath, newFileContent);
      setShowNewFileModal(false);
      if (success) {
        refreshDirectory();
      }
    }
  }, [currentPath, newFileName, newFileContent, fileSystem, joinPaths, setShowNewFileModal, refreshDirectory]);

  const confirmDelete = useCallback(async () => {
    if (fileToDelete) {
      const success = await fileSystem.deleteNode(fileToDelete);
      setShowDeleteConfirmation(false);
      setFileToDelete("");
      if (success) {
        setSelectedFile(null);
        refreshDirectory();
      }
    }
  }, [fileToDelete, fileSystem, setShowDeleteConfirmation, setFileToDelete, setSelectedFile, refreshDirectory]);

  const submitRename = useCallback(async () => {
    if (newName && fileToRename) {
      // Extract path without filename
      const dirPath = fileToRename.substring(0, fileToRename.lastIndexOf("/"));
      const newPath = dirPath + "/" + newName;

      // Get node to copy its properties
      const node = await fileSystem.getNodeFromPath(fileToRename);
      if (node) {
        // Create new node with same content but new name
        await fileSystem.writeFile(newPath, (node as any).content || "");
        // Delete the old node
        await fileSystem.deleteNode(fileToRename);
        setShowRenameModal(false);
        refreshDirectory();
      }
    }
  }, [newName, fileToRename, fileSystem, setShowRenameModal, refreshDirectory]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <FileManagerToolbar
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        breadcrumbs={getBreadcrumbs()}
        viewMode={viewMode}
        onNavigateBack={navigateBack}
        onNavigateForward={navigateForward}
        onNavigateUp={navigateUp}
        onNavigateHome={navigateToHome}
        onNavigateTo={navigateTo}
        onToggleViewMode={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        onCreateNewFolder={createNewFolder}
        onCreateNewFile={createNewFile}
        onCreateNewHtmlFile={createNewHtmlFile}
        onCreateNewCssFile={createNewCssFile}
        onCreateNewJsFile={createNewJsFile}
        onCreateNewMarkdownFile={createNewMarkdownFile}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <FileManagerSidebar
          currentPath={currentPath}
          onNavigateTo={navigateTo}
        />

        {/* Files area */}
        <div
          className="flex-1 overflow-auto bg-gray-900"
          onClick={() => setSelectedFile(null)}
          onContextMenu={handleEmptySpaceContextMenu}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-gray-400"></div>
            </div>
          ) : (
            <FileView
              files={files}
              viewMode={viewMode}
              selectedFile={selectedFile}
              onFileClick={handleClick}
              onFileDoubleClick={handleDoubleClick}
              onFileContextMenu={handleContextMenu}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <FileManagerStatusBar
        fileCount={files.length}
        currentPath={currentPath}
      />

      {/* Modals */}
      <FileManagerModals
        showNewFolderModal={showNewFolderModal}
        newFolderName={newFolderName}
        onNewFolderNameChange={setNewFolderName}
        onNewFolderSubmit={submitNewFolder}
        onNewFolderCancel={() => setShowNewFolderModal(false)}
        showNewFileModal={showNewFileModal}
        newFileName={newFileName}
        newFileContent={newFileContent}
        onNewFileNameChange={setNewFileName}
        onNewFileContentChange={setNewFileContent}
        onNewFileSubmit={submitNewFile}
        onNewFileCancel={() => setShowNewFileModal(false)}
        showDeleteConfirmation={showDeleteConfirmation}
        fileToDelete={fileToDelete}
        onDeleteConfirm={confirmDelete}
        onDeleteCancel={() => setShowDeleteConfirmation(false)}
        showRenameModal={showRenameModal}
        newName={newName}
        onNewNameChange={setNewName}
        onRenameSubmit={submitRename}
        onRenameCancel={() => setShowRenameModal(false)}
      />
    </div>
  );
};

export default FileManager;
