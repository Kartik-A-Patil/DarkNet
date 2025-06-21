import { FileSystemNode, FileType, STORE_NAME } from './types';
import { initFileSystemDB, addToCache, invalidateCache } from './db';
import { getNodeByPath, deleteNodeAndChildren } from './operations';

/**
 * Helper function to recursively add children nodes to the database
 */
export async function addChildrenToDB(
  parentPath: string, 
  parentNode: FileSystemNode, 
  store?: any
): Promise<void> {
  if (!parentNode.children) return;
  
  const db = store || (await initFileSystemDB()).transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
  
  // Use Promise.all to perform operations in parallel for better performance
  const promises = Object.entries(parentNode.children).map(async ([childName, childNode]) => {
    const childPath = parentPath === '/' ? `/${childName}` : `${parentPath}/${childName}`;
    await db.put(childNode, childPath);
    addToCache(childPath, childNode);
    
    if (childNode.type === FileType.DIRECTORY && childNode.children) {
      await addChildrenToDB(childPath, childNode, db);
    }
  });
  
  await Promise.all(promises);
}

/**
 * Move a node from one path to another
 */
export const moveNode = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    if (sourcePath === '/' || destPath === '/' || sourcePath === destPath) return false;
    
    // Get the source node
    const sourceNode = await getNodeByPath(sourcePath);
    if (!sourceNode) return false;
    
    // Get destination parent path and node name
    const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    const destNodeName = destPath.split('/').filter(Boolean).pop() || '';
    
    // Get destination parent node
    const destParentNode = await getNodeByPath(destParentPath);
    if (!destParentNode || destParentNode.type !== FileType.DIRECTORY) return false;
    
    // Check if destination already exists
    const destExists = await getNodeByPath(destPath);
    if (destExists) return false;
    
    // Begin transaction
    const db = await initFileSystemDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Copy node to new location
    await store.put(sourceNode, destPath);
    
    // Update destination parent's children
    if (!destParentNode.children) destParentNode.children = {};
    destParentNode.children[destNodeName] = sourceNode;
    await store.put(destParentNode, destParentPath);
    
    // Delete the original node
    const sourceParentPath = sourcePath.substring(0, sourcePath.lastIndexOf('/')) || '/';
    const sourceNodeName = sourcePath.split('/').filter(Boolean).pop() || '';
    
    const sourceParentNode = await getNodeByPath(sourceParentPath);
    if (sourceParentNode && sourceParentNode.children) {
      delete sourceParentNode.children[sourceNodeName];
      await store.put(sourceParentNode, sourceParentPath);
    }
    
    // Recursively delete the original node and its children from DB
    await deleteNodeAndChildren(sourcePath, sourceNode, store);
    
    // Recursively add the node at its new location
    if (sourceNode.type === FileType.DIRECTORY && sourceNode.children) {
      await addChildrenToDB(destPath, sourceNode, store);
    }
    
    // Commit transaction
    await tx.done;
    
    // Update cache
    invalidateCache(sourcePath);
    invalidateCache(destPath);
    addToCache(destPath, sourceNode);
    
    return true;
  } catch (error) {
    console.error('Error moving node:', error);
    return false;
  }
};

/**
 * Copy a node from one path to another
 */
export const copyNode = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    if (sourcePath === '/' || sourcePath === destPath) return false;
    
    // Get the source node
    const sourceNode = await getNodeByPath(sourcePath);
    if (!sourceNode) return false;
    
    // Create a deep copy of the node
    const nodeCopy = JSON.parse(JSON.stringify(sourceNode));
    
    // Update modification time on the copy
    nodeCopy.lastModified = new Date();
    
    // Get destination parent path and node name
    const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    const destNodeName = destPath.split('/').filter(Boolean).pop() || '';
    
    // Get destination parent node
    const destParentNode = await getNodeByPath(destParentPath);
    if (!destParentNode || destParentNode.type !== FileType.DIRECTORY) return false;
    
    // Check if destination already exists
    const destExists = await getNodeByPath(destPath);
    if (destExists) return false;
    
    // Begin transaction
    const db = await initFileSystemDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Add the copy to the new location
    await store.put(nodeCopy, destPath);
    
    // Update destination parent's children
    if (!destParentNode.children) destParentNode.children = {};
    destParentNode.children[destNodeName] = nodeCopy;
    await store.put(destParentNode, destParentPath);
    
    // If it's a directory, recursively copy children
    if (nodeCopy.type === FileType.DIRECTORY && nodeCopy.children) {
      await addChildrenToDB(destPath, nodeCopy, store);
    }
    
    // Commit transaction
    await tx.done;
    
    // Update cache
    invalidateCache(destPath);
    addToCache(destPath, nodeCopy);
    
    return true;
  } catch (error) {
    console.error('Error copying node:', error);
    return false;
  }
};

/**
 * Search the filesystem for files/directories matching a pattern
 */
export const searchFileSystem = async (searchPattern: string, startPath: string = '/'): Promise<string[]> => {
  const results: string[] = [];
  const pattern = new RegExp(searchPattern, 'i');
  
  // Recursive helper function
  const searchNode = async (nodePath: string): Promise<void> => {
    const node = await getNodeByPath(nodePath);
    if (!node) return;
    
    // Check if current node name matches
    const nodeName = nodePath.split('/').filter(Boolean).pop() || '';
    if (pattern.test(nodeName)) {
      results.push(nodePath);
    }
    
    // If it's a file with content, search in content too
    if (node.type === FileType.FILE && node.content && pattern.test(node.content)) {
      if (!results.includes(nodePath)) {
        results.push(nodePath);
      }
    }
    
    // Recursively search children if it's a directory
    if (node.type === FileType.DIRECTORY && node.children) {
      const promises = Object.keys(node.children).map(childName => {
        const childPath = nodePath === '/' ? `/${childName}` : `${nodePath}/${childName}`;
        return searchNode(childPath);
      });
      await Promise.all(promises);
    }
  };
  
  await searchNode(startPath);
  return results;
};
