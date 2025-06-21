import { CommandOptions, CommandResult, Command } from './types';
import { formatError, formatSuccess } from './utils/formatOutput';

// File System Commands
import { ls } from './commands/fileSystem/ls';
import { cd } from './commands/fileSystem/cd';
import { pwd } from './commands/fileSystem/pwd';
import { cat } from './commands/fileSystem/cat';
import { mkdir } from './commands/fileSystem/mkdir';
import { rm } from './commands/fileSystem/rm';
import { touch } from './commands/fileSystem/touch';

// System Commands
import { echo } from './commands/system/echo';
import { clear } from './commands/system/clear';
import { whoami } from './commands/system/whoami';
import { hostname } from './commands/system/hostname';
import { date } from './commands/system/date';
import { history } from './commands/system/history';
import { node } from './commands/system/node';
import { python } from './commands/system/python';
import { apt } from './commands/system/apt';

// Network Commands
import { ping } from './commands/network/ping';
import { ifconfig } from './commands/network/ifconfig';

// Help Command
import { help } from './commands/help';

// Register all available commands
const availableCommands: Command[] = [
  // File system commands
  ls,
  cd,
  pwd,
  cat,
  mkdir,
  rm,
  touch,
  
  // System commands
  echo,
  clear,
  whoami,
  hostname,
  date,
  history,
  node,
  python,
  apt,
  
  // Network commands
  ping,
  ifconfig,
  
  // Help command
  help
];

export { availableCommands as commands };

export class CommandProcessor {
  private options: CommandOptions;
  
  constructor(options: CommandOptions) {
    this.options = options;
  }
  
  async processCommand(input: string): Promise<CommandResult> {
    if (!input.trim()) {
      return { output: '', error: false };
    }
    
    try {
      // Split the command into parts
      const parts = input.trim().split(/\s+/);
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Find the command in the available commands
      const command = availableCommands.find(cmd => cmd.name === commandName);
      
      if (command) {
        // Command found, execute it with the given arguments
        const result = await command.execute(args, this.options);
        
        // If error is indicated but output doesn't already have HTML formatting,
        // apply error formatting
        if (result.error && !result.output.includes('<span')) {
          result.output = formatError(result.output);
        }
        
        return result;
      } else {
        // Command not found with proper formatting
        return {
          output: formatError(`bash: ${commandName}: command not found`),
          error: true
        };
      }
    } catch (error: any) {
      console.error('Error processing command:', error);
      return {
        output: formatError(`Error: ${error.message || 'An unknown error occurred'}`),
        error: true
      };
    }
  }
}

export function createCommandProcessor(options: CommandOptions): CommandProcessor {
  return new CommandProcessor(options);
}
