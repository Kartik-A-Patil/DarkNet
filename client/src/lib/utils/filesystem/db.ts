import { openDB, IDBPDatabase, IDBPObjectStore } from 'idb';
import { FilesystemDBSchema, FileSystemNode, DB_NAME, DB_VERSION, STORE_NAME } from './types';

// Database connection
let dbPromise: Promise<IDBPDatabase<FilesystemDBSchema>> | null = null;

// Cache configuration
const nodeCache = new Map<string, {node: FileSystemNode, timestamp: number}>();
const CACHE_TTL = 60000; // Cache entries expire after 1 minute

/**
 * Initialize the filesystem database
 */
export const initFileSystemDB = async (): Promise<IDBPDatabase<FilesystemDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<FilesystemDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

// Helper to check if a node is in cache and not expired
export const getFromCache = (path: string): FileSystemNode | undefined => {
  const cached = nodeCache.get(path);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.node;
  }
  // Remove expired item from cache
  if (cached) nodeCache.delete(path);
  return undefined;
};

// Helper to add a node to cache
export const addToCache = (path: string, node: FileSystemNode): void => {
  nodeCache.set(path, { node, timestamp: Date.now() });
};

// Clear cache entry and all children entries when a node is modified
export const invalidateCache = (path: string): void => {
  // Clear the exact path
  nodeCache.delete(path);
  
  // Clear any children paths
  const pathPrefix = path === '/' ? '/' : `${path}/`;
  for (const cachedPath of [...nodeCache.keys()]) {
    if (cachedPath.startsWith(pathPrefix)) {
      nodeCache.delete(cachedPath);
    }
  }

  // Also invalidate parent directory to update children listings
  if (path !== '/') {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    nodeCache.delete(parentPath);
  }
};

/**
 * Clear the cache (useful when needing to force a refresh)
 */
export const clearCache = (): void => {
  nodeCache.clear();
};
