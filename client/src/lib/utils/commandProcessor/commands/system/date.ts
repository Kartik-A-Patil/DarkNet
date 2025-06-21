import { Command, CommandOptions, CommandResult } from '../../types';

export const date: Command = {
  name: 'date',
  description: 'Print or set the system date and time',
  usage: 'date [options]',
  execute: async (args: string[], _options: CommandOptions): Promise<CommandResult> => {
    try {
      const now = new Date();
      
      // Handle different format options
      if (args.includes('-u') || args.includes('--utc')) {
        return {
          output: now.toUTCString(),
          error: false
        };
      }
      
      if (args.includes('-I') || args.includes('--iso-8601')) {
        return {
          output: now.toISOString().split('T')[0],
          error: false
        };
      }
      
      // Default format - similar to Linux date command
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const day = days[now.getDay()];
      const month = months[now.getMonth()];
      const date = now.getDate();
      
      // Format: Day Month Date HH:MM:SS Timezone Year
      const output = `${day} ${month} ${date} ${now.toTimeString()} ${now.getFullYear()}`;
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `date: error: ${error.message}`,
        error: true
      };
    }
  }
};
