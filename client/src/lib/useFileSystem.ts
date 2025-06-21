import { useState, useCallback, useEffect, useRef } from "react";
import { 
  FileSystemNode, 
  FileType,
  initFileSystemDB,
  seedFileSystemIfEmpty,
  getNodeByPath,
  getNodeChildren,
  addNodeByPath,
  updateNodeByPath,
  deleteNodeByPath,
  getFileSystemRoot
} from "@/lib/utils/filesystem";

export function useFileSystem() {
  const [fileSystem, setFileSystem] = useState<{ [path: string]: FileSystemNode }>({});
  const [currentPath, setCurrentPath] = useState("/home/hackos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Initialize the filesystem database and seed if needed
  useEffect(() => {
    const initFS = async () => {
      try {
        setIsLoading(true);
        await initFileSystemDB();
        await seedFileSystemIfEmpty();
        
        // Get root to populate initial state
        const root = await getFileSystemRoot();
        if (root && isMounted.current) {
          setFileSystem({ "/": root });
        }
        if (isMounted.current) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing filesystem:", err);
        if (isMounted.current) {
          setError("Failed to initialize filesystem");
          setIsLoading(false);
        }
      }
    };
    
    initFS();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Get node from path with improved error handling
  const getNodeFromPath = useCallback(async (path: string): Promise<FileSystemNode | null> => {
    try {
      const node = await getNodeByPath(path);
      return node || null;
    } catch (err) {
      console.error(`Error getting node at path ${path}:`, err);
      return null;
    }
  }, []);

  // Get node children with improved error handling
  const getNodeFromChildren = useCallback(async (path: string): Promise<{ [key: string]: FileSystemNode } | null> => {
    try {
      const children = await getNodeChildren(path);
      return children || null;
    } catch (err) {
      console.error(`Error getting node children at path ${path}:`, err);
      return null;
    }
  }, []);

  // List directory contents with improved error handling
  const listDirectory = useCallback(async (path: string) => {
    try {
      const node = await getNodeByPath(path);
      if (!node || node.type !== FileType.DIRECTORY) {
        return {};
      }
      return node.children || {};
    } catch (err) {
      console.error(`Error listing directory ${path}:`, err);
      return {};
    }
  }, []);

  // Read file with improved error handling and timeout
  const readFile = useCallback(async (path: string): Promise<string | null> => {
    try {
      const node = await getNodeByPath(path);
      // Important: Check for both FILE and EXECUTABLE types
      if (!node || (node.type !== FileType.FILE && node.type !== FileType.EXECUTABLE)) {
        return null;
      }
      return node.content || "";
    } catch (err) {
      console.error(`Error reading file ${path}:`, err);
      return null;
    }
  }, []);

  // Write to file with improved path handling
  const writeFile = useCallback(async (path: string, content: string): Promise<boolean> => {
    try {
      const node = await getNodeByPath(path);
      
      if (node && node.type === FileType.FILE) {
        // Update existing file
        return updateNodeByPath(path, { 
          content, 
          lastModified: new Date()
        });
      } else {
        // Create new file
        // Get directory path and file name
        const dirPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const fileName = path.split('/').pop() || '';
        
        // Check if parent directory exists
        const parentDir = await getNodeByPath(dirPath);
        if (!parentDir || parentDir.type !== FileType.DIRECTORY) return false;
        
        // Create new file
        return addNodeByPath(path, {
          type: FileType.FILE,
          content,
          permissions: '-rw-r--r--',
          owner: 'hackos',
          lastModified: new Date()
        });
      }
    } catch (err) {
      console.error(`Error writing to file ${path}:`, err);
      return false;
    }
  }, []);

  // Create directory with improved path validation
  const createDirectory = useCallback(async (path: string): Promise<boolean> => {
    try {
      // Check if already exists
      const existing = await getNodeByPath(path);
      if (existing) return false;
      
      // Get parent directory path
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      
      // Check if parent directory exists
      const parentDir = await getNodeByPath(parentPath);
      if (!parentDir || parentDir.type !== FileType.DIRECTORY) return false;
      
      return addNodeByPath(path, {
        type: FileType.DIRECTORY,
        permissions: 'drwxr-xr-x',
        owner: 'hackos',
        children: {},
        lastModified: new Date()
      });
    } catch (err) {
      console.error(`Error creating directory ${path}:`, err);
      return false;
    }
  }, []);

  // Delete node with improved error handling
  const deleteNode = useCallback(async (path: string): Promise<boolean> => {
    try {
      // Prevent deletion of root or home directory
      if (path === '/' || path === '/home' || path === '/home/hackos') {
        console.error(`Cannot delete critical system path: ${path}`);
        return false;
      }
      
      return deleteNodeByPath(path);
    } catch (err) {
      console.error(`Error deleting node ${path}:`, err);
      return false;
    }
  }, []);

  // Update the current path with validation
  const updateCurrentPath = useCallback(async (path: string) => {
    try {
      // Verify the path exists before setting it
      const node = await getNodeByPath(path);
      if (node && node.type === FileType.DIRECTORY) {
        // Update internal state
        setCurrentPath(path);
        
        // Emit event for other components
        window.dispatchEvent(new CustomEvent('filesystem-path-changed', { 
          detail: { path } 
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Error setting current path to ${path}:`, err);
      return false;
    }
  }, []);

  // Handle path change events with proper cleanup
  useEffect(() => {
    const handlePathChange = (e: CustomEvent<{path: string}>) => {
      if (e.detail && e.detail.path && isMounted.current) {
        setCurrentPath(e.detail.path);
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener('filesystem-path-changed', 
      handlePathChange as EventListener);
    
    return () => {
      window.removeEventListener('filesystem-path-changed', 
        handlePathChange as EventListener);
    };
  }, []);

  return {
    fileSystem,
    currentPath,
    setCurrentPath: updateCurrentPath,
    getNodeFromPath,
    getNodeFromChildren,
    listDirectory,
    readFile,
    writeFile,
    createDirectory,
    deleteNode,
    
    isLoading,
    error
  };
}
