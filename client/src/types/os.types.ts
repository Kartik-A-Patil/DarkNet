// File system types
export type FileType = "file" | "directory";

export interface FileSystemNode {
  type: FileType;
  content?: string;
  permissions?: string;
  owner?: string;
  lastModified?: Date;
  children?: { [key: string]: FileSystemNode };
  executable?: boolean;
  mimeType?: string;
  size?: number;
}

export interface FileSystem {
  [path: string]: FileSystemNode;
}

// Window types
export type WindowState = "normal" | "minimized" | "maximized";

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Window {
  id: string;
  title: string;
  app: AppType;
  icon: string;
  state: WindowState;
  position: WindowPosition;
  zIndex: number;
  isActive: boolean;
  props?: any; // For storing app-specific data
}

// App types
export type AppType =
  | "terminal"
  | "file-manager"
  | "text-editor"
  | "network-scanner"
  | "system-monitor"
  | "vulnerability-scanner"
  | "password-cracker"
  | "settings"
  | "control-panel"
  | "black-market"
  | "mailware"
  | "security-dashboard"
  | "animation-demo"
  | "social-feed"
  | "device-control"
  | "browser";

export interface AppInfo {
  type: AppType;
  title: string;
  icon: string;
  defaultSize: {
    width: number;
    height: number;
  };
}

// Desktop elements
export interface DesktopIcon {
  id: string;
  label: string;
  icon: string;
  app: AppType;
  position?: { x: number; y: number };
  path?: string; // For file shortcuts
}

export interface DesktopSettings {
  wallpaper: string;
  icons: DesktopIcon[];
  theme: "dark" | "light";
  accentColor: string;
}

// Terminal commands
export interface CommandResult {
  output: string;
  error?: boolean;
  clearScreen?: boolean;
  newPath?: string; // For updating path after cd command
}

// Network related types
export interface NetworkHost {
  ip: string;
  status: "online" | "offline";
  type?: string;
  ports?: number[];
  services?: { [port: number]: string };
  vulnerabilities?: string[];
}

export interface Network {
  hosts: { [ip: string]: NetworkHost };
}

// UI elements
export interface FileAction {
  name: string;
  icon: string;
  handler: (path: string) => void;
}

export interface ContextMenuOption {
  label: string;
  icon: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}

export type WallpaperOption = {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
};
