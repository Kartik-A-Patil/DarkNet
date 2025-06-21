import React, { useState, useEffect } from 'react';
import { Device } from '../../types';
import { logNetworkActivity, saveDeviceData, getDeviceData } from '../../utils/networkDatabase';

interface ServerInterfaceProps {
  device: Device;
  onUpdate: (deviceId: string, data: any) => void;
}

const ServerInterface: React.FC<ServerInterfaceProps> = ({ device, onUpdate }) => {
  const [services, setServices] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [serverConfig, setServerConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    loadServerData();
    simulateServices();
    simulateLogs();
  }, []);

  const loadServerData = async () => {
    try {
      const serverData = await getDeviceData(device.id, 'server_config');
      if (serverData.length > 0) {
        setServerConfig(serverData[0].data);
      }
      
      const websiteData = await getDeviceData(device.id, 'websites');
      if (websiteData.length > 0) {
        setWebsites(websiteData.map(w => w.data));
      } else {
        // Initialize with default websites
        const defaultWebsites = device.data?.websites || ['darknet.local', 'admin.darknet.local'];
        const websiteConfigs = defaultWebsites.map((site: string) => ({
          id: site.replace('.', '_'),
          domain: site,
          port: site.includes('admin') ? 8443 : 443,
          ssl: true,
          status: 'active',
          visitors: Math.floor(Math.random() * 1000),
          uptime: '99.9%'
        }));
        setWebsites(websiteConfigs);
      }
    } catch (error) {
      console.error('Failed to load server data:', error);
    }
  };

  const simulateServices = () => {
    const serviceList = device.services || ['Apache', 'PHP', 'SSL'];
    const serviceConfigs = serviceList.map(service => ({
      name: service,
      status: Math.random() > 0.1 ? 'running' : 'stopped',
      port: service === 'Apache' ? 80 : service === 'SSL' ? 443 : 3000,
      cpu: Math.random() * 20,
      memory: Math.random() * 100,
      connections: Math.floor(Math.random() * 50)
    }));
    setServices(serviceConfigs);
  };

  const simulateLogs = () => {
    const logTypes = ['access', 'error', 'security', 'system'];
    const mockLogs = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      message: `Log entry ${i + 1} - ${logTypes[Math.floor(Math.random() * logTypes.length)]} event`,
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));
    setLogs(mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const restartService = async (serviceName: string) => {
    setLoading(true);
    
    // Update service status
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'restarting' }
        : service
    ));

    // Simulate restart delay
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'running', connections: 0 }
          : service
      ));
      setLoading(false);
    }, 3000);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'restart_service', service: serviceName },
      type: 'command'
    });
  };

  const stopService = async (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'stopped', connections: 0 }
        : service
    ));

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'stop_service', service: serviceName },
      type: 'command'
    });
  };

  const startService = async (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'running' }
        : service
    ));

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'start_service', service: serviceName },
      type: 'command'
    });
  };

  const updateWebsiteConfig = async (websiteId: string, updates: any) => {
    const updatedWebsites = websites.map(site => 
      site.id === websiteId ? { ...site, ...updates } : site
    );
    setWebsites(updatedWebsites);

    await saveDeviceData(device.id, 'websites', updatedWebsites);
    
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'update_website', websiteId, updates },
      type: 'command'
    });
  };

  const deployNewSite = async () => {
    const newSite = {
      id: `site_${Date.now()}`,
      domain: `new-site-${Date.now()}.darknet.local`,
      port: 8080,
      ssl: false,
      status: 'active',
      visitors: 0,
      uptime: '100%'
    };

    const updatedWebsites = [...websites, newSite];
    setWebsites(updatedWebsites);
    
    await saveDeviceData(device.id, 'websites', newSite);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'deploy_site', site: newSite },
      type: 'command'
    });
  };

  const createBackup = async () => {
    const backup = {
      id: `backup_${Date.now()}`,
      timestamp: new Date(),
      size: `${Math.floor(Math.random() * 1000) + 100}MB`,
      services: services.map(s => s.name),
      websites: websites.length,
      status: 'completed'
    };

    await saveDeviceData(device.id, 'backups', backup);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'create_backup', backup },
      type: 'backup'
    });

    // Update device stats
    onUpdate(device.id, {
      data: {
        ...device.data,
        lastBackup: new Date().toISOString()
      }
    });
  };

  const clearLogs = async (logType?: string) => {
    if (logType) {
      setLogs(prev => prev.filter(log => log.type !== logType));
    } else {
      setLogs([]);
    }

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'clear_logs', logType: logType || 'all' },
      type: 'command'
    });
  };

  return (
    <div className="server-interface">
      <div className="server-header">
        <h4>SERVER INTERFACE - {device.name}</h4>
        <div className="server-stats">
          <span>Services: {services.filter(s => s.status === 'running').length}/{services.length}</span>
          <span>Websites: {websites.length}</span>
          <span>Connections: {device.data?.activeConnections || 0}</span>
        </div>
      </div>

      {/* Services Management */}
      <div className="services-section">
        <h5>SERVICES</h5>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.name} className="service-card">
              <div className="service-info">
                <div className="service-name">{service.name}</div>
                <div className={`service-status ${service.status}`}>
                  {service.status.toUpperCase()}
                </div>
                <div className="service-details">
                  <span>Port: {service.port}</span>
                  <span>CPU: {service.cpu.toFixed(1)}%</span>
                  <span>Connections: {service.connections}</span>
                </div>
              </div>
              <div className="service-actions">
                {service.status === 'running' ? (
                  <>
                    <button onClick={() => restartService(service.name)} className="restart-btn">
                      RESTART
                    </button>
                    <button onClick={() => stopService(service.name)} className="stop-btn">
                      STOP
                    </button>
                  </>
                ) : (
                  <button onClick={() => startService(service.name)} className="start-btn">
                    START
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Website Management */}
      <div className="websites-section">
        <h5>HOSTED WEBSITES</h5>
        <div className="websites-grid">
          {websites.map((site) => (
            <div key={site.id} className="website-card">
              <div className="website-info">
                <div className="website-domain">{site.domain}</div>
                <div className="website-details">
                  <span>Port: {site.port}</span>
                  <span>SSL: {site.ssl ? 'Enabled' : 'Disabled'}</span>
                  <span>Visitors: {site.visitors}</span>
                  <span>Uptime: {site.uptime}</span>
                </div>
              </div>
              <div className="website-actions">
                <button
                  onClick={() => updateWebsiteConfig(site.id, { ssl: !site.ssl })}
                  className="ssl-btn"
                >
                  {site.ssl ? 'DISABLE SSL' : 'ENABLE SSL'}
                </button>
                <button
                  onClick={() => updateWebsiteConfig(site.id, { status: site.status === 'active' ? 'maintenance' : 'active' })}
                  className="status-btn"
                >
                  {site.status === 'active' ? 'MAINTENANCE' : 'ACTIVATE'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={deployNewSite} className="deploy-btn">
          DEPLOY NEW SITE
        </button>
      </div>

      {/* Server Logs */}
      <div className="logs-section">
        <h5>SERVER LOGS</h5>
        <div className="logs-controls">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="log-filter"
          >
            <option value="">All Logs</option>
            <option value="access">Access Logs</option>
            <option value="error">Error Logs</option>
            <option value="security">Security Logs</option>
            <option value="system">System Logs</option>
          </select>
          <button onClick={() => clearLogs()} className="clear-logs-btn">
            CLEAR ALL
          </button>
        </div>
        <div className="logs-container">
          {logs
            .filter(log => !selectedService || log.type === selectedService)
            .slice(0, 10)
            .map((log) => (
              <div key={log.id} className={`log-entry ${log.severity}`}>
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-type">{log.type.toUpperCase()}</span>
                <span className="log-ip">{log.ip}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Server Actions */}
      <div className="server-actions">
        <h5>SERVER MANAGEMENT</h5>
        <div className="actions-grid">
          <button onClick={createBackup} className="backup-btn">
            CREATE BACKUP
          </button>
          <button
            onClick={() => {
              services.forEach(service => {
                if (service.status === 'stopped') {
                  startService(service.name);
                }
              });
            }}
            className="start-all-btn"
          >
            START ALL SERVICES
          </button>
          <button
            onClick={() => clearLogs()}
            className="maintenance-btn"
          >
            MAINTENANCE MODE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerInterface;
