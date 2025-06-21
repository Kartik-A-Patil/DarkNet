import { 
  saveDeviceData, 
  logNetworkActivity, 
  saveDeviceConfig, 
  createExternalConnection 
} from '../DeviceControl/utils/networkDatabase';

// Sample data generator for demonstration
export const generateSampleNetworkData = async () => {
  try {
    // Generate some sample device data
    await saveDeviceData('db-server-001', 'users', {
      id: 1,
      username: 'admin',
      email: 'admin@darknet.local',
      role: 'administrator',
      lastLogin: new Date()
    });

    await saveDeviceData('db-server-001', 'logs', {
      id: 1,
      action: 'login_attempt',
      user: 'admin',
      ip: '192.168.1.100',
      success: true,
      timestamp: new Date()
    });

    await saveDeviceData('router-001', 'routes', {
      destination: '10.0.0.0/8',
      gateway: '192.168.1.1',
      interface: 'eth0',
      metric: 100
    });

    // Generate some network activity logs
    await logNetworkActivity({
      sourceDevice: 'laptop-001',
      targetDevice: 'db-server-001',
      type: 'sync',
      data: { query: 'SELECT * FROM users', records: 15 }
    });

    await logNetworkActivity({
      sourceDevice: 'router-001',
      targetDevice: 'iot-sensor-003',
      type: 'command',
      data: { command: 'get_temperature', response: '22.5°C' }
    });

    await logNetworkActivity({
      sourceDevice: 'file-server-001',
      targetDevice: 'laptop-001',
      type: 'file',
      data: { filename: 'sensitive_data.txt', size: '2.1MB', operation: 'download' }
    });

    await logNetworkActivity({
      sourceDevice: 'db-server-001',
      targetDevice: 'backup-server-001',
      type: 'backup',
      data: { tables: ['users', 'logs', 'sessions'], size: '45MB' }
    });

    // Save some device configurations
    await saveDeviceConfig('router-001', {
      ip: '192.168.1.1',
      subnet: '255.255.255.0',
      dhcp: {
        enabled: true,
        range: '192.168.1.100-192.168.1.200'
      },
      firewall: {
        enabled: true,
        rules: [
          { port: 22, protocol: 'tcp', action: 'allow', source: 'internal' },
          { port: 80, protocol: 'tcp', action: 'allow', source: 'any' },
          { port: 443, protocol: 'tcp', action: 'allow', source: 'any' }
        ]
      }
    });

    await saveDeviceConfig('db-server-001', {
      host: '192.168.1.50',
      port: 3306,
      databases: ['darknet_main', 'user_data', 'audit_logs'],
      backupSchedule: '0 2 * * *', // Daily at 2 AM
      encryption: 'AES-256',
      maxConnections: 100
    });

    // Create some external connections
    await createExternalConnection('router-001', {
      type: 'vpn',
      endpoint: 'vpn.darknet.external',
      status: 'connected',
      encryption: 'OpenVPN',
      bandwidth: '100Mbps'
    });

    await createExternalConnection('db-server-001', {
      type: 'replication',
      endpoint: 'replica.darknet.backup',
      status: 'syncing',
      lastSync: new Date(),
      dataSize: '2.1GB'
    });

    console.log('Sample network data generated successfully');
    return true;
  } catch (error) {
    console.error('Failed to generate sample data:', error);
    return false;
  }
};

// Function to check if sample data exists
export const hasSampleData = async () => {
  try {
    const { getNetworkStats } = await import('../DeviceControl/utils/networkDatabase');
    const stats = await getNetworkStats();
    return stats.totalRecords > 0 || stats.totalLogs > 0;
  } catch (error) {
    return false;
  }
};

// Default export for convenience
export default {
  generateSampleNetworkData,
  hasSampleData
};
