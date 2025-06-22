import RealWorldController from '../core/RealWorldController';
import NetworkManager from '../core/NetworkManager';

export class DeviceNetworkBrowser {
  private static instance: DeviceNetworkBrowser;
  
  static getInstance(): DeviceNetworkBrowser {
    if (!DeviceNetworkBrowser.instance) {
      DeviceNetworkBrowser.instance = new DeviceNetworkBrowser();
    }
    return DeviceNetworkBrowser.instance;
  }

  // Enhanced URL resolution that handles device IPs
  async resolveURL(url: string): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    headers?: Record<string, string>;
    statusCode?: number;
  }> {
    try {
      // Handle different URL schemes
      if (url.startsWith('browser://')) {
        return this.handleBrowserScheme(url);
      }

      if (url.startsWith('device://')) {
        return this.handleDeviceScheme(url);
      }

      // Handle IP addresses and domains
      if (this.isNetworkURL(url)) {
        return this.handleNetworkRequest(url);
      }

      // Handle file:// URLs
      if (url.startsWith('file://')) {
        return this.handleFileURL(url);
      }

      return {
        success: false,
        error: 'Unsupported URL scheme'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isNetworkURL(url: string): boolean {
    // Check if URL contains IP address or known device names
    const ipRegex = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    const deviceRegex = /^https?:\/\/(localhost|[a-zA-Z0-9-]+\.local)/;
    
    return ipRegex.test(url) || deviceRegex.test(url) || url.includes('192.168.');
  }

  private async handleBrowserScheme(url: string): Promise<any> {
    const path = url.replace('browser://', '');
    
    switch (path) {
      case 'welcome':
        return {
          success: true,
          content: this.generateWelcomePage(),
          headers: { 'Content-Type': 'text/html' }
        };
      
      case 'network':
        return {
          success: true,
          content: this.generateNetworkOverview(),
          headers: { 'Content-Type': 'text/html' }
        };
      
      case 'devices':
        return {
          success: true,
          content: this.generateDeviceList(),
          headers: { 'Content-Type': 'text/html' }
        };
      
      default:
        return {
          success: false,
          error: 'Page not found'
        };
    }
  }

  private async handleDeviceScheme(url: string): Promise<any> {
    // Format: device://device-id/path
    const match = url.match(/^device:\/\/([^\/]+)(?:\/(.*))?$/);
    if (!match) {
      return { success: false, error: 'Invalid device URL format' };
    }

    const [, deviceId, path = ''] = match;
    const device = NetworkManager.getDevice(deviceId);
    
    if (!device) {
      return { success: false, error: 'Device not found' };
    }

    if (device.status !== 'online') {
      return { 
        success: false, 
        error: 'Device is offline',
        statusCode: 503
      };
    }

    // Redirect to actual device IP
    const actualURL = `http://${device.ip}/${path}`;
    return this.handleNetworkRequest(actualURL);
  }

  private async handleNetworkRequest(url: string): Promise<any> {
    try {
      const response = await RealWorldController.handleBrowserRequest(url);
      
      return {
        success: response.status >= 200 && response.status < 400,
        content: response.data,
        headers: {
          'content-type': 'application/json',
          'server': 'DarkNet-Simulator',
          'x-response-time': `${(response as any).responseTime || 100}ms`
        },
        statusCode: response.status,
        error: response.status >= 400 ? response.statusText : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 500
      };
    }
  }

  private async handleFileURL(url: string): Promise<any> {
    const filePath = url.replace('file://', '');
    
    // Check if this is a device file system access
    const deviceMatch = filePath.match(/^\/devices\/([^\/]+)\/(.*)$/);
    if (deviceMatch) {
      const [, deviceId, path] = deviceMatch;
      return this.handleDeviceFileAccess(deviceId, path);
    }

    // Regular file access would be handled by the existing file system
    return {
      success: false,
      error: 'File access not implemented for this path'
    };
  }

  private async handleDeviceFileAccess(deviceId: string, path: string): Promise<any> {
    const device = NetworkManager.getDevice(deviceId);
    if (!device || device.status !== 'online') {
      return {
        success: false,
        error: 'Device not accessible'
      };
    }

    const fileSystem = RealWorldController.getDeviceFileSystem(deviceId);
    if (!fileSystem) {
      return {
        success: false,
        error: 'File system not available'
      };
    }

    // Navigate file system and return content
    const content = this.navigateFileSystem(fileSystem, path);
    
    return {
      success: true,
      content: content || 'File not found',
      headers: { 'Content-Type': 'text/plain' }
    };
  }

  private navigateFileSystem(root: any, path: string): string | null {
    if (!path || path === '/') {
      return this.generateDirectoryListing(root);
    }

    const parts = path.split('/').filter(part => part);
    let current = root;

    for (const part of parts) {
      if (!current.children) return null;
      current = current.children.find((child: any) => child.name === part);
      if (!current) return null;
    }

    if (current.type === 'directory') {
      return this.generateDirectoryListing(current);
    } else {
      return current.content || 'Binary file (content not available)';
    }
  }

  private generateDirectoryListing(directory: any): string {
    if (!directory.children) return 'Empty directory';

    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory Listing - ${directory.name}</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #00ff41; padding: 20px; }
        .listing { list-style: none; padding: 0; }
        .listing li { padding: 5px 0; border-bottom: 1px solid #333; }
        .file { color: #ffffff; }
        .directory { color: #00ff41; font-weight: bold; }
        .directory::before { content: "📁 "; }
        .file::before { content: "📄 "; }
        a { color: inherit; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .header { border-bottom: 2px solid #00ff41; margin-bottom: 20px; padding-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Directory: ${directory.name}</h1>
    </div>
    <ul class="listing">`;

    directory.children.forEach((item: any) => {
      const className = item.type === 'directory' ? 'directory' : 'file';
      html += `<li class="${className}"><a href="${item.name}${item.type === 'directory' ? '/' : ''}">${item.name}</a></li>`;
    });

    html += `
    </ul>
</body>
</html>`;

    return html;
  }

  private generateWelcomePage(): string {
    const devices = NetworkManager.getAllDevices();
    const onlineDevices = devices.filter(d => d.status === 'online');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>DarkNet Browser - Network Control</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #000000, #001100);
            color: #00ff41;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 2px solid #00ff41;
            margin-bottom: 40px;
            position: relative;
        }
        .title {
            font-size: 3em;
            text-shadow: 0 0 20px #00ff41;
            margin: 0;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .network-status {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .status-card {
            background: rgba(0, 255, 65, 0.1);
            border: 1px solid #00ff41;
            padding: 20px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .status-card:hover {
            background: rgba(0, 255, 65, 0.2);
            transform: translateY(-2px);
        }
        .card-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #ffffff;
        }
        .quick-access {
            margin: 40px 0;
        }
        .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .device-link {
            display: block;
            background: rgba(0, 20, 0, 0.8);
            border: 1px solid #00ff41;
            padding: 15px;
            text-decoration: none;
            color: #00ff41;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        .device-link:hover {
            background: rgba(0, 255, 65, 0.1);
            transform: scale(1.02);
        }
        .device-name { font-weight: bold; font-size: 1.1em; }
        .device-ip { color: #888; font-size: 0.9em; }
        .device-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            margin-top: 5px;
        }
        .status-online { background: #00ff41; color: #000; }
        .status-offline { background: #ff4444; color: #fff; }
        .floating-particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }
        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #00ff41;
            animation: float 6s infinite linear;
        }
        @keyframes float {
            0% { transform: translateY(100vh) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-10px) translateX(100px); opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="floating-particles"></div>
    <div class="container">
        <div class="header">
            <h1 class="title">🌐 DARKNET CONTROL</h1>
            <p>Advanced Network Management & Device Control System</p>
        </div>

        <div class="network-status">
            <div class="status-card">
                <div class="card-title">🖥️ Network Status</div>
                <p><strong>${devices.length}</strong> Total Devices</p>
                <p><strong>${onlineDevices.length}</strong> Online</p>
                <p><strong>${devices.length - onlineDevices.length}</strong> Offline</p>
            </div>
            
            <div class="status-card">
                <div class="card-title">🔒 Security Level</div>
                <p><strong>HIGH</strong> - All systems secured</p>
                <p>Firewall: <span style="color: #00ff41;">ACTIVE</span></p>
                <p>Encryption: <span style="color: #00ff41;">ENABLED</span></p>
            </div>
            
            <div class="status-card">
                <div class="card-title">📊 System Performance</div>
                <p>Network Load: <strong>Normal</strong></p>
                <p>Response Time: <strong>&lt;50ms</strong></p>
                <p>Uptime: <strong>99.9%</strong></p>
            </div>
        </div>

        <div class="quick-access">
            <h2>🎯 Quick Access - Online Devices</h2>
            <div class="device-grid">
                ${onlineDevices.map(device => `
                    <a href="http://${device.ip}" class="device-link">
                        <div class="device-name">${device.name}</div>
                        <div class="device-ip">${device.ip}</div>
                        <div class="device-status status-online">ONLINE</div>
                    </a>
                `).join('')}
                
                <a href="browser://network" class="device-link">
                    <div class="device-name">🌐 Network Overview</div>
                    <div class="device-ip">Full topology view</div>
                </a>
                
                <a href="browser://devices" class="device-link">
                    <div class="device-name">📋 Device Manager</div>
                    <div class="device-ip">All devices & services</div>
                </a>
            </div>
        </div>

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #333; padding-top: 20px;">
            <p style="color: #666;">DarkNet Infrastructure - Secure Network Management</p>
            <p style="color: #666; font-size: 0.8em;">
                Last Updated: ${new Date().toLocaleString()} | 
                Status: <span style="color: #00ff41;">ALL SYSTEMS OPERATIONAL</span>
            </p>
        </div>
    </div>

    <script>
        // Create floating particles
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (6 + Math.random() * 4) + 's';
            document.querySelector('.floating-particles').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 10000);
        }

        // Create particles periodically
        setInterval(createParticle, 300);
        
        // Initial particles
        for (let i = 0; i < 10; i++) {
            setTimeout(createParticle, i * 100);
        }
    </script>
</body>
</html>`;
  }

  private generateNetworkOverview(): string {
    const status = RealWorldController.getNetworkStatus();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Network Overview - DarkNet</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #00ff41; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #00ff41; padding-bottom: 20px; margin-bottom: 30px; }
        .network-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .section { background: rgba(0, 255, 65, 0.1); border: 1px solid #00ff41; padding: 20px; border-radius: 8px; }
        .device-list { list-style: none; padding: 0; }
        .device-item { padding: 10px; border-bottom: 1px solid #333; }
        .status-online { color: #00ff41; }
        .status-offline { color: #ff4444; }
        .service-list { font-size: 0.9em; color: #888; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Network Overview</h1>
            <p>Real-time network status and device management</p>
        </div>
        
        <div class="network-grid">
            <div class="section">
                <h2>📱 Devices (${status.devices.length})</h2>
                <ul class="device-list">
                    ${status.devices.map(device => `
                        <li class="device-item">
                            <strong>${device.name}</strong> (${device.ip})
                            <br>
                            <span class="status-${device.status}">${device.status.toUpperCase()}</span>
                            ${device.services && device.services.length > 0 ? 
                                `<div class="service-list">Services: ${device.services.join(', ')}</div>` : 
                                ''
                            }
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>⚙️ Running Services (${status.services.length})</h2>
                <ul class="device-list">
                    ${status.services.map(service => `
                        <li class="device-item">
                            <strong>${service.name}</strong> (Port ${service.port})
                            <br>
                            <span class="status-${service.status === 'running' ? 'online' : 'offline'}">${service.status.toUpperCase()}</span>
                            <div class="service-list">
                                Connections: ${service.metrics.connections} | 
                                Requests: ${service.metrics.requests} |
                                Uptime: ${Math.floor(service.metrics.uptime / 60)}m
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div class="section" style="margin-top: 30px;">
            <h2>🔌 Port Status</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${status.ports.map(port => `
                    <div style="padding: 10px; background: rgba(0, 20, 0, 0.5); border: 1px solid #333; border-radius: 4px;">
                        <strong>Port ${port.port}</strong><br>
                        ${port.isForwarded ? '🔄 Forwarded' : '📡 Direct'}<br>
                        <span style="color: #888;">${port.protocol.toUpperCase()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private generateDeviceList(): string {
    const devices = NetworkManager.getAllDevices();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Device Manager - DarkNet</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #00ff41; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .device-card { 
            background: rgba(0, 255, 65, 0.1); 
            border: 1px solid #00ff41; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
        }
        .device-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .device-name { font-size: 1.3em; font-weight: bold; }
        .device-status { padding: 5px 10px; border-radius: 4px; font-size: 0.9em; }
        .status-online { background: #00ff41; color: #000; }
        .status-offline { background: #ff4444; color: #fff; }
        .device-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .info-item { background: rgba(0, 20, 0, 0.5); padding: 10px; border-radius: 4px; }
        .service-links { margin-top: 15px; }
        .service-link { 
            display: inline-block; 
            background: #00ff41; 
            color: #000; 
            padding: 5px 10px; 
            margin: 5px; 
            text-decoration: none; 
            border-radius: 3px; 
        }
        .service-link:hover { background: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Device Manager</h1>
        <p>Comprehensive device control and service management</p>
        
        ${devices.map(device => {
          const services = RealWorldController.getRunningServices(device.id);
          return `
            <div class="device-card">
                <div class="device-header">
                    <div class="device-name">${device.name}</div>
                    <div class="device-status status-${device.status}">${device.status.toUpperCase()}</div>
                </div>
                
                <div class="device-info">
                    <div class="info-item">
                        <strong>IP Address:</strong><br>
                        <a href="http://${device.ip}" style="color: #00ff41;">${device.ip}</a>
                    </div>
                    <div class="info-item">
                        <strong>Type:</strong><br>
                        ${device.type.toUpperCase()}
                    </div>
                    <div class="info-item">
                        <strong>OS:</strong><br>
                        ${device.os || 'Unknown'}
                    </div>
                    <div class="info-item">
                        <strong>Performance:</strong><br>
                        CPU: ${device.cpu || 0}% | Memory: ${device.memory || 0}%
                    </div>
                </div>
                
                ${services.length > 0 ? `
                    <div class="service-links">
                        <strong>Active Services:</strong><br>
                        ${services.map(service => 
                            `<a href="http://${device.ip}:${service.port}" class="service-link">
                                ${service.name} :${service.port}
                            </a>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
          `;
        }).join('')}
    </div>
</body>
</html>`;
  }

  // Initialize network simulation when browser starts
  initialize() {
    NetworkManager.startNetworkSimulation();
    console.log('DarkNet Browser: Real-world network simulation started');
  }
}

export default DeviceNetworkBrowser;
