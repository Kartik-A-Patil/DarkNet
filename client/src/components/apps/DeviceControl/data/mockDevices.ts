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
    accessLevel: 'full',
    capabilities: ['backup', 'restore', 'monitoring', 'query'],
    config: {
      dbEngine: 'MySQL 8.0',
      connections: 45,
      maxConnections: 200,
      backupSchedule: 'Daily at 2:00 AM',
      autoRestart: true,
      notifications: true
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
    accessLevel: 'full',
    capabilities: ['port-forwarding', 'bandwidth-control', 'wifi-management', 'firewall'],
    config: {
      wifiEnabled: true,
      bandwidth: { total: 1000, used: 267 },
      portForwarding: [
        { port: 80, target: '192.168.1.100' },
        { port: 22, target: '192.168.1.50' }
      ],
      autoRestart: false,
      notifications: true
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
    accessLevel: 'full',
    capabilities: ['remote-access', 'file-sharing', 'security-tools'],
    config: {
      autoRestart: false,
      notifications: true,
      maintenanceMode: false
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
    accessLevel: 'limited',
    capabilities: ['web-hosting', 'ssl-management', 'load-balancing'],
    config: {
      webServices: ['Apache 2.4', 'PHP 8.0', 'MySQL 5.7'],
      loadBalancer: false,
      autoRestart: true,
      notifications: true
    }
  },
  {
    id: '5',
    name: 'NAS Storage Server',
    type: 'nas',
    status: 'online',
    ip: '192.168.1.150',
    lastSeen: new Date(),
    os: 'FreeNAS 12.0',
    services: ['SMB', 'FTP', 'NFS', 'RAID'],
    uptime: '200 days, 15:23:45',
    cpu: 12,
    memory: 34,
    storage: 89,
    network: { upload: 156.3, download: 234.7 },
    security: { firewall: true, encryption: true, updates: true },
    accessLevel: 'full',
    capabilities: ['storage-management', 'raid-control', 'backup', 'file-sharing'],
    config: {
      totalStorage: 8000, // 8TB
      usedStorage: 7120, // 7.12TB
      availableStorage: 880, // 880GB
      storagePrice: 0.15, // $0.15 per GB
      sharedFolders: ['/media', '/backups', '/documents', '/projects'],
      autoRestart: true,
      notifications: true
    }
  },
  {
    id: '6',
    name: 'Security Camera #1',
    type: 'camera',
    status: 'online',
    ip: '192.168.1.201',
    lastSeen: new Date(),
    os: 'Linux Embedded',
    services: ['RTSP', 'HTTP'],
    uptime: '89 days, 12:45:23',
    cpu: 45,
    memory: 78,
    network: { upload: 89.2, download: 12.4 },
    security: { firewall: false, encryption: true, updates: false },
    accessLevel: 'read-only',
    capabilities: ['video-streaming', 'motion-detection', 'recording'],
    config: {
      resolution: '1920x1080',
      recordingEnabled: true,
      motionDetection: true,
      notifications: true
    }
  },
  {
    id: '7',
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
    accessLevel: 'limited',
    capabilities: ['sensor-monitoring', 'automation', 'data-collection'],
    config: {
      sensors: ['temperature', 'humidity', 'motion', 'light'],
      lastReading: {
        temperature: '22.5°C',
        humidity: '45%',
        motion: 'inactive',
        light: '350 lux'
      },
      automationRules: ['Auto lights at sunset', 'Climate control'],
      notifications: true
    }
  },
  {
    id: '8',
    name: 'Network Switch',
    type: 'switch',
    status: 'online',
    ip: '192.168.1.2',
    lastSeen: new Date(),
    os: 'Cisco IOS',
    services: ['SNMP', 'Telnet', 'SSH'],
    uptime: '156 days, 9:12:34',
    cpu: 8,
    memory: 25,
    network: { upload: 2450.5, download: 1876.3 },
    security: { firewall: true, encryption: true, updates: true },
    accessLevel: 'full',
    capabilities: ['port-management', 'vlan-config', 'traffic-monitoring'],
    config: {
      autoRestart: false,
      notifications: true
    }
  },
  {
    id: '9',
    name: 'Mobile Device',
    type: 'mobile',
    status: 'offline',
    ip: '192.168.1.75',
    lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
    os: 'Android 13',
    services: ['ADB', 'SSH'],
    uptime: '0 days, 0:00:00',
    security: { firewall: false, encryption: true, updates: true },
    accessLevel: 'restricted',
    capabilities: ['remote-control', 'file-access'],
    config: {
      notifications: false
    }
  }
];