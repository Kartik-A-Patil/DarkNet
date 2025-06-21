import React from 'react';

interface FileManagerModalsProps {
  // New Folder Modal
  showNewFolderModal: boolean;
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onNewFolderSubmit: () => void;
  onNewFolderCancel: () => void;

  // New File Modal
  showNewFileModal: boolean;
  newFileName: string;
  newFileContent: string;
  onNewFileNameChange: (name: string) => void;
  onNewFileContentChange: (content: string) => void;
  onNewFileSubmit: () => void;
  onNewFileCancel: () => void;

  // Delete Confirmation Modal
  showDeleteConfirmation: boolean;
  fileToDelete: string;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;

  // Rename Modal
  showRenameModal: boolean;
  newName: string;
  onNewNameChange: (name: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
}

const FileManagerModals: React.FC<FileManagerModalsProps> = ({
  showNewFolderModal,
  newFolderName,
  onNewFolderNameChange,
  onNewFolderSubmit,
  onNewFolderCancel,
  showNewFileModal,
  newFileName,
  newFileContent,
  onNewFileNameChange,
  onNewFileContentChange,
  onNewFileSubmit,
  onNewFileCancel,
  showDeleteConfirmation,
  fileToDelete,
  onDeleteConfirm,
  onDeleteCancel,
  showRenameModal,
  newName,
  onNewNameChange,
  onRenameSubmit,
  onRenameCancel,
}) => {
  return (
    <>
      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-80">
            <h3 className="text-lg font-medium mb-4 text-gray-200">Create New Folder</h3>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Folder name"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                value={newFolderName}
                onChange={(e) => onNewFolderNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={onNewFolderCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                onClick={onNewFolderSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4 text-gray-200">Create New File</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="File name"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                value={newFileName}
                onChange={(e) => onNewFileNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-6">
              <textarea
                placeholder="File content (optional)"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 h-24 resize-none focus:outline-none focus:border-gray-500"
                value={newFileContent}
                onChange={(e) => onNewFileContentChange(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={onNewFileCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                onClick={onNewFileSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 border border-red-600 rounded-lg p-6 w-80">
            <h3 className="text-lg font-medium mb-4 flex items-center text-red-400">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              Delete Item
            </h3>
            <div className="mb-6">
              <p className="text-gray-300">Are you sure you want to delete:</p>
              <p className="font-medium mt-2 text-gray-200">{fileToDelete.split("/").pop()}</p>
              <p className="text-xs text-red-400 mt-3">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={onDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                onClick={onDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-80">
            <h3 className="text-lg font-medium mb-4 text-gray-200">Rename Item</h3>
            <div className="mb-6">
              <input
                type="text"
                placeholder="New name"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                value={newName}
                onChange={(e) => onNewNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                onClick={onRenameCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                onClick={onRenameSubmit}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileManagerModals;
