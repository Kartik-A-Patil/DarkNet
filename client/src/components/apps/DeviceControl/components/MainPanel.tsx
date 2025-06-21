import React from 'react';
import OverviewPanel from './panels/OverviewPanel';
import ControlPanel from './panels/ControlPanel';
import MonitoringPanel from './panels/MonitoringPanel';
import SecurityPanel from './panels/SecurityPanel';
import TopologyPanel from './panels/TopologyPanel';
import { Device } from '../types';

interface MainPanelProps {
  activeTab: 'overview' | 'control' | 'monitoring' | 'security' | 'topology';
  devices: Device[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
  onToggleDevice: (deviceId: string) => void;
  onRestartDevice: (deviceId: string) => void;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const MainPanel: React.FC<MainPanelProps> = ({
  activeTab,
  devices,
  selectedDevice,
  onDeviceSelect,
  onToggleDevice,
  onRestartDevice,
  onUpdateDevice
}) => {
  const renderPanel = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPanel
            devices={devices}
            selectedDevice={selectedDevice}
          />
        );
      case 'control':
        return (
          <ControlPanel
            devices={devices}
            selectedDevice={selectedDevice}
            onToggleDevice={onToggleDevice}
            onRestartDevice={onRestartDevice}
            onUpdateDevice={onUpdateDevice}
          />
        );
      case 'monitoring':
        return (
          <MonitoringPanel
            devices={devices}
            selectedDevice={selectedDevice}
          />
        );
      case 'security':
        return (
          <SecurityPanel
            devices={devices}
            selectedDevice={selectedDevice}
          />
        );
      case 'topology':
        return (
          <TopologyPanel
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceSelect={onDeviceSelect}
          />
        );
      default:
        return <div className="h-full bg-black flex items-center justify-center text-gray-500">Select a tab</div>;
    }
  };

  return (
    <div className="main-panel">
      {renderPanel()}
    </div>
  );
};

export default MainPanel;
