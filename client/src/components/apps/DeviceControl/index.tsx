import React, { useState, useEffect } from 'react';
import { Device } from './types';
import { mockDevices } from './data/mockDevices';
import { logNetworkActivity, getNetworkStats } from './utils/networkDatabase';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import './styles/DeviceControl.css';

const DeviceControl: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'monitoring' | 'security' | 'topology'>('overview');
  const [networkStats, setNetworkStats] = useState<any>(null);

  // Initialize devices and network database
  useEffect(() => {
    setDevices(mockDevices);
    loadNetworkStats();
  }, []);

  const loadNetworkStats = async () => {
    try {
      const stats = await getNetworkStats();
      setNetworkStats(stats);
    } catch (error) {
      console.error('Failed to load network stats:', error);
    }
  };

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    
    // Log device access
    logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'device_selected', deviceName: device.name },
      type: 'command'
    });
  };

  // Handle device toggle (power on/off)
  const handleToggleDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newStatus = device.status === 'online' ? 'offline' : 'online';
    
    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, status: newStatus }
        : d
    ));

    // Log the power state change
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: deviceId,
      data: { 
        action: 'power_toggle', 
        previousStatus: device.status,
        newStatus: newStatus
      },
      type: 'command'
    });

    // Update selected device if it's the one being toggled
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle device restart
  const handleRestartDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, status: 'connecting' }
        : d
    ));
    
    // Log restart command
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: deviceId,
      data: { 
        action: 'restart_device', 
        deviceName: device.name,
        previousUptime: device.uptime
      },
      type: 'command'
    });
    
    // Simulate restart
    setTimeout(async () => {
      setDevices(prev => prev.map(d => 
        d.id === deviceId 
          ? { ...d, status: 'online', uptime: '0 days, 0:00:01' }
          : d
      ));

      // Log restart completion
      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: deviceId,
        data: { action: 'restart_completed', deviceName: device.name },
        type: 'command'
      });

      // Update selected device
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => prev ? { 
          ...prev, 
          status: 'online', 
          uptime: '0 days, 0:00:01' 
        } : null);
      }
    }, 3000);
  };

  // Handle device settings update
  const handleUpdateDevice = async (deviceId: string, updates: any) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, ...updates }
        : d
    ));

    // Log device update
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: deviceId,
      data: { 
        action: 'device_updated', 
        deviceName: device.name,
        updates: Object.keys(updates)
      },
      type: 'command'
    });

    // Update selected device
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, ...updates } : null);
    }

    // Refresh network stats
    loadNetworkStats();
  };

  return (
    <div className="device-control">
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deviceCount={devices.length}
        onlineCount={devices.filter(d => d.status === 'online').length}
        networkStats={networkStats}
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
          onUpdateDevice={handleUpdateDevice}
        />
      </div>
    </div>
  );
};

export default DeviceControl;
