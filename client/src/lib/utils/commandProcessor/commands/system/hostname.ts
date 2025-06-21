import { Command, CommandOptions, CommandResult } from '../../types';

export const hostname: Command = {
  name: 'hostname',
  description: 'Show or set the system hostname',
  usage: 'hostname',
  execute: async (_args: string[], options: CommandOptions): Promise<CommandResult> => {
    return {
      output: options.hostname || 'kali',
      error: false
    };
  }
};
