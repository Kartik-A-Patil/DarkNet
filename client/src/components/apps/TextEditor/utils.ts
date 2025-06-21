// Utility functions for the Text Editor
import { EditorTab, EditorSettings } from './types';

export const getFileLanguage = (filePath?: string | null): string => {
  if (!filePath) return "text";

  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "c":
    case "cpp":
    case "h":
    case "hpp":
      return "cpp";
    case "html":
    case "htm":
    case "xml":
      return "html";
    case "css":
    case "scss":
    case "sass":
      return "css";
    case "md":
      return "markdown";
    case "json":
      return "json";
    case "rs":
      return "rust";
    case "sql":
      return "sql";
    case "sh":
    case "bash":
      return "sh";
    case "yaml":
    case "yml":
      return "yaml";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "java":
      return "java";
    default:
      return "text";
  }
};

export const getLanguageIcon = (language: string): string => {
  switch (language) {
    case "javascript":
      return "fa-js text-yellow-400";
    case "typescript":
      return "fa-code text-blue-400";
    case "python":
      return "fa-python text-blue-400";
    case "html":
      return "fa-html5 text-orange-400";
    case "css":
      return "fa-css3 text-blue-500";
    case "markdown":
      return "fa-markdown text-purple-400";
    case "json":
      return "fa-code text-green-400";
    case "cpp":
    case "c":
      return "fa-code text-blue-600";
    default:
      return "fa-file-code text-gray-400";
  }
};

export const createNewTab = (path?: string, content: string = ""): EditorTab => {
  const newTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: newTabId,
    filePath: path || null,
    content,
    saved: path ? true : false,
    language: getFileLanguage(path),
    fileName: path ? path.split("/").pop() || "Untitled" : "Untitled"
  };
};

export const getFileExtensions = (): string[] => [
  'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'htm', 
  'css', 'scss', 'sass', 'json', 'xml', 'sql', 'sh', 'bash', 
  'c', 'cpp', 'h', 'hpp', 'rs', 'java', 'php', 'rb', 'go', 
  'yaml', 'yml', 'vue', 'svelte', 'dart', 'kt', 'swift'
];

export const isTabUnsaved = (tab: EditorTab): boolean => {
  return !tab.saved && tab.content.trim().length > 0;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getShortcutText = (shortcut: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return shortcut.replace('Ctrl', isMac ? 'Cmd' : 'Ctrl');
};

// Settings persistence utilities
const SETTINGS_STORAGE_KEY = 'texteditor-settings';

export const loadSettings = (): Partial<EditorSettings> => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load editor settings:', error);
    return {};
  }
};

export const saveSettings = (settings: EditorSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save editor settings:', error);
  }
};

export const getDefaultSettings = (): EditorSettings => ({
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,
  theme: 'dark'
});
