import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NetworkDevice,
  NetworkNode,
  NetworkTransfer,
  NetworkShare,
  saveNetworkDevice,
  getNetworkDevice,
  getNetworkDeviceByIp,
  getAllNetworkDevices,
  deleteNetworkDevice,
  saveNetworkNode,
  getNetworkNode,
  getNetworkNodeByPath,
  getNetworkNodesByDevice,
  getNetworkDirectoryChildren,
  deleteNetworkNode,
  saveNetworkTransfer,
  getNetworkTransfer,
  getAllNetworkTransfers,
  logNetworkAccess,
  generateNodeId,
  generateTransferId,
  initializeSampleNetworkData,
  debugNetworkDatabase
} from './networkFileSystem';

export interface UseNetworkFileSystemReturn {
  // State
  networkDevices: NetworkDevice[];
  currentDevice: NetworkDevice | null;
  currentPath: string;
  currentNodes: NetworkNode[];
  isLoading: boolean;
  error: string | null;
  
  // Device operations
  connectToDevice: (ip: string) => Promise<NetworkDevice | null>;
  disconnectFromDevice: () => void;
  refreshDevices: () => Promise<void>;
  
  // Navigation
  navigateToPath: (deviceId: string, path: string) => Promise<NetworkNode[]>;
  navigateUp: () => Promise<void>;
  getCurrentDirectory: () => Promise<NetworkNode | null>;
  
  // File operations
  createFile: (name: string, content: string, mimeType?: string) => Promise<boolean>;
  createDirectory: (name: string) => Promise<boolean>;
  readFile: (nodeId: string) => Promise<string | null>;
  writeFile: (nodeId: string, content: string) => Promise<boolean>;
  deleteNode: (nodeId: string) => Promise<boolean>;
  renameNode: (nodeId: string, newName: string) => Promise<boolean>;
  
  // Transfer operations
  transferFileFromLocal: (localPath: string, targetPath: string, fileName: string) => Promise<string>;
  transferFileToLocal: (nodeId: string, localPath: string) => Promise<boolean>;
  getTransferStatus: (transferId: string) => Promise<NetworkTransfer | null>;
  getAllTransfers: () => Promise<NetworkTransfer[]>;
  
  // Utility
  getNodeIcon: (node: NetworkNode) => string;
  formatFileSize: (size: number) => string;
  getDeviceStatus: (device: NetworkDevice) => string;
}

export const useNetworkFileSystem = (): UseNetworkFileSystemReturn => {
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);
  const [currentDevice, setCurrentDevice] = useState<NetworkDevice | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [currentNodes, setCurrentNodes] = useState<NetworkNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);

  // Initialize the network file system
  useEffect(() => {
    console.log('useNetworkFileSystem: Starting initialization effect...');
    const initializeSystem = async () => {
      try {
        console.log('useNetworkFileSystem: Setting loading state...');
        setIsLoading(true);
        setError(null);
        
        console.log('useNetworkFileSystem: Initializing network file system...');
        await initializeSampleNetworkData();
        console.log('useNetworkFileSystem: Sample data initialized, running debug...');
        await debugNetworkDatabase();
        console.log('useNetworkFileSystem: Debug complete, refreshing devices...');
        await refreshDevices();
        console.log('useNetworkFileSystem: Network file system initialized successfully');
      } catch (err) {
        console.error('useNetworkFileSystem: Failed to initialize network file system:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
        setError(`Failed to initialize network file system: ${errorMessage}`);
      } finally {
        console.log('useNetworkFileSystem: Setting loading to false...');
        setIsLoading(false);
      }
    };

    initializeSystem();
    
    return () => {
      console.log('useNetworkFileSystem: Cleanup...');
      isMounted.current = false;
    };
  }, []);

  // Refresh available network devices
  const refreshDevices = useCallback(async () => {
    try {
      console.log('Refreshing network devices...');
      const devices = await getAllNetworkDevices();
      console.log('Found network devices:', devices.length);
      
      if (isMounted.current) {
        setNetworkDevices(devices);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error('Failed to refresh devices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown refresh error';
      setError(`Failed to refresh network devices: ${errorMessage}`);
    }
  }, []);

  // Connect to a network device by IP
  const connectToDevice = useCallback(async (ip: string): Promise<NetworkDevice | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const device = await getNetworkDeviceByIp(ip);
      if (!device) {
        setError(`No network device found at IP: ${ip}`);
        return null;
      }

      // Update last accessed time
      device.lastAccessed = new Date();
      await saveNetworkDevice(device);
      
      // Log access
      await logNetworkAccess(device.id, 'connect', '/', { ip });
      
      setCurrentDevice(device);
      setCurrentPath('/');
      
      // Load root directory
      const rootNodes = await getNetworkDirectoryChildren(device.id, '/');
      setCurrentNodes(rootNodes);
      
      return device;
    } catch (err) {
      console.error('Failed to connect to device:', err);
      setError(`Failed to connect to device at ${ip}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from current device
  const disconnectFromDevice = useCallback(() => {
    setCurrentDevice(null);
    setCurrentPath('/');
    setCurrentNodes([]);
    setError(null);
  }, []);

  // Navigate to a specific path on a device
  const navigateToPath = useCallback(async (deviceId: string, path: string): Promise<NetworkNode[]> => {
    try {
      setIsLoading(true);
      
      const nodes = await getNetworkDirectoryChildren(deviceId, path);
      
      if (isMounted.current) {
        setCurrentPath(path);
        setCurrentNodes(nodes);
        
        // Log navigation
        await logNetworkAccess(deviceId, 'navigate', path);
      }
      
      return nodes;
    } catch (err) {
      console.error('Failed to navigate to path:', err);
      setError(`Failed to navigate to ${path}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Navigate up one directory level
  const navigateUp = useCallback(async () => {
    if (!currentDevice || currentPath === '/') return;
    
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    await navigateToPath(currentDevice.id, parentPath);
  }, [currentDevice, currentPath, navigateToPath]);

  // Get current directory node
  const getCurrentDirectory = useCallback(async (): Promise<NetworkNode | null> => {
    if (!currentDevice) return null;
    
    const node = await getNetworkNodeByPath(currentDevice.id, currentPath);
    return node || null;
  }, [currentDevice, currentPath]);

  // Create a new file
  const createFile = useCallback(async (name: string, content: string, mimeType?: string): Promise<boolean> => {
    if (!currentDevice) return false;
    
    try {
      const filePath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      
      const fileNode: NetworkNode = {
        id: generateNodeId(currentDevice.id, filePath),
        name,
        path: filePath,
        type: 'file',
        size: content.length,
        content,
        mimeType: mimeType || 'text/plain',
        permissions: 'rw-r--r--',
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: currentDevice.id,
        deviceIp: currentDevice.ip
      };
      
      await saveNetworkNode(fileNode);
      await logNetworkAccess(currentDevice.id, 'create_file', filePath, { size: content.length });
      
      // Refresh current directory
      await navigateToPath(currentDevice.id, currentPath);
      
      return true;
    } catch (err) {
      console.error('Failed to create file:', err);
      setError(`Failed to create file: ${name}`);
      return false;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Create a new directory
  const createDirectory = useCallback(async (name: string): Promise<boolean> => {
    if (!currentDevice) return false;
    
    try {
      const dirPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      
      const dirNode: NetworkNode = {
        id: generateNodeId(currentDevice.id, dirPath),
        name,
        path: dirPath,
        type: 'directory',
        permissions: 'rwxr-xr-x',
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: currentDevice.id,
        deviceIp: currentDevice.ip,
        children: {}
      };
      
      await saveNetworkNode(dirNode);
      await logNetworkAccess(currentDevice.id, 'create_directory', dirPath);
      
      // Refresh current directory
      await navigateToPath(currentDevice.id, currentPath);
      
      return true;
    } catch (err) {
      console.error('Failed to create directory:', err);
      setError(`Failed to create directory: ${name}`);
      return false;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Read file content
  const readFile = useCallback(async (nodeId: string): Promise<string | null> => {
    try {
      const node = await getNetworkNode(nodeId);
      if (!node || node.type !== 'file') return null;
      
      await logNetworkAccess(node.deviceId, 'read_file', node.path, { size: node.size });
      
      return typeof node.content === 'string' ? node.content : null;
    } catch (err) {
      console.error('Failed to read file:', err);
      setError('Failed to read file');
      return null;
    }
  }, []);

  // Write file content
  const writeFile = useCallback(async (nodeId: string, content: string): Promise<boolean> => {
    try {
      const node = await getNetworkNode(nodeId);
      if (!node || node.type !== 'file') return false;
      
      node.content = content;
      node.size = content.length;
      node.modified = new Date();
      
      await saveNetworkNode(node);
      await logNetworkAccess(node.deviceId, 'write_file', node.path, { size: content.length });
      
      // Refresh current directory if the file is in current path
      if (currentDevice && node.deviceId === currentDevice.id) {
        const parentPath = node.path.substring(0, node.path.lastIndexOf('/')) || '/';
        if (parentPath === currentPath) {
          await navigateToPath(currentDevice.id, currentPath);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Failed to write file:', err);
      setError('Failed to write file');
      return false;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Delete a node (file or directory)
  const deleteNode = useCallback(async (nodeId: string): Promise<boolean> => {
    try {
      const node = await getNetworkNode(nodeId);
      if (!node) return false;
      
      await deleteNetworkNode(nodeId);
      await logNetworkAccess(node.deviceId, 'delete', node.path, { type: node.type });
      
      // Refresh current directory if the node was in current path
      if (currentDevice && node.deviceId === currentDevice.id) {
        const parentPath = node.path.substring(0, node.path.lastIndexOf('/')) || '/';
        if (parentPath === currentPath) {
          await navigateToPath(currentDevice.id, currentPath);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete node:', err);
      setError('Failed to delete item');
      return false;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Rename a node
  const renameNode = useCallback(async (nodeId: string, newName: string): Promise<boolean> => {
    try {
      const node = await getNetworkNode(nodeId);
      if (!node) return false;
      
      const oldPath = node.path;
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/')) || '/';
      const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;
      
      // Update node with new name and path
      node.name = newName;
      node.path = newPath;
      node.modified = new Date();
      
      // Delete old node and save new one
      await deleteNetworkNode(nodeId);
      node.id = generateNodeId(node.deviceId, newPath);
      await saveNetworkNode(node);
      
      await logNetworkAccess(node.deviceId, 'rename', oldPath, { newPath, newName });
      
      // Refresh current directory
      if (currentDevice && node.deviceId === currentDevice.id && parentPath === currentPath) {
        await navigateToPath(currentDevice.id, currentPath);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to rename node:', err);
      setError('Failed to rename item');
      return false;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Transfer file from local filesystem to network device
  const transferFileFromLocal = useCallback(async (
    localPath: string, 
    targetPath: string, 
    fileName: string
  ): Promise<string> => {
    if (!currentDevice) throw new Error('No device connected');
    
    const transferId = generateTransferId();
    
    try {
      // Create transfer record
      const transfer: NetworkTransfer = {
        id: transferId,
        sourceDeviceId: 'local',
        targetDeviceId: currentDevice.id,
        sourcePath: localPath,
        targetPath,
        fileName,
        size: 0, // Will be updated when we get the file
        status: 'pending',
        progress: 0,
        started: new Date()
      };
      
      await saveNetworkTransfer(transfer);
      
      // Simulate file transfer (in real implementation, this would read from local FS)
      transfer.status = 'transferring';
      transfer.progress = 50;
      await saveNetworkTransfer(transfer);
      
      // Create the file on the network device
      const networkPath = targetPath === '/' ? `/${fileName}` : `${targetPath}/${fileName}`;
      const mockContent = `File transferred from local path: ${localPath}\nTransfer ID: ${transferId}\nTimestamp: ${new Date().toISOString()}`;
      
      const fileNode: NetworkNode = {
        id: generateNodeId(currentDevice.id, networkPath),
        name: fileName,
        path: networkPath,
        type: 'file',
        size: mockContent.length,
        content: mockContent,
        mimeType: 'text/plain',
        permissions: 'rw-r--r--',
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: currentDevice.id,
        deviceIp: currentDevice.ip
      };
      
      await saveNetworkNode(fileNode);
      
      // Complete transfer
      transfer.status = 'completed';
      transfer.progress = 100;
      transfer.size = mockContent.length;
      transfer.completed = new Date();
      await saveNetworkTransfer(transfer);
      
      await logNetworkAccess(currentDevice.id, 'transfer_from_local', networkPath, {
        transferId,
        sourcePath: localPath,
        size: mockContent.length
      });
      
      // Refresh current directory if needed
      const parentPath = networkPath.substring(0, networkPath.lastIndexOf('/')) || '/';
      if (parentPath === currentPath) {
        await navigateToPath(currentDevice.id, currentPath);
      }
      
      return transferId;
    } catch (err) {
      // Mark transfer as failed
      const transfer = await getNetworkTransfer(transferId);
      if (transfer) {
        transfer.status = 'failed';
        transfer.error = err instanceof Error ? err.message : 'Unknown error';
        await saveNetworkTransfer(transfer);
      }
      
      console.error('Failed to transfer file from local:', err);
      throw err;
    }
  }, [currentDevice, currentPath, navigateToPath]);

  // Transfer file from network device to local filesystem
  const transferFileToLocal = useCallback(async (nodeId: string, localPath: string): Promise<boolean> => {
    try {
      const node = await getNetworkNode(nodeId);
      if (!node || node.type !== 'file') return false;
      
      const transferId = generateTransferId();
      
      const transfer: NetworkTransfer = {
        id: transferId,
        sourceDeviceId: node.deviceId,
        targetDeviceId: 'local',
        sourcePath: node.path,
        targetPath: localPath,
        fileName: node.name,
        size: node.size || 0,
        status: 'transferring',
        progress: 0,
        started: new Date()
      };
      
      await saveNetworkTransfer(transfer);
      
      // Simulate transfer progress
      transfer.progress = 100;
      transfer.status = 'completed';
      transfer.completed = new Date();
      await saveNetworkTransfer(transfer);
      
      await logNetworkAccess(node.deviceId, 'transfer_to_local', node.path, {
        transferId,
        targetPath: localPath,
        size: node.size
      });
      
      return true;
    } catch (err) {
      console.error('Failed to transfer file to local:', err);
      setError('Failed to transfer file to local system');
      return false;
    }
  }, []);

  // Get transfer status
  const getTransferStatus = useCallback(async (transferId: string): Promise<NetworkTransfer | null> => {
    try {
      const transfer = await getNetworkTransfer(transferId);
      return transfer || null;
    } catch (err) {
      console.error('Failed to get transfer status:', err);
      return null;
    }
  }, []);

  // Get all transfers
  const getAllTransfers = useCallback(async (): Promise<NetworkTransfer[]> => {
    try {
      return await getAllNetworkTransfers();
    } catch (err) {
      console.error('Failed to get transfers:', err);
      return [];
    }
  }, []);

  // Get icon for a network node
  const getNodeIcon = useCallback((node: NetworkNode): string => {
    if (node.type === 'directory') {
      return node.isShared ? 'fa-folder-open' : 'fa-folder';
    }
    
    if (!node.mimeType) return 'fa-file';
    
    if (node.mimeType.startsWith('text/')) return 'fa-file-text';
    if (node.mimeType.startsWith('image/')) return 'fa-file-image';
    if (node.mimeType.startsWith('video/')) return 'fa-file-video';
    if (node.mimeType.startsWith('audio/')) return 'fa-file-audio';
    if (node.mimeType === 'application/json') return 'fa-file-code';
    if (node.mimeType === 'application/pdf') return 'fa-file-pdf';
    
    return 'fa-file';
  }, []);

  // Format file size
  const formatFileSize = useCallback((size: number): string => {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get device status with color coding
  const getDeviceStatus = useCallback((device: NetworkDevice): string => {
    switch (device.status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }, []);

  return {
    // State
    networkDevices,
    currentDevice,
    currentPath,
    currentNodes,
    isLoading,
    error,
    
    // Device operations
    connectToDevice,
    disconnectFromDevice,
    refreshDevices,
    
    // Navigation
    navigateToPath,
    navigateUp,
    getCurrentDirectory,
    
    // File operations
    createFile,
    createDirectory,
    readFile,
    writeFile,
    deleteNode,
    renameNode,
    
    // Transfer operations
    transferFileFromLocal,
    transferFileToLocal,
    getTransferStatus,
    getAllTransfers,
    
    // Utility
    getNodeIcon,
    formatFileSize,
    getDeviceStatus
  };
};
