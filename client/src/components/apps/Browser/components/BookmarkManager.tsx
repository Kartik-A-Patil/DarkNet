import React, { useState } from 'react';
import { Bookmark } from '../types';

interface BookmarkManagerProps {
  bookmarks: Bookmark[];
  onOpenBookmark: (bookmark: Bookmark) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onClose: () => void;
}

const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  bookmarks,
  onOpenBookmark,
  onRemoveBookmark,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Filter bookmarks based on search term and folder
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !selectedFolder || bookmark.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Get unique folders
  const folders = Array.from(new Set(bookmarks.map(b => b.folder).filter(Boolean)));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBookmarkIcon = (bookmark: Bookmark) => {
    if (bookmark.url.startsWith('file://')) {
      const extension = bookmark.filePath?.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'html':
        case 'htm':
          return '🌐';
        case 'css':
          return '🎨';
        case 'js':
          return '📜';
        default:
          return '📄';
      }
    }
    return '🔗';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl w-[700px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Bookmark Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookmarks..."
                className="w-full px-3 py-2 pl-9 bg-gray-700 text-white rounded border border-gray-600
                         focus:outline-none focus:border-blue-500 text-sm"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600
                         focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">All Folders</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Bookmark List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredBookmarks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                {bookmarks.length === 0 ? (
                  <>
                    <p>No bookmarks yet</p>
                    <p className="text-sm mt-1">Add bookmarks while browsing files</p>
                  </>
                ) : (
                  <>
                    <p>No bookmarks match your search</p>
                    <p className="text-sm mt-1">Try different search terms</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-750 
                           border border-gray-700 hover:border-gray-600 transition-colors group"
                >
                  {/* Bookmark Icon */}
                  <div className="mr-3 text-lg">
                    {getBookmarkIcon(bookmark)}
                  </div>

                  {/* Bookmark Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">
                        {bookmark.title}
                      </h3>
                      <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {formatDate(bookmark.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 truncate mt-1">
                      {bookmark.url}
                    </div>
                    {bookmark.folder && (
                      <div className="text-xs text-blue-400 mt-1">
                        📁 {bookmark.folder}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenBookmark(bookmark)}
                      className="p-2 rounded text-green-400 hover:text-green-300 hover:bg-gray-700 transition-colors"
                      title="Open bookmark"
                    >
                      <i className="fas fa-external-link-alt text-sm"></i>
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(bookmark.id)}
                      className="p-2 rounded text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                      title="Remove bookmark"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {filteredBookmarks.length} of {bookmarks.length} bookmarks
            </span>
            <span>
              Double-click a bookmark to open it
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkManager;
