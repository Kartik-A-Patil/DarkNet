import { Command, CommandOptions, CommandResult } from '../../types';

export const clear: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  execute: async (_args: string[], _options: CommandOptions): Promise<CommandResult> => {
    return {
      output: '',
      clearScreen: true,
      error: false
    };
  }
};
