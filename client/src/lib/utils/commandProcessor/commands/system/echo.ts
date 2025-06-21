import { Command, CommandOptions, CommandResult } from '../../types';

export const echo: Command = {
  name: 'echo',
  description: 'Display text',
  usage: 'echo [string...]',
  execute: async (args: string[], _options: CommandOptions): Promise<CommandResult> => {
    return {
      output: args.join(' '),
      error: false
    };
  }
};
