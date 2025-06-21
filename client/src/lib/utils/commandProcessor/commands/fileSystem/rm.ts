import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';

export const rm: Command = {
  name: 'rm',
  description: 'Remove files or directories',
  usage: 'rm [options] <file...>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath } = options;
      
      if (args.length === 0) {
        return {
          output: 'rm: missing operand',
          error: true
        };
      }
      
      const recursive = args.includes('-r') || args.includes('-R') || args.includes('--recursive');
      const force = args.includes('-f') || args.includes('--force');
      const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
      
      if (nonOptionArgs.length === 0) {
        return {
          output: 'rm: missing operand',
          error: true
        };
      }
      
      const results: string[] = [];
      let hasError = false;
      
      for (const arg of nonOptionArgs) {
        const path = resolvePath(arg, currentPath);
        
        // Prevent deleting critical system paths
        if (path === '/' || path === '/home' || path === '/home/hackos') {
          if (!force) {
            results.push(`rm: cannot remove '${arg}': Is a critical system path`);
            hasError = true;
            continue;
          }
        }
        
        try {
          const node = await fileSystem.getNodeFromPath(path);
          
          if (!node) {
            if (!force) {
              results.push(`rm: cannot remove '${arg}': No such file or directory`);
              hasError = true;
            }
            continue;
          }
          
          if (node.type === 'directory' && !recursive) {
            results.push(`rm: cannot remove '${arg}': Is a directory`);
            hasError = true;
            continue;
          }
          
          const success = await fileSystem.deleteNode(path);
          
          if (!success && !force) {
            results.push(`rm: cannot remove '${arg}': Permission denied`);
            hasError = true;
          }
        } catch (error: any) {
          if (!force) {
            results.push(`rm: cannot remove '${arg}': ${error.message}`);
            hasError = true;
          }
        }
      }
      
      return {
        output: results.join('\n'),
        error: hasError
      };
    } catch (error: any) {
      return {
        output: `rm: error: ${error.message}`,
        error: true
      };
    }
  }
};
