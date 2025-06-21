import React from 'react';
import { Device } from '../../types';

interface SecurityPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ devices, selectedDevice }) => {
  if (!selectedDevice) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🔒</div>
          <div>SELECT A DEVICE FOR SECURITY INFO</div>
        </div>
      </div>
    );
  }

  const securityStatus = selectedDevice.status === 'online' ? 'SECURE' : 'OFFLINE';
  const threatLevel = selectedDevice.status === 'online' ? 'LOW' : 'UNKNOWN';

  return (
    <div className="h-full bg-black p-6">
      <div className="security-section">
        <h3 className="security-title">SECURITY - {selectedDevice.name}</h3>
        
        <div className="security-grid">
          {/* Security Status */}
          <div className="security-group">
            <h4>SECURITY STATUS</h4>
            <div className="security-display">
              <div className="security-item">
                STATUS: <span className={`security-value ${securityStatus.toLowerCase()}`}>
                  {securityStatus}
                </span>
              </div>
              <div className="security-item">
                THREAT LEVEL: <span className={`security-value ${threatLevel.toLowerCase()}`}>
                  {threatLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Firewall Status */}
          <div className="security-group">
            <h4>FIREWALL</h4>
            <div className="security-display">
              <div className="security-item">
                STATUS: <span className="security-value enabled">ENABLED</span>
              </div>
              <div className="security-item">
                RULES: <span className="security-value">127</span>
              </div>
              <div className="security-item">
                BLOCKED: <span className="security-value">8</span>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="security-group">
            <h4>ACCESS CONTROL</h4>
            <div className="security-display">
              <div className="security-item">
                AUTH: <span className="security-value enabled">REQUIRED</span>
              </div>
              <div className="security-item">
                SESSIONS: <span className="security-value">2</span>
              </div>
              <div className="security-item">
                LAST LOGIN: <span className="security-value">12:34</span>
              </div>
            </div>
          </div>

          {/* Encryption */}
          <div className="security-group">
            <h4>ENCRYPTION</h4>
            <div className="security-display">
              <div className="security-item">
                PROTOCOL: <span className="security-value">AES-256</span>
              </div>
              <div className="security-item">
                KEY STRENGTH: <span className="security-value enabled">STRONG</span>
              </div>
              <div className="security-item">
                LAST ROTATE: <span className="security-value">24H AGO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;