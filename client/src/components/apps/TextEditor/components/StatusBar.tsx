import React from 'react';
import { EditorTab, EditorSettings } from '../types';
import { formatFileSize, getShortcutText } from '../utils';

interface StatusBarProps {
  activeTab: EditorTab | null;
  settings: EditorSettings;
  cursorPosition?: { line: number; column: number };
  selection?: { from: number; to: number };
}

const StatusBar: React.FC<StatusBarProps> = ({
  activeTab,
  settings,
  cursorPosition,
  selection
}) => {
  const getSelectionInfo = () => {
    if (!selection || selection.from === selection.to) {
      return null;
    }
    const length = selection.to - selection.from;
    return `${length} selected`;
  };

  const getWordCount = (content: string) => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const getCharCount = (content: string) => {
    return content.length;
  };

  return (
    <div className="status-bar bg-gray-800 border-t border-gray-700 px-2 sm:px-4 py-1 text-xs flex items-center justify-between">
      {/* Left Side - File Info */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {activeTab && (
          <>
            <span className={`flex items-center ${
              activeTab.saved ? 'text-green-400' : 'text-yellow-400'
            }`}>
              <i className={`fa ${
                activeTab.saved ? 'fa-check-circle' : 'fa-exclamation-circle'
              } mr-1 text-xs`}></i>
              {activeTab.saved ? 'Saved' : 'Unsaved'}
            </span>
            
            {/* File name - always visible but truncated on mobile */}
            <span className="text-gray-400 truncate max-w-24 sm:max-w-md" title={activeTab.filePath || 'Untitled'}>
              {activeTab.fileName}
            </span>
            
            {/* Character/Word count - hidden on small screens */}
            <span className="text-gray-500 hidden sm:inline">
              {getCharCount(activeTab.content)} chars, {getWordCount(activeTab.content)} words
            </span>
            
            {getSelectionInfo() && (
              <span className="text-blue-400 hidden md:inline">
                {getSelectionInfo()}
              </span>
            )}
          </>
        )}
      </div>

      {/* Right Side - Editor Info */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Cursor position - hidden on mobile */}
        {cursorPosition && (
          <span className="text-gray-400 hidden sm:inline" title="Line:Column">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        )}
        
        {/* Language mode */}
        {activeTab && (
          <span className="px-2 py-0.5 bg-gray-700 rounded text-gray-300" title="Language Mode">
            {activeTab.language.toUpperCase()}
          </span>
        )}
        
        {/* File info - hidden on small screens */}
        <span className="text-gray-500 hidden md:inline" title="Encoding">
          UTF-8
        </span>
        
        <span className="text-gray-500 hidden md:inline" title="Line Ending">
          LF
        </span>
        
        <span className="text-gray-500 hidden lg:inline" title={`Tab Size: ${settings.tabSize}`}>
          Spaces: {settings.tabSize}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
