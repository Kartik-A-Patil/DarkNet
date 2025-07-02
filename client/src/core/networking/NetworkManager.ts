/**
 * Global Network Manager - Central hub for all network operations
 * Accessible from anywhere in the game to query network state
 */

import { 
  NetworkSystem, 
  NetworkAddress, 
  NetworkService, 
  PortStatus,
  NetworkAddressGenerator,
  PortManager,
  ServiceGenerator,
  ServiceRegistry
} from './NetworkingCore';

export interface NetworkScanResult {
  systemId: string;
  openPorts: number[];
  services: Array<{ port: number; service: NetworkService }>;
  scanTime: Date;
  scanType: 'tcp' | 'udp' | 'stealth' | 'comprehensive';
}

export interface NetworkConnection {
  id: string;
  sourceSystemId: string;
  targetSystemId: string;
  sourcePort: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP';
  status: 'established' | 'connecting' | 'closed' | 'timeout';
  established: Date;
  lastActivity: Date;
  dataTransferred: number;
}

export class GlobalNetworkManager {
  private static instance: GlobalNetworkManager;
  private systems: Map<string, NetworkSystem> = new Map();
  private connections: Map<string, NetworkConnection> = new Map();
  private scanHistory: Map<string, NetworkScanResult[]> = new Map();
  private ipToSystemMap: Map<string, string> = new Map(); // IP -> System ID mapping

  private constructor() {
    this.initializeDefaultSystems();
  }

  static getInstance(): GlobalNetworkManager {
    if (!GlobalNetworkManager.instance) {
      GlobalNetworkManager.instance = new GlobalNetworkManager();
    }
    return GlobalNetworkManager.instance;
  }

  // System Management
  createSystem(
    id: string, 
    name: string, 
    type: NetworkSystem['type'], 
    os: string,
    securityLevel: NetworkSystem['securityLevel'] = 'medium'
  ): NetworkSystem {
    if (this.systems.has(id)) {
      throw new Error(`System with ID ${id} already exists`);
    }

    const address = NetworkAddressGenerator.generateAddress(id);
    const ports = PortManager.initializePorts();
    
    const system: NetworkSystem = {
      id,
      name,
      address,
      type,
      os,
      ports,
      systemServices: new Map(),
      userServices: new Map(),
      isOnline: true,
      lastSeen: new Date(),
      securityLevel
    };

    // Generate default system services
    const defaultServices = ServiceGenerator.generateRandomSystemServices(
      this.getServiceCountByType(type)
    );

    for (const { port, service } of defaultServices) {
      this.addSystemService(id, port, service);
    }

    this.systems.set(id, system);
    this.ipToSystemMap.set(address.ipv4, id);
    this.ipToSystemMap.set(address.ipv6, id);

    console.log(`Created network system: ${name} (${id}) at ${address.ipv4}`);
    return system;
  }

  getSystem(id: string): NetworkSystem | undefined {
    return this.systems.get(id);
  }

  getSystemByIP(ip: string): NetworkSystem | undefined {
    const systemId = this.ipToSystemMap.get(ip);
    return systemId ? this.systems.get(systemId) : undefined;
  }

  getAllSystems(): NetworkSystem[] {
    return Array.from(this.systems.values());
  }

  getOnlineSystems(): NetworkSystem[] {
    return Array.from(this.systems.values()).filter(s => s.isOnline);
  }

  // Service Management
  addSystemService(systemId: string, port: number, service: NetworkService): boolean {
    const system = this.systems.get(systemId);
    if (!system) return false;

    if (!PortManager.isSystemPort(port)) {
      throw new Error(`Port ${port} is not in system port range (0-900)`);
    }

    system.systemServices.set(port, service);
    system.ports.set(port, {
      port,
      status: 'open',
      service,
      lastAccessed: new Date()
    });

    return true;
  }

  addUserService(systemId: string, port: number, service: NetworkService): boolean {
    const system = this.systems.get(systemId);
    if (!system) return false;

    if (!PortManager.isUserPort(port)) {
      throw new Error(`Port ${port} is not in user port range (901-1023)`);
    }

    system.userServices.set(port, service);
    system.ports.set(port, {
      port,
      status: 'open',
      service,
      lastAccessed: new Date()
    });

    return true;
  }

  removeService(systemId: string, port: number): boolean {
    const system = this.systems.get(systemId);
    if (!system) return false;

    system.systemServices.delete(port);
    system.userServices.delete(port);
    system.ports.set(port, { port, status: 'closed' });

    return true;
  }

  // Port Status Queries
  getOpenPorts(systemId: string): number[] {
    const system = this.systems.get(systemId);
    if (!system) return [];

    return Array.from(system.ports.entries())
      .filter(([_, status]) => status.status === 'open')
      .map(([port, _]) => port);
  }

  getPortStatus(systemId: string, port: number): PortStatus | undefined {
    const system = this.systems.get(systemId);
    if (!system) return undefined;

    return system.ports.get(port);
  }

  getRunningServices(systemId: string): Array<{ port: number; service: NetworkService }> {
    const system = this.systems.get(systemId);
    if (!system) return [];

    const services: Array<{ port: number; service: NetworkService }> = [];
    
    // Add system services
    system.systemServices.forEach((service, port) => {
      services.push({ port, service });
    });

    // Add user services
    system.userServices.forEach((service, port) => {
      services.push({ port, service });
    });

    return services;
  }

  getServiceByPort(systemId: string, port: number): NetworkService | undefined {
    const system = this.systems.get(systemId);
    if (!system) return undefined;

    return system.systemServices.get(port) || system.userServices.get(port);
  }

  // Network Scanning
  scanSystem(
    scannerSystemId: string, 
    targetSystemId: string, 
    scanType: NetworkScanResult['scanType'] = 'tcp',
    portRange?: { start: number; end: number }
  ): NetworkScanResult {
    const targetSystem = this.systems.get(targetSystemId);
    if (!targetSystem) {
      throw new Error(`Target system ${targetSystemId} not found`);
    }

    if (!targetSystem.isOnline) {
      throw new Error(`Target system ${targetSystemId} is offline`);
    }

    const range = portRange || { start: 1, end: 1023 };
    const openPorts: number[] = [];
    const services: Array<{ port: number; service: NetworkService }> = [];

    // Scan the specified range
    for (let port = range.start; port <= range.end; port++) {
      const portStatus = targetSystem.ports.get(port);
      if (portStatus && portStatus.status === 'open') {
        openPorts.push(port);
        if (portStatus.service) {
          services.push({ port, service: portStatus.service });
        }
      }
    }

    const scanResult: NetworkScanResult = {
      systemId: targetSystemId,
      openPorts,
      services,
      scanTime: new Date(),
      scanType
    };

    // Store scan history
    if (!this.scanHistory.has(scannerSystemId)) {
      this.scanHistory.set(scannerSystemId, []);
    }
    this.scanHistory.get(scannerSystemId)!.push(scanResult);

    // Update last seen for target system
    targetSystem.lastSeen = new Date();

    return scanResult;
  }

  getScanHistory(systemId: string): NetworkScanResult[] {
    return this.scanHistory.get(systemId) || [];
  }

  // Connection Management
  establishConnection(
    sourceSystemId: string,
    targetSystemId: string,
    sourcePort: number,
    targetPort: number,
    protocol: 'TCP' | 'UDP' = 'TCP'
  ): NetworkConnection | null {
    const sourceSystem = this.systems.get(sourceSystemId);
    const targetSystem = this.systems.get(targetSystemId);

    if (!sourceSystem || !targetSystem) return null;
    if (!targetSystem.isOnline) return null;

    const targetPortStatus = targetSystem.ports.get(targetPort);
    if (!targetPortStatus || targetPortStatus.status !== 'open') return null;

    const connectionId = `${sourceSystemId}:${sourcePort}->${targetSystemId}:${targetPort}`;
    const connection: NetworkConnection = {
      id: connectionId,
      sourceSystemId,
      targetSystemId,
      sourcePort,
      targetPort,
      protocol,
      status: 'established',
      established: new Date(),
      lastActivity: new Date(),
      dataTransferred: 0
    };

    this.connections.set(connectionId, connection);
    
    // Update port last accessed time
    if (targetPortStatus.service) {
      targetPortStatus.lastAccessed = new Date();
    }

    return connection;
  }

  getConnections(systemId: string): NetworkConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.sourceSystemId === systemId || conn.targetSystemId === systemId
    );
  }

  closeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    connection.status = 'closed';
    connection.lastActivity = new Date();
    
    // Remove after a delay to maintain history
    setTimeout(() => {
      this.connections.delete(connectionId);
    }, 30000); // 30 seconds

    return true;
  }

  // System State Management
  setSystemOnline(systemId: string, online: boolean): boolean {
    const system = this.systems.get(systemId);
    if (!system) return false;

    system.isOnline = online;
    system.lastSeen = new Date();

    if (!online) {
      // Close all connections involving this system
      const systemConnections = this.getConnections(systemId);
      systemConnections.forEach(conn => this.closeConnection(conn.id));
    }

    return true;
  }

  // Utility Methods
  private getServiceCountByType(type: NetworkSystem['type']): number {
    switch (type) {
      case 'server': return 8;
      case 'database': return 3;
      case 'router': return 5;
      case 'workstation': return 4;
      case 'iot': return 2;
      default: return 3;
    }
  }

  private initializeDefaultSystems(): void {
    // Create some default systems for testing
    this.createSystem('sys-001', 'Web Server Alpha', 'server', 'Ubuntu 20.04 LTS', 'medium');
    this.createSystem('sys-002', 'Database Server', 'database', 'CentOS 8', 'high');
    this.createSystem('sys-003', 'Main Router', 'router', 'RouterOS 7.1', 'high');
    this.createSystem('sys-004', 'Admin Workstation', 'workstation', 'Windows 10 Pro', 'medium');
    this.createSystem('sys-005', 'IoT Gateway', 'iot', 'Embedded Linux', 'low');
  }

  // Debug/Development Methods
  getNetworkStats(): {
    totalSystems: number;
    onlineSystems: number;
    totalOpenPorts: number;
    activeConnections: number;
    totalServices: number;
  } {
    const systems = Array.from(this.systems.values());
    const totalOpenPorts = systems.reduce((sum, sys) => 
      sum + Array.from(sys.ports.values()).filter(p => p.status === 'open').length, 0
    );
    const totalServices = systems.reduce((sum, sys) => 
      sum + sys.systemServices.size + sys.userServices.size, 0
    );

    return {
      totalSystems: systems.length,
      onlineSystems: systems.filter(s => s.isOnline).length,
      totalOpenPorts,
      activeConnections: Array.from(this.connections.values()).filter(c => c.status === 'established').length,
      totalServices
    };
  }

  exportSystemData(systemId: string): any {
    const system = this.systems.get(systemId);
    if (!system) return null;

    return {
      ...system,
      ports: Array.from(system.ports.entries()),
      systemServices: Array.from(system.systemServices.entries()),
      userServices: Array.from(system.userServices.entries()),
      connections: this.getConnections(systemId),
      scanHistory: this.getScanHistory(systemId)
    };
  }
}

// Export singleton instance
export const NetworkManager = GlobalNetworkManager.getInstance();
