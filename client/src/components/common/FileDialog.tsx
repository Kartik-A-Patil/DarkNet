import React, { useState, useEffect, useMemo } from "react";
import { useOS } from "../../contexts/OSContext";

interface FileDialogProps {
  isOpen: boolean;
  mode?: 'open' | 'save';
  title?: string;
  initialPath?: string;
  initialFileName?: string;
  supportedExtensions?: string[];
  onSelect: (path: string) => void;
  onCancel: () => void;
}

const FileDialog: React.FC<FileDialogProps> = ({
  isOpen,
  mode = 'open',
  title = 'Select File',
  initialPath = '/home/hackos/Documents',
  initialFileName = '',
  supportedExtensions = [],
  onSelect,
  onCancel
}) => {
  const { fileSystem } = useOS();
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [fileName, setFileName] = useState(initialFileName);
  const [files, setFiles] = useState<[string, any][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Memoize supportedExtensions to prevent unnecessary re-renders
  const memoizedExtensions = useMemo(() => {
    return supportedExtensions || [];
  }, [supportedExtensions?.length, supportedExtensions?.join?.(',')]);
  useEffect(() => {
    if (isOpen) {
      setCurrentPath(initialPath);
      setFileName(initialFileName);
      setSelectedFile('');
      setFiles([]);
      setIsLoading(true);
    } else {
      // Reset when closing to prevent stale state
      setIsLoading(false);
    }
  }, [isOpen, initialPath, initialFileName]);

  // Load directory contents
  useEffect(() => {
    const loadDirectory = async () => {
      if (!isOpen || !fileSystem) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Loading timeout')), 5000)
        );
        
        const loadPromise = fileSystem.getNodeFromPath(currentPath);
        const node = await Promise.race([loadPromise, timeoutPromise]) as any;
        
        if (node && node.children) {
          // Convert object to array and sort (directories first)
          const entries = Object.entries(node.children).sort(([nameA, nodeA], [nameB, nodeB]) => {
            const typeA = (nodeA as any)?.type;
            const typeB = (nodeB as any)?.type;
            if (typeA === "directory" && typeB !== "directory") return -1;
            if (typeA !== "directory" && typeB === "directory") return 1;
            return nameA.localeCompare(nameB);
          });
          
          // Filter files if extensions are specified
          const filteredEntries = memoizedExtensions.length > 0 
            ? entries.filter(([name, node]) => {
                const nodeType = (node as any)?.type;
                if (nodeType === "directory") return true;
                const ext = name.split('.').pop()?.toLowerCase();
                return ext && memoizedExtensions.includes(ext);
              })
            : entries;
            
          setFiles(filteredEntries);
        } else {
          setFiles([]);
        }
      } catch (error) {
        console.error("Error loading directory:", error);
        setFiles([]);
        // Don't stay in loading state on error
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadDirectory();
    } else {
      // Reset loading state when dialog closes
      setIsLoading(false);
    }
  }, [currentPath, fileSystem, isOpen, memoizedExtensions]);

  // Navigate to a directory
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFile('');
  };

  // Navigate up one level
  const navigateUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length === 0) return;
    
    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}`;
    setCurrentPath(newPath);
  };

  // Navigate to common directories
  const navigateToHome = () => navigateTo("/home/hackos");
  const navigateToDesktop = () => navigateTo("/home/hackos/Desktop");
  const navigateToDocuments = () => navigateTo("/home/hackos/Documents");
  const navigateToDownloads = () => navigateTo("/home/hackos/Downloads");

  // Get breadcrumbs from current path
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

  // Get file icon based on type and name
  const getFileIcon = (name: string, node: any) => {
    if (node.type === "directory") {
      if (name === "Desktop") return "fa-desktop text-blue-400";
      if (name === "Documents") return "fa-file-alt text-blue-400";
      if (name === "Downloads") return "fa-download text-blue-400";
      if (name === "Pictures") return "fa-image text-blue-400";
      if (name === "Music") return "fa-music text-blue-400";
      if (name === "Videos") return "fa-video text-blue-400";
      return "fa-folder text-blue-400";
    } else {
      const ext = name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'html':
        case 'htm':
          return "fa-file-code text-orange-400";
        case 'css':
          return "fa-file-code text-blue-500";
        case 'js':
          return "fa-file-code text-yellow-400";
        case 'json':
          return "fa-file-code text-green-400";
        case 'xml':
          return "fa-file-code text-red-400";
        case 'txt':
        case 'md':
          return "fa-file-text text-gray-400";
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
          return "fa-file-image text-purple-400";
        default:
          if (node.executable) return "fa-file-code text-green-500";
          return "fa-file text-gray-400";
      }
    }
  };

  // Handle file/directory click
  const handleItemClick = (name: string, node: any) => {
    if (node.type === "directory") {
      const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
      navigateTo(newPath);
    } else {
      setSelectedFile(name);
      if (mode === 'save') {
        setFileName(name);
      }
    }
  };

  // Handle file selection
  const handleSelect = () => {
    let finalPath = '';
    
    if (mode === 'save') {
      if (!fileName.trim()) {
        alert('Please enter a filename');
        return;
      }
      finalPath = currentPath === "/" ? `/${fileName}` : `${currentPath}/${fileName}`;
    } else {
      if (!selectedFile) {
        alert('Please select a file');
        return;
      }
      finalPath = currentPath === "/" ? `/${selectedFile}` : `${currentPath}/${selectedFile}`;
    }
    
    onSelect(finalPath);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-3/4 h-3/4 max-w-4xl max-h-3xl flex flex-col">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 rounded-t-lg border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-750 border-r border-gray-600 p-3">
            <div className="space-y-2">
              <button
                onClick={navigateToHome}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-600 text-white flex items-center"
              >
                <i className="fa fa-home mr-2 text-blue-400"></i>
                Home
              </button>
              <button
                onClick={navigateToDesktop}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-600 text-white flex items-center"
              >
                <i className="fa fa-desktop mr-2 text-blue-400"></i>
                Desktop
              </button>
              <button
                onClick={navigateToDocuments}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-600 text-white flex items-center"
              >
                <i className="fa fa-file-alt mr-2 text-blue-400"></i>
                Documents
              </button>
              <button
                onClick={navigateToDownloads}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-600 text-white flex items-center"
              >
                <i className="fa fa-download mr-2 text-blue-400"></i>
                Downloads
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Navigation Bar */}
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <button
                  onClick={navigateUp}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm"
                  disabled={currentPath === "/"}
                >
                  <i className="fa fa-arrow-up mr-1"></i>
                  Up
                </button>
                
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-1 flex-1">
                  {getBreadcrumbs().map((crumb, index, array) => (
                    <React.Fragment key={crumb.path}>
                      <button
                        onClick={() => navigateTo(crumb.path)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {crumb.name}
                      </button>
                      {index < array.length - 1 && <span className="text-gray-400">/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">
                  <i className="fa fa-spinner fa-spin text-2xl mb-2"></i>
                  <div>Loading...</div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <i className="fa fa-folder-open text-2xl mb-2"></i>
                  <div>Empty directory</div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-4">
                  {files.map(([name, node]) => (
                    <div
                      key={name}
                      className={`flex flex-col items-center p-3 rounded cursor-pointer transition-colors ${
                        selectedFile === name
                          ? 'bg-blue-600 bg-opacity-50'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => handleItemClick(name, node)}
                    >
                      <i className={`fa ${getFileIcon(name, node)} text-2xl mb-2`}></i>
                      <span className="text-sm text-center text-white truncate w-full" title={name}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 rounded-b-lg border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mode === 'save' && (
                <div className="flex items-center space-x-2">
                  <label className="text-white text-sm">Filename:</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="px-2 py-1 bg-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter filename..."
                  />
                </div>
              )}
              {mode === 'open' && selectedFile && (
                <div className="text-white text-sm">
                  Selected: <span className="text-blue-400">{selectedFile}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                disabled={mode === 'open' && !selectedFile || mode === 'save' && !fileName.trim()}
              >
                {mode === 'open' ? 'Open' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDialog;
