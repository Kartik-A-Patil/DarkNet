export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  filePath?: string;
  isActive: boolean;
  isLoading: boolean;
  favicon?: string;
  content?: string;
  error?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  filePath?: string;
  folder?: string;
  createdAt: Date;
}
