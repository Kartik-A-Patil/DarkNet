import { Command, CommandOptions, CommandResult } from '../../types';

export const whoami: Command = {
  name: 'whoami',
  description: 'Print effective user name',
  usage: 'whoami',
  execute: async (_args: string[], options: CommandOptions): Promise<CommandResult> => {
    return {
      output: options.user || 'hackos',
      error: false
    };
  }
};
