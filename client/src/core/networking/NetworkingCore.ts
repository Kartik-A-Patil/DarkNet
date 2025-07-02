/**
 * Networking Core System for DarkNet Game
 * Provides realistic network simulation with IPv4/IPv6 addresses, port management, and service mapping
 */

// Network Types and Interfaces
export interface NetworkAddress {
  ipv4: string;
  ipv6: string;
  systemId: string;
}

export interface NetworkService {
  id: number; // 8-bit service ID (0-255)
  name: string;
  version: string;
  protocol: 'TCP' | 'UDP' | 'BOTH';
  description: string;
  vulnerabilities?: string[];
  banner?: string;
}

export interface PortStatus {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: NetworkService;
  lastAccessed?: Date;
}

export interface NetworkSystem {
  id: string;
  name: string;
  address: NetworkAddress;
  type: 'server' | 'workstation' | 'router' | 'iot' | 'database';
  os: string;
  ports: Map<number, PortStatus>;
  systemServices: Map<number, NetworkService>; // Ports 0-900
  userServices: Map<number, NetworkService>;   // Ports 901-1023
  isOnline: boolean;
  lastSeen: Date;
  securityLevel: 'low' | 'medium' | 'high' | 'military';
}

export interface ServiceDefinition {
  id: number;
  name: string;
  defaultPorts: number[];
  versions: string[];
  protocols: ('TCP' | 'UDP' | 'BOTH')[];
  vulnerabilities: string[];
  bannerTemplates: string[];
}

// Service Registry - Predefined services with 8-bit IDs
export class ServiceRegistry {
  private static services: Map<number, ServiceDefinition> = new Map([
    // System Services (0-50)
    [1, {
      id: 1,
      name: 'SSH',
      defaultPorts: [22],
      versions: ['OpenSSH_7.4', 'OpenSSH_8.0', 'OpenSSH_8.4'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-41617', 'CVE-2020-15778'],
      bannerTemplates: ['SSH-2.0-OpenSSH_{version}']
    }],
    [2, {
      id: 2,
      name: 'HTTP',
      defaultPorts: [80],
      versions: ['Apache/2.4.41', 'nginx/1.18.0', 'IIS/10.0'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-41773', 'CVE-2021-42013'],
      bannerTemplates: ['HTTP/1.1 200 OK\r\nServer: {version}']
    }],
    [3, {
      id: 3,
      name: 'HTTPS',
      defaultPorts: [443],
      versions: ['Apache/2.4.41', 'nginx/1.18.0', 'IIS/10.0'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-41773', 'CVE-2021-42013'],
      bannerTemplates: ['HTTP/1.1 200 OK\r\nServer: {version}']
    }],
    [4, {
      id: 4,
      name: 'FTP',
      defaultPorts: [21],
      versions: ['vsftpd 3.0.3', 'ProFTPD 1.3.6', 'FileZilla Server 0.9.60'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-26691', 'CVE-2020-9273'],
      bannerTemplates: ['220 Welcome to {version} FTP server']
    }],
    [5, {
      id: 5,
      name: 'SMTP',
      defaultPorts: [25, 587],
      versions: ['Postfix 3.4.13', 'Sendmail 8.15.2', 'Exim 4.94'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2020-28021', 'CVE-2021-27216'],
      bannerTemplates: ['220 {hostname} ESMTP {version}']
    }],
    [6, {
      id: 6,
      name: 'DNS',
      defaultPorts: [53],
      versions: ['BIND 9.11.4', 'PowerDNS 4.1.1', 'Unbound 1.9.0'],
      protocols: ['UDP', 'TCP'],
      vulnerabilities: ['CVE-2021-25214', 'CVE-2020-8625'],
      bannerTemplates: ['DNS Server {version}']
    }],
    [7, {
      id: 7,
      name: 'MySQL',
      defaultPorts: [3306],
      versions: ['5.7.33', '8.0.23', '8.0.25'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-2146', 'CVE-2021-2179'],
      bannerTemplates: ['{version}-MySQL']
    }],
    [8, {
      id: 8,
      name: 'PostgreSQL',
      defaultPorts: [5432],
      versions: ['12.6', '13.2', '13.3'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-32027', 'CVE-2021-32028'],
      bannerTemplates: ['PostgreSQL {version}']
    }],
    [9, {
      id: 9,
      name: 'Redis',
      defaultPorts: [6379],
      versions: ['6.2.1', '6.2.3', '6.0.12'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-32625', 'CVE-2021-32672'],
      bannerTemplates: ['Redis server v={version}']
    }],
    [10, {
      id: 10,
      name: 'MongoDB',
      defaultPorts: [27017],
      versions: ['4.4.5', '4.4.6', '5.0.0'],
      protocols: ['TCP'],
      vulnerabilities: ['CVE-2021-20329', 'CVE-2021-20331'],
      bannerTemplates: ['MongoDB {version}']
    }],
    
    // DarkMesh Services (51-100)
    [51, {
      id: 51,
      name: 'DarkMesh-Core',
      defaultPorts: [7777],
      versions: ['1.0.0', '1.1.0', '1.2.0'],
      protocols: ['TCP'],
      vulnerabilities: ['DARK-2024-001', 'DARK-2024-002'],
      bannerTemplates: ['DarkMesh Core v{version}']
    }],
    [52, {
      id: 52,
      name: 'DarkMesh-Relay',
      defaultPorts: [7778],
      versions: ['1.0.0', '1.1.0'],
      protocols: ['TCP', 'UDP'],
      vulnerabilities: ['DARK-2024-003'],
      bannerTemplates: ['DarkMesh Relay v{version}']
    }],
    [53, {
      id: 53,
      name: 'DarkMesh-Market',
      defaultPorts: [7779],
      versions: ['2.0.0', '2.1.0'],
      protocols: ['TCP'],
      vulnerabilities: ['DARK-2024-004', 'DARK-2024-005'],
      bannerTemplates: ['DarkMesh Market API v{version}']
    }],
    [54, {
      id: 54,
      name: 'DarkMesh-Chat',
      defaultPorts: [7780],
      versions: ['1.0.0', '1.0.1'],
      protocols: ['TCP'],
      vulnerabilities: [],
      bannerTemplates: ['DarkMesh Chat v{version}']
    }],
    [55, {
      id: 55,
      name: 'DarkMesh-FileShare',
      defaultPorts: [7781],
      versions: ['1.0.0', '1.1.0', '1.2.0'],
      protocols: ['TCP'],
      vulnerabilities: ['DARK-2024-006'],
      bannerTemplates: ['DarkMesh FileShare v{version}']
    }],
  ]);

  static getService(id: number): ServiceDefinition | undefined {
    return this.services.get(id);
  }

  static getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  static getServicesByName(name: string): ServiceDefinition[] {
    return Array.from(this.services.values()).filter(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  static addCustomService(service: ServiceDefinition): void {
    if (service.id < 101 || service.id > 255) {
      throw new Error('Custom service IDs must be between 101-255');
    }
    this.services.set(service.id, service);
  }
}

// Network Address Generator
export class NetworkAddressGenerator {
  private static usedIPv4: Set<string> = new Set();
  private static usedIPv6: Set<string> = new Set();

  static generateIPv4(systemId: string): string {
    // Generate deterministic IPv4 based on system ID
    let hash = 0;
    for (let i = 0; i < systemId.length; i++) {
      hash = ((hash << 5) - hash) + systemId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    // Use hash to generate IP in private ranges
    const ranges = [
      { base: [10, 0, 0, 0], mask: 8 },
      { base: [172, 16, 0, 0], mask: 12 },
      { base: [192, 168, 0, 0], mask: 16 }
    ];

    const range = ranges[Math.abs(hash) % ranges.length];
    const ip = [...range.base];
    
    // Modify the IP based on hash
    ip[1] = (ip[1] + Math.abs(hash >> 8)) % 256;
    ip[2] = (ip[2] + Math.abs(hash >> 16)) % 256;
    ip[3] = (ip[3] + Math.abs(hash >> 24)) % 256;
    
    // Ensure it's not .0 or .255
    if (ip[3] === 0) ip[3] = 1;
    if (ip[3] === 255) ip[3] = 254;

    const ipv4 = ip.join('.');
    
    // If already used, increment until unique
    let counter = 1;
    let finalIP = ipv4;
    while (this.usedIPv4.has(finalIP)) {
      const parts = ipv4.split('.').map(Number);
      parts[3] = (parts[3] + counter) % 255;
      if (parts[3] === 0) parts[3] = 1;
      finalIP = parts.join('.');
      counter++;
    }

    this.usedIPv4.add(finalIP);
    return finalIP;
  }

  static generateIPv6(systemId: string): string {
    // Generate deterministic IPv6 based on system ID
    let hash = 0;
    for (let i = 0; i < systemId.length; i++) {
      hash = ((hash << 5) - hash) + systemId.charCodeAt(i);
      hash = hash & hash;
    }

    // Use fc00::/7 (Unique Local Address) for private IPv6
    const prefix = 'fc00';
    const parts = [prefix];
    
    // Generate 7 more groups of 4 hex digits
    for (let i = 0; i < 7; i++) {
      const part = (Math.abs(hash + i * 1000) % 65536).toString(16).padStart(4, '0');
      parts.push(part);
    }

    let ipv6 = parts.join(':');
    
    // If already used, modify until unique
    let counter = 1;
    while (this.usedIPv6.has(ipv6)) {
      const lastPart = parseInt(parts[7], 16);
      parts[7] = ((lastPart + counter) % 65536).toString(16).padStart(4, '0');
      ipv6 = parts.join(':');
      counter++;
    }

    this.usedIPv6.add(ipv6);
    return ipv6;
  }

  static generateAddress(systemId: string): NetworkAddress {
    return {
      ipv4: this.generateIPv4(systemId),
      ipv6: this.generateIPv6(systemId),
      systemId
    };
  }
}

// Port Manager
export class PortManager {
  private static readonly SYSTEM_PORT_RANGE = { min: 0, max: 900 };
  private static readonly USER_PORT_RANGE = { min: 901, max: 1023 };
  private static readonly EXTENDED_PORT_RANGE = { min: 1024, max: 65535 };

  static initializePorts(): Map<number, PortStatus> {
    const ports = new Map<number, PortStatus>();

    // Initialize all ports as closed
    for (let port = 0; port <= 1023; port++) {
      ports.set(port, {
        port,
        status: 'closed'
      });
    }

    // Simulate extended port range behavior
    for (let port = 1024; port <= 65535; port++) {
      const status = Math.random() < 0.05 ? 'filtered' : 'closed';
      ports.set(port, { port, status });
    }

    return ports;
  }

  static isSystemPort(port: number): boolean {
    return port >= this.SYSTEM_PORT_RANGE.min && port <= this.SYSTEM_PORT_RANGE.max;
  }

  static isUserPort(port: number): boolean {
    return port >= this.USER_PORT_RANGE.min && port <= this.USER_PORT_RANGE.max;
  }

  static isExtendedPort(port: number): boolean {
    return port >= this.EXTENDED_PORT_RANGE.min && port <= this.EXTENDED_PORT_RANGE.max;
  }

  static getAvailableSystemPorts(usedPorts: Set<number>): number[] {
    const available: number[] = [];
    for (let port = this.SYSTEM_PORT_RANGE.min; port <= this.SYSTEM_PORT_RANGE.max; port++) {
      if (!usedPorts.has(port)) {
        available.push(port);
      }
    }
    return available;
  }

  static getAvailableUserPorts(usedPorts: Set<number>): number[] {
    const available: number[] = [];
    for (let port = this.USER_PORT_RANGE.min; port <= this.USER_PORT_RANGE.max; port++) {
      if (!usedPorts.has(port)) {
        available.push(port);
      }
    }
    return available;
  }
}

// Service Generator
export class ServiceGenerator {
  static generateService(serviceId: number, port: number): NetworkService | null {
    const serviceDef = ServiceRegistry.getService(serviceId);
    if (!serviceDef) return null;

    const version = serviceDef.versions[Math.floor(Math.random() * serviceDef.versions.length)];
    const protocol = serviceDef.protocols[Math.floor(Math.random() * serviceDef.protocols.length)];
    const vulnerabilities = serviceDef.vulnerabilities.slice(0, Math.floor(Math.random() * serviceDef.vulnerabilities.length + 1));
    
    let banner = serviceDef.bannerTemplates[Math.floor(Math.random() * serviceDef.bannerTemplates.length)];
    banner = banner.replace('{version}', version);
    banner = banner.replace('{hostname}', 'localhost'); // Could be dynamic

    return {
      id: serviceId,
      name: serviceDef.name,
      version,
      protocol,
      description: `${serviceDef.name} service running on port ${port}`,
      vulnerabilities,
      banner
    };
  }

  static generateRandomSystemServices(count: number = 5): Array<{ port: number; service: NetworkService }> {
    const services: Array<{ port: number; service: NetworkService }> = [];
    const usedPorts = new Set<number>();
    const systemServices = ServiceRegistry.getAllServices().filter(s => s.id <= 50);

    for (let i = 0; i < Math.min(count, systemServices.length); i++) {
      const serviceDef = systemServices[Math.floor(Math.random() * systemServices.length)];
      const defaultPort = serviceDef.defaultPorts[Math.floor(Math.random() * serviceDef.defaultPorts.length)];
      
      let port = defaultPort;
      let attempts = 0;
      while (usedPorts.has(port) && attempts < 100) {
        port = Math.floor(Math.random() * 900) + 1;
        attempts++;
      }

      if (!usedPorts.has(port)) {
        usedPorts.add(port);
        const service = this.generateService(serviceDef.id, port);
        if (service) {
          services.push({ port, service });
        }
      }
    }

    return services;
  }
}
