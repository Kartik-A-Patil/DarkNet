import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import './ControlPanel.css';

type SettingsTab = 'appearance' | 'system' | 'network' | 'security' | 'about';

interface TerminalSettings {
  theme: 'dark' | 'light' | 'matrix';
  fontSize: number;
  opacity: number;
}

interface SystemSettings {
  powerSaving: boolean;
  autoSleep: boolean;
  sleepTimeout: number;
  firewallEnabled: boolean;
  trackHistory: boolean;
  anonymousMode: boolean;
  autoClearTerminal: boolean;
}

const ControlPanel: React.FC = () => {
  const { 
    desktopSettings, 
    updateDesktopSettings, 
    availableWallpapers,
    systemStatus,
    toggleWifi,
    connectToNetwork,
    disconnectFromNetwork,
    toggleBluetooth,
  } = useOS();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>({
    theme: 'dark',
    fontSize: 14,
    opacity: 95
  });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    powerSaving: false,
    autoSleep: false,
    sleepTimeout: 10,
    firewallEnabled: true,
    trackHistory: true,
    anonymousMode: false,
    autoClearTerminal: false
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [searchingNetworks, setSearchingNetworks] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTerminalSettings = localStorage.getItem('terminal-settings');
    const savedSystemSettings = localStorage.getItem('system-settings');
    
    if (savedTerminalSettings) {
      setTerminalSettings(JSON.parse(savedTerminalSettings));
    }
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('terminal-settings', JSON.stringify(terminalSettings));
  }, [terminalSettings]);

  useEffect(() => {
    localStorage.setItem('system-settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updateDesktopSettings({ theme });
    
    // Apply theme immediately to document
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    
    // Show success feedback
    showNotification('Theme changed successfully!', 'success');
  };

  const handleWallpaperChange = (wallpaper: string) => {
    updateDesktopSettings({ wallpaper });
    showNotification('Wallpaper updated!', 'success');
  };

  const handleAccentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    updateDesktopSettings({ accentColor: color });
    
    // Apply accent color to CSS variables
    document.documentElement.style.setProperty('--accent-color', color);
    showNotification('Accent color updated!', 'success');
  };

  const handleTerminalThemeChange = (theme: 'dark' | 'light' | 'matrix') => {
    setTerminalSettings(prev => ({ ...prev, theme }));
    // Apply terminal theme to all terminal instances
    localStorage.setItem('terminal-theme', theme);
    window.dispatchEvent(new CustomEvent('terminal-theme-change', { detail: theme }));
    showNotification(`Terminal theme changed to ${theme}!`, 'success');
  };

  const handleTerminalSettingChange = (key: keyof TerminalSettings, value: any) => {
    setTerminalSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`terminal-${key}`, value.toString());
    window.dispatchEvent(new CustomEvent('terminal-setting-change', { detail: { key, value } }));
  };

  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    showNotification(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleNetworkConnect = async (ssid: string) => {
    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection delay
      connectToNetwork(ssid);
      showNotification(`Connected to ${ssid}`, 'success');
    } catch (error) {
      showNotification(`Failed to connect to ${ssid}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleNetworkScan = async () => {
    setSearchingNetworks(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate scanning
      showNotification('Network scan completed', 'success');
    } finally {
      setSearchingNetworks(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col control-panel-gradient">
      <div className="flex h-full overflow-hidden">
        {/* Left sidebar with categories */}
        <div className="w-56 glass-panel border-r border-gray-700/50 shadow-lg">
          <div className="p-4">
            <div className="text-lg font-bold text-white mb-4 flex items-center">
              <i className="fa fa-cogs mr-2 text-accent"></i>
              Settings
            </div>
            
            <nav className="space-y-1">
              {[
                { id: 'appearance', icon: 'fa-palette', label: 'Appearance' },
                { id: 'system', icon: 'fa-microchip', label: 'System' },
                { id: 'network', icon: 'fa-wifi', label: 'Network' },
                { id: 'security', icon: 'fa-shield-alt', label: 'Security' },
                { id: 'about', icon: 'fa-info-circle', label: 'About' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all duration-200 button-ripple ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-md transform scale-105'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                >
                  <i className={`fa ${tab.icon} w-5 mr-3`}></i>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-6 overflow-y-auto control-panel-scroll bg-gray-900/30 backdrop-blur-sm">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <i className="fa fa-palette mr-3 text-accent"></i>
                  Appearance Settings
                </h2>
                <p className="text-gray-400">Customize the look and feel of your desktop environment</p>
              </div>
              
              {/* Theme Selection */}
              <div className="control-panel-card glass-panel rounded-xl p-6 mb-6 border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-moon mr-2 text-blue-400"></i>
                  Color Theme
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'dark', name: 'Dark Mode', bg: 'from-gray-900 to-gray-800', icon: 'fa-moon' },
                    { id: 'light', name: 'Light Mode', bg: 'from-gray-100 to-white', icon: 'fa-sun' }
                  ].map(theme => (
                    <div 
                      key={theme.id}
                      className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                        desktopSettings.theme === theme.id 
                          ? 'border-accent shadow-lg shadow-accent/20 transform scale-105' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleThemeChange(theme.id as 'dark' | 'light')}
                    >
                      <div className={`w-full h-24 bg-gradient-to-br ${theme.bg} rounded-lg mb-3 flex items-center justify-center`}>
                        <i className={`fa ${theme.icon} text-2xl ${theme.id === 'dark' ? 'text-blue-400' : 'text-yellow-500'}`}></i>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-white">{theme.name}</div>
                        {desktopSettings.theme === theme.id && (
                          <div className="text-xs text-accent mt-1 flex items-center justify-center">
                            <i className="fa fa-check mr-1"></i>
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Accent Color */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-palette mr-2 text-purple-400"></i>
                  Accent Color
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={desktopSettings.accentColor} 
                      onChange={handleAccentColorChange}
                      className="w-16 h-16 rounded-lg border border-gray-600 cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">Current Color</div>
                    <div className="text-gray-400 font-mono">{desktopSettings.accentColor}</div>
                  </div>
                  <div className="flex space-x-2">
                    {['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899'].map(color => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateDesktopSettings({ accentColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Wallpaper Selection */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-image mr-2 text-green-400"></i>
                  Desktop Wallpaper
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {availableWallpapers.map(wallpaper => (
                    <div 
                      key={wallpaper.id}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                        desktopSettings.wallpaper === wallpaper.path 
                          ? 'border-accent shadow-lg shadow-accent/20 transform scale-105' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleWallpaperChange(wallpaper.path)}
                    >
                      <div className="aspect-video bg-gray-700 flex items-center justify-center">
                        <img 
                          src={wallpaper.thumbnail} 
                          alt={wallpaper.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100%" height="100%" fill="%23374151"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="12">Preview</text></svg>';
                          }}
                        />
                      </div>
                      <div className="p-2 text-center">
                        <div className="text-sm font-medium text-white">{wallpaper.name}</div>
                        {desktopSettings.wallpaper === wallpaper.path && (
                          <div className="text-xs text-accent mt-1 flex items-center justify-center">
                            <i className="fa fa-check mr-1"></i>
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Customization */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-terminal mr-2 text-cyan-400"></i>
                  Terminal Appearance
                </h3>
                
                {/* Terminal Theme */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Terminal Theme</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', name: 'Dark', bg: 'bg-gray-900', text: 'text-green-400' },
                      { id: 'light', name: 'Light', bg: 'bg-gray-100', text: 'text-gray-800' },
                      { id: 'matrix', name: 'Matrix', bg: 'bg-black', text: 'text-green-500' }
                    ].map(theme => (
                      <div 
                        key={theme.id}
                        className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 ${
                          terminalSettings.theme === theme.id 
                            ? 'border-accent bg-accent/10' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleTerminalThemeChange(theme.id as any)}
                      >
                        <div className={`w-full h-16 rounded ${theme.bg} flex items-center p-2 mb-2`}>
                          <div className={`text-xs font-mono ${theme.text}`}>
                            user@darknet:~$ ls<br/>
                            <span className="opacity-60">Desktop/ Documents/</span>
                          </div>
                        </div>
                        <div className="text-center text-white font-medium">{theme.name}</div>
                        {terminalSettings.theme === theme.id && (
                          <div className="text-xs text-accent mt-1 text-center">
                            <i className="fa fa-check mr-1"></i>
                            Active
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terminal Font Size */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Font Size: {terminalSettings.fontSize}px</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">10px</span>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={terminalSettings.fontSize}
                      onChange={(e) => handleTerminalSettingChange('fontSize', parseInt(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-gray-400 text-sm">20px</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div 
                      className="inline-block bg-gray-900 px-3 py-2 rounded font-mono text-green-400"
                      style={{ fontSize: `${terminalSettings.fontSize}px` }}
                    >
                      Sample terminal text
                    </div>
                  </div>
                </div>

                {/* Terminal Opacity */}
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Background Opacity: {terminalSettings.opacity}%</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">50%</span>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={terminalSettings.opacity}
                      onChange={(e) => handleTerminalSettingChange('opacity', parseInt(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-gray-400 text-sm">100%</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div 
                      className="inline-block bg-gray-900 px-3 py-2 rounded font-mono text-green-400"
                      style={{ opacity: terminalSettings.opacity / 100 }}
                    >
                      Terminal background preview
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <i className="fa fa-microchip mr-3 text-accent"></i>
                  System Settings
                </h2>
                <p className="text-gray-400">Manage system configuration and performance settings</p>
              </div>
              
              {/* User Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-user mr-2 text-blue-400"></i>
                  User Profile
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {systemStatus.userInfo.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">{systemStatus.userInfo.fullName}</div>
                    <div className="text-gray-400 mb-1">@{systemStatus.userInfo.username}</div>
                    <div className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                      <i className="fa fa-crown mr-1"></i>
                      {systemStatus.userInfo.role}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-white transition-colors">
                      <i className="fa fa-edit mr-2"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
              
              {/* System Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Battery Status */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className={`fa fa-battery-${systemStatus.batteryLevel > 75 ? 'full' : systemStatus.batteryLevel > 50 ? 'three-quarters' : systemStatus.batteryLevel > 25 ? 'half' : 'quarter'} mr-2 ${systemStatus.batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}`}></i>
                    Battery Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level</span>
                      <span className="text-white font-semibold">{systemStatus.batteryLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${systemStatus.batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${systemStatus.batteryLevel}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {systemStatus.batteryCharging ? (
                          <><i className="fa fa-plug text-green-400 mr-1"></i>Charging</>
                        ) : (
                          <><i className="fa fa-battery-empty mr-1"></i>On Battery</>
                        )}
                      </span>
                      <span className="text-gray-400">~3h 45m remaining</span>
                    </div>
                  </div>
                </div>

                {/* System Performance */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fa fa-tachometer-alt mr-2 text-cyan-400"></i>
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU Usage</span>
                      <span className="text-white">24%</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full">
                      <div className="w-1/4 h-full bg-blue-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">RAM Usage</span>
                      <span className="text-white">8.2GB / 16GB</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full">
                      <div className="w-1/2 h-full bg-green-500 rounded-full"></div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Disk Usage</span>
                      <span className="text-white">95.5GB / 120GB</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full">
                      <div className="w-4/5 h-full bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-info-circle mr-2 text-yellow-400"></i>
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Operating System</span>
                      <span className="text-white">HackOS 1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kernel Version</span>
                      <span className="text-white">Linux 5.10.0-kali</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Architecture</span>
                      <span className="text-white">x86_64</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Desktop Environment</span>
                      <span className="text-white">DarkNet Shell</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">System Uptime</span>
                      <span className="text-white">2h 13m 45s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Boot Time</span>
                      <span className="text-white">12.3 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shell Version</span>
                      <span className="text-white">Zsh 5.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Login</span>
                      <span className="text-white">Today, 09:15 AM</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Power Management */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-power-off mr-2 text-red-400"></i>
                  Power Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Power Saving Mode</div>
                        <div className="text-gray-400 text-sm">Reduce performance to save battery</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={systemSettings.powerSaving}
                          onChange={(e) => handleSystemSettingChange('powerSaving', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Auto Sleep</div>
                        <div className="text-gray-400 text-sm">Sleep after period of inactivity</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={systemSettings.autoSleep}
                          onChange={(e) => handleSystemSettingChange('autoSleep', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Sleep Timeout</label>
                      <select 
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                        value={systemSettings.sleepTimeout}
                        onChange={(e) => handleSystemSettingChange('sleepTimeout', parseInt(e.target.value))}
                        disabled={!systemSettings.autoSleep}
                      >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Actions */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-tools mr-2 text-orange-400"></i>
                  System Maintenance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    className="flex flex-col items-center p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 text-blue-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Checking for updates...', 'info')}
                  >
                    <i className="fa fa-sync-alt text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Update System</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-500/30 text-green-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Starting system cleanup...', 'info')}
                  >
                    <i className="fa fa-broom text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Clean System</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 text-purple-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Opening system monitor...', 'info')}
                  >
                    <i className="fa fa-chart-line text-2xl mb-2"></i>
                    <span className="text-sm font-medium">System Monitor</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-500/30 text-red-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Opening advanced settings...', 'info')}
                  >
                    <i className="fa fa-cog text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Advanced</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <i className="fa fa-wifi mr-3 text-accent"></i>
                  Network Settings
                </h2>
                <p className="text-gray-400">Configure network connections and security settings</p>
              </div>

              {/* Network Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${systemStatus.wifiEnabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      <i className="fa fa-wifi text-xl"></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-semibold">WiFi</div>
                      <div className="text-sm text-gray-400">
                        {systemStatus.wifiEnabled ? (systemStatus.wifiConnected ? 'Connected' : 'Enabled') : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${systemStatus.bluetoothEnabled ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      <i className="fa fa-bluetooth text-xl"></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-semibold">Bluetooth</div>
                      <div className="text-sm text-gray-400">
                        {systemStatus.bluetoothEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${systemSettings.firewallEnabled ? 'bg-red-600/20 text-red-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      <i className="fa fa-shield-alt text-xl"></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-semibold">Firewall</div>
                      <div className="text-sm text-gray-400">
                        {systemSettings.firewallEnabled ? 'Protected' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* WiFi Settings */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fa fa-wifi mr-2 text-green-400"></i>
                    WiFi Configuration
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemStatus.wifiEnabled}
                      onChange={toggleWifi}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                
                {systemStatus.wifiEnabled && (
                  <>
                    {/* Current Connection */}
                    {systemStatus.wifiConnected && systemStatus.connectedNetwork && (
                      <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <i className="fa fa-wifi text-green-400 mr-2"></i>
                            <span className="text-white font-semibold">{systemStatus.connectedNetwork}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 text-sm">Connected</span>
                            <button 
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                              onClick={disconnectFromNetwork}
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">IP Address:</span>
                            <span className="text-white ml-2">192.168.1.105</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Gateway:</span>
                            <span className="text-white ml-2">192.168.1.1</span>
                          </div>
                          <div>
                            <span className="text-gray-400">DNS:</span>
                            <span className="text-white ml-2">8.8.8.8</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Signal:</span>
                            <span className="text-white ml-2">85%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Available Networks */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Available Networks</h4>
                      <button 
                        className={`px-4 py-2 rounded-lg transition-all ${
                          searchingNetworks 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-accent hover:bg-accent/80 text-white'
                        }`}
                        onClick={handleNetworkScan}
                        disabled={searchingNetworks}
                      >
                        {searchingNetworks ? (
                          <>
                            <i className="fa fa-spinner fa-spin mr-2"></i>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-search mr-2"></i>
                            Scan Networks
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {systemStatus.availableNetworks.map((network) => (
                        <div 
                          key={network.ssid}
                          className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              network.signalStrength > 70 ? 'bg-green-600/20 text-green-400' :
                              network.signalStrength > 40 ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-red-600/20 text-red-400'
                            }`}>
                              <i className="fa fa-wifi text-sm"></i>
                            </div>
                            <div>
                              <div className="text-white font-medium">{network.ssid}</div>
                              <div className="text-sm text-gray-400 flex items-center space-x-2">
                                <span>{network.secured ? 'Secured' : 'Open'}</span>
                                <span>•</span>
                                <span>Signal: {network.signalStrength}%</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              isConnecting
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-accent hover:bg-accent/80 text-white'
                            }`}
                            onClick={() => handleNetworkConnect(network.ssid)}
                            disabled={isConnecting || systemStatus.connectedNetwork === network.ssid}
                          >
                            {systemStatus.connectedNetwork === network.ssid ? 'Connected' : 
                             isConnecting ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Bluetooth Settings */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fa fa-bluetooth mr-2 text-blue-400"></i>
                    Bluetooth Configuration
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemStatus.bluetoothEnabled}
                      onChange={toggleBluetooth}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                
                {systemStatus.bluetoothEnabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Device Discovery</span>
                      <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors">
                        <i className="fa fa-search mr-2"></i>
                        Scan for Devices
                      </button>
                    </div>
                    <div className="text-center text-gray-400 py-8">
                      <i className="fa fa-bluetooth text-4xl mb-2"></i>
                      <div>No Bluetooth devices found</div>
                      <div className="text-sm">Make sure nearby devices are discoverable</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Firewall Settings */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fa fa-shield-alt mr-2 text-red-400"></i>
                    Firewall Protection
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemSettings.firewallEnabled}
                      onChange={(e) => handleSystemSettingChange('firewallEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                
                {systemSettings.firewallEnabled && (
                  <div className="space-y-4">
                    <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fa fa-shield-alt text-green-400 mr-2"></i>
                        <span className="text-green-400 font-medium">Firewall Active</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Your system is protected from unauthorized network access
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="text-white font-medium mb-1">Blocked Connections</div>
                        <div className="text-2xl font-bold text-red-400">127</div>
                        <div className="text-xs text-gray-400">Last 24 hours</div>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="text-white font-medium mb-1">Allowed Connections</div>
                        <div className="text-2xl font-bold text-green-400">1,423</div>
                        <div className="text-xs text-gray-400">Last 24 hours</div>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      onClick={() => showNotification('Opening advanced firewall settings...', 'info')}
                    >
                      <i className="fa fa-cog mr-2"></i>
                      Advanced Firewall Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <i className="fa fa-shield-alt mr-3 text-accent"></i>
                  Security Settings
                </h2>
                <p className="text-gray-400">Manage your system security and privacy settings</p>
              </div>

              {/* Security Status */}
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                      <i className="fa fa-shield-check text-2xl text-green-400"></i>
                    </div>
                    <div className="ml-4">
                      <div className="text-xl font-bold text-white">System Secure</div>
                      <div className="text-green-400">All security features are active</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">98%</div>
                    <div className="text-sm text-gray-400">Security Score</div>
                  </div>
                </div>
              </div>
              
              {/* Account Security */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-user-shield mr-2 text-blue-400"></i>
                  Account Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <i className="fa fa-key text-yellow-400 mr-3"></i>
                      <div>
                        <div className="text-white font-medium">Password Protection</div>
                        <div className="text-gray-400 text-sm">Last changed 2 weeks ago</div>
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-white transition-colors"
                      onClick={() => showNotification('Password change dialog opened', 'info')}
                    >
                      Change Password
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <i className="fa fa-mobile-alt text-green-400 mr-3"></i>
                      <div>
                        <div className="text-white font-medium">Two-Factor Authentication</div>
                        <div className="text-gray-400 text-sm">Enhanced security for your account</div>
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors"
                      onClick={() => showNotification('2FA setup initiated', 'info')}
                    >
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <i className="fa fa-history text-purple-400 mr-3"></i>
                      <div>
                        <div className="text-white font-medium">Login History</div>
                        <div className="text-gray-400 text-sm">View recent login attempts</div>
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors"
                      onClick={() => showNotification('Login history displayed', 'info')}
                    >
                      View History
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-user-secret mr-2 text-purple-400"></i>
                  Privacy Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Store Command History</div>
                      <div className="text-gray-400 text-sm">Keep track of terminal commands for convenience</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={systemSettings.trackHistory}
                        onChange={(e) => handleSystemSettingChange('trackHistory', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Anonymous Mode</div>
                      <div className="text-gray-400 text-sm">Hide your identity and activity from logging</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={systemSettings.anonymousMode}
                        onChange={(e) => handleSystemSettingChange('anonymousMode', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Auto-clear Terminal</div>
                      <div className="text-gray-400 text-sm">Automatically clear terminal after each session</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={systemSettings.autoClearTerminal}
                        onChange={(e) => handleSystemSettingChange('autoClearTerminal', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Security Tools */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-tools mr-2 text-orange-400"></i>
                  Security Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    className="flex items-center p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-500/30 text-red-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Starting security scan...', 'info')}
                  >
                    <i className="fa fa-shield-alt text-2xl mr-4"></i>
                    <div className="text-left">
                      <div className="font-medium">Security Scanner</div>
                      <div className="text-sm opacity-80">Scan for vulnerabilities</div>
                    </div>
                  </button>
                  
                  <button 
                    className="flex items-center p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 text-purple-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Opening privacy inspector...', 'info')}
                  >
                    <i className="fa fa-user-secret text-2xl mr-4"></i>
                    <div className="text-left">
                      <div className="font-medium">Privacy Inspector</div>
                      <div className="text-sm opacity-80">Check privacy settings</div>
                    </div>
                  </button>
                  
                  <button 
                    className="flex items-center p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 text-blue-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Starting integrity check...', 'info')}
                  >
                    <i className="fa fa-file-shield text-2xl mr-4"></i>
                    <div className="text-left">
                      <div className="font-medium">Integrity Checker</div>
                      <div className="text-sm opacity-80">Verify system files</div>
                    </div>
                  </button>
                  
                  <button 
                    className="flex items-center p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-500/30 text-green-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Starting malware scan...', 'info')}
                  >
                    <i className="fa fa-bug text-2xl mr-4"></i>
                    <div className="text-left">
                      <div className="font-medium">Malware Scanner</div>
                      <div className="text-sm opacity-80">Detect threats</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <i className="fa fa-info-circle mr-3 text-accent"></i>
                  About HackOS
                </h2>
                <p className="text-gray-400">System information and details about this platform</p>
              </div>

              {/* Main About Section */}
              <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-900/60 backdrop-blur-sm rounded-xl p-8 mb-6 border border-gray-700/50 text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center">
                    <i className="fa fa-terminal text-4xl text-white"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">HackOS</h3>
                  <div className="text-accent font-medium text-lg mb-2">Version 1.0.0</div>
                  <div className="text-gray-400">Ethical Hacking Simulation Platform</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    HackOS is a comprehensive educational platform designed to teach ethical hacking and cybersecurity concepts 
                    in a safe, controlled environment. It provides a realistic Linux desktop experience with various security 
                    tools and scenarios for learning purposes.
                  </p>
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                    <div className="flex items-start">
                      <i className="fa fa-exclamation-triangle text-yellow-400 mr-2 mt-1"></i>
                      <div>
                        <div className="text-yellow-300 font-medium mb-1">Educational Use Only</div>
                        <div className="text-yellow-200/80 text-sm">
                          This software is intended solely for educational purposes and ethical hacking practice. 
                          Misuse of the knowledge gained here for illegal activities is strictly prohibited.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fa fa-microchip mr-2 text-blue-400"></i>
                    System Specifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Operating System</span>
                      <span className="text-white">HackOS 1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kernel Version</span>
                      <span className="text-white">Linux 5.10.0-kali</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Architecture</span>
                      <span className="text-white">x86_64</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Desktop Environment</span>
                      <span className="text-white">DarkNet Shell</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shell Version</span>
                      <span className="text-white">Zsh 5.8</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fa fa-code mr-2 text-green-400"></i>
                    Development Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Build Date</span>
                      <span className="text-white">June 22, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Framework</span>
                      <span className="text-white">React 18.2.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TypeScript</span>
                      <span className="text-white">5.0+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Build Tool</span>
                      <span className="text-white">Vite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">License</span>
                      <span className="text-white">MIT License</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-star mr-2 text-yellow-400"></i>
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <i className="fa fa-terminal text-cyan-400 mr-3"></i>
                    <div>
                      <div className="text-white font-medium">Interactive Terminal</div>
                      <div className="text-gray-400 text-sm">Full Linux command support</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <i className="fa fa-network-wired text-green-400 mr-3"></i>
                    <div>
                      <div className="text-white font-medium">Network Tools</div>
                      <div className="text-gray-400 text-sm">Simulated network environment</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <i className="fa fa-shield-alt text-red-400 mr-3"></i>
                    <div>
                      <div className="text-white font-medium">Security Tools</div>
                      <div className="text-gray-400 text-sm">Ethical hacking utilities</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <i className="fa fa-file-code text-purple-400 mr-3"></i>
                    <div>
                      <div className="text-white font-medium">Code Editor</div>
                      <div className="text-gray-400 text-sm">Built-in text editor</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa fa-external-link-alt mr-2 text-blue-400"></i>
                  Resources & Support
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    className="flex items-center justify-center p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 text-blue-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Opening documentation...', 'info')}
                  >
                    <i className="fa fa-book text-xl mr-2"></i>
                    <span className="font-medium">Documentation</span>
                  </button>
                  
                  <button 
                    className="flex items-center justify-center p-4 bg-gray-600/20 hover:bg-gray-600/30 rounded-lg border border-gray-500/30 text-gray-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Opening source code repository...', 'info')}
                  >
                    <i className="fa fa-code text-xl mr-2"></i>
                    <span className="font-medium">Source Code</span>
                  </button>
                  
                  <button 
                    className="flex items-center justify-center p-4 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg border border-orange-500/30 text-orange-300 transition-all duration-300 hover:scale-105"
                    onClick={() => showNotification('Bug report form opened', 'info')}
                  >
                    <i className="fa fa-bug text-xl mr-2"></i>
                    <span className="font-medium">Report Bug</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;