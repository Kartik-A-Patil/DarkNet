import React from 'react';
import { EditorSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: EditorSettings;
  onClose: () => void;
  onSettingsChange: (settings: EditorSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  onClose,
  onSettingsChange
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof EditorSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 rounded-t-lg border-b border-gray-600 sticky top-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Editor Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Size
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleChange('fontSize', Math.max(10, settings.fontSize - 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                disabled={settings.fontSize <= 10}
              >
                -
              </button>
              <input
                type="range"
                min="10"
                max="28"
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => handleChange('fontSize', Math.min(28, settings.fontSize + 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                disabled={settings.fontSize >= 28}
              >
                +
              </button>
              <span className="text-gray-300 text-sm w-12 text-center">{settings.fontSize}px</span>
              <button
                onClick={() => handleChange('fontSize', 14)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
                title="Reset to default (14px)"
              >
                Reset
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tab Size
            </label>
            <select
              value={settings.tabSize}
              onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value as 'dark' | 'light')}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Show Line Numbers
              </label>
              <button
                onClick={() => handleChange('lineNumbers', !settings.lineNumbers)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.lineNumbers ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.lineNumbers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Word Wrap
              </label>
              <button
                onClick={() => handleChange('wordWrap', !settings.wordWrap)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.wordWrap ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.wordWrap ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Show Minimap
              </label>
              <button
                onClick={() => handleChange('minimap', !settings.minimap)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.minimap ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.minimap ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Settings Preview */}
          <div className="bg-gray-700 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
            <div className="flex space-x-2">
              <div 
                className="bg-gray-900 p-2 rounded text-xs font-mono flex-1"
                style={{ fontSize: `${settings.fontSize}px` }}
              >
                <span className="text-blue-400">function</span>{' '}
                <span className="text-yellow-300">example</span>() {'{'}<br />
                {settings.lineNumbers && <span className="text-gray-500 mr-2">1</span>}
                <span style={{ marginLeft: `${settings.tabSize * 8}px` }}>
                  <span className="text-purple-400">return</span>{' '}
                  <span className="text-green-400">"Hello World"</span>;
                </span><br />
                {settings.lineNumbers && <span className="text-gray-500 mr-2">2</span>}
                {'}'}
              </div>
              
              {settings.minimap && (
                <div className="w-6 bg-gray-900 rounded border-l border-gray-600">
                  <div className="text-xs text-gray-600 p-1 font-mono" style={{ fontSize: '4px', lineHeight: '6px' }}>
                    fn ex()<br />
                    ret "H"<br />
                    {'}'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Font: {settings.fontSize}px • Tab: {settings.tabSize} spaces • Theme: {settings.theme}
              {settings.minimap && ' • Minimap enabled'}
              {settings.wordWrap && ' • Word wrap on'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 rounded-b-lg border-t border-gray-600 sticky bottom-0">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Settings are saved automatically</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
