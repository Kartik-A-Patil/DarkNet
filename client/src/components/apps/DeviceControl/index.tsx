import React, { useState, useEffect } from 'react';
import { Device } from './types';
import { mockDevices } from './data/mockDevices';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import './styles/DeviceControl.css';

const DeviceControl: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'monitoring' | 'security' | 'topology'>('overview');

  // Initialize devices
  useEffect(() => {
    setDevices(mockDevices);
  }, []);

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };

  // Handle device toggle (power on/off)
  const handleToggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === 'online' ? 'offline' : 'online' }
        : device
    ));
  };

  // Handle device restart
  const handleRestartDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'connecting' }
        : device
    ));
    
    // Simulate restart
    setTimeout(() => {
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'online' }
          : device
      ));
    }, 3000);
  };

  // Handle device settings update
  const handleUpdateDevice = (deviceId: string, settings: any) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, ...settings }
        : device
    ));
  };

  return (
    <div className="device-control">
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deviceCount={devices.length}
        onlineCount={devices.filter(d => d.status === 'online').length}
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
