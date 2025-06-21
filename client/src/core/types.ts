/**
 * Represents storage information about a peer in the network
 */
export interface PeerStorageInfo {
  nodeId: string;
  availableStorage: number; // In bytes
  totalStorage: number; // In bytes
  isOnline: boolean;
  latency?: number; // In milliseconds
  reliability?: number; // 0-1 score based on uptime
  lastSeen?: Date;
}

/**
 * Represents a chunk of a file
 */
export interface FileChunk {
  chunkId: string; // SHA-256 hash of the chunk
  fileId: string;  // Parent file ID
  index: number;   // Position in the file
  data: ArrayBuffer; // The actual chunk data
  size: number;    // Size in bytes
}

/**
 * Represents metadata about where a chunk is stored
 */
export interface ChunkPlacement {
  chunkId: string;
  nodeIds: string[]; // List of peers storing this chunk
  encrypted: boolean;
  checksum: string; // Verification hash
}

/**
 * Represents a complete file's metadata
 */
export interface FileMetadata {
  fileId: string;
  filename: string;
  path: string;
  size: number;
  mimeType?: string;
  created: Date;
  modified: Date;
  owner: string;
  permissions?: string;
  chunks: ChunkPlacement[];
  redundancyLevel: number; // Minimum number of copies
  encrypted: boolean;
  encryptionKeyId?: string; // Reference to encryption key
}

/**
 * Configuration for the distributed file system
 */
export interface DFSConfig {
  chunkSize: number; // Size of chunks in bytes
  minRedundancy: number; // Minimum number of copies per chunk
  maxRedundancy: number; // Maximum number of copies per chunk
  quotaPerPeer: number; // Maximum storage per peer in bytes
  syncInterval: number; // Time between sync checks in ms
  encryptChunks: boolean; // Whether to encrypt chunks
  useCloudFallback: boolean; // Whether to use cloud fallback
  useRelay: boolean; // Whether to use relay server
}

/**
 * Database schema for the DFS
 */
export interface DFSSchema extends DBSchema {
  fileMetadata: {
    key: string; // fileId
    value: FileMetadata;
  };
  chunks: {
    key: string; // chunkId
    value: FileChunk;
  };
  peerInfo: {
    key: string; // nodeId
    value: PeerStorageInfo;
  };
  config: {
    key: string;
    value: any;
  };
}

/**
 * Status of an operation
 */
export interface OperationStatus {
  success: boolean;
  message?: string;
  data?: any;
}

// Import this at the top of the file
import { DBSchema } from 'idb';
