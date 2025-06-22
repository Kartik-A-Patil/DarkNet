// Network Database Utility Functions
// Simulates database operations for network devices and data storage

interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: string;
  status: string;
}

interface NetworkActivity {
  id: string;
  sourceDevice: string;
  targetDevice: string;
  type: 'sync' | 'command' | 'data' | 'control';
  data: any;
  timestamp: Date;
}

interface DeviceData {
  deviceId: string;
  table: string;
  data: any;
  timestamp: Date;
}

interface DeviceConfig {
  deviceId: string;
  config: any;
  timestamp: Date;
}

interface ExternalConnection {
  id: string;
  sourceDevice: string;
  targetDevice: string;
  protocol: string;
  port: number;
  status: 'active' | 'inactive' | 'error';
  timestamp: Date;
}

// In-memory storage simulation (in a real app, this would be a proper database)
class NetworkDatabase {
  private deviceData: Map<string, DeviceData[]> = new Map();
  private networkActivity: NetworkActivity[] = [];
  private deviceConfigs: Map<string, DeviceConfig> = new Map();
  private externalConnections: Map<string, ExternalConnection> = new Map();
  private devices: Map<string, NetworkDevice> = new Map();

  // Device Data Operations
  async saveDeviceData(deviceId: string, table: string, data: any): Promise<boolean> {
    try {
      const key = `${deviceId}:${table}`;
      const deviceDataList = this.deviceData.get(key) || [];
      
      const newEntry: DeviceData = {
        deviceId,
        table,
        data,
        timestamp: new Date()
      };
      
      deviceDataList.push(newEntry);
      
      // Keep only last 100 entries per table
      if (deviceDataList.length > 100) {
        deviceDataList.splice(0, deviceDataList.length - 100);
      }
      
      this.deviceData.set(key, deviceDataList);
      return true;
    } catch (error) {
      console.error('Failed to save device data:', error);
      return false;
    }
  }

  async getDeviceData(deviceId: string, table: string): Promise<any[]> {
    try {
      const key = `${deviceId}:${table}`;
      const deviceDataList = this.deviceData.get(key) || [];
      return deviceDataList.map(entry => entry.data);
    } catch (error) {
      console.error('Failed to get device data:', error);
      return [];
    }
  }

  // Network Activity Operations
  async logNetworkActivity(activity: Omit<NetworkActivity, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const newActivity: NetworkActivity = {
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      this.networkActivity.push(newActivity);
      
      // Keep only last 1000 activities
      if (this.networkActivity.length > 1000) {
        this.networkActivity.splice(0, this.networkActivity.length - 1000);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to log network activity:', error);
      return false;
    }
  }

  async getNetworkActivity(limit: number = 50): Promise<NetworkActivity[]> {
    try {
      return this.networkActivity
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get network activity:', error);
      return [];
    }
  }

  // Network Logs Operations
  async getNetworkLogs(deviceId?: string, limit: number = 100): Promise<NetworkActivity[]> {
    try {
      let logs = this.networkActivity;
      
      // Filter by device if specified
      if (deviceId) {
        logs = logs.filter(activity => 
          activity.sourceDevice === deviceId || 
          activity.targetDevice === deviceId
        );
      }
      
      // Sort by timestamp (newest first) and limit results
      return logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get network logs:', error);
      return [];
    }
  }

  async getNetworkLogsByType(type: NetworkActivity['type'], limit: number = 50): Promise<NetworkActivity[]> {
    try {
      return this.networkActivity
        .filter(activity => activity.type === type)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get network logs by type:', error);
      return [];
    }
  }

  async getNetworkLogsByDateRange(startDate: Date, endDate: Date): Promise<NetworkActivity[]> {
    try {
      return this.networkActivity
        .filter(activity => 
          activity.timestamp >= startDate && 
          activity.timestamp <= endDate
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get network logs by date range:', error);
      return [];
    }
  }

  // Device Configuration Operations
  async saveDeviceConfig(deviceId: string, config: any): Promise<boolean> {
    try {
      const deviceConfig: DeviceConfig = {
        deviceId,
        config,
        timestamp: new Date()
      };
      
      this.deviceConfigs.set(deviceId, deviceConfig);
      return true;
    } catch (error) {
      console.error('Failed to save device config:', error);
      return false;
    }
  }

  async getDeviceConfig(deviceId: string): Promise<any | null> {
    try {
      const deviceConfig = this.deviceConfigs.get(deviceId);
      return deviceConfig ? deviceConfig.config : null;
    } catch (error) {
      console.error('Failed to get device config:', error);
      return null;
    }
  }

  // External Connection Operations
  async createExternalConnection(connection: Omit<ExternalConnection, 'id' | 'timestamp'>): Promise<string | null> {
    try {
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newConnection: ExternalConnection = {
        ...connection,
        id: connectionId,
        timestamp: new Date()
      };
      
      this.externalConnections.set(connectionId, newConnection);
      return connectionId;
    } catch (error) {
      console.error('Failed to create external connection:', error);
      return null;
    }
  }

  async getExternalConnections(): Promise<ExternalConnection[]> {
    try {
      return Array.from(this.externalConnections.values());
    } catch (error) {
      console.error('Failed to get external connections:', error);
      return [];
    }
  }

  async updateConnectionStatus(connectionId: string, status: ExternalConnection['status']): Promise<boolean> {
    try {
      const connection = this.externalConnections.get(connectionId);
      if (connection) {
        connection.status = status;
        this.externalConnections.set(connectionId, connection);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update connection status:', error);
      return false;
    }
  }

  // Device Management Operations
  async registerDevice(device: NetworkDevice): Promise<boolean> {
    try {
      this.devices.set(device.id, device);
      return true;
    } catch (error) {
      console.error('Failed to register device:', error);
      return false;
    }
  }

  async getDevice(deviceId: string): Promise<NetworkDevice | null> {
    try {
      return this.devices.get(deviceId) || null;
    } catch (error) {
      console.error('Failed to get device:', error);
      return null;
    }
  }

  async getAllDevices(): Promise<NetworkDevice[]> {
    try {
      return Array.from(this.devices.values());
    } catch (error) {
      console.error('Failed to get all devices:', error);
      return [];
    }
  }

  // Utility Operations
  async clearAllNetworkData(): Promise<boolean> {
    try {
      this.deviceData.clear();
      this.networkActivity.length = 0;
      this.deviceConfigs.clear();
      this.externalConnections.clear();
      this.devices.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear network data:', error);
      return false;
    }
  }

  async getStorageStats(): Promise<{
    deviceDataEntries: number;
    networkActivities: number;
    deviceConfigs: number;
    externalConnections: number;
    devices: number;
  }> {
    try {
      let totalDeviceDataEntries = 0;
      this.deviceData.forEach(entries => {
        totalDeviceDataEntries += entries.length;
      });

      return {
        deviceDataEntries: totalDeviceDataEntries,
        networkActivities: this.networkActivity.length,
        deviceConfigs: this.deviceConfigs.size,
        externalConnections: this.externalConnections.size,
        devices: this.devices.size
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        deviceDataEntries: 0,
        networkActivities: 0,
        deviceConfigs: 0,
        externalConnections: 0,
        devices: 0
      };
    }
  }

  // Network Statistics Operations
  async getNetworkStats(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalConnections: number;
    activeConnections: number;
    totalDataTransfer: number;
    averageLatency: number;
    networkErrors: number;
    topActiveDevices: Array<{ deviceId: string; activityCount: number }>;
    recentActivity: NetworkActivity[];
  }> {
    try {
      const devices = Array.from(this.devices.values());
      const connections = Array.from(this.externalConnections.values());
      const recentActivities = this.networkActivity.slice(-50);

      // Calculate device statistics
      const totalDevices = devices.length;
      const onlineDevices = devices.filter(d => d.status === 'online').length;
      const offlineDevices = devices.filter(d => d.status === 'offline').length;

      // Calculate connection statistics
      const totalConnections = connections.length;
      const activeConnections = connections.filter(c => c.status === 'active').length;

      // Calculate network activity statistics
      const totalDataTransfer = this.networkActivity
        .filter(a => a.type === 'data')
        .reduce((sum, activity) => sum + (activity.data?.size || 1024), 0);

      // Simulate average latency (in a real system this would be measured)
      const averageLatency = Math.round(Math.random() * 50 + 10); // 10-60ms

      // Count network errors
      const networkErrors = this.networkActivity
        .filter(a => a.data?.error).length;

      // Get top active devices
      const deviceActivityCount = new Map<string, number>();
      this.networkActivity.forEach(activity => {
        deviceActivityCount.set(
          activity.sourceDevice, 
          (deviceActivityCount.get(activity.sourceDevice) || 0) + 1
        );
        deviceActivityCount.set(
          activity.targetDevice, 
          (deviceActivityCount.get(activity.targetDevice) || 0) + 1
        );
      });

      const topActiveDevices = Array.from(deviceActivityCount.entries())
        .map(([deviceId, count]) => ({ deviceId, activityCount: count }))
        .sort((a, b) => b.activityCount - a.activityCount)
        .slice(0, 5);

      return {
        totalDevices,
        onlineDevices,
        offlineDevices,
        totalConnections,
        activeConnections,
        totalDataTransfer,
        averageLatency,
        networkErrors,
        topActiveDevices,
        recentActivity: recentActivities
      };
    } catch (error) {
      console.error('Failed to get network stats:', error);
      return {
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        totalConnections: 0,
        activeConnections: 0,
        totalDataTransfer: 0,
        averageLatency: 0,
        networkErrors: 0,
        topActiveDevices: [],
        recentActivity: []
      };
    }
  }

  async getDeviceStats(deviceId: string): Promise<{
    device: NetworkDevice | null;
    totalActivities: number;
    incomingActivities: number;
    outgoingActivities: number;
    lastActivity: NetworkActivity | null;
    connections: ExternalConnection[];
    dataTransferred: number;
    errors: number;
  }> {
    try {
      const device = this.devices.get(deviceId) || null;
      
      const deviceActivities = this.networkActivity.filter(activity =>
        activity.sourceDevice === deviceId || activity.targetDevice === deviceId
      );

      const incomingActivities = this.networkActivity.filter(activity =>
        activity.targetDevice === deviceId
      ).length;

      const outgoingActivities = this.networkActivity.filter(activity =>
        activity.sourceDevice === deviceId
      ).length;

      const lastActivity = deviceActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;

      const connections = Array.from(this.externalConnections.values())
        .filter(conn => conn.sourceDevice === deviceId || conn.targetDevice === deviceId);

      const dataTransferred = deviceActivities
        .filter(a => a.type === 'data')
        .reduce((sum, activity) => sum + (activity.data?.size || 1024), 0);

      const errors = deviceActivities
        .filter(a => a.data?.error).length;

      return {
        device,
        totalActivities: deviceActivities.length,
        incomingActivities,
        outgoingActivities,
        lastActivity,
        connections,
        dataTransferred,
        errors
      };
    } catch (error) {
      console.error('Failed to get device stats:', error);
      return {
        device: null,
        totalActivities: 0,
        incomingActivities: 0,
        outgoingActivities: 0,
        lastActivity: null,
        connections: [],
        dataTransferred: 0,
        errors: 0
      };
    }
  }

  // Search Operations
  async searchNetworkActivity(query: string, deviceId?: string): Promise<NetworkActivity[]> {
    try {
      const filtered = this.networkActivity.filter(activity => {
        const matchesQuery = JSON.stringify(activity.data).toLowerCase().includes(query.toLowerCase()) ||
                           activity.type.toLowerCase().includes(query.toLowerCase());
        const matchesDevice = !deviceId || 
                            activity.sourceDevice === deviceId || 
                            activity.targetDevice === deviceId;
        
        return matchesQuery && matchesDevice;
      });

      return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to search network activity:', error);
      return [];
    }
  }
}

// Create singleton instance
const networkDB = new NetworkDatabase();

// Export individual functions for backward compatibility
export const saveDeviceData = (deviceId: string, table: string, data: any) => 
  networkDB.saveDeviceData(deviceId, table, data);

export const getDeviceData = (deviceId: string, table: string) => 
  networkDB.getDeviceData(deviceId, table);

export const logNetworkActivity = (activity: Omit<NetworkActivity, 'id' | 'timestamp'>) => 
  networkDB.logNetworkActivity(activity);

export const getNetworkActivity = (limit?: number) => 
  networkDB.getNetworkActivity(limit);

export const getNetworkLogs = (deviceId?: string, limit?: number) => 
  networkDB.getNetworkLogs(deviceId, limit);

export const getNetworkLogsByType = (type: NetworkActivity['type'], limit?: number) => 
  networkDB.getNetworkLogsByType(type, limit);

export const getNetworkLogsByDateRange = (startDate: Date, endDate: Date) => 
  networkDB.getNetworkLogsByDateRange(startDate, endDate);

export const saveDeviceConfig = (deviceId: string, config: any) => 
  networkDB.saveDeviceConfig(deviceId, config);

export const getDeviceConfig = (deviceId: string) => 
  networkDB.getDeviceConfig(deviceId);

export const createExternalConnection = (connection: Omit<ExternalConnection, 'id' | 'timestamp'>) => 
  networkDB.createExternalConnection(connection);

export const getExternalConnections = () => 
  networkDB.getExternalConnections();

export const updateConnectionStatus = (connectionId: string, status: ExternalConnection['status']) => 
  networkDB.updateConnectionStatus(connectionId, status);

export const registerDevice = (device: NetworkDevice) => 
  networkDB.registerDevice(device);

export const getDevice = (deviceId: string) => 
  networkDB.getDevice(deviceId);

export const getAllDevices = () => 
  networkDB.getAllDevices();

export const clearAllNetworkData = () => 
  networkDB.clearAllNetworkData();

export const getStorageStats = () => 
  networkDB.getStorageStats();

export const searchNetworkActivity = (query: string, deviceId?: string) => 
  networkDB.searchNetworkActivity(query, deviceId);

export const getNetworkStats = () => 
  networkDB.getNetworkStats();

export const getDeviceStats = (deviceId: string) => 
  networkDB.getDeviceStats(deviceId);

// Export the database instance for advanced usage
export { networkDB };

// Export types for external usage
export type { 
  NetworkDevice, 
  NetworkActivity, 
  DeviceData, 
  DeviceConfig, 
  ExternalConnection 
};
