import React from 'react';
import { FileSystemNode } from '../../../types/os.types';

interface FileViewProps {
  files: [string, FileSystemNode][];
  viewMode: "grid" | "list";
  selectedFile: string | null;
  onFileClick: (name: string) => void;
  onFileDoubleClick: (name: string, node: FileSystemNode) => void;
  onFileContextMenu: (e: React.MouseEvent, name: string, node: FileSystemNode) => void;
  getFileIcon: (name: string, node: FileSystemNode) => string;
  formatFileSize: (size?: number) => string;
}

const FileView: React.FC<FileViewProps> = ({
  files,
  viewMode,
  selectedFile,
  onFileClick,
  onFileDoubleClick,
  onFileContextMenu,
  getFileIcon,
  formatFileSize,
}) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <i className="fa fa-folder-open text-3xl mb-3 opacity-50"></i>
        <p className="text-sm">This folder is empty</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-8 gap-3 p-4">
        {files.map(([name, node]) => (
          <div
            key={name}
            className={`flex flex-col items-center p-3 rounded cursor-pointer transition-colors ${
              selectedFile === name
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onFileClick(name);
            }}
            onDoubleClick={() => onFileDoubleClick(name, node)}
            onContextMenu={(e) => onFileContextMenu(e, name, node)}
          >
            <i className={`fa ${getFileIcon(name, node)} text-2xl text-gray-400 mb-2`}></i>
            <div className="text-xs text-center text-gray-300 break-all leading-tight max-w-full">
              {name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-12 gap-4 text-xs font-medium p-3 border-b border-gray-700 text-gray-400 bg-gray-900">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Modified</div>
      </div>
      <div className="flex-1 overflow-auto">
        {files.map(([name, node]) => (
          <div
            key={name}
            className={`grid grid-cols-12 gap-4 text-sm p-3 border-b border-gray-800 cursor-pointer transition-colors ${
              selectedFile === name 
                ? "bg-gray-700" 
                : "hover:bg-gray-800"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onFileClick(name);
            }}
            onDoubleClick={() => onFileDoubleClick(name, node)}
            onContextMenu={(e) => onFileContextMenu(e, name, node)}
          >
            <div className="col-span-6 flex items-center space-x-3 min-w-0">
              <i className={`fa ${getFileIcon(name, node)} text-gray-400`}></i>
              <span className="truncate text-gray-300">{name}</span>
            </div>
            <div className="col-span-2 text-gray-400 text-xs">
              {node.type === "directory"
                ? "—"
                : formatFileSize(node.size)}
            </div>
            <div className="col-span-2 text-gray-400 text-xs">
              {node.type === "directory"
                ? "Folder"
                : node.mimeType || "File"}
            </div>
            <div className="col-span-2 text-gray-400 text-xs">
              {node.lastModified
                ? node.lastModified.toLocaleDateString()
                : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileView;
