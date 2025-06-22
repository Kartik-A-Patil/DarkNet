import { openDB, IDBPDatabase } from 'idb';

// Network File System Types
export interface NetworkNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string | ArrayBuffer;
  mimeType?: string;
  permissions: string;
  owner: string;
  created: Date;
  modified: Date;
  deviceId: string;
  deviceIp: string;
  children?: { [key: string]: NetworkNode };
  isShared?: boolean;
  sharePermissions?: 'read' | 'write' | 'full';
}

export interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: string;
  status: 'online' | 'offline' | 'connecting';
  accessLevel: 'full' | 'limited' | 'read-only' | 'restricted';
  rootPath: string;
  shares: NetworkShare[];
  lastAccessed: Date;
}

export interface NetworkShare {
  id: string;
  name: string;
  path: string;
  permissions: 'read' | 'write' | 'full';
  protocol: 'smb' | 'ftp' | 'nfs' | 'ssh';
  enabled: boolean;
  users: string[];
  deviceId: string;
}

export interface NetworkTransfer {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourcePath: string;
  targetPath: string;
  fileName: string;
  size: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  progress: number;
  speed?: number;
  started: Date;
  completed?: Date;
  error?: string;
}

const DB_NAME = 'darknet-network-fs';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const initNetworkDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Network nodes (files and directories)
        if (!db.objectStoreNames.contains('networkNodes')) {
          const nodeStore = db.createObjectStore('networkNodes', { keyPath: 'id' });
          nodeStore.createIndex('deviceId', 'deviceId', { unique: false });
          nodeStore.createIndex('path', 'path', { unique: false });
          nodeStore.createIndex('devicePath', ['deviceId', 'path'], { unique: true });
        }

        // Network devices
        if (!db.objectStoreNames.contains('networkDevices')) {
          const deviceStore = db.createObjectStore('networkDevices', { keyPath: 'id' });
          deviceStore.createIndex('ip', 'ip', { unique: true });
        }

        // Network shares
        if (!db.objectStoreNames.contains('networkShares')) {
          const shareStore = db.createObjectStore('networkShares', { keyPath: 'id' });
          shareStore.createIndex('deviceId', 'deviceId', { unique: false });
        }

        // Transfer history
        if (!db.objectStoreNames.contains('networkTransfers')) {
          const transferStore = db.createObjectStore('networkTransfers', { keyPath: 'id' });
          transferStore.createIndex('sourceDevice', 'sourceDeviceId', { unique: false });
          transferStore.createIndex('targetDevice', 'targetDeviceId', { unique: false });
          transferStore.createIndex('status', 'status', { unique: false });
        }

        // Network access logs
        if (!db.objectStoreNames.contains('networkLogs')) {
          const logStore = db.createObjectStore('networkLogs', { keyPath: 'id' });
          logStore.createIndex('deviceId', 'deviceId', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      }
    });
  }
  return dbPromise;
};

// Network Device Operations
export const saveNetworkDevice = async (device: NetworkDevice): Promise<void> => {
  const db = await initNetworkDB();
  await db.put('networkDevices', device);
};

export const getNetworkDevice = async (id: string): Promise<NetworkDevice | undefined> => {
  const db = await initNetworkDB();
  return await db.get('networkDevices', id);
};

export const getNetworkDeviceByIp = async (ip: string): Promise<NetworkDevice | undefined> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkDevices', 'readonly');
  const index = tx.store.index('ip');
  return await index.get(ip);
};

export const getAllNetworkDevices = async (): Promise<NetworkDevice[]> => {
  try {
    const db = await initNetworkDB();
    const devices = await db.getAll('networkDevices');
    console.log('Retrieved network devices from database:', devices.length);
    return devices;
  } catch (error) {
    console.error('Failed to get all network devices:', error);
    throw error;
  }
};

export const deleteNetworkDevice = async (id: string): Promise<void> => {
  const db = await initNetworkDB();
  const tx = db.transaction(['networkDevices', 'networkNodes', 'networkShares'], 'readwrite');
  
  // Delete device
  await tx.objectStore('networkDevices').delete(id);
  
  // Delete all nodes for this device
  const nodeIndex = tx.objectStore('networkNodes').index('deviceId');
  const nodeKeys = await nodeIndex.getAllKeys(id);
  for (const key of nodeKeys) {
    await tx.objectStore('networkNodes').delete(key);
  }
  
  // Delete all shares for this device
  const shareIndex = tx.objectStore('networkShares').index('deviceId');
  const shareKeys = await shareIndex.getAllKeys(id);
  for (const key of shareKeys) {
    await tx.objectStore('networkShares').delete(key);
  }
  
  await tx.done;
};

// Network Node Operations
export const saveNetworkNode = async (node: NetworkNode): Promise<void> => {
  const db = await initNetworkDB();
  await db.put('networkNodes', node);
};

export const getNetworkNode = async (id: string): Promise<NetworkNode | undefined> => {
  const db = await initNetworkDB();
  return await db.get('networkNodes', id);
};

export const getNetworkNodeByPath = async (deviceId: string, path: string): Promise<NetworkNode | undefined> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkNodes', 'readonly');
  const index = tx.store.index('devicePath');
  return await index.get([deviceId, path]);
};

export const getNetworkNodesByDevice = async (deviceId: string): Promise<NetworkNode[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkNodes', 'readonly');
  const index = tx.store.index('deviceId');
  return await index.getAll(deviceId);
};

export const getNetworkDirectoryChildren = async (deviceId: string, path: string): Promise<NetworkNode[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkNodes', 'readonly');
  const index = tx.store.index('deviceId');
  const allNodes = await index.getAll(deviceId);
  
  // Filter children of the specified directory
  return allNodes.filter(node => {
    const parentPath = node.path.substring(0, node.path.lastIndexOf('/')) || '/';
    return parentPath === path && node.path !== path;
  });
};

export const deleteNetworkNode = async (id: string): Promise<void> => {
  const db = await initNetworkDB();
  const node = await db.get('networkNodes', id);
  if (!node) return;

  const tx = db.transaction('networkNodes', 'readwrite');
  
  if (node.type === 'directory') {
    // Delete all children recursively
    const allNodes = await tx.store.getAll();
    const toDelete = allNodes.filter(n => 
      n.deviceId === node.deviceId && n.path.startsWith(node.path + '/')
    );
    
    for (const childNode of toDelete) {
      await tx.store.delete(childNode.id);
    }
  }
  
  await tx.store.delete(id);
  await tx.done;
};

// Network Share Operations
export const saveNetworkShare = async (share: NetworkShare): Promise<void> => {
  const db = await initNetworkDB();
  await db.put('networkShares', share);
};

export const getNetworkShare = async (id: string): Promise<NetworkShare | undefined> => {
  const db = await initNetworkDB();
  return await db.get('networkShares', id);
};

export const getNetworkSharesByDevice = async (deviceId: string): Promise<NetworkShare[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkShares', 'readonly');
  const index = tx.store.index('deviceId');
  return await index.getAll(deviceId);
};

export const deleteNetworkShare = async (id: string): Promise<void> => {
  const db = await initNetworkDB();
  await db.delete('networkShares', id);
};

// Network Transfer Operations
export const saveNetworkTransfer = async (transfer: NetworkTransfer): Promise<void> => {
  const db = await initNetworkDB();
  await db.put('networkTransfers', transfer);
};

export const getNetworkTransfer = async (id: string): Promise<NetworkTransfer | undefined> => {
  const db = await initNetworkDB();
  return await db.get('networkTransfers', id);
};

export const getAllNetworkTransfers = async (): Promise<NetworkTransfer[]> => {
  const db = await initNetworkDB();
  return await db.getAll('networkTransfers');
};

export const getTransfersByStatus = async (status: NetworkTransfer['status']): Promise<NetworkTransfer[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('networkTransfers', 'readonly');
  const index = tx.store.index('status');
  return await index.getAll(status);
};

// Network Access Logging
export const logNetworkAccess = async (deviceId: string, action: string, path: string, details?: any): Promise<void> => {
  const db = await initNetworkDB();
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    deviceId,
    action,
    path,
    details,
    timestamp: new Date(),
    userAgent: navigator.userAgent
  };
  await db.put('networkLogs', log);
};

// Clear all network data from database
export const clearNetworkDatabase = async (): Promise<void> => {
  try {
    console.log('Clearing network database...');
    const db = await initNetworkDB();
    
    // Clear all stores
    const tx = db.transaction(['networkDevices', 'networkNodes', 'networkShares', 'networkTransfers', 'networkLogs'], 'readwrite');
    await tx.objectStore('networkDevices').clear();
    await tx.objectStore('networkNodes').clear();
    await tx.objectStore('networkShares').clear();
    await tx.objectStore('networkTransfers').clear();
    await tx.objectStore('networkLogs').clear();
    await tx.done;
    
    console.log('Network database cleared successfully');
  } catch (error) {
    console.error('Failed to clear network database:', error);
    throw error;
  }
};

// Database management utilities
export const getDatabaseInfo = async (): Promise<{
  devices: number;
  nodes: number;
  shares: number;
  transfers: number;
  logs: number;
}> => {
  try {
    const db = await initNetworkDB();
    
    const [devices, nodes, shares, transfers, logs] = await Promise.all([
      db.count('networkDevices'),
      db.count('networkNodes'),
      db.count('networkShares'),
      db.count('networkTransfers'),
      db.count('networkLogs')
    ]);
    
    return { devices, nodes, shares, transfers, logs };
  } catch (error) {
    console.error('Failed to get database info:', error);
    return { devices: 0, nodes: 0, shares: 0, transfers: 0, logs: 0 };
  }
};

// Utility Functions
export const generateNodeId = (deviceId: string, path: string): string => {
  return `${deviceId}:${path}`;
};

export const generateTransferId = (): string => {
  return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const initializeNetworkDevice = async (device: any): Promise<NetworkDevice> => {
  const networkDevice: NetworkDevice = {
    id: device.id,
    name: device.name,
    ip: device.ip,
    type: device.type,
    status: device.status,
    accessLevel: device.accessLevel || 'limited',
    rootPath: '/',
    shares: [],
    lastAccessed: new Date()
  };

  // Create shares based on device type
  if (device.type === 'database') {
    // Database-specific shares with realistic structure
    networkDevice.shares = [
      {
        id: `share_${device.id}_data`,
        name: 'Database Files',
        path: '/var/lib/mysql',
        permissions: device.accessLevel === 'full' ? 'full' : 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['dba', 'root'],
        deviceId: device.id
      },
      {
        id: `share_${device.id}_logs`,
        name: 'Database Logs',
        path: '/var/log/mysql',
        permissions: 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['dba', 'monitor'],
        deviceId: device.id
      },
      {
        id: `share_${device.id}_backups`,
        name: 'Database Backups',
        path: '/backups/mysql',
        permissions: device.accessLevel === 'full' ? 'full' : 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['dba', 'backup'],
        deviceId: device.id
      },
      {
        id: `share_${device.id}_config`,
        name: 'Database Config',
        path: '/etc/mysql',
        permissions: device.accessLevel === 'full' ? 'full' : 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['dba'],
        deviceId: device.id
      }
    ];
  } else if (device.type === 'nas' && device.config?.sharedFolders) {
    // Handle both string arrays and object arrays for sharedFolders
    networkDevice.shares = device.config.sharedFolders.map((folder: any, index: number) => {
      // If folder is a string, treat it as a path
      if (typeof folder === 'string') {
        return {
          id: `share_${device.id}_${index}`,
          name: folder.split('/').pop() || folder,
          path: folder,
          permissions: 'full' as const,
          protocol: 'smb' as const,
          enabled: true,
          users: ['*'],
          deviceId: device.id
        };
      }
      // If folder is an object, extract properties safely
      else {
        return {
          id: `share_${device.id}_${index}`,
          name: folder.name || folder.path?.split('/').pop() || 'Unknown',
          path: folder.path || '/unknown',
          permissions: 'full' as const,
          protocol: 'smb' as const,
          enabled: folder.enabled !== false,
          users: Array.isArray(folder.users) ? folder.users : ['*'],
          deviceId: device.id
        };
      }
    });
  } else if (device.type === 'router') {
    // Router-specific shares
    networkDevice.shares = [
      {
        id: `share_${device.id}_config`,
        name: 'Router Config',
        path: '/etc/config',
        permissions: device.accessLevel === 'full' ? 'full' : 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['admin'],
        deviceId: device.id
      },
      {
        id: `share_${device.id}_logs`,
        name: 'System Logs',
        path: '/var/log',
        permissions: 'read',
        protocol: 'ssh',
        enabled: true,
        users: ['admin', 'monitor'],
        deviceId: device.id
      }
    ];
  } else {
    // Default shares for other device types
    const defaultShares = device.type === 'server' 
      ? ['/var/www', '/var/log', '/home/shared']
      : device.type === 'computer'
      ? ['/home/shared', '/tmp']
      : ['/shared'];

    networkDevice.shares = defaultShares.map((path, index) => ({
      id: `share_${device.id}_${index}`,
      name: path.split('/').pop() || 'root',
      path,
      permissions: device.accessLevel === 'full' ? 'full' as const : 'read' as const,
      protocol: 'ssh' as const,
      enabled: true,
      users: ['*'],
      deviceId: device.id
    }));
  }

  await saveNetworkDevice(networkDevice);
  
  // Create default directory structure
  await createDefaultDirectoryStructure(networkDevice, device);
  
  return networkDevice;
};

const createDefaultDirectoryStructure = async (device: NetworkDevice, deviceConfig?: any): Promise<void> => {
  const rootNode: NetworkNode = {
    id: generateNodeId(device.id, '/'),
    name: '/',
    path: '/',
    type: 'directory',
    permissions: 'rwxr-xr-x',
    owner: 'root',
    created: new Date(),
    modified: new Date(),
    deviceId: device.id,
    deviceIp: device.ip,
    children: {}
  };

  await saveNetworkNode(rootNode);

  // Create device-specific directory structures
  if (device.type === 'database') {
    await createDatabaseStructure(device, deviceConfig);
  } else if (device.type === 'router') {
    await createRouterStructure(device, deviceConfig);
  } else {
    // Create standard share directories for other devices
    for (const share of device.shares) {
      if (share.path !== '/') {
        const shareNode: NetworkNode = {
          id: generateNodeId(device.id, share.path),
          name: share.name,
          path: share.path,
          type: 'directory',
          permissions: share.permissions === 'full' ? 'rwxrwxrwx' : 'r-xr-xr-x',
          owner: 'network',
          created: new Date(),
          modified: new Date(),
          deviceId: device.id,
          deviceIp: device.ip,
          isShared: true,
          sharePermissions: share.permissions,
          children: {}
        };

        await saveNetworkNode(shareNode);
        
        // Create some sample files in shared directories
        await createSampleNetworkFiles(device, share.path);
      }
    }
  }
};

const createSampleNetworkFiles = async (device: NetworkDevice, basePath: string): Promise<void> => {
  const sampleFiles = [
    {
      name: 'README.txt',
      content: `Welcome to ${device.name}\n\nThis is a shared network directory.\nDevice IP: ${device.ip}\nAccess Level: ${device.accessLevel}\n\nLast updated: ${new Date().toISOString()}`,
      mimeType: 'text/plain'
    },
    {
      name: 'system_info.json',
      content: JSON.stringify({
        device: device.name,
        ip: device.ip,
        type: device.type,
        accessLevel: device.accessLevel,
        lastAccessed: device.lastAccessed,
        shares: device.shares.length
      }, null, 2),
      mimeType: 'application/json'
    }
  ];

  for (const file of sampleFiles) {
    const filePath = `${basePath}/${file.name}`;
    const fileNode: NetworkNode = {
      id: generateNodeId(device.id, filePath),
      name: file.name,
      path: filePath,
      type: 'file',
      size: file.content.length,
      content: file.content,
      mimeType: file.mimeType,
      permissions: 'rw-r--r--',
      owner: 'network',
      created: new Date(),
      modified: new Date(),
      deviceId: device.id,
      deviceIp: device.ip,
      isShared: true
    };

    await saveNetworkNode(fileNode);
  }
};

const createDatabaseStructure = async (device: NetworkDevice, config?: any): Promise<void> => {
  const now = new Date();
  const dbEngine = config?.config?.dbEngine || 'MySQL 8.0';
  const connections = config?.config?.connections || 45;
  
  // Create database directories and files
  const dbStructure = [
    // MySQL data directory
    { path: '/var/lib/mysql', type: 'directory', name: 'mysql' },
    { path: '/var/lib/mysql/mysql', type: 'directory', name: 'mysql' },
    { path: '/var/lib/mysql/information_schema', type: 'directory', name: 'information_schema' },
    { path: '/var/lib/mysql/performance_schema', type: 'directory', name: 'performance_schema' },
    { path: '/var/lib/mysql/sys', type: 'directory', name: 'sys' },
    
    // Application databases
    { path: '/var/lib/mysql/darknet_main', type: 'directory', name: 'darknet_main' },
    { path: '/var/lib/mysql/darknet_users', type: 'directory', name: 'darknet_users' },
    { path: '/var/lib/mysql/darknet_logs', type: 'directory', name: 'darknet_logs' },
    
    // Database files
    { 
      path: '/var/lib/mysql/darknet_main/users.ibd', 
      type: 'file', 
      name: 'users.ibd',
      content: `-- DarkNet Users Table Data File
-- MySQL InnoDB Data File
-- Engine: ${dbEngine}
-- Active Connections: ${connections}
-- Last Backup: ${new Date().toISOString()}

[Binary Data - Users Table]
Total Records: 15,847
Active Users: 12,394
Inactive Users: 3,453
Last Updated: ${now.toISOString()}

-- Recent Login Activity --
${now.toISOString()} - User 'admin' logged in from 192.168.1.100
${now.toISOString()} - User 'hacker01' failed login attempt from 192.168.1.25
${now.toISOString()} - User 'db_monitor' connected from 192.168.1.50
${now.toISOString()} - User 'backup_user' initiated backup process`,
      size: 2048576, // 2MB
      mimeType: 'application/octet-stream'
    },
    
    // Log directory
    { path: '/var/log/mysql', type: 'directory', name: 'mysql' },
    {
      path: '/var/log/mysql/error.log',
      type: 'file',
      name: 'error.log',
      content: `${now.toISOString()} [Note] Starting MySQL server...
${now.toISOString()} [Note] InnoDB: Buffer pool size: 128MB
${now.toISOString()} [Note] InnoDB: Log file size: 50MB
${now.toISOString()} [Note] InnoDB: Starting crash recovery
${now.toISOString()} [Note] InnoDB: Database was not shutdown normally!
${now.toISOString()} [Note] InnoDB: Starting crash recovery
${now.toISOString()} [Note] InnoDB: Recovery complete
${now.toISOString()} [Note] MySQL: Ready for connections
${now.toISOString()} [Note] Event Scheduler: Scheduler thread started
${now.toISOString()} [Warning] Access denied for user 'hacker'@'192.168.1.25' (using password: YES)
${now.toISOString()} [Warning] Multiple failed login attempts from 192.168.1.25
${now.toISOString()} [Note] Connection from 192.168.1.100 accepted
${now.toISOString()} [Note] Query: SELECT * FROM users WHERE active=1 LIMIT 1000
${now.toISOString()} [Note] Slow query detected: SELECT * FROM logs WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 YEAR)
${now.toISOString()} [Warning] Disk space low on /var/lib/mysql partition (15% remaining)`,
      size: 1024,
      mimeType: 'text/plain'
    },
    
    // General query log
    {
      path: '/var/log/mysql/general.log',
      type: 'file',
      name: 'general.log',
      content: `${now.toISOString()} Connect darknet_user@192.168.1.100 on darknet_main
${now.toISOString()} Query SELECT COUNT(*) FROM users WHERE last_login > '2025-06-01'
${now.toISOString()} Query SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100
${now.toISOString()} Query UPDATE user_sessions SET last_activity = NOW() WHERE user_id = 1001
${now.toISOString()} Query INSERT INTO access_logs (user_id, action, ip_address, user_agent) VALUES (1001, 'file_access', '192.168.1.100', 'DarkNet-Browser/2.0')
${now.toISOString()} Query SELECT p.*, u.username FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.status = 'active'
${now.toISOString()} Query SELECT network_traffic FROM monitoring WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)
${now.toISOString()} Query UPDATE device_status SET cpu_usage = 23, memory_usage = 67, last_update = NOW() WHERE device_id = 'main_db'
${now.toISOString()} Quit darknet_user@192.168.1.100`,
      size: 2048,
      mimeType: 'text/plain'
    },
    
    // Configuration
    { path: '/etc/mysql', type: 'directory', name: 'mysql' },
    {
      path: '/etc/mysql/my.cnf',
      type: 'file',
      name: 'my.cnf',
      content: `# MySQL Configuration File
# DarkNet Database Server
# Generated: ${now.toISOString()}

[mysqld]
user = mysql
port = 3306
datadir = /var/lib/mysql
socket = /var/run/mysqld/mysqld.sock

# Connection Settings
max_connections = 200
max_user_connections = 50
connect_timeout = 10
wait_timeout = 28800
interactive_timeout = 28800

# Buffer Settings
innodb_buffer_pool_size = 128M
innodb_log_file_size = 50M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Security Settings
bind-address = 0.0.0.0
skip-name-resolve
secure_file_priv = /var/lib/mysql-files/
local_infile = 0

# Logging
general_log = 1
general_log_file = /var/log/mysql/general.log
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Replication (if enabled)
server-id = 1
log-bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7

[client]
port = 3306
socket = /var/run/mysqld/mysqld.sock
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4`,
      size: 1024,
      mimeType: 'text/plain'
    },
    
    // Backup directory
    { path: '/backups/mysql', type: 'directory', name: 'mysql' },
    {
      path: '/backups/mysql/daily_backup_' + now.toISOString().split('T')[0] + '.sql',
      type: 'file',
      name: 'daily_backup_' + now.toISOString().split('T')[0] + '.sql',
      content: `-- MySQL dump 10.13  Distrib ${dbEngine}
-- Host: localhost    Database: darknet_main
-- Server version: ${dbEngine}
-- Backup started: ${now.toISOString()}

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;

--
-- Current Database: darknet_main
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ darknet_main /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE darknet_main;

--
-- Table structure for table 'users'
--

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  email varchar(100) NOT NULL,
  password_hash varchar(255) NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp NULL DEFAULT NULL,
  status enum('active','inactive','suspended') DEFAULT 'active',
  access_level enum('user','admin','dba') DEFAULT 'user',
  failed_login_attempts int(11) DEFAULT 0,
  last_failed_login timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email),
  KEY idx_status (status),
  KEY idx_last_login (last_login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table 'system_logs'
--

DROP TABLE IF EXISTS system_logs;
CREATE TABLE system_logs (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  user_id int(11) DEFAULT NULL,
  action varchar(100) NOT NULL,
  ip_address varchar(45) NOT NULL,
  user_agent text,
  timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
  details json DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_timestamp (timestamp),
  KEY idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Backup Statistics
--

-- Backup completed: ${now.toISOString()}
-- Total tables backed up: 15
-- Total records backed up: 15,847
-- Backup size: 25.6MB
-- Backup duration: 45 seconds
-- Compression: gzip
-- Backup integrity: VERIFIED`,
      size: 26843545, // ~25MB
      mimeType: 'application/sql'
    },
    
    // Performance monitoring
    {
      path: '/var/log/mysql/slow.log',
      type: 'file',
      name: 'slow.log',
      content: `# Slow Query Log
# Generated: ${now.toISOString()}

# Time: ${now.toISOString()}
# User@Host: darknet_user[darknet_user] @ [192.168.1.100]
# Query_time: 5.234567  Lock_time: 0.000234 Rows_sent: 1234  Rows_examined: 567890
SET timestamp=${Math.floor(now.getTime() / 1000)};
SELECT u.*, COUNT(l.id) as log_count FROM users u LEFT JOIN system_logs l ON u.id = l.user_id WHERE u.created_at > '2024-01-01' GROUP BY u.id ORDER BY log_count DESC;

# Time: ${now.toISOString()}
# User@Host: monitor[monitor] @ [192.168.1.50]
# Query_time: 3.456789  Lock_time: 0.001234 Rows_sent: 5678  Rows_examined: 123456
SET timestamp=${Math.floor(now.getTime() / 1000)};
SELECT DATE(timestamp) as date, COUNT(*) as count, AVG(response_time) as avg_response FROM access_logs WHERE timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(timestamp);`,
      size: 4096,
      mimeType: 'text/plain'
    }
  ];

  // Create all database structure
  for (const item of dbStructure) {
    const node: NetworkNode = {
      id: generateNodeId(device.id, item.path),
      name: item.name,
      path: item.path,
      type: item.type as 'file' | 'directory',
      permissions: item.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--',
      owner: item.path.includes('/var/lib/mysql') ? 'mysql' : 'root',
      created: now,
      modified: now,
      deviceId: device.id,
      deviceIp: device.ip,
      ...(item.type === 'file' && {
        content: item.content,
        size: item.size,
        mimeType: item.mimeType
      })
    };

    await saveNetworkNode(node);
  }
};

const createRouterStructure = async (device: NetworkDevice, config?: any): Promise<void> => {
  const now = new Date();
  
  const routerStructure = [
    // Config directory
    { path: '/etc/config', type: 'directory', name: 'config' },
    {
      path: '/etc/config/network',
      type: 'file',
      name: 'network',
      content: `# Network Configuration
# Generated: ${now.toISOString()}

config interface 'loopback'
    option ifname 'lo'
    option proto 'static'
    option ipaddr '127.0.0.1'
    option netmask '255.0.0.0'

config interface 'lan'
    option ifname 'eth0'
    option proto 'static'
    option ipaddr '192.168.1.1'
    option netmask '255.255.255.0'
    option gateway '192.168.1.1'
    option dns '8.8.8.8 8.8.4.4'

config interface 'wan'
    option ifname 'eth1'
    option proto 'dhcp'
    option hostname 'darknet-router'

config interface 'wifi'
    option ifname 'wlan0'
    option proto 'static'
    option ipaddr '192.168.1.1'
    option netmask '255.255.255.0'`,
      size: 512,
      mimeType: 'text/plain'
    },
    
    // System logs
    { path: '/var/log', type: 'directory', name: 'log' },
    {
      path: '/var/log/messages',
      type: 'file',
      name: 'messages',
      content: `${now.toISOString()} kernel: [    0.000000] Linux version 5.4.0-openwrt
${now.toISOString()} kernel: [    0.000000] CPU: ARMv7 Processor rev 0 (v7l)
${now.toISOString()} kernel: [    1.234567] Booting Linux on physical CPU 0x0
${now.toISOString()} dnsmasq[1234]: started, version 2.85
${now.toISOString()} dnsmasq[1234]: compile time options: IPv6 GNU-getopt DBus no-i18n IDN2 DHCP DHCPv6 no-Lua TFTP no-conntrack ipset auth DNSSEC loop-detect inotify dumpfile
${now.toISOString()} dnsmasq[1234]: DHCP, IP range 192.168.1.100 -- 192.168.1.200, lease time 12h
${now.toISOString()} hostapd: wlan0: interface state UNINITIALIZED->ENABLED
${now.toISOString()} hostapd: wlan0: AP-ENABLED
${now.toISOString()} hostapd: wlan0: STA a4:b1:c2:d3:e4:f5 IEEE 802.11: authenticated
${now.toISOString()} hostapd: wlan0: STA a4:b1:c2:d3:e4:f5 IEEE 802.11: associated (aid 1)
${now.toISOString()} dropbear[2345]: Child connection from 192.168.1.100:52341
${now.toISOString()} dropbear[2345]: Successful login for 'admin' from 192.168.1.100
${now.toISOString()} kernel: [12345.678901] ath10k_pci 0000:01:00.0: firmware crashed!
${now.toISOString()} kernel: [12345.678902] ath10k_pci 0000:01:00.0: qca988x hw2.0 target 0x4100016c chip_id 0x043202ff sub 0000:0000
${now.toISOString()} kernel: [12345.678903] ath10k_pci 0000:01:00.0: kconfig debug 0 debugfs 1 tracing 1 dfs 0 testmode 0`,
      size: 2048,
      mimeType: 'text/plain'
    },
    
    // Firewall rules
    {
      path: '/etc/config/firewall',
      type: 'file',
      name: 'firewall',
      content: `# Firewall Configuration
# Generated: ${now.toISOString()}

config defaults
    option syn_flood 1
    option input ACCEPT
    option output ACCEPT
    option forward REJECT
    option disable_ipv6 0

config zone
    option name 'lan'
    option input ACCEPT
    option output ACCEPT
    option forward ACCEPT
    list network 'lan'
    list network 'wifi'

config zone
    option name 'wan'
    option input REJECT
    option output ACCEPT
    option forward REJECT
    option masq 1
    option mtu_fix 1
    list network 'wan'

config forwarding
    option src 'lan'
    option dest 'wan'

# Port forwarding rules
config redirect
    option target 'DNAT'
    option src 'wan'
    option dest 'lan'
    option proto 'tcp'
    option src_dport '80'
    option dest_ip '192.168.1.100'
    option dest_port '80'
    option name 'HTTP Server'

config redirect
    option target 'DNAT'
    option src 'wan'
    option dest 'lan'
    option proto 'tcp'
    option src_dport '3306'
    option dest_ip '192.168.1.100'
    option dest_port '3306'
    option name 'MySQL Database'`,
      size: 1024,
      mimeType: 'text/plain'
    }
  ];

  for (const item of routerStructure) {
    const node: NetworkNode = {
      id: generateNodeId(device.id, item.path),
      name: item.name,
      path: item.path,
      type: item.type as 'file' | 'directory',
      permissions: item.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--',
      owner: 'root',
      created: now,
      modified: now,
      deviceId: device.id,
      deviceIp: device.ip,
      ...(item.type === 'file' && {
        content: item.content,
        size: item.size,
        mimeType: item.mimeType
      })
    };

    await saveNetworkNode(node);
  }
};

// Initialize sample network devices
export const initializeSampleNetworkData = async (): Promise<void> => {
  try {
    console.log('=== Starting initializeSampleNetworkData ===');
    const existingDevices = await getAllNetworkDevices();
    console.log(`Found ${existingDevices.length} existing devices`);
    
    // Always reinitialize for now to ensure we have fresh data
    if (existingDevices.length > 0) {
      console.log('Clearing existing devices and reinitializing...');
      await clearNetworkDatabase();
    }

    // Create sample network devices if mockDevices is not available
    let networkCapableDevices: any[] = [];
    
    try {
      console.log('Attempting to import mockDevices...');
      // Try to import mock devices
      const { mockDevices } = await import('../components/apps/DeviceControl/data/mockDevices');
      console.log(`Imported ${mockDevices.length} mock devices`);
      
      // Include ALL devices that are online, including databases
      networkCapableDevices = mockDevices.filter(device => 
        device.status === 'online' && 
        (device.type === 'nas' || device.type === 'server' || device.type === 'computer' || 
         device.type === 'database' || device.type === 'router' || device.type === 'switch') &&
        device.accessLevel !== 'restricted'
      );
      
      console.log(`Filtered to ${networkCapableDevices.length} network-capable devices:`, 
        networkCapableDevices.map(d => `${d.name} (${d.type})`));
      
      // Clean up any devices that might have problematic configurations
      networkCapableDevices = networkCapableDevices.map(device => ({
        ...device,
        config: device.config ? {
          ...device.config,
          // Ensure sharedFolders is an array of strings, not objects
          sharedFolders: Array.isArray(device.config.sharedFolders) 
            ? device.config.sharedFolders.map((folder: any) => 
                typeof folder === 'string' ? folder : folder.path || '/unknown'
              )
            : device.config.sharedFolders
        } : device.config
      }));
      
      console.log('Network devices ready for initialization:', networkCapableDevices.map(d => `${d.name} (${d.type})`));
    } catch (importError) {
      console.warn('Could not import mockDevices, creating default network devices:', importError);
      
      // Create default network devices including a realistic database
      networkCapableDevices = [
        {
          id: 'default-db-1',
          name: 'Main Database Server',
          type: 'database',
          status: 'online',
          ip: '192.168.1.100',
          accessLevel: 'full',
          os: 'Ubuntu Server 20.04',
          services: ['MySQL', 'Redis', 'MongoDB'],
          uptime: '45 days, 12:34:56',
          cpu: 23,
          memory: 67,
          storage: 78,
          network: { upload: 125.5, download: 89.2 },
          config: {
            dbEngine: 'MySQL 8.0',
            connections: 45,
            maxConnections: 200,
            backupSchedule: 'Daily at 2:00 AM'
          }
        },
        {
          id: 'default-server-1',
          name: 'Network File Server',
          type: 'server',
          status: 'online',
          ip: '192.168.1.101',
          accessLevel: 'full',
          os: 'Linux Server',
          services: ['SMB', 'FTP', 'SSH']
        },
        {
          id: 'default-nas-1',
          name: 'Network Storage',
          type: 'nas',
          status: 'online',
          ip: '192.168.1.102',
          accessLevel: 'limited',
          os: 'NAS OS',
          services: ['SMB', 'NFS'],
          config: {
            sharedFolders: ['/media', '/backups', '/documents']
          }
        }
      ];
    }

    // Initialize each device
    console.log(`Starting to initialize ${networkCapableDevices.length} devices...`);
    for (let i = 0; i < networkCapableDevices.length; i++) {
      const device = networkCapableDevices[i];
      try {
        console.log(`Initializing device ${i + 1}/${networkCapableDevices.length}: ${device.name} (${device.type})`);
        await initializeNetworkDevice(device);
        await logNetworkAccess(device.id, 'initialize', '/', { 
          message: `${device.type.toUpperCase()} device initialized in network filesystem`,
          deviceType: device.type,
          services: device.services || []
        });
        console.log(`Successfully initialized ${device.name}`);
      } catch (deviceError) {
        console.error(`Failed to initialize device ${device.name}:`, deviceError);
        // Continue with other devices
      }
    }
    console.log('=== Completed initializeSampleNetworkData ===');
  } catch (error) {
    console.error('Failed to initialize sample network data:', error);
    throw error;
  }
};

// Debug function to check database state
export const debugNetworkDatabase = async (): Promise<void> => {
  try {
    console.log('=== Network Database Debug ===');
    const db = await initNetworkDB();
    console.log('Database initialized successfully');
    
    const devices = await getAllNetworkDevices();
    console.log(`Found ${devices.length} network devices:`);
    devices.forEach(device => {
      console.log(`- ${device.name} (${device.type}) - ${device.ip} - ${device.status}`);
    });
    
    const allNodes = await db.getAll('networkNodes');
    console.log(`Found ${allNodes.length} network nodes`);
    
    const allShares = await db.getAll('networkShares');
    console.log(`Found ${allShares.length} network shares`);
    
    console.log('=== End Debug ===');
  } catch (error) {
    console.error('Debug failed:', error);
  }
};

// Add debug functions to window for testing
if (typeof window !== 'undefined') {
  (window as any).debugNetworkFS = {
    initializeSampleNetworkData,
    debugNetworkDatabase,
    clearNetworkDatabase,
    getAllNetworkDevices
  };
}
