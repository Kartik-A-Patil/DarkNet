import React, { useState, useEffect, useMemo } from 'react';
import { useOS } from '../../../../contexts/OSContext';
import { FileSystemNode } from '../../../../types/os.types';

interface FileExplorerProps {
  onSelectFile: (filePath: string) => void;
  onClose: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onSelectFile, onClose }) => {
  const { fileSystem } = useOS();
  const [currentPath, setCurrentPath] = useState('/home/hackos');
  const [currentDir, setCurrentDir] = useState<FileSystemNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load directory content
  useEffect(() => {
    const loadDirectory = async () => {
      setIsLoading(true);
      try {
        const node = await fileSystem.readFile(currentPath);
        if (typeof node === 'string') {
          // If it's a string, create a file node
          setCurrentDir({ type: 'file', content: node });
        } else {
          setCurrentDir(node);
        }
      } catch (error) {
        console.error('Error loading directory:', error);
        setCurrentDir(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectory();
  }, [currentPath, fileSystem]);

  // Get supported files and directories
  const items = useMemo(() => {
    if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
      return [];
    }

    const supportedExtensions = ['html', 'htm', 'css', 'js', 'txt', 'md', 'json', 'xml'];
    
    return Object.entries(currentDir.children)
      .map(([name, node]) => ({ name, node }))
      .filter(({ name, node }) => {
        if (node.type === 'directory') return true;
        const extension = name.split('.').pop()?.toLowerCase();
        return extension && supportedExtensions.includes(extension);
      })
      .sort((a, b) => {
        // Directories first, then files
        if (a.node.type !== b.node.type) {
          return a.node.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [currentDir]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const handleItemClick = (name: string, node: FileSystemNode) => {
    const itemPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    
    if (node.type === 'directory') {
      navigateTo(itemPath);
    } else {
      onSelectFile(itemPath);
      onClose();
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      navigateTo(parentPath);
    }
  };

  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: 'Root', path: '/' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    let buildPath = '';
    for (const part of parts) {
      buildPath += `/${part}`;
      breadcrumbs.push({ name: part, path: buildPath });
    }
    
    return breadcrumbs;
  };

  const getFileIcon = (name: string, node: FileSystemNode) => {
    if (node.type === 'directory') {
      return '📁';
    }
    
    const extension = name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
      case 'htm':
        return '🌐';
      case 'css':
        return '🎨';
      case 'js':
        return '📜';
      case 'json':
        return '📋';
      case 'xml':
        return '📄';
      case 'txt':
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl w-[600px] h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Open File</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center p-3 bg-gray-800 border-b border-gray-700 text-sm">
          <button
            onClick={navigateUp}
            disabled={currentPath === '/'}
            className="mr-2 p-1 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-arrow-up"></i>
          </button>
          <div className="flex items-center space-x-1 overflow-x-auto">
            {getBreadcrumbs().map((crumb, index, array) => (
              <React.Fragment key={crumb.path}>
                <button
                  onClick={() => navigateTo(crumb.path)}
                  className={`px-2 py-1 rounded hover:bg-gray-700 transition-colors ${
                    index === array.length - 1 ? 'text-blue-400' : 'text-gray-300'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < array.length - 1 && (
                  <span className="text-gray-500">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3"></div>
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📂</div>
                <p>No supported files found</p>
                <p className="text-sm mt-1">Supported: HTML, CSS, JS, TXT, MD, JSON, XML</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map(({ name, node }) => (
                <div
                  key={name}
                  onClick={() => handleItemClick(name, node)}
                  className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <span className="mr-3 text-lg">
                    {getFileIcon(name, node)}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{name}</div>
                    {node.type === 'file' && (
                      <div className="text-xs text-gray-500">
                        {node.lastModified?.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {node.type === 'directory' && (
                    <i className="fas fa-chevron-right text-gray-500 text-xs"></i>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 text-sm text-gray-400">
          Select an HTML, CSS, JavaScript, or text file to open in the browser
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
