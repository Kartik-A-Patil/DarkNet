import { Device } from '../types';

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Main Database Server',
    type: 'database',
    status: 'online',
    ip: '192.168.1.100',
    lastSeen: new Date(),
    os: 'Ubuntu Server 20.04',
    services: ['MySQL', 'Redis', 'MongoDB'],
    uptime: '45 days, 12:34:56',
    cpu: 23,
    memory: 67,
    storage: 78,
    network: { upload: 125.5, download: 89.2 },
    security: { firewall: true, encryption: true, updates: true },
    capabilities: {
      canConnect: true,
      canExecuteCommands: true,
      canStoreData: true,
      canMonitor: true,
      hasFileSystem: true
    },
    data: {
      tables: ['users', 'sessions', 'logs', 'network_data'],
      connections: 15,
      queriesPerSecond: 245
    }
  },
  {
    id: '2',
    name: 'Main Router',
    type: 'router',
    status: 'online',
    ip: '192.168.1.1',
    lastSeen: new Date(),
    os: 'OpenWrt 21.02',
    services: ['DHCP', 'DNS', 'VPN'],
    uptime: '120 days, 8:15:42',
    cpu: 15,
    memory: 45,
    network: { upload: 1024, download: 512 },
    security: { firewall: true, encryption: true, updates: false },
    capabilities: {
      canConnect: true,
      canExecuteCommands: true,
      canRoute: true,
      canMonitor: true
    },
    data: {
      connectedDevices: 23,
      routingTable: ['192.168.1.0/24', '10.0.0.0/8'],
      bandwidth: { total: '1Gbps', used: '340Mbps' }
    }
  },
  {
    id: '3',
    name: 'Current Workstation',
    type: 'computer',
    status: 'online',
    ip: '192.168.1.50',
    lastSeen: new Date(),
    os: 'Kali Linux 2023.4',
    services: ['SSH', 'HTTP', 'Metasploit'],
    uptime: '2 days, 14:22:11',
    cpu: 45,
    memory: 72,
    storage: 56,
    network: { upload: 89.5, download: 156.8 },
    security: { firewall: true, encryption: true, updates: true },
    capabilities: {
      canConnect: true,
      canExecuteCommands: true,
      canStoreData: true,
      canMonitor: true,
      hasFileSystem: true
    },
    data: {
      tools: ['nmap', 'metasploit', 'wireshark', 'burpsuite'],
      activeScans: 3,
      discoveredHosts: 45
    }
  },
  {
    id: '4',
    name: 'Web Server',
    type: 'server',
    status: 'online',
    ip: '192.168.1.110',
    lastSeen: new Date(),
    os: 'CentOS 8',
    services: ['Apache', 'PHP', 'SSL'],
    uptime: '89 days, 3:45:12',
    cpu: 34,
    memory: 58,
    storage: 23,
    network: { upload: 234.1, download: 78.9 },
    security: { firewall: true, encryption: true, updates: true },
    capabilities: {
      canConnect: true,
      canExecuteCommands: true,
      canStoreData: true,
      canMonitor: true,
      hasFileSystem: true
    },
    data: {
      websites: ['darknet.local', 'admin.darknet.local'],
      activeConnections: 156,
      requestsPerSecond: 89
    }
  },
  {
    id: '5',
    name: 'IoT Gateway',
    type: 'iot',
    status: 'connecting',
    ip: '192.168.1.200',
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    os: 'Raspberry Pi OS',
    services: ['MQTT', 'Node-RED'],
    uptime: '12 days, 6:30:45',
    cpu: 78,
    memory: 85,
    network: { upload: 12.3, download: 45.6 },
    security: { firewall: false, encryption: true, updates: false },
    capabilities: {
      canConnect: true,
      canExecuteCommands: false,
      canStoreData: true,
      canMonitor: true
    },
    data: {
      sensors: ['temperature', 'humidity', 'motion', 'light'],
      connectedDevices: 8,
      mqttMessages: 1245
    }
  },
  {
    id: '6',
    name: 'Mobile Device',
    type: 'mobile',
    status: 'offline',
    ip: '192.168.1.75',
    lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
    os: 'Android 13',
    services: ['ADB', 'SSH'],
    uptime: '0 days, 0:00:00',
    security: { firewall: false, encryption: true, updates: true }
  }
];
