import { Command, CommandResult, CommandOptions } from '../../types';
import { formatError, formatSuccess, formatOutput } from '../../utils/formatOutput';
import {
  getNetworkDeviceByIp,
  getAllNetworkDevices,
  getNetworkDirectoryChildren,
  getNetworkNodeByPath,
  saveNetworkNode,
  deleteNetworkNode,
  logNetworkAccess,
  generateNodeId,
  NetworkDevice,
  NetworkNode,
  initializeSampleNetworkData
} from '../../../../../lib/networkFileSystem';
import { setNetworkState, nettransfer, netcp } from './transfer';

// Global state for network connection
let connectedDevice: NetworkDevice | null = null;
let currentNetworkPath = '/';

// Helper function to update transfer commands with current state
const updateNetworkState = () => {
  setNetworkState(connectedDevice, currentNetworkPath);
};

export const netconnect: Command = {
  name: 'netconnect',
  description: 'Connect to a network device by IP address',
  usage: 'netconnect <ip_address>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        output: formatError('Usage: netconnect <ip_address>\n\nExample: netconnect 192.168.1.100'),
        error: true
      };
    }

    const ip = args[0];
    
    try {
      // Initialize network data if needed
      await initializeSampleNetworkData();
      
      const device = await getNetworkDeviceByIp(ip);
      if (!device) {
        return {
          output: formatError(`No network device found at IP: ${ip}\n\nUse 'netscan' to see available devices.`),
          error: true
        };
      }

      if (device.status !== 'online') {
        return {
          output: formatError(`Device at ${ip} (${device.name}) is ${device.status}\n\nCannot connect to offline devices.`),
          error: true
        };
      }

      // Connect to device
      connectedDevice = device;
      currentNetworkPath = '/';
      device.lastAccessed = new Date();
      
      // Update transfer commands state
      updateNetworkState();
      
      await logNetworkAccess(device.id, 'terminal_connect', '/', { ip, terminal: true });

      return {
        output: formatSuccess(`Connected to ${device.name} (${ip})\nDevice type: ${device.type}\nAccess level: ${device.accessLevel}\n\nUse 'netls' to list files, 'netcd' to navigate, or 'nethelp' for more commands.`),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to connect to ${ip}: ${error.message}`),
        error: true
      };
    }
  }
};

export const netdisconnect: Command = {
  name: 'netdisconnect',
  description: 'Disconnect from current network device',
  usage: 'netdisconnect',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect to a device.'),
        error: true
      };
    }

    const deviceName = connectedDevice.name;
    const deviceIp = connectedDevice.ip;
    
    await logNetworkAccess(connectedDevice.id, 'terminal_disconnect', currentNetworkPath, { terminal: true });
    
    connectedDevice = null;
    currentNetworkPath = '/';
    updateNetworkState();

    return {
      output: formatSuccess(`Disconnected from ${deviceName} (${deviceIp})`),
      error: false
    };
  }
};

export const netscan: Command = {
  name: 'netscan',
  description: 'Scan for available network devices',
  usage: 'netscan [--verbose]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      await initializeSampleNetworkData();
      const devices = await getAllNetworkDevices();
      
      if (devices.length === 0) {
        return {
          output: formatOutput('No network devices found.\n\nNetwork devices are automatically discovered from the Device Control application.'),
          error: false
        };
      }

      const verbose = args.includes('--verbose') || args.includes('-v');
      let output = formatSuccess(`Found ${devices.length} network device(s):\n\n`);
      
      devices.forEach(device => {
        const status = device.status === 'online' ? 
          '<span style="color: #10b981">online</span>' : 
          device.status === 'offline' ? 
          '<span style="color: #ef4444">offline</span>' : 
          '<span style="color: #f59e0b">connecting</span>';
          
        const accessLevel = device.accessLevel === 'full' ? 
          '<span style="color: #10b981">full</span>' : 
          device.accessLevel === 'limited' ? 
          '<span style="color: #f59e0b">limited</span>' : 
          device.accessLevel === 'read-only' ? 
          '<span style="color: #3b82f6">read-only</span>' : 
          '<span style="color: #ef4444">restricted</span>';

        output += `<span style="color: #60a5fa">${device.ip.padEnd(15)}</span> ${device.name.padEnd(20)} [${device.type.padEnd(8)}] ${status} (${accessLevel})\n`;
        
        if (verbose) {
          output += `  └─ Shares: ${device.shares.length}, Last accessed: ${device.lastAccessed.toLocaleString()}\n`;
        }
      });
      
      output += `\nUse 'netconnect <ip>' to connect to a device.`;
      
      return {
        output: output,
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to scan network: ${error.message}`),
        error: true
      };
    }
  }
};

export const netls: Command = {
  name: 'netls',
  description: 'List files and directories on connected network device',
  usage: 'netls [path] [--long]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    try {
      const targetPath = args.find(arg => !arg.startsWith('--')) || currentNetworkPath;
      const longFormat = args.includes('--long') || args.includes('-l');
      
      const nodes = await getNetworkDirectoryChildren(connectedDevice.id, targetPath);
      
      if (nodes.length === 0) {
        return {
          output: formatOutput(`Directory is empty: ${targetPath}`),
          error: false
        };
      }

      let output = `<span style="color: #10b981">Listing ${targetPath} on ${connectedDevice.name} (${connectedDevice.ip}):</span>\n\n`;
      
      // Sort nodes: directories first, then files
      const sortedNodes = nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      if (longFormat) {
        sortedNodes.forEach(node => {
          const permissions = node.permissions || 'rwxr-xr-x';
          const owner = node.owner || 'network';
          const size = node.type === 'file' ? (node.size || 0).toString().padStart(8) : '     dir';
          const modified = node.modified.toLocaleDateString();
          const typeColor = node.type === 'directory' ? '#60a5fa' : '#f3f4f6';
          const name = node.isShared ? `${node.name} <span style="color: #10b981">[shared]</span>` : node.name;
          
          output += `${permissions} ${owner.padEnd(8)} ${size} ${modified} <span style="color: ${typeColor}">${name}</span>\n`;
        });
      } else {
        const itemsPerRow = 4;
        for (let i = 0; i < sortedNodes.length; i += itemsPerRow) {
          const rowItems = sortedNodes.slice(i, i + itemsPerRow);
          const formattedItems = rowItems.map(node => {
            const typeColor = node.type === 'directory' ? '#60a5fa' : '#f3f4f6';
            const name = node.isShared ? `${node.name}*` : node.name;
            return `<span style="color: ${typeColor}">${name.padEnd(20)}</span>`;
          });
          output += formattedItems.join(' ') + '\n';
        }
        
        output += `\n<span style="color: #6b7280">* = shared directory</span>`;
      }

      await logNetworkAccess(connectedDevice.id, 'terminal_ls', targetPath, { longFormat, terminal: true });

      return {
        output: output,
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to list directory: ${error.message}`),
        error: true
      };
    }
  }
};

export const netcd: Command = {
  name: 'netcd',
  description: 'Change directory on connected network device',
  usage: 'netcd [directory]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    try {
      let targetPath = args[0] || '/';
      
      // Handle relative paths
      if (!targetPath.startsWith('/')) {
        targetPath = currentNetworkPath === '/' ? `/${targetPath}` : `${currentNetworkPath}/${targetPath}`;
      }
      
      // Handle .. (parent directory)
      if (targetPath.includes('..')) {
        const parts = targetPath.split('/').filter(p => p !== '');
        const resolvedParts: string[] = [];
        
        for (const part of parts) {
          if (part === '..') {
            resolvedParts.pop();
          } else {
            resolvedParts.push(part);
          }
        }
        
        targetPath = '/' + resolvedParts.join('/');
      }
      
      // Check if directory exists
      const node = await getNetworkNodeByPath(connectedDevice.id, targetPath);
      if (!node) {
        return {
          output: formatError(`Directory not found: ${targetPath}`),
          error: true
        };
      }
      
      if (node.type !== 'directory') {
        return {
          output: formatError(`Not a directory: ${targetPath}`),
          error: true
        };
      }
      
      currentNetworkPath = targetPath;
      updateNetworkState();
      
      await logNetworkAccess(connectedDevice.id, 'terminal_cd', targetPath, { terminal: true });
      
      return {
        output: formatSuccess(`Changed directory to: ${targetPath}`),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to change directory: ${error.message}`),
        error: true
      };
    }
  }
};

export const netpwd: Command = {
  name: 'netpwd',
  description: 'Print current working directory on network device',
  usage: 'netpwd',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    return {
      output: formatOutput(`${connectedDevice.name}:${currentNetworkPath}`),
      error: false
    };
  }
};

export const netcat: Command = {
  name: 'netcat',
  description: 'Display file content from network device',
  usage: 'netcat <filename>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length === 0) {
      return {
        output: formatError('Usage: netcat <filename>'),
        error: true
      };
    }

    try {
      const filename = args[0];
      let targetPath = filename.startsWith('/') ? filename : 
        currentNetworkPath === '/' ? `/${filename}` : `${currentNetworkPath}/${filename}`;
      
      const node = await getNetworkNodeByPath(connectedDevice.id, targetPath);
      if (!node) {
        return {
          output: formatError(`File not found: ${targetPath}`),
          error: true
        };
      }
      
      if (node.type !== 'file') {
        return {
          output: formatError(`Not a file: ${targetPath}`),
          error: true
        };
      }
      
      const content = typeof node.content === 'string' ? node.content : 'Binary file content';
      
      await logNetworkAccess(connectedDevice.id, 'terminal_cat', targetPath, { size: node.size, terminal: true });
      
      return {
        output: formatOutput(content),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to read file: ${error.message}`),
        error: true
      };
    }
  }
};

export const netmkdir: Command = {
  name: 'netmkdir',
  description: 'Create directory on network device',
  usage: 'netmkdir <directory_name>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length === 0) {
      return {
        output: formatError('Usage: netmkdir <directory_name>'),
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
      const dirName = args[0];
      const targetPath = currentNetworkPath === '/' ? `/${dirName}` : `${currentNetworkPath}/${dirName}`;
      
      // Check if directory already exists
      const existingNode = await getNetworkNodeByPath(connectedDevice.id, targetPath);
      if (existingNode) {
        return {
          output: formatError(`Directory already exists: ${targetPath}`),
          error: true
        };
      }
      
      const dirNode: NetworkNode = {
        id: generateNodeId(connectedDevice.id, targetPath),
        name: dirName,
        path: targetPath,
        type: 'directory',
        permissions: 'rwxr-xr-x',
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: connectedDevice.id,
        deviceIp: connectedDevice.ip,
        children: {}
      };
      
      await saveNetworkNode(dirNode);
      await logNetworkAccess(connectedDevice.id, 'terminal_mkdir', targetPath, { terminal: true });
      
      return {
        output: formatSuccess(`Created directory: ${targetPath}`),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to create directory: ${error.message}`),
        error: true
      };
    }
  }
};

export const netrm: Command = {
  name: 'netrm',
  description: 'Remove file or directory from network device',
  usage: 'netrm <filename> [--recursive]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length === 0) {
      return {
        output: formatError('Usage: netrm <filename> [--recursive]'),
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
      const filename = args.find(arg => !arg.startsWith('--'));
      if (!filename) {
        return {
          output: formatError('No filename provided'),
          error: true
        };
      }

      const recursive = args.includes('--recursive') || args.includes('-r');
      const targetPath = filename.startsWith('/') ? filename : 
        currentNetworkPath === '/' ? `/${filename}` : `${currentNetworkPath}/${filename}`;
      
      const node = await getNetworkNodeByPath(connectedDevice.id, targetPath);
      if (!node) {
        return {
          output: formatError(`File or directory not found: ${targetPath}`),
          error: true
        };
      }
      
      if (node.type === 'directory' && !recursive) {
        return {
          output: formatError(`Cannot remove directory without --recursive flag: ${targetPath}`),
          error: true
        };
      }
      
      await deleteNetworkNode(node.id);
      await logNetworkAccess(connectedDevice.id, 'terminal_rm', targetPath, { 
        type: node.type, 
        recursive, 
        terminal: true 
      });
      
      return {
        output: formatSuccess(`Removed: ${targetPath}`),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to remove: ${error.message}`),
        error: true
      };
    }
  }
};

export const nettouch: Command = {
  name: 'nettouch',
  description: 'Create empty file on network device',
  usage: 'nettouch <filename>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (!connectedDevice) {
      return {
        output: formatError('Not connected to any network device.\n\nUse "netconnect <ip>" to connect first.'),
        error: true
      };
    }

    if (args.length === 0) {
      return {
        output: formatError('Usage: nettouch <filename>'),
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
      const filename = args[0];
      const targetPath = filename.startsWith('/') ? filename : 
        currentNetworkPath === '/' ? `/${filename}` : `${currentNetworkPath}/${filename}`;
      
      // Check if file already exists
      const existingNode = await getNetworkNodeByPath(connectedDevice.id, targetPath);
      if (existingNode) {
        // Update modification time
        existingNode.modified = new Date();
        await saveNetworkNode(existingNode);
        
        return {
          output: formatSuccess(`Updated timestamp: ${targetPath}`),
          error: false
        };
      }
      
      const fileNode: NetworkNode = {
        id: generateNodeId(connectedDevice.id, targetPath),
        name: filename,
        path: targetPath,
        type: 'file',
        size: 0,
        content: '',
        mimeType: 'text/plain',
        permissions: 'rw-r--r--',
        owner: 'user',
        created: new Date(),
        modified: new Date(),
        deviceId: connectedDevice.id,
        deviceIp: connectedDevice.ip
      };
      
      await saveNetworkNode(fileNode);
      await logNetworkAccess(connectedDevice.id, 'terminal_touch', targetPath, { terminal: true });
      
      return {
        output: formatSuccess(`Created file: ${targetPath}`),
        error: false
      };
    } catch (error: any) {
      return {
        output: formatError(`Failed to create file: ${error.message}`),
        error: true
      };
    }
  }
};

export const nethelp: Command = {
  name: 'nethelp',
  description: 'Show help for network commands',
  usage: 'nethelp [command]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    const networkCommands = [
      netconnect, netdisconnect, netscan, netls, netcd, netpwd, 
      netcat, netmkdir, netrm, nettouch
    ];

    if (args.length > 0) {
      const commandName = args[0];
      const command = networkCommands.find(cmd => cmd.name === commandName);
      
      if (command) {
        return {
          output: formatOutput(`<span style="color: #60a5fa">${command.name}</span> - ${command.description}\n\nUsage: ${command.usage}`),
          error: false
        };
      } else {
        return {
          output: formatError(`Network command not found: ${commandName}`),
          error: true
        };
      }
    }

    let output = formatSuccess('Network File System Commands:\n\n');
    
    networkCommands.forEach(cmd => {
      output += `<span style="color: #60a5fa">${cmd.name.padEnd(15)}</span> ${cmd.description}\n`;
    });
    
    output += `\nUse 'nethelp <command>' for detailed help on a specific command.`;
    output += `\nExample workflow:`;
    output += `\n  1. netscan              # Find available devices`;
    output += `\n  2. netconnect 192.168.1.100  # Connect to device`;
    output += `\n  3. netls                # List files`;
    output += `\n  4. netcd /shared        # Navigate to directory`;
    output += `\n  5. netcat file.txt      # View file content`;

    return {
      output: output,
      error: false
    };
  }
};

// Export transfer commands
export { nettransfer, netcp };
