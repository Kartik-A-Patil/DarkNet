// Types for the Text Editor
export interface EditorTab {
  id: string;
  filePath: string | null;
  content: string;
  saved: boolean;
  language: string;
  fileName: string;
}

export interface TextEditorProps {
  filePath?: string;
  initialContent?: string;
}

export type ViewMode = 'editor' | 'preview' | 'split';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  theme: 'dark' | 'light';
}

export interface FileOperation {
  type: 'open' | 'save' | 'saveAs' | 'new';
  tabId?: string;
  path?: string;
}
