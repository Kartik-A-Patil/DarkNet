import { Command, CommandOptions, CommandResult } from '../../types';

export const ping: Command = {
  name: 'ping',
  description: 'Send ICMP ECHO_REQUEST to network hosts',
  usage: 'ping [options] <hostname|IP>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { network } = options;
      
      if (args.length === 0) {
        return {
          output: 'ping: missing host operand',
          error: true
        };
      }
      
      // Parse options
      const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) || 4 : 4;
      
      // Get the target host (last non-option argument)
      const targetHost = args.filter(arg => !arg.startsWith('-') && 
                                    args.indexOf(arg) !== args.indexOf('-c') + 1).pop();
      
      if (!targetHost) {
        return {
          output: 'ping: missing host operand',
          error: true
        };
      }
      
      // Simulate ping based on network state
      if (!network || !network.online) {
        return {
          output: `ping: unknown host ${targetHost}`,
          error: true
        };
      }
      
      // Generate ping statistics
      const responses: string[] = [];
      let successful = 0;
      
      responses.push(`PING ${targetHost} (${generateFakeIP(targetHost)}) 56(84) bytes of data.`);
      
      for (let i = 0; i < count; i++) {
        // Simulate network latency and packet loss
        const latency = Math.floor(20 + Math.random() * 60);
        const success = Math.random() > 0.1; // 10% packet loss
        
        if (success) {
          responses.push(`64 bytes from ${targetHost} (${generateFakeIP(targetHost)}): icmp_seq=${i+1} ttl=64 time=${latency} ms`);
          successful++;
        } else {
          responses.push(`Request timeout for icmp_seq ${i+1}`);
        }
      }
      
      // Add ping statistics
      responses.push('');
      responses.push(`--- ${targetHost} ping statistics ---`);
      responses.push(`${count} packets transmitted, ${successful} received, ${Math.floor((count - successful) / count * 100)}% packet loss`);
      
      if (successful > 0) {
        responses.push(`rtt min/avg/max = 20.123/42.549/60.992 ms`);
      }
      
      return {
        output: responses.join('\n'),
        error: false
      };
    } catch (error: any) {
      return {
        output: `ping: error: ${error.message}`,
        error: true
      };
    }
  }
};

// Helper function to generate consistent fake IP for a hostname
function generateFakeIP(hostname: string): string {
  // Simple hash function to generate IP-like numbers from hostname
  let hash = 0;
  for (let i = 0; i < hostname.length; i++) {
    hash = ((hash << 5) - hash) + hostname.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate IP-like structure
  const ip = [
    '192',
    Math.abs(hash & 255),
    Math.abs((hash >> 8) & 255),
    Math.abs((hash >> 16) & 255)
  ].join('.');
  
  return ip;
}
