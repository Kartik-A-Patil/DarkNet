import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';

export const touch: Command = {
  name: 'touch',
  description: 'Create an empty file or update file timestamp',
  usage: 'touch [file...]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath } = options;
      
      if (args.length === 0) {
        return {
          output: 'touch: missing file operand',
          error: true
        };
      }
      
      const results: string[] = [];
      let hasError = false;
      
      for (const arg of args) {
        const filePath = resolvePath(arg, currentPath);
        
        try {
          // Check if file exists
          const existingNode = await fileSystem.getNodeFromPath(filePath);
          
          if (existingNode) {
            // Update file timestamp
            await fileSystem.updateNodeByPath(filePath, { lastModified: new Date() });
          } else {
            // Create empty file
            const success = await fileSystem.writeFile(filePath, '');
            
            if (!success) {
              results.push(`touch: cannot touch '${arg}': Permission denied`);
              hasError = true;
            }
          }
        } catch (error: any) {
          results.push(`touch: cannot touch '${arg}': ${error.message}`);
          hasError = true;
        }
      }
      
      return {
        output: results.join('\n'),
        error: hasError
      };
    } catch (error: any) {
      return {
        output: `touch: error: ${error.message}`,
        error: true
      };
    }
  }
};
