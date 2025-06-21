import { IDBPObjectStore } from 'idb';
import { FileSystemNode, FileType, FilesystemDBSchema, STORE_NAME } from './types';
import { initFileSystemDB, getFromCache, addToCache, invalidateCache } from './db';

/**
 * Get the root node of the filesystem
 */
export const getFileSystemRoot = async (): Promise<FileSystemNode | undefined> => {
  const cachedRoot = getFromCache('/');
  if (cachedRoot) return cachedRoot;
  
  const db = await initFileSystemDB();
  const root = await db.get(STORE_NAME, '/');
  
  if (root) {
    addToCache('/', root);
  }
  
  return root;
};

/**
 * Get a node by its path
 */
export const getNodeByPath = async (path: string): Promise<FileSystemNode | undefined> => {
  try {
    // Handle empty or invalid paths
    if (!path) return undefined;
    
    // Normalize path (remove trailing slash except for root)
    const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');
    
    // Check cache first
    const cachedNode = getFromCache(normalizedPath);
    if (cachedNode) return cachedNode;

    const db = await initFileSystemDB();
    const node = await db.get(STORE_NAME, normalizedPath);

    if (node) {
      addToCache(normalizedPath, node);
    }

    return node;
  } catch (err) {
    console.error(`Error in getNodeByPath for path ${path}:`, err);
    return undefined;
  }
};

/**
 * Get node's children
 */
export const getNodeChildren = async (path: string): Promise<{ [key: string]: FileSystemNode }> => {
  try {
    // Normalize path (remove trailing slash except for root)
    const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');
    
    // Try to get from cache first
    const node = await getNodeByPath(normalizedPath);
    
    if (!node || node.type !== FileType.DIRECTORY) {
      return {};
    }
    
    return node.children || {};
  } catch (err) {
    console.error(`Error in getNodeChildren for path ${path}:`, err);
    return {};
  }
};

/**
 * Update a node by its path
 */
export const updateNodeByPath = async (path: string, updates: Partial<FileSystemNode>): Promise<boolean> => {
  try {
    const db = await initFileSystemDB();
    const node = await getNodeByPath(path);
    
    if (!node) return false;
    
    const updatedNode = { ...node, ...updates, lastModified: new Date() };
    
    // Start a transaction for better performance when updating both the node and its parent
    const tx = db.transaction(STORE_NAME, 'readwrite');
    
    // Update the node
    await tx.objectStore(STORE_NAME).put(updatedNode, path);
    
    // Update parent's reference to this node
    if (path !== '/') {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const nodeName = path.split('/').filter(Boolean).pop() || '';
      
      const parentNode = await getNodeByPath(parentPath);
      if (parentNode && parentNode.children) {
        parentNode.children[nodeName] = updatedNode;
        await tx.objectStore(STORE_NAME).put(parentNode, parentPath);
        
        // Update cache
        addToCache(parentPath, parentNode);
      }
    }
    
    // Commit the transaction
    await tx.done;
    
    // Invalidate cache for this path
    invalidateCache(path);
    
    // Update the node in cache
    addToCache(path, updatedNode);
    
    return true;
  } catch (error) {
    console.error('Error updating node:', error);
    return false;
  }
};

/**
 * Add a new node
 */
export const addNodeByPath = async (path: string, nodeData: FileSystemNode): Promise<boolean> => {
  try {
    if (path === '/') return false; // Cannot replace root
    
    const db = await initFileSystemDB();
    
    // Check if node already exists
    const existingNode = await getNodeByPath(path);
    if (existingNode) return false;
    
    // Get parent path and ensure parent exists
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const nodeName = path.split('/').filter(Boolean).pop() || '';
    
    const parentNode = await getNodeByPath(parentPath);
    if (!parentNode || parentNode.type !== FileType.DIRECTORY) return false;
    
    // Start a transaction for atomicity
    const tx = db.transaction(STORE_NAME, 'readwrite');
    
    // Add node to database
    await tx.objectStore(STORE_NAME).put(nodeData, path);
    
    // Update parent's children
    if (!parentNode.children) parentNode.children = {};
    parentNode.children[nodeName] = nodeData;
    await tx.objectStore(STORE_NAME).put(parentNode, parentPath);
    
    // Commit the transaction
    await tx.done;
    
    // Update cache
    addToCache(path, nodeData);
    addToCache(parentPath, parentNode);
    
    return true;
  } catch (error) {
    console.error('Error adding node:', error);
    return false;
  }
};

/**
 * Helper function to recursively delete a node and all its children
 */
async function deleteNodeAndChildren(
  path: string, 
  node: FileSystemNode, 
  store?: IDBPObjectStore<FilesystemDBSchema, ["filesystem"], "filesystem">
): Promise<void> {
  const db = store || (await initFileSystemDB()).transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
  
  // Delete this node
  await db.delete(path);
  
  // If directory, recursively delete children
  if (node.type === FileType.DIRECTORY && node.children) {
    const promises = Object.entries(node.children).map(([childName, childNode]) => {
      const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
      return deleteNodeAndChildren(childPath, childNode, db);
    });
    
    await Promise.all(promises);
  }
  
  // Invalidate cache for this path
  invalidateCache(path);
}

/**
 * Delete a node
 */
export const deleteNodeByPath = async (path: string): Promise<boolean> => {
  try {
    if (path === '/') return false; // Cannot delete root
    
    const db = await initFileSystemDB();
    
    // Check if node exists
    const node = await getNodeByPath(path);
    if (!node) return false;
    
    // Get parent path
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const nodeName = path.split('/').filter(Boolean).pop() || '';
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Remove from parent's children
    const parentNode = await getNodeByPath(parentPath);
    if (parentNode && parentNode.children && parentNode.children[nodeName]) {
      delete parentNode.children[nodeName];
      await store.put(parentNode, parentPath);
    }
    
    // Delete node and all its children recursively
    if (node) {
      await deleteNodeAndChildren(path, node, store);
    }
    
    // Commit the transaction
    await tx.done;
    
    // Invalidate cache entries
    invalidateCache(path);
    if (parentNode) {
      addToCache(parentPath, parentNode);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting node:', error);
    return false;
  }
};

// Export deleteNodeAndChildren for use in advanced operations
export { deleteNodeAndChildren };
