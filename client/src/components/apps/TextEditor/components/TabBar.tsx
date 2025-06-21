import React from 'react';
import { EditorTab } from '../types';
import { getLanguageIcon, isTabUnsaved } from '../utils';

interface TabBarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab
}) => {
  return (
    <div className="tab-bar bg-gray-900 flex items-center overflow-x-auto border-b border-gray-700">
      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="flex-shrink-0 px-2 sm:px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        title="New Tab (Ctrl+T)"
      >
        <i className="fa fa-plus text-sm"></i>
      </button>

      {/* Tabs */}
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const hasUnsavedChanges = isTabUnsaved(tab);
          
          return (
            <div
              key={tab.id}
              className={`flex items-center px-2 sm:px-3 py-2 cursor-pointer border-r border-gray-700 max-w-32 sm:max-w-xs min-w-0 group ${
                isActive
                  ? "bg-gray-800 text-white border-t-2 border-t-blue-500"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => onTabClick(tab.id)}
              title={tab.filePath || tab.fileName}
            >
              {/* File Icon */}
              <i className={`fa ${getLanguageIcon(tab.language)} mr-1 sm:mr-2 text-xs flex-shrink-0`}></i>
              
              {/* File Name */}
              <span className="truncate text-xs sm:text-sm flex-1 min-w-0">
                {tab.fileName}
              </span>
              
              {/* Unsaved Indicator */}
              {hasUnsavedChanges && (
                <span className="text-yellow-400 ml-1 flex-shrink-0 text-xs">●</span>
              )}
              
              {/* Close Button */}
              <button
                className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                title="Close tab"
              >
                <i className="fa fa-times text-xs"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
