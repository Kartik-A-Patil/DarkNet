import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';
import { formatError } from '../../utils/formatOutput';
import { getInterpreter } from '../../../../utils/interpreters';

export const node: Command = {
  name: 'node',
  description: 'Execute JavaScript files',
  usage: 'node [options] <file> [arguments...]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath, packageManager } = options;
      
      if (args.length === 0) {
        return {
          output: 'node: missing file operand\nUsage: node [file] [arguments...]',
          error: true
        };
      }
      
      // Get the file path from args
      const filePath = resolvePath(args[0], currentPath);
      
      // Get the JavaScript interpreter
      const interpreter = getInterpreter('javascript');
      
      if (!interpreter) {
        return {
          output: 'Error: JavaScript interpreter not available',
          error: true
        };
      }
      
      // Check if the interpreter can run (node is installed)
      // Use isPackageInstalled instead of getInstalledPackages
      if (!packageManager || !packageManager.isPackageInstalled('node')) {
        return {
          output: 'Error: Node.js is not installed. Install it using "apt install node"',
          error: true
        };
      }
      
      // Read the file content
      const content = await fileSystem.readFile(filePath);
      
      if (content === null) {
        return {
          output: `node: ${args[0]}: No such file or directory`,
          error: true
        };
      }
      
      // Execute the JavaScript code with the remaining arguments
      const result = await interpreter.execute(content, args.slice(1));
      
      return {
        output: result.output,
        error: result.error
      };
    } catch (error: any) {
      return {
        output: formatError(`node: error: ${error.message}`),
        error: true
      };
    }
  }
};