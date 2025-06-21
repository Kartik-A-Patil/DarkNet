export interface FileManagerState {
  currentPath: string;
  selectedFile: string | null;
  history: string[];
  historyIndex: number;
  viewMode: "grid" | "list";
  showHiddenFiles: boolean;
  isLoading: boolean;
}

export interface ContextMenuAction {
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface EmptySpaceContextMenu {
  createActions: ContextMenuAction[];
  pasteActions: ContextMenuAction[];
  viewActions: ContextMenuAction[];
  systemActions: ContextMenuAction[];
}

export interface FileManagerActions {
  navigateTo: (path: string, addToHistory?: boolean) => Promise<void>;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;
  navigateToHome: () => void;
  handleClick: (name: string) => void;
  handleDoubleClick: (name: string, node: any) => void;
  handleContextMenu: (e: React.MouseEvent, name: string, node: any) => void;
  handleEmptySpaceContextMenu: (e: React.MouseEvent) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setShowHiddenFiles: (show: boolean) => void;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FileAction {
  openFile: (name: string, node: any) => void;
  openWithTextEditor: (path: string) => Promise<void>;
  openWithBrowser: (path: string) => Promise<void>;
  openInTerminal: (path: string) => Promise<void>;
  executeFile: (path: string) => void;
  copyFile: (path: string) => void;
  cutFile: (path: string) => void;
  renameFile: (path: string) => void;
  deleteFile: (path: string) => Promise<void>;
  createNewFolder: () => void;
  createNewFile: () => void;
  createNewHtmlFile: () => void;
  createNewCssFile: () => void;
  createNewJsFile: () => void;
  createNewMarkdownFile: () => void;
  showProperties: (path: string) => void;
  refreshDirectory: () => void;
  selectAllFiles: () => void;
  pasteFiles: () => void;
  isHtmlFile: (fileName: string) => boolean;
}
