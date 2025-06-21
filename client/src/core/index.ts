// Export type definitions
export * from './types';

// Export core components
export { securityModule } from './security';

// Export database functions
export {
  saveFileMetadata,
  getFileMetadata,
  deleteFileMetadata,
  saveFileChunk,
  getFileChunk,
  getFileChunks,
  deleteFileChunk,
  deleteFileChunks,
  saveConfig,
  getConfig
} from './indexedDBHandler';


