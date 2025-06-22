import React, { useState, useEffect } from 'react';
import './styles/DeviceControl.css';
import { Device } from './types';
import { mockDevices } from './data/mockDevices';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import WelcomeScreen from './components/WelcomeScreen';
import NetworkManager from './core/NetworkManager';
import RealWorldController from './core/RealWorldController';

const DeviceControl: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'monitoring' | 'security' | 'topology'>('overview');

  // Initialize devices and start real-world simulation
  useEffect(() => {
    // Initialize with mock devices but register them in NetworkManager
    const initializedDevices = mockDevices.map(device => {
      const deviceId = NetworkManager.registerDevice(device);
      return { ...device, id: deviceId };
    });
    
    setDevices(initializedDevices);

    // Start some default services
    initializeDefaultServices(initializedDevices);

    // Start network simulation
    NetworkManager.startNetworkSimulation();
  }, []);

  const initializeDefaultServices = async (deviceList: Device[]) => {
    for (const device of deviceList) {
      if (device.status === 'online') {
        try {
          switch (device.type) {
            case 'server':
              // Start HTTP server
              await RealWorldController.startService(device.id, 'http', {
                name: `${device.name} Web Server`,
                type: 'http',
                port: 80,
                enabled: true,
                autoStart: true,
                config: {
                  documentRoot: '/var/www/html',
                  virtualHosts: [
                    {
                      serverName: device.ip,
                      documentRoot: '/var/www/html',
                      port: 80
                    }
                  ]
                }
              });

              // Start API server
              await RealWorldController.startService(device.id, 'api', {
                name: `${device.name} API`,
                type: 'api',
                port: 8080,
                enabled: true,
                autoStart: true,
                config: {
                  endpoints: [
                    { path: '/api/status', method: 'GET', handler: 'getStatus' },
                    { path: '/api/metrics', method: 'GET', handler: 'getMetrics' },
                    { path: '/api/logs', method: 'GET', handler: 'getLogs' }
                  ]
                }
              });
              break;

            case 'database':
              await RealWorldController.startService(device.id, 'database', {
                name: `${device.name} Database`,
                type: 'database',
                port: 3306,
                enabled: true,
                autoStart: true,
                config: {
                  engine: 'mysql',
                  database: 'darknet',
                  maxConnections: 200
                }
              });
              break;

            case 'router':
              // Enable port forwarding for web server
              const webServer = deviceList.find(d => d.type === 'server');
              if (webServer) {
                await RealWorldController.enablePortForwarding(device.id, 8080, webServer.id, 80);
                await RealWorldController.enablePortForwarding(device.id, 8081, webServer.id, 8080);
              }
              break;

            case 'nas':
              // Create network storage
              RealWorldController.createNetworkStorage(device.id, 'documents', '/media/documents', 'rw');
              RealWorldController.createNetworkStorage(device.id, 'backups', '/media/backups', 'r');
              break;
          }
        } catch (error) {
          console.error(`Failed to initialize services for ${device.name}:`, error);
        }
      }
    }
  };

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    // Auto-switch to control tab when selecting a device for better UX
    if (activeTab === 'overview') {
      setActiveTab('control');
    }
  };

  // Handle device toggle (power on/off)
  const handleToggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === 'online' ? 'offline' : 'online' }
        : device
    ));
    
    // Update selected device if it's the one being toggled
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? {
        ...prev,
        status: prev.status === 'online' ? 'offline' : 'online'
      } : null);
    }
  };

  // Handle device restart
  const handleRestartDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'connecting' }
        : device
    ));
    
    // Update selected device
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, status: 'connecting' } : null);
    }
    
    // Simulate restart process
    setTimeout(() => {
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'online' }
          : device
      ));
      
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => prev ? { ...prev, status: 'online' } : null);
      }
    }, 3000);
  };

  // Handle device settings update
  const handleUpdateDevice = (deviceId: string, settings: any) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, ...settings }
        : device
    ));
    
    // Update selected device
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, ...settings } : null);
    }
  };

  // Enhanced update function for nested config updates
  const handleUpdateDeviceConfig = (deviceId: string, configUpdates: any) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            config: { 
              ...device.config, 
              ...configUpdates 
            } 
          }
        : device
    ));
    
    // Update selected device
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { 
        ...prev, 
        config: { 
          ...prev.config, 
          ...configUpdates 
        } 
      } : null);
    }
  };

  // Get device statistics for header
  const getDeviceStats = () => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const connecting = devices.filter(d => d.status === 'connecting').length;
    const errors = devices.filter(d => d.status === 'error').length;
    
    return { total, online, offline, connecting, errors };
  };

  const stats = getDeviceStats();

  return (
    <div className="device-control">
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deviceCount={stats.total}
        onlineCount={stats.online}
        offlineCount={stats.offline}
        connectingCount={stats.connecting}
        errorCount={stats.errors}
      />
      
      <div className="device-control-content">
        <Sidebar 
          devices={devices}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
        />
        
        <MainPanel 
          activeTab={activeTab}
          devices={devices}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
          onToggleDevice={handleToggleDevice}
          onRestartDevice={handleRestartDevice}
          onUpdateDevice={(deviceId, settings) => {
            // Check if we're updating config specifically
            if (settings.config) {
              handleUpdateDeviceConfig(deviceId, settings.config);
            } else {
              handleUpdateDevice(deviceId, settings);
            }
          }}
        />
      </div>
    </div>
  );
};

export default DeviceControl;
