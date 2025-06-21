import { Command, CommandOptions, CommandResult } from '../types';
import { commands } from '../index';

export const help: Command = {
  name: 'help',
  description: 'Display help information',
  usage: 'help [command]',
  execute: async (args: string[], _options: CommandOptions): Promise<CommandResult> => {
    try {
      // If a command is specified, show help for that command
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = commands.find(cmd => cmd.name === commandName);
        
        if (command) {
          return {
            output: `${command.name} - ${command.description}\n\nUsage: ${command.usage}`,
            error: false
          };
        } else {
          return {
            output: `help: no help topics match '${commandName}'`,
            error: true
          };
        }
      }
      
      // Otherwise, list all available commands in categories
      const output = ['Available commands:'];
      
      // File System commands
      output.push('\nFile System:');
      ['cd', 'ls', 'pwd', 'cat', 'mkdir', 'touch', 'rm'].forEach(cmd => {
        const command = commands.find(c => c.name === cmd);
        if (command) {
          output.push(`  ${command.name.padEnd(10)} - ${command.description}`);
        }
      });
      
      // System commands
      output.push('\nSystem:');
      ['echo', 'clear', 'whoami', 'hostname', 'date', 'history', 'node', 'python', 'apt'].forEach(cmd => {
        const command = commands.find(c => c.name === cmd);
        if (command) {
          output.push(`  ${command.name.padEnd(10)} - ${command.description}`);
        }
      });
      
      // Network commands
      output.push('\nNetwork:');
      ['ping', 'ifconfig'].forEach(cmd => {
        const command = commands.find(c => c.name === cmd);
        if (command) {
          output.push(`  ${command.name.padEnd(10)} - ${command.description}`);
        }
      });
      
      output.push('\nFor help on a specific command, type: help <command>');
      
      return {
        output: output.join('\n'),
        error: false
      };
    } catch (error: any) {
      return {
        output: `help: error: ${error.message}`,
        error: true
      };
    }
  }
};
