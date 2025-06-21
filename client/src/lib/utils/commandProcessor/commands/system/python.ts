import { Command, CommandOptions, CommandResult } from '../../types';
import { resolvePath } from '../../utils/pathUtils';
import { formatError } from '../../utils/formatOutput';
import { getInterpreter } from '../../../../utils/interpreters';

export const python: Command = {
  name: 'python',
  description: 'Execute Python scripts',
  usage: 'python [options] <file> [arguments...]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { fileSystem, currentPath, packageManager } = options;
      
      // Handle python with no arguments - show version info
      if (args.length === 0) {
        return {
          output: 'Python 3.10.0 (HackOS)\nType "help", "copyright", "credits" or "license" for more information.',
          error: false
        };
      }
      
      // Get the file path from args
      const filePath = resolvePath(args[0], currentPath);
      
      // Get the Python interpreter
      const interpreter = getInterpreter('python');
      
      if (!interpreter) {
        return {
          output: 'Error: Python interpreter not available',
          error: true
        };
      }
      
      // Check if the interpreter can run (python is installed)
      // Use isPackageInstalled instead of getInstalledPackages
      if (!packageManager || !packageManager.isPackageInstalled('python3')) {
        return {
          output: 'Error: Python is not installed. Install it using "apt install python3"',
          error: true
        };
      }
      
      // Read the file content
      const content = await fileSystem.readFile(filePath);
      
      if (content === null) {
        return {
          output: `python: can't open file '${args[0]}': [Errno 2] No such file or directory`,
          error: true
        };
      }
      
      // Execute the Python code with the remaining arguments
      const result = await interpreter.execute(content, args.slice(1));
      
      return {
        output: result.output,
        error: result.error
      };
    } catch (error: any) {
      return {
        output: formatError(`python: error: ${error.message}`),
        error: true
      };
    }
  }
};