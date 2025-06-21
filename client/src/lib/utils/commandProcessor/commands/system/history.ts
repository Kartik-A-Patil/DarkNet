import { Command, CommandOptions, CommandResult } from '../../types';

export const history: Command = {
  name: 'history',
  description: 'Display command history',
  usage: 'history [n]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { history = [] } = options;
      
      // Check if a specific number of entries was requested
      let count = history.length;
      if (args.length > 0) {
        const requestedCount = parseInt(args[0]);
        if (!isNaN(requestedCount) && requestedCount > 0) {
          count = Math.min(requestedCount, history.length);
        }
      }
      
      // Get the most recent entries up to the count
      const entries = history.slice(0, count);
      
      // Format history entries with numbers
      const output = entries.map((cmd, i) => 
        `${history.length - i}\t${cmd}`
      ).reverse().join('\n');
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `history: error: ${error.message}`,
        error: true
      };
    }
  }
};
