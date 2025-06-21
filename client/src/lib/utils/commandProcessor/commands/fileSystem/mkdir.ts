import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';

export const mkdir: Command = {
  name: 'mkdir',
  description: 'Create directory',
  usage: 'mkdir [options] <directory...>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath } = options;
      
      if (args.length === 0) {
        return {
          output: 'mkdir: missing operand',
          error: true
        };
      }
      
      const createParents = args.includes('-p') || args.includes('--parents');
      const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
      
      if (nonOptionArgs.length === 0) {
        return {
          output: 'mkdir: missing operand',
          error: true
        };
      }
      
      const results: string[] = [];
      let hasError = false;
      
      for (const dir of nonOptionArgs) {
        const dirPath = resolvePath(dir, currentPath);
        
        try {
          // Check if directory already exists
          const existingNode = await fileSystem.getNodeFromPath(dirPath);
          
          if (existingNode) {
            results.push(`mkdir: cannot create directory '${dir}': File exists`);
            hasError = true;
            continue;
          }
          
          if (createParents) {
            // Create parent directories if needed
            const parts = dirPath.split('/').filter(Boolean);
            let currentDir = '';
            
            for (let i = 0; i < parts.length; i++) {
              currentDir += `/${parts[i]}`;
              
              const exists = await fileSystem.getNodeFromPath(currentDir);
              if (!exists) {
                const success = await fileSystem.createDirectory(currentDir);
                if (!success) {
                  results.push(`mkdir: cannot create directory '${currentDir}': Permission denied`);
                  hasError = true;
                  break;
                }
              } else if (exists.type !== 'directory') {
                results.push(`mkdir: cannot create directory '${currentDir}': Not a directory`);
                hasError = true;
                break;
              }
            }
          } else {
            // Create directory directly
            const success = await fileSystem.createDirectory(dirPath);
            if (!success) {
              results.push(`mkdir: cannot create directory '${dir}': Permission denied`);
              hasError = true;
            }
          }
        } catch (error: any) {
          results.push(`mkdir: cannot create directory '${dir}': ${error.message}`);
          hasError = true;
        }
      }
      
      return {
        output: results.join('\n'),
        error: hasError
      };
    } catch (error: any) {
      return {
        output: `mkdir: error: ${error.message}`,
        error: true
      };
    }
  }
};
