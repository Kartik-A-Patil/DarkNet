import { DBSchema } from 'idb';

// Define FileType enum
export enum FileType {
  DIRECTORY = 'directory',
  FILE = 'file',
  SYMLINK = 'symlink',
  EXECUTABLE = 'executable'
}

// FileSystemNode interface
export interface FileSystemNode {
  type: FileType;
  permissions: string;
  owner: string;
  content?: string;
  children?: { [key: string]: FileSystemNode };
  lastModified?: Date;
  symlink?: string;
  lastAccessed?: Date;
  metadata?: Record<string, unknown>;
}

// Database schema interface
export interface FilesystemDBSchema extends DBSchema {
  filesystem: {
    key: string; // Path string
    value: FileSystemNode;
  };
}

// Constants
export const DB_NAME = 'darknet_filesystem';
export const DB_VERSION = 1;
export const STORE_NAME = 'filesystem';
