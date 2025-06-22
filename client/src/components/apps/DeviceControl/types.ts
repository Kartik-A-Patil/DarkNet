export interface Device {
  id: string;
  name: string;
  type: 'database' | 'router' | 'computer' | 'server' | 'iot' | 'mobile' | 'nas' | 'camera' | 'switch';
  status: 'online' | 'offline' | 'connecting' | 'error' | 'maintenance';
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
  // Enhanced device-specific configurations
  config?: DeviceConfig;
  capabilities?: string[];
  accessLevel?: 'full' | 'limited' | 'read-only' | 'restricted';
}

export interface DeviceConfig {
  // NAS specific
  totalStorage?: number;
  usedStorage?: number;
  availableStorage?: number;
  storagePrice?: number; // per GB
  sharedFolders?: Array<{
    name: string;
    path: string;
    permissions: string;
    protocol: string;
    enabled: boolean;
    users: string[];
    created: string;
  }>;
  
  // Router specific
  wifiEnabled?: boolean;
  portForwarding?: Array<{
    port: number;
    target: string;
    enabled?: boolean;
    description?: string;
  }>;
  bandwidth?: {total: number, used: number};
  
  // Database specific
  dbEngine?: string;
  connections?: number;
  maxConnections?: number;
  backupSchedule?: string;
  
  // Camera specific
  resolution?: string;
  recordingEnabled?: boolean;
  motionDetection?: boolean;
  
  // IoT specific
  sensors?: string[];
  lastReading?: any;
  automationRules?: string[];
  
  // Server specific
  webServices?: string[];
  loadBalancer?: boolean;
  
  // General management
  maintenanceMode?: boolean;
  autoRestart?: boolean;
  notifications?: boolean;
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

export interface DeviceAction {
  id: string;
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'danger';
  requiresConfirmation?: boolean;
  description?: string;
}

export interface NetworkStorage {
  deviceId: string;
  name: string;
  path: string;
  size: number;
  used: number;
  accessible: boolean;
}
export type DeviceStatus = Device['status'];
