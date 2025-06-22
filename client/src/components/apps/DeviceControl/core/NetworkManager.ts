import { Device, DeviceConfig } from '../types';

export interface NetworkPort {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  deviceId: string;
  isForwarded: boolean;
  forwardedPort?: number;
}

export interface ServiceInstance {
  id: string;
  name: string;
  type: 'http' | 'https' | 'ssh' | 'ftp' | 'database' | 'api' | 'custom';
  port: number;
  deviceId: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  config: any;
  logs: string[];
  metrics: {
    connections: number;
    requests: number;
    uptime: number;
    cpu: number;
    memory: number;
  };
}

export interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  port: number;
  protocol: 'tcp' | 'udp';
  status: 'active' | 'inactive' | 'establishing' | 'error';
  bytesTransferred: number;
  startTime: Date;
  lastActivity: Date;
}

class NetworkManager {
  private devices: Map<string, Device> = new Map();
  private services: Map<string, ServiceInstance> = new Map();
  private ports: Map<number, NetworkPort> = new Map();
  private connections: Map<string, NetworkConnection> = new Map();
  private ipPool: Set<string> = new Set();
  private serviceTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeIPPool();
    this.initializeServiceTemplates();
  }

  private initializeIPPool() {
    // Generate available IP addresses in the 192.168.1.x range
    for (let i = 10; i < 255; i++) {
      this.ipPool.add(`192.168.1.${i}`);
    }
  }

  private initializeServiceTemplates() {
    this.serviceTemplates.set('http', {
      name: 'HTTP Server',
      defaultPort: 80,
      protocols: ['tcp'],
      config: {
        documentRoot: '/var/www/html',
        maxConnections: 100,
        keepAlive: true,
        compression: true
      }
    });

    this.serviceTemplates.set('https', {
      name: 'HTTPS Server',
      defaultPort: 443,
      protocols: ['tcp'],
      config: {
        documentRoot: '/var/www/html',
        sslCert: '/etc/ssl/certs/server.crt',
        sslKey: '/etc/ssl/private/server.key',
        maxConnections: 100
      }
    });

    this.serviceTemplates.set('ssh', {
      name: 'SSH Server',
      defaultPort: 22,
      protocols: ['tcp'],
      config: {
        allowRootLogin: false,
        maxSessions: 10,
        authentication: 'key'
      }
    });

    this.serviceTemplates.set('database', {
      name: 'Database Server',
      defaultPort: 3306,
      protocols: ['tcp'],
      config: {
        engine: 'mysql',
        maxConnections: 200,
        cacheSize: '256M',
        logLevel: 'info'
      }
    });

    this.serviceTemplates.set('api', {
      name: 'API Server',
      defaultPort: 8080,
      protocols: ['tcp'],
      config: {
        cors: true,
        rateLimit: 1000,
        timeout: 30000,
        apiVersion: 'v1'
      }
    });
  }

  // Device Management
  registerDevice(device: Device): string {
    const deviceId = device.id || this.generateDeviceId();
    
    // Assign IP if not provided
    if (!device.ip) {
      device.ip = this.assignIP();
    }

    this.devices.set(deviceId, { ...device, id: deviceId });
    return deviceId;
  }

  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  updateDevice(deviceId: string, updates: Partial<Device>): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    this.devices.set(deviceId, { ...device, ...updates });
    return true;
  }

  // Service Management
  createService(deviceId: string, serviceType: string, config?: any): string | null {
    const device = this.devices.get(deviceId);
    if (!device || device.status !== 'online') return null;

    const template = this.serviceTemplates.get(serviceType);
    if (!template) return null;

    const serviceId = this.generateServiceId();
    const port = config?.port || this.findAvailablePort(template.defaultPort);

    const service: ServiceInstance = {
      id: serviceId,
      name: config?.name || template.name,
      type: serviceType as any,
      port,
      deviceId,
      status: 'starting',
      config: { ...template.config, ...config },
      logs: [`Service ${template.name} starting on port ${port}`],
      metrics: {
        connections: 0,
        requests: 0,
        uptime: 0,
        cpu: 0,
        memory: 0
      }
    };

    this.services.set(serviceId, service);

    // Register port
    this.ports.set(port, {
      port,
      protocol: 'tcp',
      service: serviceId,
      deviceId,
      isForwarded: false
    });

    // Simulate service startup
    setTimeout(() => {
      this.updateServiceStatus(serviceId, 'running');
    }, 1000 + Math.random() * 2000);

    return serviceId;
  }

  getService(serviceId: string): ServiceInstance | undefined {
    return this.services.get(serviceId);
  }

  getDeviceServices(deviceId: string): ServiceInstance[] {
    return Array.from(this.services.values()).filter(s => s.deviceId === deviceId);
  }

  updateServiceStatus(serviceId: string, status: ServiceInstance['status']): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;

    service.status = status;
    service.logs.push(`Service status changed to ${status} at ${new Date().toISOString()}`);
    
    if (status === 'running') {
      this.startServiceMetrics(serviceId);
    }

    return true;
  }

  stopService(serviceId: string): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;

    service.status = 'stopping';
    service.logs.push(`Service stopping at ${new Date().toISOString()}`);

    // Clean up port
    this.ports.delete(service.port);

    // Clean up connections
    Array.from(this.connections.values())
      .filter(conn => conn.to === `${this.getDevice(service.deviceId)?.ip}:${service.port}`)
      .forEach(conn => this.connections.delete(conn.id));

    setTimeout(() => {
      service.status = 'stopped';
      service.logs.push(`Service stopped at ${new Date().toISOString()}`);
    }, 500);

    return true;
  }

  // Port Management
  forwardPort(externalPort: number, deviceId: string, internalPort: number): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    const portInfo = this.ports.get(internalPort);
    if (!portInfo) return false;

    // Check if external port is available
    if (this.ports.has(externalPort)) return false;

    // Create port forwarding
    this.ports.set(externalPort, {
      ...portInfo,
      port: externalPort,
      isForwarded: true,
      forwardedPort: internalPort
    });

    return true;
  }

  removePortForwarding(externalPort: number): boolean {
    const portInfo = this.ports.get(externalPort);
    if (!portInfo || !portInfo.isForwarded) return false;

    this.ports.delete(externalPort);
    return true;
  }

  // Network Simulation
  simulateNetworkTraffic(deviceId: string) {
    const device = this.devices.get(deviceId);
    if (!device || device.status !== 'online') return;

    const services = this.getDeviceServices(deviceId);
    
    services.forEach(service => {
      if (service.status === 'running') {
        // Simulate varying load
        const baseLoad = Math.random() * 50;
        const spike = Math.random() > 0.9 ? Math.random() * 100 : 0;
        
        service.metrics.connections = Math.floor(baseLoad + spike);
        service.metrics.requests += Math.floor(Math.random() * 10);
        service.metrics.cpu = Math.min(100, baseLoad + spike * 0.5);
        service.metrics.memory = Math.min(100, 20 + Math.random() * 30);
        service.metrics.uptime += 1;

        // Update device metrics
        const avgCpu = services.reduce((sum, s) => sum + s.metrics.cpu, 0) / services.length;
        const avgMemory = services.reduce((sum, s) => sum + s.metrics.memory, 0) / services.length;
        
        this.updateDevice(deviceId, {
          cpu: Math.floor(avgCpu),
          memory: Math.floor(avgMemory),
          network: {
            upload: device.network?.upload || 0 + Math.random() * 50,
            download: device.network?.download || 0 + Math.random() * 50
          }
        });
      }
    });
  }

  // Network Requests
  async makeRequest(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<{
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
  }> {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    const hostname = urlObj.hostname;
    const port = parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80);

    // Find target device
    const targetDevice = Array.from(this.devices.values()).find(d => d.ip === hostname);
    if (!targetDevice) {
      return {
        status: 404,
        statusText: 'Host not found',
        data: 'Device not found in network',
        headers: {}
      };
    }

    if (targetDevice.status !== 'online') {
      return {
        status: 503,
        statusText: 'Service Unavailable',
        data: 'Target device is offline',
        headers: {}
      };
    }

    // Find service on port
    const portInfo = this.ports.get(port);
    if (!portInfo) {
      return {
        status: 404,
        statusText: 'Port not found',
        data: 'No service running on this port',
        headers: {}
      };
    }

    const service = this.services.get(portInfo.service);
    if (!service || service.status !== 'running') {
      return {
        status: 503,
        statusText: 'Service Unavailable',
        data: 'Service is not running',
        headers: {}
      };
    }

    // Simulate request processing
    const connectionId = this.createConnection(hostname, port);
    
    // Update metrics
    service.metrics.requests++;
    service.metrics.connections++;

    // Generate response based on service type
    const response = await this.generateServiceResponse(service, method, urlObj.pathname, data);

    // Clean up connection
    setTimeout(() => {
      if (connectionId) {
        this.connections.delete(connectionId);
        service.metrics.connections = Math.max(0, service.metrics.connections - 1);
      }
    }, 1000);

    return response;
  }

  // Helper methods
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateServiceId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private assignIP(): string {
    const ipArray = Array.from(this.ipPool);
    for (const ip of ipArray) {
      if (!Array.from(this.devices.values()).some(d => d.ip === ip)) {
        return ip;
      }
    }
    throw new Error('No available IP addresses');
  }

  private findAvailablePort(preferredPort: number): number {
    if (!this.ports.has(preferredPort)) {
      return preferredPort;
    }

    // Find next available port
    for (let port = preferredPort + 1; port < 65536; port++) {
      if (!this.ports.has(port)) {
        return port;
      }
    }

    throw new Error('No available ports');
  }

  private createConnection(hostname: string, port: number): string | null {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: NetworkConnection = {
      id: connectionId,
      from: 'client',
      to: `${hostname}:${port}`,
      port,
      protocol: 'tcp',
      status: 'active',
      bytesTransferred: 0,
      startTime: new Date(),
      lastActivity: new Date()
    };

    this.connections.set(connectionId, connection);
    return connectionId;
  }

  private async generateServiceResponse(
    service: ServiceInstance,
    method: string,
    path: string,
    data?: any
  ): Promise<any> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));

    const headers = {
      'Content-Type': 'text/html',
      'Server': `DarkNet/${service.type}`,
      'Date': new Date().toUTCString()
    };

    switch (service.type) {
      case 'http':
      case 'https':
        return this.generateHTTPResponse(service, method, path, headers);
      case 'api':
        return this.generateAPIResponse(service, method, path, data, headers);
      case 'database':
        return this.generateDatabaseResponse(service, method, path, data, headers);
      default:
        return {
          status: 200,
          statusText: 'OK',
          data: `Service ${service.name} responded to ${method} ${path}`,
          headers
        };
    }
  }

  private generateHTTPResponse(service: ServiceInstance, method: string, path: string, headers: Record<string, string>) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${service.name}</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #00ff41; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 2px solid #00ff41; padding-bottom: 10px; margin-bottom: 20px; }
        .service-info { background: #001100; padding: 15px; border: 1px solid #00ff41; margin: 10px 0; }
        .status { color: #00ff41; font-weight: bold; }
        .error { color: #ff4444; }
        .warning { color: #ffaa00; }
        pre { background: #002200; padding: 10px; border-left: 3px solid #00ff41; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${service.name}</h1>
            <p>Status: <span class="status">ONLINE</span></p>
        </div>
        
        <div class="service-info">
            <h3>Service Information</h3>
            <p><strong>Type:</strong> ${service.type.toUpperCase()}</p>
            <p><strong>Port:</strong> ${service.port}</p>
            <p><strong>Status:</strong> ${service.status.toUpperCase()}</p>
            <p><strong>Uptime:</strong> ${Math.floor(service.metrics.uptime / 60)}m ${service.metrics.uptime % 60}s</p>
            <p><strong>Connections:</strong> ${service.metrics.connections}</p>
            <p><strong>Total Requests:</strong> ${service.metrics.requests}</p>
        </div>

        <div class="service-info">
            <h3>Request Information</h3>
            <p><strong>Method:</strong> ${method}</p>
            <p><strong>Path:</strong> ${path}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>

        <div class="service-info">
            <h3>Available Endpoints</h3>
            <ul>
                <li><a href="/status" style="color: #00ff41;">/status</a> - Service status</li>
                <li><a href="/metrics" style="color: #00ff41;">/metrics</a> - Performance metrics</li>
                <li><a href="/logs" style="color: #00ff41;">/logs</a> - Service logs</li>
                <li><a href="/config" style="color: #00ff41;">/config</a> - Configuration</li>
            </ul>
        </div>

        ${path === '/status' ? `
        <div class="service-info">
            <h3>Service Status</h3>
            <pre>${JSON.stringify(service.metrics, null, 2)}</pre>
        </div>
        ` : ''}

        ${path === '/logs' ? `
        <div class="service-info">
            <h3>Recent Logs</h3>
            <pre>${service.logs.slice(-10).join('\n')}</pre>
        </div>
        ` : ''}

        ${path === '/config' ? `
        <div class="service-info">
            <h3>Service Configuration</h3>
            <pre>${JSON.stringify(service.config, null, 2)}</pre>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

    return {
      status: 200,
      statusText: 'OK',
      data: html,
      headers: { ...headers, 'Content-Type': 'text/html' }
    };
  }

  private generateAPIResponse(service: ServiceInstance, method: string, path: string, data: any, headers: Record<string, string>) {
    const response = {
      success: true,
      service: service.name,
      method,
      path,
      timestamp: new Date().toISOString(),
      data: data || null,
      metrics: service.metrics
    };

    return {
      status: 200,
      statusText: 'OK',
      data: JSON.stringify(response, null, 2),
      headers: { ...headers, 'Content-Type': 'application/json' }
    };
  }

  private generateDatabaseResponse(service: ServiceInstance, method: string, path: string, data: any, headers: Record<string, string>) {
    const response = {
      database: service.name,
      engine: service.config.engine,
      status: 'connected',
      query: data?.query || 'SELECT * FROM information_schema.tables LIMIT 5',
      results: [
        { table_name: 'users', table_schema: 'darknet', table_type: 'BASE TABLE' },
        { table_name: 'sessions', table_schema: 'darknet', table_type: 'BASE TABLE' },
        { table_name: 'logs', table_schema: 'darknet', table_type: 'BASE TABLE' },
        { table_name: 'devices', table_schema: 'darknet', table_type: 'BASE TABLE' },
        { table_name: 'services', table_schema: 'darknet', table_type: 'BASE TABLE' }
      ],
      metrics: service.metrics
    };

    return {
      status: 200,
      statusText: 'OK',
      data: JSON.stringify(response, null, 2),
      headers: { ...headers, 'Content-Type': 'application/json' }
    };
  }

  private startServiceMetrics(serviceId: string) {
    const updateMetrics = () => {
      const service = this.services.get(serviceId);
      if (!service || service.status !== 'running') return;

      // Simulate realistic metrics
      service.metrics.uptime++;
      
      // Vary CPU and memory based on connections
      const connectionLoad = service.metrics.connections / 10;
      service.metrics.cpu = Math.min(100, 5 + connectionLoad + Math.random() * 20);
      service.metrics.memory = Math.min(100, 15 + connectionLoad + Math.random() * 15);

      setTimeout(updateMetrics, 1000);
    };

    updateMetrics();
  }

  // Public API methods
  getNetworkStatus() {
    return {
      devices: this.getAllDevices(),
      services: Array.from(this.services.values()),
      ports: Array.from(this.ports.values()),
      connections: Array.from(this.connections.values())
    };
  }

  getServiceLogs(serviceId: string): string[] {
    const service = this.services.get(serviceId);
    return service?.logs || [];
  }

  getDeviceMetrics(deviceId: string) {
    const device = this.devices.get(deviceId);
    const services = this.getDeviceServices(deviceId);
    
    return {
      device,
      services,
      totalServices: services.length,
      runningServices: services.filter(s => s.status === 'running').length,
      totalConnections: services.reduce((sum, s) => sum + s.metrics.connections, 0),
      totalRequests: services.reduce((sum, s) => sum + s.metrics.requests, 0)
    };
  }

  // Start network simulation
  startNetworkSimulation() {
    setInterval(() => {
      this.devices.forEach(device => {
        if (device.status === 'online') {
          this.simulateNetworkTraffic(device.id);
        }
      });
    }, 2000);
  }
}

export default new NetworkManager();
