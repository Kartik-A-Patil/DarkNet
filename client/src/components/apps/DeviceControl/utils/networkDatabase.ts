import { openDB, IDBPDatabase } from 'idb';
import { DatabaseRecord, NetworkData } from '../types';

const NETWORK_DB_NAME = 'darknet-network-devices';
const NETWORK_DB_VERSION = 1;

let networkDbPromise: Promise<IDBPDatabase> | null = null;

const initNetworkDB = async () => {
  if (!networkDbPromise) {
    networkDbPromise = openDB(NETWORK_DB_NAME, NETWORK_DB_VERSION, {
      upgrade(db) {
        // Device data storage
        if (!db.objectStoreNames.contains('device_data')) {
          const deviceStore = db.createObjectStore('device_data', { keyPath: 'id' });
          deviceStore.createIndex('deviceId', 'deviceId', { unique: false });
          deviceStore.createIndex('table', 'table', { unique: false });
        }
        
        // Network communications
        if (!db.objectStoreNames.contains('network_logs')) {
          const networkStore = db.createObjectStore('network_logs', { keyPath: 'id' });
          networkStore.createIndex('sourceDevice', 'sourceDevice', { unique: false });
          networkStore.createIndex('targetDevice', 'targetDevice', { unique: false });
          networkStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Device configurations
        if (!db.objectStoreNames.contains('device_configs')) {
          db.createObjectStore('device_configs', { keyPath: 'deviceId' });
        }
        
        // External connections
        if (!db.objectStoreNames.contains('external_connections')) {
          const connStore = db.createObjectStore('external_connections', { keyPath: 'id' });
          connStore.createIndex('deviceId', 'deviceId', { unique: false });
        }
      }
    });
  }
  return networkDbPromise;
};

// Database operations for device data
export const saveDeviceData = async (deviceId: string, table: string, data: any): Promise<string> => {
  const db = await initNetworkDB();
  const record: DatabaseRecord = {
    id: `${deviceId}_${table}_${Date.now()}`,
    table,
    data,
    timestamp: new Date(),
    deviceId
  };
  await db.put('device_data', record);
  return record.id;
};

export const getDeviceData = async (deviceId: string, table?: string): Promise<DatabaseRecord[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('device_data', 'readonly');
  const index = tx.store.index('deviceId');
  const allRecords = await index.getAll(deviceId);
  
  if (table) {
    return allRecords.filter(record => record.table === table);
  }
  return allRecords;
};

export const deleteDeviceData = async (recordId: string): Promise<void> => {
  const db = await initNetworkDB();
  await db.delete('device_data', recordId);
};

// Network communication logs
export const logNetworkActivity = async (activity: Omit<NetworkData, 'id' | 'timestamp'>): Promise<void> => {
  const db = await initNetworkDB();
  const networkData: NetworkData = {
    id: `net_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...activity
  };
  await db.put('network_logs', networkData);
};

export const getNetworkLogs = async (deviceId?: string): Promise<NetworkData[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('network_logs', 'readonly');
  
  if (deviceId) {
    const sourceIndex = tx.store.index('sourceDevice');
    const targetIndex = tx.store.index('targetDevice');
    const [sourceResults, targetResults] = await Promise.all([
      sourceIndex.getAll(deviceId),
      targetIndex.getAll(deviceId)
    ]);
    return [...sourceResults, ...targetResults].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  const allLogs = await tx.store.getAll();
  return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Device configuration storage
export const saveDeviceConfig = async (deviceId: string, config: any): Promise<void> => {
  const db = await initNetworkDB();
  await db.put('device_configs', { deviceId, config, lastUpdated: new Date() });
};

export const getDeviceConfig = async (deviceId: string): Promise<any> => {
  const db = await initNetworkDB();
  const result = await db.get('device_configs', deviceId);
  return result?.config;
};

// External connections management
export const createExternalConnection = async (deviceId: string, connectionData: any): Promise<string> => {
  const db = await initNetworkDB();
  const connectionId = `conn_${deviceId}_${Date.now()}`;
  await db.put('external_connections', {
    id: connectionId,
    deviceId,
    ...connectionData,
    createdAt: new Date()
  });
  return connectionId;
};

export const getExternalConnections = async (deviceId: string): Promise<any[]> => {
  const db = await initNetworkDB();
  const tx = db.transaction('external_connections', 'readonly');
  const index = tx.store.index('deviceId');
  return await index.getAll(deviceId);
};

// Utility functions
export const clearAllNetworkData = async (): Promise<void> => {
  const db = await initNetworkDB();
  const stores = ['device_data', 'network_logs', 'device_configs', 'external_connections'];
  
  for (const storeName of stores) {
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.clear();
  }
};

export const getNetworkStats = async (): Promise<{
  totalRecords: number;
  totalLogs: number;
  totalConnections: number;
  deviceCount: number;
}> => {
  const db = await initNetworkDB();
  const [records, logs, connections] = await Promise.all([
    db.getAll('device_data'),
    db.getAll('network_logs'),
    db.getAll('external_connections')
  ]);
  
  const deviceIds = new Set([
    ...records.map(r => r.deviceId),
    ...logs.map(l => l.sourceDevice),
    ...logs.map(l => l.targetDevice)
  ]);
  
  return {
    totalRecords: records.length,
    totalLogs: logs.length,
    totalConnections: connections.length,
    deviceCount: deviceIds.size
  };
};
