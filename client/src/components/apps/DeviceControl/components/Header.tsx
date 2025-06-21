import React from 'react';

interface HeaderProps {
  activeTab: 'overview' | 'control' | 'monitoring' | 'security' | 'topology';
  onTabChange: (tab: 'overview' | 'control' | 'monitoring' | 'security' | 'topology') => void;
  deviceCount: number;
  onlineCount: number;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  deviceCount,
  onlineCount
}) => {
  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'control', label: 'CONTROL' },
    { id: 'monitoring', label: 'MONITORING' },
    { id: 'security', label: 'SECURITY' },
    { id: 'topology', label: 'TOPOLOGY' }
  ] as const;

  return (
    <div className="header">
      <div className="header-title">
        <h1>Network Device Controller</h1>
        <div className="header-status">
          <span className="status-item">
            <span className="status-value">{deviceCount}</span> Devices
          </span>
          <span className="status-item">
            <span className="status-value online">{onlineCount}</span> Online
          </span>
          <span className="status-item">
            <span className="status-value">{deviceCount - onlineCount}</span> Offline
          </span>
        </div>
      </div>
      
      <div className="header-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;