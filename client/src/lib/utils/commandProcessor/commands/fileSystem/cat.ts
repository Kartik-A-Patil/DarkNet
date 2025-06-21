import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';

export const cat: Command = {
  name: 'cat',
  description: 'Concatenate and display file contents',
  usage: 'cat [file...]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath } = options;
      
      if (args.length === 0) {
        return {
          output: 'cat: missing file operand',
          error: true
        };
      }
      
      // Handle multiple files
      const outputs: string[] = [];
      
      for (const arg of args) {
        const filePath = resolvePath(arg, currentPath);
        const content = await fileSystem.readFile(filePath);
        
        if (content === null) {
          return {
            output: `cat: ${arg}: No such file or directory`,
            error: true
          };
        }
        
        outputs.push(content);
      }
      
      return {
        output: outputs.join('\n'),
        error: false
      };
    } catch (error: any) {
      return {
        output: `cat: error: ${error.message}`,
        error: true
      };
    }
  }
};
