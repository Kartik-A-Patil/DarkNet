import React, { useState } from 'react';
import { Device } from '../../types';

interface NASInterfaceProps {
  device: Device;
  onUpdateDevice: (deviceId: string, settings: any) => void;
  onOpenFileManager: () => void;
}

const NASInterface: React.FC<NASInterfaceProps> = ({ 
  device, 
  onUpdateDevice,
  onOpenFileManager 
}) => {
  const [expandStorage, setExpandStorage] = useState(false);
  const [newStorageSize, setNewStorageSize] = useState(1000);
  
  const config = device.config || {};
  const storagePercent = config.totalStorage ? (config.usedStorage || 0) / config.totalStorage * 100 : 0;
  
  const handleExpandStorage = () => {
    const cost = newStorageSize * (config.storagePrice || 0.15);
    if (confirm(`Add ${newStorageSize}GB storage for $${cost.toFixed(2)}?`)) {
      onUpdateDevice(device.id, {
        config: {
          ...config,
          totalStorage: (config.totalStorage || 0) + newStorageSize,
          availableStorage: (config.availableStorage || 0) + newStorageSize
        }
      });
      setExpandStorage(false);
    }
  };

  const handleToggleService = (service: string) => {
    const currentServices = device.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    onUpdateDevice(device.id, { services: newServices });
  };

  return (
    <div className="nas-interface p-6 bg-gray-900 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-green-400">NAS STORAGE MANAGEMENT</h3>
        <button
          onClick={onOpenFileManager}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
        >
          <i className="fa fa-folder"></i>
          Access Files
        </button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Storage Overview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Storage:</span>
              <span className="text-green-400">{(config.totalStorage || 0).toLocaleString()}GB</span>
            </div>
            <div className="flex justify-between">
              <span>Used:</span>
              <span className="text-yellow-400">{(config.usedStorage || 0).toLocaleString()}GB</span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="text-green-400">{(config.availableStorage || 0).toLocaleString()}GB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-400">
              {storagePercent.toFixed(1)}% Used
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Quick Actions</h4>
          <div className="space-y-3">
            <button
              onClick={() => setExpandStorage(!expandStorage)}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2"
            >
              <i className="fa fa-plus"></i>
              Expand Storage
            </button>
            <button
              onClick={onOpenFileManager}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
            >
              <i className="fa fa-network-wired"></i>
              Browse Network
            </button>
            <button
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center justify-center gap-2"
            >
              <i className="fa fa-download"></i>
              Schedule Backup
            </button>
          </div>
        </div>
      </div>

      {/* Expand Storage Modal */}
      {expandStorage && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-green-500">
          <h4 className="text-lg font-semibold mb-3 text-green-400">Expand Storage</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Storage (GB):</label>
              <input
                type="number"
                value={newStorageSize}
                onChange={(e) => setNewStorageSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:border-green-500 focus:outline-none"
                min="100"
                max="10000"
                step="100"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Cost per GB:</span>
              <span className="text-green-400">${(config.storagePrice || 0.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Cost:</span>
              <span className="text-green-400">${(newStorageSize * (config.storagePrice || 0.15)).toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExpandStorage}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Purchase
              </button>
              <button
                onClick={() => setExpandStorage(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Folders */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Shared Folders</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(config.sharedFolders || []).map((folder, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded text-center hover:bg-gray-600 cursor-pointer">
              <i className="fa fa-folder text-2xl text-blue-400 mb-2"></i>
              <div className="text-sm">{folder}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Management */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Network Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['SMB', 'FTP', 'NFS', 'SSH', 'SFTP', 'WebDAV'].map((service) => (
            <button
              key={service}
              onClick={() => handleToggleService(service)}
              className={`px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                (device.services || []).includes(service)
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <i className={`fa ${(device.services || []).includes(service) ? 'fa-check' : 'fa-times'}`}></i>
              {service}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NASInterface;
