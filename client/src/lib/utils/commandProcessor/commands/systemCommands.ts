import { Command, CommandProcessorOptions } from '../types';
import { CommandResult } from '../../../../types/os.types';

export const whoami: Command = {
  async execute(): Promise<CommandResult> {
    return { output: 'hackos' };
  }
};

export const clear: Command = {
  async execute(): Promise<CommandResult> {
    return { output: '', clearScreen: true };
  }
};

export const echo: Command = {
  async execute(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '' };
    }
    return { output: args.join(' ') };
  }
};

// ... implement other system commands (uname, ps, etc.)
