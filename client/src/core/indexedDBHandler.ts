import { openDB, IDBPDatabase } from 'idb';
import { FileChunk, FileMetadata, DFSConfig } from './types/dfsTypes';

const DB_NAME = 'darknet-dfs';
const DB_VERSION = 1;

// Database initialization
let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'chunkId' });
          chunkStore.createIndex('fileId', 'fileId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'fileId' });
        }
        
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
};

// File chunks operations
export const saveFileChunk = async (chunk: FileChunk): Promise<void> => {
  const db = await initDB();
  await db.put('chunks', chunk);
};

export const getFileChunk = async (chunkId: string): Promise<FileChunk | undefined> => {
  const db = await initDB();
  return await db.get('chunks', chunkId);
};

export const getFileChunks = async (fileId: string): Promise<FileChunk[]> => {
  const db = await initDB();
  const tx = db.transaction('chunks', 'readonly');
  const index = tx.store.index('fileId');
  return await index.getAll(fileId);
};

export const deleteFileChunk = async (chunkId: string): Promise<void> => {
  const db = await initDB();
  await db.delete('chunks', chunkId);
};

export const deleteFileChunks = async (fileId: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction('chunks', 'readwrite');
  const index = tx.store.index('fileId');
  const chunkKeys = await index.getAllKeys(fileId);
  
  for (const key of chunkKeys) {
    await tx.store.delete(key);
  }
  
  await tx.done;
};

// File metadata operations
export const saveFileMetadata = async (metadata: FileMetadata): Promise<void> => {
  const db = await initDB();
  await db.put('metadata', metadata);
};

export const getFileMetadata = async (fileId: string): Promise<FileMetadata | undefined> => {
  const db = await initDB();
  return await db.get('metadata', fileId);
};

export const getFileMetadataList = async (): Promise<FileMetadata[]> => {
  const db = await initDB();
  return await db.getAll('metadata');
};

// Alias for compatibility with existing code
export const getAllFileMetadata = getFileMetadataList;

export const deleteFileMetadata = async (fileId: string): Promise<void> => {
  const db = await initDB();
  await db.delete('metadata', fileId);
};

// Config operations
export const saveConfig = async (id: string, config: any): Promise<void> => {
  const db = await initDB();
  await db.put('config', { id, ...config });
};

export const getConfig = async (id: string): Promise<any | undefined> => {
  const db = await initDB();
  return await db.get('config', id);
};
