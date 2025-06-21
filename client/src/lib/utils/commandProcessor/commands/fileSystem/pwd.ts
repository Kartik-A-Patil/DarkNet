import { Command, CommandOptions, CommandResult } from '../../types';

export const pwd: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  execute: async (_args: string[], options: CommandOptions): Promise<CommandResult> => {
    return {
      output: options.currentPath,
      error: false
    };
  }
};
