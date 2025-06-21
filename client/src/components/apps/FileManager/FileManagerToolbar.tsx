import React, { useState, useEffect, useRef } from 'react';
import { BreadcrumbItem } from './types';

interface FileManagerToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  breadcrumbs: BreadcrumbItem[];
  viewMode: "grid" | "list";
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onNavigateUp: () => void;
  onNavigateHome: () => void;
  onNavigateTo: (path: string) => void;
  onToggleViewMode: () => void;
  onCreateNewFolder: () => void;
  onCreateNewFile: () => void;
  onCreateNewHtmlFile?: () => void;
  onCreateNewCssFile?: () => void;
  onCreateNewJsFile?: () => void;
  onCreateNewMarkdownFile?: () => void;
}

const FileManagerToolbar: React.FC<FileManagerToolbarProps> = ({
  canGoBack,
  canGoForward,
  breadcrumbs,
  viewMode,
  onNavigateBack,
  onNavigateForward,
  onNavigateUp,
  onNavigateHome,
  onNavigateTo,
  onToggleViewMode,
  onCreateNewFolder,
  onCreateNewFile,
  onCreateNewHtmlFile,
  onCreateNewCssFile,
  onCreateNewJsFile,
  onCreateNewMarkdownFile,
}) => {
  const [showNewFileDropdown, setShowNewFileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNewFileDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNewFileDropdown(false);
      }
    };

    if (showNewFileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showNewFileDropdown]);
  return (
    <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center space-x-2">
      {/* Navigation buttons */}
      <div className="flex items-center space-x-1">
        <button
          className={`p-1.5 text-sm rounded transition-colors ${
            canGoBack
              ? "hover:bg-gray-700 text-gray-300"
              : "opacity-40 cursor-not-allowed text-gray-500"
          }`}
          onClick={onNavigateBack}
          disabled={!canGoBack}
        >
          <i className="fa fa-arrow-left"></i>
        </button>
        <button
          className={`p-1.5 text-sm rounded transition-colors ${
            canGoForward
              ? "hover:bg-gray-700 text-gray-300"
              : "opacity-40 cursor-not-allowed text-gray-500"
          }`}
          onClick={onNavigateForward}
          disabled={!canGoForward}
        >
          <i className="fa fa-arrow-right"></i>
        </button>
        <button
          className="p-1.5 text-sm rounded hover:bg-gray-700 text-gray-300 transition-colors"
          onClick={onNavigateUp}
        >
          <i className="fa fa-arrow-up"></i>
        </button>
        <button
          className="p-1.5 text-sm rounded hover:bg-gray-700 text-gray-300 transition-colors"
          onClick={onNavigateHome}
        >
          <i className="fa fa-home"></i>
        </button>
      </div>

      {/* Separator */}
      <div className="border-l border-gray-600 h-5"></div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        <button
          className="p-1.5 text-sm rounded hover:bg-gray-700 text-gray-300 transition-colors"
          onClick={onCreateNewFolder}
          title="New Folder"
        >
          <i className="fa fa-folder-plus"></i>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-1.5 text-sm rounded hover:bg-gray-700 text-gray-300 transition-colors flex items-center"
            onClick={() => setShowNewFileDropdown(!showNewFileDropdown)}
            title="New File"
          >
            <i className="fa fa-file-plus mr-1"></i>
            <i className="fa fa-caret-down text-xs"></i>
          </button>
          
          {showNewFileDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 min-w-48">
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex items-center text-gray-300"
                onClick={() => {
                  onCreateNewFile();
                  setShowNewFileDropdown(false);
                }}
              >
                <i className="fa fa-file text-gray-400 w-4 mr-2"></i>
                New File
              </button>
              {onCreateNewHtmlFile && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex items-center text-gray-300"
                  onClick={() => {
                    onCreateNewHtmlFile();
                    setShowNewFileDropdown(false);
                  }}
                >
                  <i className="fa fa-code text-gray-400 w-4 mr-2"></i>
                  HTML File
                </button>
              )}
              {onCreateNewCssFile && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex items-center text-gray-300"
                  onClick={() => {
                    onCreateNewCssFile();
                    setShowNewFileDropdown(false);
                  }}
                >
                  <i className="fa fa-paint-brush text-gray-400 w-4 mr-2"></i>
                  CSS File
                </button>
              )}
              {onCreateNewJsFile && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex items-center text-gray-300"
                  onClick={() => {
                    onCreateNewJsFile();
                    setShowNewFileDropdown(false);
                  }}
                >
                  <i className="fa fa-code text-gray-400 w-4 mr-2"></i>
                  JavaScript File
                </button>
              )}
              {onCreateNewMarkdownFile && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex items-center text-gray-300"
                  onClick={() => {
                    onCreateNewMarkdownFile();
                    setShowNewFileDropdown(false);
                  }}
                >
                  <i className="fa fa-markdown text-gray-400 w-4 mr-2"></i>
                  Markdown File
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location bar with breadcrumbs */}
      <div className="flex-1 mx-4">
        <div className="flex items-center text-sm bg-gray-800 px-3 py-1.5 rounded border border-gray-600">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="mx-1 text-gray-500">/</span>}
              <div
                className="flex items-center hover:text-white cursor-pointer text-gray-300 transition-colors"
                onClick={() => onNavigateTo(crumb.path)}
              >
                {i === 0 ? <i className="fa fa-hdd mr-1 text-gray-400"></i> : null}
                <span>{crumb.name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* View controls */}
      <div className="flex items-center space-x-1">
        <button
          className="p-1.5 text-sm rounded hover:bg-gray-700 text-gray-300 transition-colors"
          onClick={onToggleViewMode}
          title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
        >
          <i className={`fa fa-${viewMode === "grid" ? "list" : "th"}`}></i>
        </button>
      </div>
    </div>
  );
};

export default FileManagerToolbar;
