import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';
import { formatError, formatFile, formatDirectory } from '../../utils/formatOutput';

export const ls: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [options] [directory]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath } = options;
      
      // Parse options
      const showAll = args.includes('-a') || args.includes('--all');
      const showLong = args.includes('-l');
      const humanReadable = args.includes('-h');
      
      // Determine directory to list
      let targetDir = currentPath;
      const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
      
      if (nonOptionArgs.length > 0) {
        targetDir = resolvePath(nonOptionArgs[0], currentPath);
      }
      
      // Get directory contents
      const contents = await fileSystem.listDirectory(targetDir);
      
      if (!contents) {
        return {
          output: formatError(`ls: cannot access '${targetDir}': No such file or directory`),
          error: true
        };
      }
      
      // Filter hidden files if needed
      let fileNames = Object.keys(contents);
      if (!showAll) {
        fileNames = fileNames.filter(name => !name.startsWith('.'));
      }
      
      // Sort files (directories first)
      fileNames.sort((a, b) => {
        const nodeA = contents[a];
        const nodeB = contents[b];
        
        if (nodeA.type === 'directory' && nodeB.type !== 'directory') return -1;
        if (nodeA.type !== 'directory' && nodeB.type === 'directory') return 1;
        return a.localeCompare(b);
      });
      
      // Format output
      if (showLong) {
        // Long format (-l)
        const lines = fileNames.map(name => {
          const node = contents[name];
          const permissions = node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
          const size = formatSize(node.size || 0, humanReadable);
          const owner = node.owner || 'hackos';
          const mtime = (node.lastModified || new Date()).toLocaleDateString();
          
          let displayName = name;
          if (node.type === 'directory') {
            displayName = formatDirectory(`${name}/`);
          } else if (node.executable) {
            displayName = `${formatFile(name)}*`;
          } else {
            displayName = formatFile(name);
          }
          
          return `${permissions} 1 ${owner} ${owner} ${size} ${mtime} ${displayName}`;
        });
        
        return { output: lines.join('\n'), error: false };
      } else {
        // Simple format
        const fileList = fileNames.map(name => {
          const node = contents[name];
          if (node.type === 'directory') {
            return formatDirectory(`${name}/`);
          } else if (node.executable) {
            return `${formatFile(name)}*`;
          }
          return formatFile(name);
        });
        
        return { output: fileList.join('  '), error: false };
      }
    } catch (error: any) {
      return {
        output: formatError(`ls: error: ${error.message}`),
        error: true
      };
    }
  }
};

function formatSize(size: number, humanReadable: boolean): string {
  if (!humanReadable) return size.toString();
  
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let unitIndex = 0;
  let scaledSize = size;
  
  while (scaledSize >= 1024 && unitIndex < units.length - 1) {
    unitIndex++;
    scaledSize /= 1024;
  }
  
  return `${Math.round(scaledSize * 10) / 10}${units[unitIndex]}`;
}
