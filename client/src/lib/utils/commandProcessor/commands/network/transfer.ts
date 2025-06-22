import { Command, CommandResult, CommandOptions } from '../../types';
import { formatError, formatSuccess, formatOutput } from '../../utils/formatOutput';
import {
  saveNetworkNode,
  logNetworkAccess,
  generateNodeId,
  generateTransferId,
  saveNetworkTransfer,
  getNetworkNodeByPath,
  NetworkNode,
  NetworkTransfer
} from '../../../../../lib/networkFileSystem';

// Import the connected device state from the main network commands
// This is a simple way to share state - in a real app you might use context or a state manager
let connectedDevice: any = null;
let currentNetworkPath = '/';

// Set these from the main network commands file
export const setNetworkState = (device: any, path: string) => {
  connectedDevice = device;
  currentNetworkPath = path;
};

export const nettransfer: Command = {
  name: 'nettransfer',
  description: 'Transfer files between local and network devices',
  usage: 'nettransfer <source> <destination> [--to-local|--to-network]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length < 2) {
      return {
        output: formatError('Usage: nettransfer <source> <destination> [--to-local|--to-network]\n\nExamples:\n  nettransfer /home/user/file.txt /shared/file.txt --to-network\n  nettransfer /shared/data.txt /home/user/downloads/data.txt --to-local'),
        error: true
      };
    }

    const source = args[0];
    const destination = args[1];
    const toLocal = args.includes('--to-local');
    const toNetwork = args.includes('--to-network');

    if (!toLocal && !toNetwork) {
      return {
        output: formatError('Please specify transfer direction with --to-local or --to-network'),
        error: true
      };
    }

    if (toLocal && toNetwork) {
      return {
        output: formatError('Cannot specify both --to-local and --to-network'),
        error: true
      };
    }

    try {
      const transferId = generateTransferId();
      
      if (toNetwork) {
        // Transfer FROM local TO network
        const fileName = source.split('/').pop() || 'file';
        const networkPath = destination.startsWith('/') ? destination : 
          currentNetworkPath === '/' ? `/${destination}` : `${currentNetworkPath}/${destination}`;
        
        // Check if destination already exists
        const existingNode = await getNetworkNodeByPath(connectedDevice.id, networkPath);
        if (existingNode) {
          return {
            output: formatError(`Destination already exists: ${networkPath}\n\nUse a different name or remove the existing file first.`),
            error: true
          };
        }

        // Create transfer record
        const transfer: NetworkTransfer = {
          id: transferId,
          sourceDeviceId: 'local',
          targetDeviceId: connectedDevice.id,
          sourcePath: source,
          targetPath: networkPath,
          fileName,
          size: 0,
          status: 'transferring',
          progress: 0,
          started: new Date()
        };
        
        await saveNetworkTransfer(transfer);
        
        // Simulate reading local file (in real implementation, this would use the local file system)
        let content: string;
        try {
          // Try to read from local file system
          const localNode = await options.fileSystem.getNodeFromPath(source);
          if (!localNode || localNode.type !== 'file') {
            throw new Error('Local file not found or is not a file');
          }
          content = localNode.content || 'File content from local filesystem';
        } catch (err) {
          // Fallback to simulated content
          content = `File transferred from local path: ${source}\nTransfer ID: ${transferId}\nTimestamp: ${new Date().toISOString()}\n\nThis is simulated content since we cannot directly access the local file system.`;
        }
        
        // Create the file on network device
        const networkNode: NetworkNode = {
          id: generateNodeId(connectedDevice.id, networkPath),
          name: fileName,
          path: networkPath,
          type: 'file',
          size: content.length,
          content: content,
          mimeType: 'text/plain',
          permissions: 'rw-r--r--',
          owner: 'user',
          created: new Date(),
          modified: new Date(),
          deviceId: connectedDevice.id,
          deviceIp: connectedDevice.ip
        };
        
        await saveNetworkNode(networkNode);
        
        // Update transfer as completed
        transfer.status = 'completed';
        transfer.progress = 100;
        transfer.size = content.length;
        transfer.completed = new Date();
        await saveNetworkTransfer(transfer);
        
        await logNetworkAccess(connectedDevice.id, 'transfer_from_local', networkPath, {
          transferId,
          sourcePath: source,
          size: content.length,
          terminal: true
        });
        
        return {
          output: formatSuccess(`File transferred successfully!\n\nTransfer ID: ${transferId}\nSource: ${source} (local)\nDestination: ${networkPath} (${connectedDevice.name})\nSize: ${content.length} bytes`),
          error: false
        };
        
      } else {
        // Transfer FROM network TO local
        const sourcePath = source.startsWith('/') ? source : 
          currentNetworkPath === '/' ? `/${source}` : `${currentNetworkPath}/${source}`;
        
        const networkNode = await getNetworkNodeByPath(connectedDevice.id, sourcePath);
        if (!networkNode || networkNode.type !== 'file') {
          return {
            output: formatError(`Source file not found on network device: ${sourcePath}`),
            error: true
          };
        }
        
        // Create transfer record
        const transfer: NetworkTransfer = {
          id: transferId,
          sourceDeviceId: connectedDevice.id,
          targetDeviceId: 'local',
          sourcePath: sourcePath,
          targetPath: destination,
          fileName: networkNode.name,
          size: networkNode.size || 0,
          status: 'transferring',
          progress: 50,
          started: new Date()
        };
        
        await saveNetworkTransfer(transfer);
        
        // Simulate writing to local file system
        try {
          const content = typeof networkNode.content === 'string' ? networkNode.content : 'Binary file content';
          
          // Try to write to local file system
          await options.fileSystem.writeFile(destination, content);
          
          // Update transfer as completed
          transfer.status = 'completed';
          transfer.progress = 100;
          transfer.completed = new Date();
          await saveNetworkTransfer(transfer);
          
          await logNetworkAccess(connectedDevice.id, 'transfer_to_local', sourcePath, {
            transferId,
            targetPath: destination,
            size: networkNode.size,
            terminal: true
          });
          
          return {
            output: formatSuccess(`File transferred successfully!\n\nTransfer ID: ${transferId}\nSource: ${sourcePath} (${connectedDevice.name})\nDestination: ${destination} (local)\nSize: ${networkNode.size || 0} bytes`),
            error: false
          };
          
        } catch (err) {
          // Mark transfer as failed
          transfer.status = 'failed';
          transfer.error = err instanceof Error ? err.message : 'Failed to write to local file';
          await saveNetworkTransfer(transfer);
          
          return {
            output: formatError(`Failed to write to local file system: ${err instanceof Error ? err.message : 'Unknown error'}\n\nTransfer ID: ${transferId} marked as failed.`),
            error: true
          };
        }
      }
    } catch (error: any) {
      return {
        output: formatError(`Transfer failed: ${error.message}`),
        error: true
      };
    }
  }
};

export const netcp: Command = {
  name: 'netcp',
  description: 'Copy files on network device (alias for internal network copy)',
  usage: 'netcp <source> <destination>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length < 2) {
      return {
        output: formatError('Usage: netcp <source> <destination>'),
        error: true
      };
    }

    if (connectedDevice.accessLevel === 'read-only') {
      return {
        output: formatError('Permission denied: Device is in read-only mode'),
        error: true
      };
    }

    try {
      const source = args[0];
      const destination = args[1];
      
      const sourcePath = source.startsWith('/') ? source : 
        currentNetworkPath === '/' ? `/${source}` : `${currentNetworkPath}/${source}`;
        
      const destPath = destination.startsWith('/') ? destination : 
        currentNetworkPath === '/' ? `/${destination}` : `${currentNetworkPath}/${destination}`;
      
      // Get source file
      const sourceNode = await getNetworkNodeByPath(connectedDevice.id, sourcePath);
      if (!sourceNode) {
        return {
          output: formatError(`Source file not found: ${sourcePath}`),
          error: true
        };
      }
      
      if (sourceNode.type !== 'file') {
        return {
          output: formatError(`Source is not a file: ${sourcePath}`),
          error: true
        };
      }
      
      // Check if destination exists
      const destNode = await getNetworkNodeByPath(connectedDevice.id, destPath);
      if (destNode) {
        return {
          output: formatError(`Destination already exists: ${destPath}`),
          error: true
        };
      }
      
      // Create copy
      const destFileName = destPath.split('/').pop() || sourceNode.name;
      const copyNode: NetworkNode = {
        id: generateNodeId(connectedDevice.id, destPath),
        name: destFileName,
        path: destPath,
        type: 'file',
        size: sourceNode.size,
        content: sourceNode.content,
        mimeType: sourceNode.mimeType,
        permissions: sourceNode.permissions,
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: connectedDevice.id,
        deviceIp: connectedDevice.ip
      };
      
      await saveNetworkNode(copyNode);
      await logNetworkAccess(connectedDevice.id, 'terminal_cp', destPath, {
        sourcePath,
        size: sourceNode.size,
        terminal: true
      });
      
      return {
        output: formatSuccess(`File copied: ${sourcePath} → ${destPath}`),
        error: false
      };
      
    } catch (error: any) {
      return {
        output: formatError(`Copy failed: ${error.message}`),
        error: true
      };
    }
  }
};
