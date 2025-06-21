import React, { useState } from 'react';
import { BrowserTab } from '../types';

interface NavigationBarProps {
  activeTab?: BrowserTab;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onOpenFile: () => void;
  onShowBookmarks: () => void;
  onAddBookmark: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onNavigate,
  onRefresh,
  onOpenFile,
  onShowBookmarks,
  onAddBookmark
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [showAddressBar, setShowAddressBar] = useState(false);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      onNavigate(addressInput.trim());
      setShowAddressBar(false);
      setAddressInput('');
    }
  };

  const toggleAddressBar = () => {
    setShowAddressBar(!showAddressBar);
    if (!showAddressBar) {
      setAddressInput(activeTab?.url || '');
    }
  };

  return (
    <div className="flex items-center bg-gray-800 border-b border-gray-700 px-4 py-2 space-x-2">
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1">
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={true} // TODO: Implement back/forward history
          title="Go back"
        >
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={true} // TODO: Implement back/forward history
          title="Go forward"
        >
          <i className="fas fa-arrow-right text-sm"></i>
        </button>
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors"
          onClick={onRefresh}
          title="Refresh"
        >
          <i className="fas fa-redo text-sm"></i>
        </button>
      </div>

      {/* Address Bar */}
      <div className="flex-1 flex items-center">
        {showAddressBar ? (
          <form onSubmit={handleAddressSubmit} className="flex-1">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onBlur={() => setShowAddressBar(false)}
              className="w-full px-3 py-1 bg-gray-700 text-white rounded border border-gray-600
                         focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Enter file path or browser:// URL"
              autoFocus
            />
          </form>
        ) : (
          <div
            className="flex-1 px-3 py-1 bg-gray-700 text-gray-300 rounded border border-gray-600
                       cursor-text hover:bg-gray-650 text-sm truncate"
            onClick={toggleAddressBar}
          >
            {activeTab?.url || 'browser://welcome'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors"
          onClick={onOpenFile}
          title="Open file"
        >
          <i className="fas fa-folder-open text-sm"></i>
        </button>
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors"
          onClick={onAddBookmark}
          title="Add bookmark"
          disabled={!activeTab || activeTab.url.startsWith('browser://')}
        >
          <i className="fas fa-bookmark text-sm"></i>
        </button>
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors"
          onClick={onShowBookmarks}
          title="Show bookmarks"
        >
          <i className="fas fa-star text-sm"></i>
        </button>
        <button
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 
                     transition-colors"
          onClick={() => onNavigate('browser://welcome')}
          title="Home"
        >
          <i className="fas fa-home text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
