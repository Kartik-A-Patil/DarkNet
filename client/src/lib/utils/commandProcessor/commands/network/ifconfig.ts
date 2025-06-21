import { Command, CommandOptions, CommandResult } from '../../types';

export const ifconfig: Command = {
  name: 'ifconfig',
  description: 'Configure network interface parameters',
  usage: 'ifconfig [interface]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { network } = options;
      const interfaceName = args[0];
      
      // Helper function to format a network interface output
      const formatInterface = (name: string, ip: string, mac: string, active: boolean) => {
        return [
          `${name}: flags=${active ? '4163<UP,BROADCAST,RUNNING,MULTICAST>' : '4099<BROADCAST,MULTICAST>'}  mtu 1500`,
          `        inet ${ip}  netmask 255.255.255.0  broadcast 192.168.1.255`,
          `        ether ${mac}  txqueuelen 1000  (Ethernet)`,
          `        RX packets ${Math.floor(10000 + Math.random() * 5000)}  bytes ${Math.floor(1000000 + Math.random() * 9000000)} (${Math.floor(1 + Math.random() * 9)} MiB)`,
          `        RX errors 0  dropped 0  overruns 0  frame 0`,
          `        TX packets ${Math.floor(8000 + Math.random() * 3000)}  bytes ${Math.floor(500000 + Math.random() * 4000000)} (${Math.floor(0.5 + Math.random() * 4)} MiB)`,
          `        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`,
          ''
        ].join('\n');
      };
      
      // Define interfaces
      const interfaces = {
        lo: {
          name: 'lo',
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00',
          active: true
        },
        eth0: {
          name: 'eth0',
          ip: '192.168.1.5',
          mac: '08:00:27:b3:fc:2d',
          active: network?.online || false
        },
        wlan0: {
          name: 'wlan0',
          ip: '192.168.1.10',
          mac: 'b8:27:eb:6c:7f:e1',
          active: network?.wifiConnected || false
        }
      };
      
      // If a specific interface is requested, only show that one
      if (interfaceName) {
        const iface = interfaces[interfaceName as keyof typeof interfaces];
        if (!iface) {
          return {
            output: `ifconfig: error: device "${interfaceName}" does not exist.`,
            error: true
          };
        }
        
        return {
          output: formatInterface(iface.name, iface.ip, iface.mac, iface.active),
          error: false
        };
      }
      
      // Otherwise, show all interfaces
      const output = Object.values(interfaces)
        .map(iface => formatInterface(iface.name, iface.ip, iface.mac, iface.active))
        .join('\n');
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `ifconfig: error: ${error.message}`,
        error: true
      };
    }
  }
};
