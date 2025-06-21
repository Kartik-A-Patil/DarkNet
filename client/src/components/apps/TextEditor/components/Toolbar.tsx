import React, { useState, useEffect, useRef } from 'react';
import { EditorTab, EditorSettings } from '../types';

interface ToolbarProps {
  activeTab: EditorTab | null;
  settings: EditorSettings;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAs: () => void;
  onToggleSettings: () => void;
  canSave: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTab,
  settings,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSaveAs,
  onToggleSettings,
  canSave
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="toolbar bg-gray-800 border-b border-gray-700 px-2 sm:px-4 py-2 flex items-center justify-between relative">
      {/* Left Side - Hamburger Menu */}
      <div className="flex items-center space-x-2">
        {/* Hamburger Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            className="toolbar-btn px-2 py-1.5"
            onClick={toggleMenu}
            title="Menu"
          >
            <i className="fa fa-bars"></i>
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-50 min-w-40">
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                onClick={() => {
                  onNewFile();
                  setIsMenuOpen(false);
                }}
              >
                <i className="fa fa-file mr-2 w-4"></i>
                New File
                <span className="ml-auto text-xs text-gray-500">Ctrl+N</span>
              </button>
              
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                onClick={() => {
                  onOpenFile();
                  setIsMenuOpen(false);
                }}
              >
                <i className="fa fa-folder-open mr-2 w-4"></i>
                Open File
                <span className="ml-auto text-xs text-gray-500">Ctrl+O</span>
              </button>
              
              <div className="border-t border-gray-600 my-1"></div>
              
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  onSaveFile();
                  setIsMenuOpen(false);
                }}
                disabled={!canSave}
              >
                <i className="fa fa-save mr-2 w-4"></i>
                Save
                <span className="ml-auto text-xs text-gray-500">Ctrl+S</span>
              </button>
              
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  onSaveAs();
                  setIsMenuOpen(false);
                }}
                disabled={!activeTab}
              >
                <i className="fa fa-save mr-2 w-4"></i>
                Save As
                <span className="ml-auto text-xs text-gray-500">Ctrl+Shift+S</span>
              </button>
              
              <div className="border-t border-gray-600 my-1"></div>
              
              <button
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                onClick={() => {
                  onToggleSettings();
                  setIsMenuOpen(false);
                }}
              >
                <i className="fa fa-cog mr-2 w-4"></i>
                Settings
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions - Desktop Only */}
        <div className="hidden md:flex items-center space-x-1">
          <button
            className="toolbar-btn px-2 py-1.5"
            onClick={onNewFile}
            title="New File (Ctrl+N)"
          >
            <i className="fa fa-file"></i>
          </button>
          
          <button
            className="toolbar-btn px-2 py-1.5"
            onClick={onSaveFile}
            title="Save (Ctrl+S)"
            disabled={!canSave}
          >
            <i className="fa fa-save"></i>
          </button>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-gray-400">
        {activeTab && (
          <>
            {/* File path - hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-4">
              <span title="Current File" className="truncate max-w-xs">
                {activeTab.filePath || 'Untitled'}
              </span>
            </div>
            
            {/* Language badge */}
            <span title="File Type" className="px-2 py-1 bg-gray-700 rounded text-xs">
              {activeTab.language.toUpperCase()}
            </span>
            
            {/* Save status */}
            <div className="flex items-center space-x-1">
              <span className={`flex items-center ${
                activeTab.saved ? 'text-green-400' : 'text-yellow-400'
              }`}>
                <i className={`fa ${
                  activeTab.saved ? 'fa-check-circle' : 'fa-exclamation-circle'
                } mr-0 sm:mr-1 text-xs`}></i>
                <span className="hidden sm:inline">
                  {activeTab.saved ? 'Saved' : 'Unsaved'}
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
