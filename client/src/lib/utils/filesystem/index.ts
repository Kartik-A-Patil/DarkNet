// Re-export all types
export * from './types';

// Re-export database functions
export {
  initFileSystemDB,
  getFromCache,
  addToCache,
  invalidateCache,
  clearCache
} from './db';

// Re-export core operations
export {
  getFileSystemRoot,
  getNodeByPath,
  getNodeChildren,
  updateNodeByPath,
  addNodeByPath,
  deleteNodeByPath
} from './operations';

// Re-export advanced operations
export {
  addChildrenToDB,
  moveNode,
  copyNode,
  searchFileSystem
} from './advanced-operations';

// Re-export seeding functionality
export {
  seedFileSystemIfEmpty
} from './seed';
