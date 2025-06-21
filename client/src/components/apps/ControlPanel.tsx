import React, { useState } from 'react';
import { useOS } from '../../contexts/OSContext';

type SettingsTab = 'appearance' | 'system' | 'network' | 'security' | 'about';

interface TerminalSettings {
  theme: 'dark' | 'light' | 'matrix';
  fontSize: number;
  opacity: number;
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

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updateDesktopSettings({ theme });
    
    // Apply theme immediately to document
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleWallpaperChange = (wallpaper: string) => {
    updateDesktopSettings({ wallpaper });
  };

  const handleAccentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    updateDesktopSettings({ accentColor: color });
  };

  const handleTerminalThemeChange = (theme: 'dark' | 'light' | 'matrix') => {
    setTerminalSettings(prev => ({ ...prev, theme }));
    // Apply terminal theme to all terminal instances
    localStorage.setItem('terminal-theme', theme);
    window.dispatchEvent(new CustomEvent('terminal-theme-change', { detail: theme }));
  };

  return (
    <div className="h-full flex flex-col bg-window">
      <div className="flex h-full overflow-hidden">
        {/* Left sidebar with categories */}
        <div className="w-48 bg-gray-900 p-2 overflow-y-auto">
          <div className="text-sm font-bold my-2 text-gray-400 pl-2">SETTINGS</div>
          
          <div 
            className={`control-panel-tab flex items-center p-2 rounded mb-1 cursor-pointer ${activeTab === 'appearance' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('appearance')}
          >
            <i className="fa fa-paint-brush w-6"></i>
            <span>Appearance</span>
          </div>
          
          <div 
            className={`control-panel-tab flex items-center p-2 rounded mb-1 cursor-pointer ${activeTab === 'system' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('system')}
          >
            <i className="fa fa-cog w-6"></i>
            <span>System</span>
          </div>
          
          <div 
            className={`control-panel-tab flex items-center p-2 rounded mb-1 cursor-pointer ${activeTab === 'network' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('network')}
          >
            <i className="fa fa-network-wired w-6"></i>
            <span>Network</span>
          </div>
          
          <div 
            className={`control-panel-tab flex items-center p-2 rounded mb-1 cursor-pointer ${activeTab === 'security' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fa fa-shield-alt w-6"></i>
            <span>Security</span>
          </div>
          
          <div 
            className={`control-panel-tab flex items-center p-2 rounded mb-1 cursor-pointer ${activeTab === 'about' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('about')}
          >
            <i className="fa fa-info-circle w-6"></i>
            <span>About</span>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
              
              {/* Theme Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Theme</h3>
                <div className="flex space-x-4">
                  <div 
                    className={`theme-option cursor-pointer p-3 rounded border ${desktopSettings.theme === 'dark' ? 'border-accent' : 'border-gray-700'}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="w-24 h-16 bg-gray-900 rounded mb-2"></div>
                    <div className="text-center">Dark</div>
                  </div>
                  
                  <div 
                    className={`theme-option cursor-pointer p-3 rounded border ${desktopSettings.theme === 'light' ? 'border-accent' : 'border-gray-700'}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="w-24 h-16 bg-gray-200 rounded mb-2"></div>
                    <div className="text-center">Light</div>
                  </div>
                </div>
              </div>
              
              {/* Accent Color */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Accent Color</h3>
                <div className="flex items-center">
                  <input 
                    type="color" 
                    value={desktopSettings.accentColor} 
                    onChange={handleAccentColorChange}
                    className="w-12 h-8 mr-3 rounded border border-gray-700 cursor-pointer"
                  />
                  <span>{desktopSettings.accentColor}</span>
                </div>
              </div>
              
              {/* Wallpaper Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Wallpaper</h3>
                <div className="grid grid-cols-3 gap-3">
                  {availableWallpapers.map(wallpaper => (
                    <div 
                      key={wallpaper.id}
                      className={`wallpaper-option cursor-pointer ${desktopSettings.wallpaper === wallpaper.path ? 'border-accent' : 'border-gray-700'}`}
                      onClick={() => handleWallpaperChange(wallpaper.path)}
                    >
                      <div className="wallpaper-thumbnail border-2 rounded overflow-hidden">
                        <img 
                          src={wallpaper.thumbnail} 
                          alt={wallpaper.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm mt-1 text-center">{wallpaper.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Customization */}
              <div>
                <h3 className="text-lg font-medium mb-2">Terminal Settings</h3>
                
                {/* Terminal Theme */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Terminal Theme</h4>
                  <div className="flex space-x-3">
                    {(['dark', 'light', 'matrix'] as const).map(theme => (
                      <div 
                        key={theme}
                        className={`cursor-pointer p-2 rounded border text-sm ${terminalSettings.theme === theme ? 'border-accent bg-accent bg-opacity-20' : 'border-gray-700'}`}
                        onClick={() => handleTerminalThemeChange(theme)}
                      >
                        <div className={`w-20 h-12 rounded mb-1 ${
                          theme === 'dark' ? 'bg-gray-900' :
                          theme === 'light' ? 'bg-gray-100' :
                          'bg-black'
                        }`}>
                          <div className={`text-xs p-1 font-mono ${
                            theme === 'dark' ? 'text-green-400' :
                            theme === 'light' ? 'text-gray-800' :
                            'text-green-500'
                          }`}>
                            $&gt; ls
                          </div>
                        </div>
                        <div className="text-center capitalize">{theme}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terminal Font Size */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Font Size: {terminalSettings.fontSize}px</h4>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    value={terminalSettings.fontSize}
                    onChange={(e) => setTerminalSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full accent-accent"
                  />
                </div>

                {/* Terminal Opacity */}
                <div>
                  <h4 className="text-md font-medium mb-2">Opacity: {terminalSettings.opacity}%</h4>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={terminalSettings.opacity}
                    onChange={(e) => setTerminalSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* System Tab */}
          {activeTab === 'system' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">System Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">User Information</h3>
                <div className="bg-gray-800 p-4 rounded flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
                    {systemStatus.userInfo.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-medium">{systemStatus.userInfo.fullName}</div>
                    <div className="text-sm text-gray-400">@{systemStatus.userInfo.username}</div>
                    <div className="text-sm text-gray-400 mt-1">{systemStatus.userInfo.role}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Battery Status</h3>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="flex items-center mb-3">
                    <i className={`fa ${systemStatus.batteryCharging ? 'fa-battery-bolt' : systemStatus.batteryLevel > 75 ? 'fa-battery-full' : systemStatus.batteryLevel > 50 ? 'fa-battery-three-quarters' : systemStatus.batteryLevel > 25 ? 'fa-battery-half' : 'fa-battery-quarter'} ${systemStatus.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} mr-2`}></i>
                    <div className="flex-1 bg-gray-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${systemStatus.batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${systemStatus.batteryLevel}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{systemStatus.batteryLevel}%</span>
                    {systemStatus.batteryCharging && (
                      <i className="fa fa-plug text-green-500 ml-2"></i>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {systemStatus.batteryCharging ? 'Charging - ' : ''}
                    Approximately 3 hours 45 minutes remaining
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">System Information</h3>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">OS Version:</div>
                    <div>HackOS 1.0</div>
                    <div className="text-gray-400">Kernel:</div>
                    <div>Linux 5.10.0-kali-simulated</div>
                    <div className="text-gray-400">Memory:</div>
                    <div>16 GB (8.2 GB available)</div>
                    <div className="text-gray-400">Disk Space:</div>
                    <div>120 GB (24.5 GB free)</div>
                    <div className="text-gray-400">System Uptime:</div>
                    <div>2 hours 13 minutes</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Power Management</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="power-save" className="mr-2" />
                    <label htmlFor="power-save">Enable power saving mode</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="auto-sleep" className="mr-2" />
                    <label htmlFor="auto-sleep">Sleep after inactivity</label>
                  </div>
                  <div className="ml-6 flex items-center">
                    <select className="bg-gray-800 border border-gray-700 rounded p-1 text-sm">
                      <option>5 minutes</option>
                      <option>10 minutes</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">System Maintenance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-accent hover:bg-opacity-90 rounded text-white flex items-center justify-center">
                    <i className="fa fa-sync-alt mr-2"></i>
                    <span>Check for Updates</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center">
                    <i className="fa fa-broom mr-2"></i>
                    <span>System Cleanup</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center">
                    <i className="fa fa-chart-line mr-2"></i>
                    <span>System Monitor</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center">
                    <i className="fa fa-tools mr-2"></i>
                    <span>Advanced Options</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Network Tab */}
          {activeTab === 'network' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Network Settings</h2>
              
              {/* WiFi Toggle */}
              <div className="flex items-center mb-4">
                <div className="mr-3 font-medium">WiFi:</div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="toggle-wifi" 
                    className="sr-only" 
                    checked={systemStatus.wifiEnabled}
                    onChange={toggleWifi}
                  />
                  <div className="w-12 h-6 bg-gray-600 rounded-full shadow-inner"></div>
                  <div className={`dot absolute w-6 h-6 rounded-full -top-0 transition-all duration-300 ${systemStatus.wifiEnabled ? 'bg-accent right-0' : 'bg-gray-400 left-0'}`}></div>
                </div>
                <label htmlFor="toggle-wifi" className={systemStatus.wifiEnabled ? "text-green-500" : "text-gray-500"}>
                  {systemStatus.wifiEnabled ? "Enabled" : "Disabled"}
                </label>
              </div>
              
              {systemStatus.wifiEnabled && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Connection Status</h3>
                    <div className="bg-gray-800 p-3 rounded mb-3">
                      <div className="flex items-center mb-2">
                        <i className={`fa fa-wifi ${systemStatus.wifiConnected ? 'text-green-500' : 'text-gray-500'} mr-2`}></i>
                        <span className="font-medium">{systemStatus.wifiConnected ? "Connected" : "Disconnected"}</span>
                      </div>
                      {systemStatus.wifiConnected && systemStatus.connectedNetwork && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-400">Network Name:</div>
                          <div>{systemStatus.connectedNetwork}</div>
                          <div className="text-gray-400">IP Address:</div>
                          <div>192.168.1.105</div>
                          <div className="text-gray-400">Gateway:</div>
                          <div>192.168.1.1</div>
                          <div className="text-gray-400">DNS:</div>
                          <div>8.8.8.8, 8.8.4.4</div>
                        </div>
                      )}
                    </div>
                    
                    {systemStatus.wifiConnected ? (
                      <button 
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                        onClick={disconnectFromNetwork}
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-accent hover:bg-opacity-90 rounded text-white">
                        Scan Networks
                      </button>
                    )}
                  </div>
                
                  {!systemStatus.wifiConnected && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Available Networks</h3>
                      <div className="space-y-2">
                        {systemStatus.availableNetworks.map(network => (
                          <div 
                            key={network.ssid}
                            className="bg-gray-800 p-2 rounded flex items-center justify-between cursor-pointer hover:bg-gray-700"
                            onClick={() => connectToNetwork(network.ssid)}
                          >
                            <div className="flex items-center">
                              <div className="mr-3">
                                {network.signalStrength > 70 ? (
                                  <i className="fa fa-wifi text-green-500"></i>
                                ) : network.signalStrength > 40 ? (
                                  <i className="fa fa-wifi text-yellow-500"></i>
                                ) : (
                                  <i className="fa fa-wifi text-red-500"></i>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{network.ssid}</div>
                                <div className="text-xs text-gray-400">
                                  {network.secured ? "Secured" : "Open"} | Signal: {network.signalStrength}%
                                </div>
                              </div>
                            </div>
                            <button className="px-2 py-1 bg-accent rounded text-sm text-white">
                              Connect
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Bluetooth Settings */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="mr-3 font-medium">Bluetooth:</div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="toggle-bluetooth" 
                      className="sr-only" 
                      checked={systemStatus.bluetoothEnabled}
                      onChange={toggleBluetooth}
                    />
                    <div className="w-12 h-6 bg-gray-600 rounded-full shadow-inner"></div>
                    <div className={`dot absolute w-6 h-6 rounded-full -top-0 transition-all duration-300 ${systemStatus.bluetoothEnabled ? 'bg-accent right-0' : 'bg-gray-400 left-0'}`}></div>
                  </div>
                  <label htmlFor="toggle-bluetooth" className={systemStatus.bluetoothEnabled ? "text-green-500" : "text-gray-500"}>
                    {systemStatus.bluetoothEnabled ? "Enabled" : "Disabled"}
                  </label>
                </div>
                
                {systemStatus.bluetoothEnabled && (
                  <button className="px-3 py-1 mt-2 bg-accent hover:bg-opacity-90 rounded text-white">
                    Scan for Devices
                  </button>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Firewall Settings</h3>
                <div className="flex items-center mb-3">
                  <div className="mr-3">Firewall Status:</div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input type="checkbox" id="toggle-firewall" className="sr-only" defaultChecked />
                    <div className="w-12 h-6 bg-gray-600 rounded-full shadow-inner"></div>
                    <div className="dot absolute w-6 h-6 bg-accent rounded-full -top-0 right-0 transition"></div>
                  </div>
                  <label htmlFor="toggle-firewall" className="text-green-500">Active</label>
                </div>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                  Advanced Firewall Settings
                </button>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Account Security</h3>
                <div className="bg-gray-800 p-3 rounded mb-3">
                  <div className="text-sm mb-3">
                    <p className="mb-2">Your account is protected with a password. Regular password changes are recommended for optimal security.</p>
                  </div>
                  <button className="px-3 py-1 bg-accent hover:bg-opacity-90 rounded text-white">
                    Change Password
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="track-history" className="mr-2" defaultChecked />
                    <label htmlFor="track-history">Store command history</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="anonymous-mode" className="mr-2" />
                    <label htmlFor="anonymous-mode">Enable anonymous mode</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="auto-clear" className="mr-2" />
                    <label htmlFor="auto-clear">Auto-clear terminal after session</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Security Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center">
                    <i className="fa fa-shield-alt mr-2"></i>
                    <span>Security Scanner</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center">
                    <i className="fa fa-user-secret mr-2"></i>
                    <span>Privacy Inspector</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center">
                    <i className="fa fa-file-shield mr-2"></i>
                    <span>Integrity Checker</span>
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center">
                    <i className="fa fa-bug mr-2"></i>
                    <span>Malware Scanner</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">About HackOS</h2>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🐱‍💻</div>
                <h3 className="text-2xl font-bold">HackOS</h3>
                <p className="text-gray-400">Version 1.0.0</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded mb-4 text-sm">
                <p className="mb-2">
                  HackOS is a simulated ethical hacking platform designed for educational purposes. 
                  It provides a realistic Linux desktop environment for practicing cybersecurity skills.
                </p>
                <p>
                  This software is provided as-is with no warranty. It is intended only for learning
                  ethical hacking techniques in controlled environments.
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">System Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Build Date:</div>
                  <div>April 4, 2025</div>
                  <div className="text-gray-400">Framework Version:</div>
                  <div>React 18.2.0</div>
                  <div className="text-gray-400">License:</div>
                  <div>MIT License</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                  <i className="fa fa-book mr-1"></i> Documentation
                </button>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                  <i className="fa fa-code mr-1"></i> Source Code
                </button>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                  <i className="fa fa-bug mr-1"></i> Report Bug
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;