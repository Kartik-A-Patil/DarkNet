// Mock network types to replace removed NetworkTopology
export enum DeviceType {
  ROUTER = 'router',
  SWITCH = 'switch',
  COMPUTER = 'computer',
  SERVER = 'server',
  FIREWALL = 'firewall',
  IOT = 'iot',
  PRINTER = 'printer',
  UNKNOWN = 'unknown'
}

export interface NetworkDevice {
  id: string;
  ip: string;
  mac: string;
  hostname?: string;
  type: DeviceType;
  os?: string;
  openPorts: number[];
  services: string[];
  isOnline: boolean;
  lastSeen: Date;
  vulnerabilities?: string[];
  x?: number;
  y?: number;
}

export interface NetworkTopology {
  devices: NetworkDevice[];
  subnet: string;
  gateway: string;
  lastScan: Date;
}

// Mock NetworkTopologyManager
export class NetworkTopologyManager {
  private mockDevices: NetworkDevice[] = [
    {
      id: '1',
      ip: '192.168.1.1',
      mac: '00:11:22:33:44:55',
      hostname: 'router.local',
      type: DeviceType.ROUTER,
      openPorts: [80, 443, 22],
      services: ['HTTP', 'HTTPS', 'SSH'],
      isOnline: true,
      lastSeen: new Date(),
      x: 400,
      y: 200
    },
    {
      id: '2',
      ip: '192.168.1.100',
      mac: '00:11:22:33:44:66',
      hostname: 'desktop-pc',
      type: DeviceType.COMPUTER,
      os: 'Windows 11',
      openPorts: [135, 445],
      services: ['RPC', 'SMB'],
      isOnline: true,
      lastSeen: new Date(),
      vulnerabilities: ['SMB v1 enabled'],
      x: 300,
      y: 300
    },
    {
      id: '3',
      ip: '192.168.1.50',
      mac: '00:11:22:33:44:77',
      hostname: 'server-01',
      type: DeviceType.SERVER,
      os: 'Ubuntu 22.04',
      openPorts: [22, 80, 443, 3306],
      services: ['SSH', 'HTTP', 'HTTPS', 'MySQL'],
      isOnline: true,
      lastSeen: new Date(),
      x: 500,
      y: 300
    }
  ];

  async scanNetwork(subnet: string = '192.168.1.0/24'): Promise<NetworkTopology> {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      devices: this.mockDevices,
      subnet,
      gateway: '192.168.1.1',
      lastScan: new Date()
    };
  }

  async scanDevice(ip: string): Promise<NetworkDevice | null> {
    // Simulate device scan delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.mockDevices.find(device => device.ip === ip) || null;
  }

  getTopology(): NetworkTopology | null {
    return {
      devices: this.mockDevices,
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.1',
      lastScan: new Date()
    };
  }
}
