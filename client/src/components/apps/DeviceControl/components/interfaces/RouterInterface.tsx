import React, { useState } from 'react';
import { Device } from '../../types';

interface RouterInterfaceProps {
  device: Device;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const RouterInterface: React.FC<RouterInterfaceProps> = ({ device, onUpdateDevice }) => {
  const [showPortForwarding, setShowPortForwarding] = useState(false);
  const [newPort, setNewPort] = useState('');
  const [newTarget, setNewTarget] = useState('');
  
  const config = device.config || {};
  const bandwidthPercent = config.bandwidth ? (config.bandwidth.used / config.bandwidth.total) * 100 : 0;

  const handleToggleWifi = () => {
    onUpdateDevice(device.id, {
      config: {
        ...config,
        wifiEnabled: !config.wifiEnabled
      }
    });
  };

  const handleAddPortForward = () => {
    if (newPort && newTarget) {
      const currentRules = config.portForwarding || [];
      const newRule = { port: parseInt(newPort), target: newTarget };
      
      onUpdateDevice(device.id, {
        config: {
          ...config,
          portForwarding: [...currentRules, newRule]
        }
      });
      
      setNewPort('');
      setNewTarget('');
    }
  };

  const handleRemovePortForward = (index: number) => {
    const currentRules = config.portForwarding || [];
    const newRules = currentRules.filter((_, i) => i !== index);
    
    onUpdateDevice(device.id, {
      config: {
        ...config,
        portForwarding: newRules
      }
    });
  };

  return (
    <div className="router-interface p-6 bg-gray-900 text-white">
      <h3 className="text-xl font-bold text-green-400 mb-6">ROUTER MANAGEMENT</h3>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Network Status</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>WiFi Status:</span>
              <span className={config.wifiEnabled ? 'text-green-400' : 'text-red-400'}>
                {config.wifiEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connected Devices:</span>
              <span className="text-blue-400">12</span>
            </div>
            <div className="flex justify-between">
              <span>IP Range:</span>
              <span className="text-gray-300">192.168.1.1/24</span>
            </div>
            <button
              onClick={handleToggleWifi}
              className={`w-full px-4 py-2 rounded-lg font-semibold ${
                config.wifiEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <i className={`fa ${config.wifiEnabled ? 'fa-wifi' : 'fa-times'} mr-2`}></i>
              {config.wifiEnabled ? 'Disable WiFi' : 'Enable WiFi'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Bandwidth Usage</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Bandwidth:</span>
              <span className="text-green-400">{config.bandwidth?.total || 0} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>Used:</span>
              <span className="text-yellow-400">{config.bandwidth?.used || 0} Mbps</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(bandwidthPercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-400">
              {bandwidthPercent.toFixed(1)}% Utilized
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Network Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(device.services || []).map((service, index) => (
            <div key={index} className="bg-green-900 border border-green-600 p-3 rounded text-center">
              <i className="fa fa-check-circle text-2xl text-green-400 mb-2"></i>
              <div className="text-sm font-semibold">{service}</div>
              <div className="text-xs text-gray-300">Active</div>
            </div>
          ))}
        </div>
      </div>

      {/* Port Forwarding */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-blue-400">Port Forwarding</h4>
          <button
            onClick={() => setShowPortForwarding(!showPortForwarding)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            <i className="fa fa-plus mr-1"></i>
            Add Rule
          </button>
        </div>

        {/* Existing Rules */}
        <div className="space-y-2 mb-4">
          {(config.portForwarding || []).map((rule, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded flex justify-between items-center">
              <div>
                <span className="font-mono text-blue-400">Port {rule.port}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="font-mono text-green-400">{rule.target}</span>
              </div>
              <button
                onClick={() => handleRemovePortForward(index)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Add New Rule */}
        {showPortForwarding && (
          <div className="bg-gray-700 p-4 rounded border border-blue-500">
            <h5 className="font-semibold mb-3 text-blue-400">Add Port Forwarding Rule</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Port:</label>
                <input
                  type="number"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="8080"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target IP:</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddPortForward}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowPortForwarding(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-sync text-xl"></i>
            <span className="text-sm">Restart</span>
          </button>
          <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-shield-alt text-xl"></i>
            <span className="text-sm">Firewall</span>
          </button>
          <button className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-download text-xl"></i>
            <span className="text-sm">Backup</span>
          </button>
          <button className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-cog text-xl"></i>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouterInterface;
