import React from 'react';
import { BrowserTab } from '../types';

interface BrowserToolbarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
}

const BrowserToolbar: React.FC<BrowserToolbarProps> = ({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onNewTab
}) => {
  return (
    <div className="flex items-center bg-gray-800 border-b border-gray-700 min-h-[40px]">
      {/* Tabs */}
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center min-w-[150px] max-w-[200px] px-3 py-2 border-r border-gray-700
              cursor-pointer select-none group relative
              ${tab.isActive 
                ? 'bg-gray-900 text-white border-b-2 border-blue-500' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
              }
            `}
            onClick={() => onSwitchTab(tab.id)}
          >
            {/* Favicon */}
            <div className="mr-2 text-sm">
              {tab.isLoading ? (
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
              ) : tab.error ? (
                <span className="text-red-500">⚠️</span>
              ) : tab.url.startsWith('file://') ? (
                <span className="text-blue-400">📄</span>
              ) : tab.url.startsWith('browser://') ? (
                <span className="text-green-400">🌐</span>
              ) : (
                <span className="text-gray-400">📄</span>
              )}
            </div>

            {/* Tab Title */}
            <span className="flex-1 truncate text-sm font-medium">
              {tab.title}
            </span>

            {/* Close Button */}
            <button
              className="ml-2 w-4 h-4 rounded flex items-center justify-center
                       text-gray-400 hover:text-white hover:bg-red-600 
                       opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              title="Close tab"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        ))}
      </div>

      {/* New Tab Button */}
      <button
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 
                   border-l border-gray-700 transition-colors"
        onClick={onNewTab}
        title="New tab"
      >
        <i className="fas fa-plus text-sm"></i>
      </button>
    </div>
  );
};

export default BrowserToolbar;
