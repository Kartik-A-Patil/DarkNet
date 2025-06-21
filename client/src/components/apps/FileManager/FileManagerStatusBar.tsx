import React from 'react';

interface FileManagerStatusBarProps {
  fileCount: number;
  currentPath: string;
}

const FileManagerStatusBar: React.FC<FileManagerStatusBarProps> = ({
  fileCount,
  currentPath,
}) => {
  return (
    <div className="bg-gray-900 border-t border-gray-700 px-3 py-1.5 flex items-center justify-between text-xs text-gray-400">
      <div>{fileCount} items</div>
      <div className="truncate max-w-md">{currentPath}</div>
    </div>
  );
};

export default FileManagerStatusBar;
