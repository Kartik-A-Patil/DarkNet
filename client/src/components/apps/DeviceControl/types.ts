export interface Device {
  id: string;
  name: string;
  type: 'database' | 'router' | 'computer' | 'server' | 'iot' | 'mobile';
  status: 'online' | 'offline' | 'connecting' | 'error';
  ip: string;
  lastSeen: Date;
  os?: string;
  services?: string[];
  uptime?: string;
  cpu?: number;
  memory?: number;
  storage?: number;
  network?: {
    upload: number;
    download: number;
  };
  security?: {
    firewall: boolean;
    encryption: boolean;
    updates: boolean;
  };
}

export interface ConnectionAnimation {
  from: string;
  to: string;
  active: boolean;
  type: 'data' | 'control' | 'sync' | 'attack' | 'secure';
}

export interface DeviceMetrics {
  cpu: number;
  memory: number;
  storage?: number;
  network?: {
    upload: number;
    download: number;
  };
}

export interface SecurityStatus {
  firewall: boolean;
  encryption: boolean;
  updates: boolean;
  score: number;
}

export type TabType = 'overview' | 'control' | 'monitoring' | 'security' | 'topology';
export type DeviceType = Device['type'];
export type DeviceStatus = Device['status'];
