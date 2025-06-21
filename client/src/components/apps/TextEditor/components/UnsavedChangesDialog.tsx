import React from 'react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  fileName: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  fileName,
  onSave,
  onDontSave,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <i className="fa fa-exclamation-triangle text-yellow-400 text-xl mr-3"></i>
            <h3 className="text-lg font-semibold text-white">Unsaved Changes</h3>
          </div>
          
          <p className="text-gray-300 mb-6">
            Do you want to save the changes to <span className="text-blue-400 font-medium">"{fileName}"</span> before closing?
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onDontSave}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
            >
              Don't Save
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
