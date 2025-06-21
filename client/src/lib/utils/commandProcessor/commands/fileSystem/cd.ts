import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';

export const cd: Command = {
  name: 'cd',
  description: 'Change directory',
  usage: 'cd [directory]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath, setCurrentPath } = options;
      
      // Default to home directory if no arguments
      const targetPath = args.length === 0 ? '/home/hackos' : resolvePath(args[0], currentPath);
      
      // Check if directory exists
      const node = await fileSystem.getNodeFromPath(targetPath);
      
      if (!node) {
        return {
          output: `cd: no such file or directory: ${args[0]}`,
          error: true
        };
      }
      
      if (node.type !== 'directory') {
        return {
          output: `cd: not a directory: ${args[0]}`,
          error: true
        };
      }
      
      // Update current path
      setCurrentPath(targetPath);
      
      return {
        output: '',
        error: false,
        newPath: targetPath
      };
    } catch (error: any) {
      return {
        output: `cd: error: ${error.message}`,
        error: true
      };
    }
  }
};
