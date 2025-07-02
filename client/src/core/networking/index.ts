/**
 * Network Integration Module
 * Integrates the networking core with existing components
 */

export * from './NetworkingCore';
export * from './NetworkManager';
export * from './NetworkCommands';
export * from './tests';

import { NetworkManager } from './NetworkManager';
import { networkCommands } from './NetworkCommands';
import { NetworkingTests } from './tests';

// Initialize networking system
export const initializeNetworking = () => {
  console.log('🌐 Initializing DarkNet Networking Core...');
  
  // Get network stats
  const stats = NetworkManager.getNetworkStats();
  console.log(`📊 Network initialized with ${stats.totalSystems} systems, ${stats.totalServices} services`);
  
  // Run tests in development
  if (process.env.NODE_ENV === 'development') {
    // Uncomment to run tests on initialization
    // NetworkingTests.testNetworkingCore();
  }
  
  return {
    manager: NetworkManager,
    commands: networkCommands,
    tests: NetworkingTests,
    stats
  };
};

// Utility function to get network info for UI components
export const getNetworkInfo = () => {
  const stats = NetworkManager.getNetworkStats();
  const systems = NetworkManager.getOnlineSystems();
  
  return {
    stats,
    systems: systems.map(sys => ({
      id: sys.id,
      name: sys.name,
      ip: sys.address.ipv4,
      type: sys.type,
      openPorts: NetworkManager.getOpenPorts(sys.id).length,
      services: NetworkManager.getRunningServices(sys.id).length
    }))
  };
};

// For SystemMonitor integration
export const getSystemNetworkInfo = (systemId?: string) => {
  const system = systemId ? NetworkManager.getSystem(systemId) : NetworkManager.getAllSystems()[0];
  
  if (!system) {
    return {
      interfaces: [],
      connections: [],
      stats: { rx: 0, tx: 0 }
    };
  }

  const connections = NetworkManager.getConnections(system.id);
  const services = NetworkManager.getRunningServices(system.id);
  
  return {
    interfaces: [
      {
        name: 'eth0',
        ip: system.address.ipv4,
        mac: '08:00:27:b3:fc:2d',
        status: system.isOnline ? 'UP' : 'DOWN',
        rx: Math.floor(Math.random() * 1000),
        tx: Math.floor(Math.random() * 1000)
      },
      {
        name: 'lo',
        ip: '127.0.0.1',
        mac: '00:00:00:00:00:00',
        status: 'UP',
        rx: 0,
        tx: 0
      }
    ],
    connections: connections.map(conn => ({
      protocol: conn.protocol,
      localPort: conn.sourceSystemId === system.id ? conn.sourcePort : conn.targetPort,
      remotePort: conn.sourceSystemId === system.id ? conn.targetPort : conn.sourcePort,
      remoteIP: conn.sourceSystemId === system.id ? 
        NetworkManager.getSystem(conn.targetSystemId)?.address.ipv4 || 'unknown' :
        NetworkManager.getSystem(conn.sourceSystemId)?.address.ipv4 || 'unknown',
      status: conn.status
    })),
    stats: {
      rx: connections.reduce((sum, conn) => sum + conn.dataTransferred, 0),
      tx: connections.reduce((sum, conn) => sum + conn.dataTransferred, 0)
    },
    services: services.map(({ port, service }) => ({
      port,
      name: service.name,
      protocol: service.protocol,
      status: 'running'
    }))
  };
};
