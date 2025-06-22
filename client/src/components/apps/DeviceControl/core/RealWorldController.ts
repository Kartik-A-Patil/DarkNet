import NetworkManager from './NetworkManager';
import { Device } from '../types';

export interface RealServiceConfig {
  name: string;
  type: 'http' | 'api' | 'database' | 'ftp' | 'custom';
  port: number;
  enabled: boolean;
  autoStart: boolean;
  config: any;
}

export interface FileSystemEntry {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  children?: FileSystemEntry[];
  permissions: string;
  owner: string;
  modified: Date;
}

class RealWorldController {
  private localStorage: Map<string, any> = new Map();
  private fileSystems: Map<string, FileSystemEntry> = new Map();
  private webServers: Map<string, any> = new Map();
  private databases: Map<string, any> = new Map();

  constructor() {
    this.initializeFileSystems();
    this.initializeWebServers();
    this.initializeDatabases();
  }

  private initializeFileSystems() {
    // Create realistic file systems for each device type
    const deviceTypes = ['database', 'router', 'server', 'nas', 'computer'];
    
    deviceTypes.forEach(type => {
      this.fileSystems.set(type, this.createFileSystemForType(type));
    });
  }

  private createFileSystemForType(type: string): FileSystemEntry {
    const commonDirs = {
      type: 'directory' as const,
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: new Date(),
      children: [] as FileSystemEntry[]
    };

    switch (type) {
      case 'server':
        return {
          name: '/',
          ...commonDirs,
          children: [
            {
              name: 'var',
              ...commonDirs,
              children: [
                {
                  name: 'www',
                  ...commonDirs,
                  children: [
                    {
                      name: 'html',
                      ...commonDirs,
                      children: [
                        {
                          name: 'index.html',
                          type: 'file',
                          size: 2048,
                          permissions: '-rw-r--r--',
                          owner: 'www-data',
                          modified: new Date(),
                          content: this.generateIndexHTML('Web Server')
                        },
                        {
                          name: 'api',
                          ...commonDirs,
                          children: [
                            {
                              name: 'status.json',
                              type: 'file',
                              size: 512,
                              permissions: '-rw-r--r--',
                              owner: 'www-data',
                              modified: new Date(),
                              content: JSON.stringify({ status: 'running', uptime: '45 days' }, null, 2)
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: 'etc',
              ...commonDirs,
              children: [
                {
                  name: 'apache2',
                  ...commonDirs,
                  children: [
                    {
                      name: 'apache2.conf',
                      type: 'file',
                      size: 4096,
                      permissions: '-rw-r--r--',
                      owner: 'root',
                      modified: new Date(),
                      content: this.generateApacheConfig()
                    }
                  ]
                }
              ]
            }
          ]
        };

      case 'database':
        return {
          name: '/',
          ...commonDirs,
          children: [
            {
              name: 'var',
              ...commonDirs,
              children: [
                {
                  name: 'lib',
                  ...commonDirs,
                  children: [
                    {
                      name: 'mysql',
                      ...commonDirs,
                      children: [
                        {
                          name: 'darknet',
                          ...commonDirs,
                          children: [
                            {
                              name: 'users.frm',
                              type: 'file',
                              size: 8192,
                              permissions: '-rw-rw----',
                              owner: 'mysql',
                              modified: new Date()
                            },
                            {
                              name: 'sessions.frm',
                              type: 'file',
                              size: 4096,
                              permissions: '-rw-rw----',
                              owner: 'mysql',
                              modified: new Date()
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        };

      case 'nas':
        return {
          name: '/',
          ...commonDirs,
          children: [
            {
              name: 'media',
              ...commonDirs,
              children: [
                {
                  name: 'documents',
                  ...commonDirs,
                  children: [
                    {
                      name: 'project_files.zip',
                      type: 'file',
                      size: 1048576,
                      permissions: '-rw-rw-rw-',
                      owner: 'nas',
                      modified: new Date()
                    }
                  ]
                },
                {
                  name: 'backups',
                  ...commonDirs,
                  children: [
                    {
                      name: 'daily_backup_2024.tar.gz',
                      type: 'file',
                      size: 5368709120,
                      permissions: '-rw-r--r--',
                      owner: 'backup',
                      modified: new Date()
                    }
                  ]
                }
              ]
            }
          ]
        };

      default:
        return {
          name: '/',
          ...commonDirs,
          children: [
            {
              name: 'home',
              ...commonDirs,
              children: [
                {
                  name: 'user',
                  ...commonDirs,
                  children: [
                    {
                      name: 'documents',
                      ...commonDirs,
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        };
    }
  }

  private generateIndexHTML(title: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - DarkNet</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background-color: #000;
            color: #00ff41;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #00ff41;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            background: rgba(0, 255, 65, 0.1);
            border-left: 4px solid #00ff41;
            padding: 20px;
            margin: 20px 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            background: rgba(0, 20, 0, 0.8);
            border: 1px solid #00ff41;
            padding: 15px;
            border-radius: 5px;
        }
        .status {
            color: #00ff41;
            font-weight: bold;
        }
        .warning {
            color: #ffaa00;
        }
        .error {
            color: #ff4444;
        }
        a {
            color: #00ff41;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .blink {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 ${title}</h1>
            <p class="status">STATUS: <span class="blink">ONLINE</span></p>
            <p>Welcome to the DarkNet Infrastructure</p>
        </div>

        <div class="section">
            <h2>📊 System Status</h2>
            <div class="grid">
                <div class="card">
                    <h3>Service Health</h3>
                    <p class="status">✅ HTTP Server: Running</p>
                    <p class="status">✅ SSL Certificate: Valid</p>
                    <p class="status">✅ Database Connection: Active</p>
                    <p class="warning">⚠️ Load Average: Moderate</p>
                </div>
                <div class="card">
                    <h3>Performance Metrics</h3>
                    <p>CPU Usage: <span class="status">${Math.floor(Math.random() * 40 + 10)}%</span></p>
                    <p>Memory Usage: <span class="status">${Math.floor(Math.random() * 30 + 20)}%</span></p>
                    <p>Disk Usage: <span class="status">${Math.floor(Math.random() * 50 + 30)}%</span></p>
                    <p>Network I/O: <span class="status">${Math.floor(Math.random() * 100 + 50)} KB/s</span></p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔗 Available Services</h2>
            <div class="grid">
                <div class="card">
                    <h3>Web Services</h3>
                    <ul>
                        <li><a href="/status">System Status</a></li>
                        <li><a href="/metrics">Performance Metrics</a></li>
                        <li><a href="/logs">System Logs</a></li>
                        <li><a href="/api">API Documentation</a></li>
                    </ul>
                </div>
                <div class="card">
                    <h3>Administrative</h3>
                    <ul>
                        <li><a href="/admin">Administration Panel</a></li>
                        <li><a href="/config">Configuration</a></li>
                        <li><a href="/backup">Backup Management</a></li>
                        <li><a href="/security">Security Settings</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📡 Network Information</h2>
            <div class="card">
                <p><strong>Server:</strong> ${title}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Uptime:</strong> ${Math.floor(Math.random() * 100)} days</p>
                <p><strong>Connection:</strong> Secure HTTPS</p>
                <p><strong>Location:</strong> DarkNet Infrastructure</p>
            </div>
        </div>

        <div class="section">
            <h2>⚠️ Security Notice</h2>
            <div class="card">
                <p class="warning">This is a secured system. All activities are monitored and logged.</p>
                <p>Unauthorized access attempts will be reported to network administrators.</p>
                <p class="status">Current security level: HIGH</p>
            </div>
        </div>
    </div>

    <script>
        // Add some dynamic behavior
        setInterval(() => {
            const statusElements = document.querySelectorAll('.status');
            statusElements.forEach(el => {
                if (Math.random() > 0.95) {
                    el.style.textShadow = '0 0 10px #00ff41';
                    setTimeout(() => {
                        el.style.textShadow = 'none';
                    }, 200);
                }
            });
        }, 1000);

        // Simulate real-time updates
        const updateMetrics = () => {
            // This would update metrics in a real implementation
            console.log('Metrics updated at', new Date().toISOString());
        };

        setInterval(updateMetrics, 10000);
    </script>
</body>
</html>`;
  }

  private generateApacheConfig(): string {
    return `# Apache Configuration for DarkNet
ServerRoot "/etc/apache2"
Listen 80
Listen 443 ssl

# Modules
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so

# Security
ServerTokens Prod
ServerSignature Off

# SSL Configuration
SSLEngine on
SSLCertificateFile /etc/ssl/certs/darknet.crt
SSLCertificateKeyFile /etc/ssl/private/darknet.key

# Document Root
DocumentRoot "/var/www/html"

# Directory Configuration
<Directory "/var/www/html">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# Logging
ErrorLog /var/log/apache2/error.log
CustomLog /var/log/apache2/access.log combined

# Performance
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 15
`;
  }

  private initializeWebServers() {
    // Initialize web server configurations
    this.webServers.set('default', {
      documentRoot: '/var/www/html',
      modules: ['rewrite', 'ssl', 'headers'],
      virtualHosts: [],
      ssl: {
        enabled: true,
        certificate: '/etc/ssl/certs/server.crt',
        privateKey: '/etc/ssl/private/server.key'
      }
    });
  }

  private initializeDatabases() {
    // Initialize database schemas
    this.databases.set('darknet', {
      engine: 'mysql',
      version: '8.0',
      charset: 'utf8mb4',
      tables: {
        users: {
          columns: [
            { name: 'id', type: 'INT', primary: true, autoIncrement: true },
            { name: 'username', type: 'VARCHAR(50)', unique: true },
            { name: 'email', type: 'VARCHAR(100)' },
            { name: 'password_hash', type: 'VARCHAR(255)' },
            { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
            { name: 'last_login', type: 'TIMESTAMP' }
          ],
          data: [
            { id: 1, username: 'admin', email: 'admin@darknet.local', created_at: '2024-01-15 10:30:00', last_login: '2024-01-15 14:30:22' },
            { id: 2, username: 'hackos', email: 'hackos@darknet.local', created_at: '2024-01-10 15:45:00', last_login: '2024-01-15 09:15:45' },
            { id: 3, username: 'analyst', email: 'analyst@darknet.local', created_at: '2024-01-05 12:20:00', last_login: '2024-01-14 16:22:11' }
          ]
        },
        sessions: {
          columns: [
            { name: 'session_id', type: 'VARCHAR(128)', primary: true },
            { name: 'user_id', type: 'INT' },
            { name: 'ip_address', type: 'VARCHAR(45)' },
            { name: 'user_agent', type: 'TEXT' },
            { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
            { name: 'expires_at', type: 'TIMESTAMP' }
          ],
          data: []
        },
        logs: {
          columns: [
            { name: 'id', type: 'INT', primary: true, autoIncrement: true },
            { name: 'level', type: 'ENUM("DEBUG","INFO","WARN","ERROR")' },
            { name: 'message', type: 'TEXT' },
            { name: 'timestamp', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
            { name: 'source', type: 'VARCHAR(50)' }
          ],
          data: [
            { id: 1, level: 'INFO', message: 'Database connection established', timestamp: '2024-01-15 10:00:00', source: 'mysql' },
            { id: 2, level: 'INFO', message: 'User admin logged in', timestamp: '2024-01-15 14:30:22', source: 'auth' },
            { id: 3, level: 'WARN', message: 'High CPU usage detected', timestamp: '2024-01-15 15:45:00', source: 'monitor' }
          ]
        }
      }
    });
  }

  // Device Service Management
  async startService(deviceId: string, serviceType: string, config: RealServiceConfig): Promise<string | null> {
    const device = NetworkManager.getDevice(deviceId);
    if (!device || device.status !== 'online') {
      return null;
    }

    // Create service in network manager
    const serviceId = NetworkManager.createService(deviceId, serviceType, config);
    if (!serviceId) return null;

    // Configure real-world behavior
    await this.configureServiceBehavior(deviceId, serviceId, serviceType, config);

    return serviceId;
  }

  private async configureServiceBehavior(deviceId: string, serviceId: string, serviceType: string, config: RealServiceConfig) {
    const device = NetworkManager.getDevice(deviceId);
    if (!device) return;

    switch (serviceType) {
      case 'http':
        await this.configureWebServer(deviceId, serviceId, config);
        break;
      case 'database':
        await this.configureDatabase(deviceId, serviceId, config);
        break;
      case 'api':
        await this.configureAPI(deviceId, serviceId, config);
        break;
      case 'ftp':
        await this.configureFTP(deviceId, serviceId, config);
        break;
    }
  }

  private async configureWebServer(deviceId: string, serviceId: string, config: RealServiceConfig) {
    const device = NetworkManager.getDevice(deviceId);
    if (!device) return;

    // Create document root structure
    const fileSystem = this.fileSystems.get(device.type) || this.createFileSystemForType('server');
    
    // Add custom content if provided
    if (config.config.customContent) {
      this.addFileToSystem(fileSystem, '/var/www/html/index.html', config.config.customContent);
    }

    // Configure virtual hosts
    if (config.config.virtualHosts) {
      config.config.virtualHosts.forEach((vhost: any) => {
        this.addVirtualHost(deviceId, vhost);
      });
    }
  }

  private async configureDatabase(deviceId: string, serviceId: string, config: RealServiceConfig) {
    // Configure database instance
    const dbConfig = {
      ...this.databases.get('darknet'),
      ...config.config
    };

    this.databases.set(`${deviceId}_${serviceId}`, dbConfig);
  }

  private async configureAPI(deviceId: string, serviceId: string, config: RealServiceConfig) {
    // Configure API endpoints
    const apiConfig = {
      endpoints: config.config.endpoints || [
        { path: '/api/status', method: 'GET', handler: 'getStatus' },
        { path: '/api/data', method: 'GET', handler: 'getData' },
        { path: '/api/data', method: 'POST', handler: 'postData' }
      ],
      middleware: config.config.middleware || ['cors', 'auth', 'rateLimit'],
      database: config.config.database || null
    };

    this.localStorage.set(`api_${deviceId}_${serviceId}`, apiConfig);
  }

  private async configureFTP(deviceId: string, serviceId: string, config: RealServiceConfig) {
    // Configure FTP server
    const ftpConfig = {
      root: config.config.root || '/ftp',
      users: config.config.users || [
        { username: 'anonymous', password: '', permissions: 'r' },
        { username: 'admin', password: 'admin123', permissions: 'rw' }
      ],
      passiveMode: config.config.passiveMode || true,
      maxConnections: config.config.maxConnections || 10
    };

    this.localStorage.set(`ftp_${deviceId}_${serviceId}`, ftpConfig);
  }

  // File System Operations
  private addFileToSystem(fileSystem: FileSystemEntry, path: string, content: string) {
    const pathParts = path.split('/').filter(part => part);
    let current = fileSystem;

    // Navigate to parent directory
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      let found = current.children?.find(child => child.name === part);
      
      if (!found) {
        found = {
          name: part,
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          modified: new Date(),
          children: []
        };
        current.children = current.children || [];
        current.children.push(found);
      }
      current = found;
    }

    // Add file
    const fileName = pathParts[pathParts.length - 1];
    const file: FileSystemEntry = {
      name: fileName,
      type: 'file',
      size: content.length,
      content,
      permissions: '-rw-r--r--',
      owner: 'www-data',
      modified: new Date()
    };

    current.children = current.children || [];
    const existingIndex = current.children.findIndex(child => child.name === fileName);
    if (existingIndex >= 0) {
      current.children[existingIndex] = file;
    } else {
      current.children.push(file);
    }
  }

  private addVirtualHost(deviceId: string, vhost: any) {
    const webConfig = this.webServers.get('default');
    if (webConfig) {
      webConfig.virtualHosts.push({
        serverName: vhost.serverName,
        documentRoot: vhost.documentRoot,
        port: vhost.port || 80,
        ssl: vhost.ssl || false
      });
    }
  }

  // Port Forwarding
  async enablePortForwarding(routerDeviceId: string, externalPort: number, targetDeviceId: string, targetPort: number): Promise<boolean> {
    const router = NetworkManager.getDevice(routerDeviceId);
    const target = NetworkManager.getDevice(targetDeviceId);
    
    if (!router || !target || router.type !== 'router') {
      return false;
    }

    // Use NetworkManager to set up port forwarding
    const success = NetworkManager.forwardPort(externalPort, targetDeviceId, targetPort);
    
    if (success) {
      // Update router configuration
      const routerConfig = router.config || {};
      routerConfig.portForwarding = routerConfig.portForwarding || [];
      routerConfig.portForwarding.push({
        port: externalPort,
        target: `${target.ip}:${targetPort}`,
        enabled: true,
        description: `Forward ${externalPort} to ${target.name}:${targetPort}`
      });

      NetworkManager.updateDevice(routerDeviceId, { config: routerConfig });
    }

    return success;
  }

  // Storage Management
  createNetworkStorage(nasDeviceId: string, shareName: string, path: string, permissions: string = 'rw'): boolean {
    const nas = NetworkManager.getDevice(nasDeviceId);
    if (!nas || nas.type !== 'nas') {
      return false;
    }

    const nasConfig = nas.config || {};
    nasConfig.sharedFolders = nasConfig.sharedFolders || [];
    
    const share = {
      name: shareName,
      path,
      permissions,
      protocol: 'SMB',
      enabled: true,
      users: ['admin', 'user'],
      created: new Date().toISOString()
    };

    nasConfig.sharedFolders.push(share);
    NetworkManager.updateDevice(nasDeviceId, { config: nasConfig });

    // Create file system structure
    const fileSystem = this.fileSystems.get(nasDeviceId) || this.createFileSystemForType('nas');
    this.addFileToSystem(fileSystem, path, '');
    this.fileSystems.set(nasDeviceId, fileSystem);

    return true;
  }

  // Browser Integration
  async handleBrowserRequest(url: string, method: string = 'GET', data?: any) {
    return await NetworkManager.makeRequest(url, method as any, data);
  }

  // Device Interaction
  async executeCommand(deviceId: string, command: string): Promise<string> {
    const device = NetworkManager.getDevice(deviceId);
    if (!device || device.status !== 'online') {
      return 'Error: Device not available';
    }

    // Simulate command execution based on device type and OS
    return this.simulateCommandExecution(device, command);
  }

  private simulateCommandExecution(device: Device, command: string): string {
    const parts = command.trim().split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case 'ls':
      case 'dir':
        return this.simulateListDirectory(device, parts[1] || '.');
      
      case 'ps':
      case 'top':
        return this.simulateProcessList(device);
      
      case 'netstat':
        return this.simulateNetstat(device);
      
      case 'systemctl':
      case 'service':
        return this.simulateServiceCommand(device, parts.slice(1));
      
      case 'cat':
      case 'type':
        return this.simulateFileRead(device, parts[1]);
      
      case 'ping':
        return this.simulatePing(parts[1]);
      
      default:
        return `${cmd}: command not found`;
    }
  }

  private simulateListDirectory(device: Device, path: string): string {
    const fileSystem = this.fileSystems.get(device.type);
    if (!fileSystem) return 'Directory not found';

    // Simulate directory listing
    const entries = [
      'drwxr-xr-x  2 root root 4096 Jan 15 10:30 bin',
      'drwxr-xr-x  2 root root 4096 Jan 15 10:30 etc',
      'drwxr-xr-x  2 root root 4096 Jan 15 10:30 home',
      'drwxr-xr-x  2 root root 4096 Jan 15 10:30 var',
      '-rw-r--r--  1 root root  512 Jan 15 14:30 status.log'
    ];

    return entries.join('\n');
  }

  private simulateProcessList(device: Device): string {
    const services = NetworkManager.getDeviceServices(device.id);
    let output = 'PID  USER     TIME  COMMAND\n';
    
    services.forEach((service, index) => {
      const pid = 1000 + index;
      output += `${pid.toString().padEnd(5)}root     ${service.metrics.uptime}:00  ${service.name}\n`;
    });

    return output;
  }

  private simulateNetstat(device: Device): string {
    const services = NetworkManager.getDeviceServices(device.id);
    let output = 'Proto Local Address     Foreign Address   State\n';
    
    services.forEach(service => {
      if (service.status === 'running') {
        output += `tcp   ${device.ip}:${service.port}    0.0.0.0:*         LISTEN\n`;
      }
    });

    return output;
  }

  private simulateServiceCommand(device: Device, args: string[]): string {
    if (args.length < 2) return 'Usage: systemctl [start|stop|status] <service>';
    
    const action = args[0];
    const serviceName = args[1];
    
    return `${action} ${serviceName}: ${action === 'status' ? 'active (running)' : 'OK'}`;
  }

  private simulateFileRead(device: Device, filePath: string): string {
    if (!filePath) return 'cat: missing file operand';
    
    // Return sample file content based on filename
    if (filePath.endsWith('.log')) {
      return `[${new Date().toISOString()}] INFO: Service started successfully
[${new Date().toISOString()}] INFO: Connection established
[${new Date().toISOString()}] WARN: High memory usage detected`;
    }
    
    if (filePath.endsWith('.conf') || filePath.endsWith('.config')) {
      return `# Configuration file for ${device.name}
port=80
debug=false
max_connections=100`;
    }
    
    return 'Hello from DarkNet file system!';
  }

  private simulatePing(target: string): string {
    if (!target) return 'ping: usage error';
    
    return `PING ${target} (${target}): 56 data bytes
64 bytes from ${target}: icmp_seq=0 ttl=64 time=1.234 ms
64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.456 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=1.123 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
  }

  // Public API
  getDeviceFileSystem(deviceId: string): FileSystemEntry | null {
    return this.fileSystems.get(deviceId) || null;
  }

  getStorageStats(deviceId: string) {
    const device = NetworkManager.getDevice(deviceId);
    if (!device) return null;

    return {
      total: device.config?.totalStorage || 1000,
      used: device.config?.usedStorage || 500,
      available: device.config?.availableStorage || 500,
      shares: device.config?.sharedFolders || []
    };
  }

  getRunningServices(deviceId: string) {
    return NetworkManager.getDeviceServices(deviceId);
  }

  getNetworkStatus() {
    return NetworkManager.getNetworkStatus();
  }
}

export default new RealWorldController();
