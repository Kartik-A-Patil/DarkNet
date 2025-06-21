import { useCallback } from "react";
import { FileSystemNode, ContextMenuOption } from "../../../types/os.types";

export const useFileActions = (
  fileSystem: any,
  windowManager: any,
  showContextMenu: any,
  currentPath: string,
  setShowNewFolderModal: (show: boolean) => void,
  setShowNewFileModal: (show: boolean) => void,
  setShowDeleteConfirmation: (show: boolean) => void,
  setShowRenameModal: (show: boolean) => void,
  setFileToDelete: (file: string) => void,
  setFileToRename: (file: string) => void,
  setNewName: (name: string) => void,
  setNewFolderName: (name: string) => void,
  setNewFileName: (name: string) => void,
  setNewFileContent: (content: string) => void,
  refreshDirectory: () => void
) => {
  // Check if file is HTML
  const isHtmlFile = useCallback((fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'html' || extension === 'htm';
  }, []);

  // Open file with appropriate app
  const openFile = useCallback((name: string, node: FileSystemNode) => {
    const filePath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;

    // Check if it's an HTML file and offer browser option
    if (isHtmlFile(name)) {
      // Open in browser by default for HTML files
      openWithBrowser(filePath);
      return;
    }

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
  }, [currentPath, windowManager, isHtmlFile]);

  const openInTerminal = useCallback(async (path: string) => {
    // Check if node exists and is a directory
    const node = await fileSystem.getNodeFromPath(path);
    if (node && (node as any).type === "directory") {
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
  }, [fileSystem, windowManager]);

  const openWithTextEditor = useCallback(async (path: string) => {
    // Get the node at the path
    const node = await fileSystem.getNodeFromPath(path);
    if (node && (node as any).type === "file") {
      // Create text editor window and pass file data
      windowManager.createWindow("text-editor", {
        title: `${path.split("/").pop()} - Text Editor`,
        props: {
          filePath: path
        }
      });
    }
  }, [fileSystem, windowManager]);

  const openWithBrowser = useCallback(async (path: string) => {
    // Get the node at the path
    const node = await fileSystem.getNodeFromPath(path);
    if (node && (node as any).type === "file") {
      // Create browser window and pass file data
      windowManager.createWindow("browser", {
        title: `${path.split("/").pop()} - Browser`,
        props: {
          filePath: path,
          shouldOpenFile: true
        }
      });
    }
  }, [fileSystem, windowManager]);

  const executeFile = useCallback((path: string) => {
    console.log(`Executing file: ${path}`);
  }, []);

  const copyFile = useCallback((path: string) => {
    console.log(`Copying file: ${path}`);
  }, []);

  const cutFile = useCallback((path: string) => {
    console.log(`Cutting file: ${path}`);
  }, []);

  const renameFile = useCallback((path: string) => {
    setFileToRename(path);
    // Set default new name to current filename
    setNewName(path.split("/").pop() || "");
    setShowRenameModal(true);
  }, [setFileToRename, setNewName, setShowRenameModal]);

  const deleteFile = useCallback(async (path: string) => {
    setShowDeleteConfirmation(true);
    setFileToDelete(path);
  }, [setShowDeleteConfirmation, setFileToDelete]);

  const createNewFolder = useCallback(() => {
    setNewFolderName("");
    setShowNewFolderModal(true);
  }, [setNewFolderName, setShowNewFolderModal]);

  const createNewFile = useCallback(() => {
    setNewFileName("");
    setNewFileContent("");
    setShowNewFileModal(true);
  }, [setNewFileName, setNewFileContent, setShowNewFileModal]);

  const showProperties = useCallback((path: string) => {
    console.log(`Showing properties for: ${path}`);
  }, []);

  // Handle file/folder context menu
  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    name: string,
    node: FileSystemNode
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const filePath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    const options: ContextMenuOption[] = [];

    if ((node as any).type === "directory") {
      options.push(
        {
          label: "Open",
          icon: "fa-folder-open",
          action: () => console.log("Open directory")
        },
        {
          label: "Open in New Window",
          icon: "fa-external-link-alt",
          action: () => console.log("Open in new window")
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

      // Add browser option for HTML files
      if (isHtmlFile(name)) {
        options.push({
          label: "Open With Browser",
          icon: "fa-globe",
          action: () => openWithBrowser(filePath)
        });
      }

      if ((node as any).executable) {
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
  }, [currentPath, openFile, openWithTextEditor, openWithBrowser, openInTerminal, executeFile, copyFile, cutFile, renameFile, deleteFile, showProperties, showContextMenu, isHtmlFile]);

  // Additional file creation helpers
  const createNewHtmlFile = useCallback(() => {
    setNewFileName("index.html");
    setNewFileContent(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New HTML File</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #1a1a1a;
            color: #00ff41;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #00ff88;
        }
    </style>
</head>
<body>
    <h1>Welcome to Your New HTML File</h1>
    <p>Start editing this file to create your webpage!</p>
</body>
</html>`);
    setShowNewFileModal(true);
  }, [setNewFileName, setNewFileContent, setShowNewFileModal]);

  const createNewCssFile = useCallback(() => {
    setNewFileName("styles.css");
    setNewFileContent(`/* New CSS File */
body {
    font-family: Arial, sans-serif;
    background: #1a1a1a;
    color: #00ff41;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

h1 {
    color: #00ff88;
    text-align: center;
}
`);
    setShowNewFileModal(true);
  }, [setNewFileName, setNewFileContent, setShowNewFileModal]);

  const createNewJsFile = useCallback(() => {
    setNewFileName("script.js");
    setNewFileContent(`// New JavaScript File
console.log('Hello, DarkNet!');

// Add your JavaScript code here
function initializeApp() {
    console.log('App initialized');
}

// Call the function when page loads
document.addEventListener('DOMContentLoaded', initializeApp);
`);
    setShowNewFileModal(true);
  }, [setNewFileName, setNewFileContent, setShowNewFileModal]);

  const createNewMarkdownFile = useCallback(() => {
    setNewFileName("README.md");
    setNewFileContent(`# New Markdown File

Welcome to your new markdown file!

## Getting Started

This is a **bold** text and this is *italic* text.

### Code Example

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

### List Example

- Item 1
- Item 2
- Item 3

### Links

[DarkNet Project](./index.html)
`);
    setShowNewFileModal(true);
  }, [setNewFileName, setNewFileContent, setShowNewFileModal]);

  const refreshCurrentDirectory = useCallback(() => {
    // Force refresh the current directory
    refreshDirectory();
  }, [refreshDirectory]);

  const selectAllFiles = useCallback(() => {
    // This would select all files - placeholder for future implementation
    console.log("Select all files");
  }, []);

  const pasteFiles = useCallback(() => {
    // Placeholder for paste functionality
    console.log(`Pasting files to: ${currentPath}`);
  }, [currentPath]);

  // Handle empty space context menu
  const handleEmptySpaceContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const options: ContextMenuOption[] = [
      // Create section
      {
        label: "New Folder",
        icon: "fa-folder-plus",
        action: () => createNewFolder()
      },
      {
        label: "New File",
        icon: "fa-file-plus",
        action: () => createNewFile()
      },
      {
        label: "New HTML File",
        icon: "fa-code",
        action: () => createNewHtmlFile()
      },
      {
        label: "New CSS File",
        icon: "fa-css3-alt",
        action: () => createNewCssFile()
      },
      {
        label: "New JavaScript File",
        icon: "fa-js-square",
        action: () => createNewJsFile()
      },
      {
        label: "New Markdown File",
        icon: "fa-markdown",
        action: () => createNewMarkdownFile()
      },
      
      // Separator
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      
      // Clipboard section
      {
        label: "Paste",
        icon: "fa-paste",
        action: () => pasteFiles(),
        disabled: true // Would be enabled if clipboard had content
      },
      
      // Separator
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      
      // View section
      {
        label: "Refresh",
        icon: "fa-sync-alt",
        action: () => refreshCurrentDirectory()
      },
      {
        label: "Select All",
        icon: "fa-check-square",
        action: () => selectAllFiles()
      },
      
      // Separator
      {
        label: "",
        icon: "",
        action: () => {},
        separator: true
      },
      
      // System section
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
  }, [
    currentPath, 
    createNewFolder, 
    createNewFile, 
    createNewHtmlFile,
    createNewCssFile,
    createNewJsFile,
    createNewMarkdownFile,
    pasteFiles,
    refreshCurrentDirectory,
    selectAllFiles,
    openInTerminal, 
    showProperties, 
    showContextMenu
  ]);

  return {
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
    isHtmlFile,
    refreshDirectory: refreshCurrentDirectory,
    selectAllFiles,
    pasteFiles,
  };
};
