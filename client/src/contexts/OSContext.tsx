import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFileSystem } from '../lib/useFileSystem';
import { useWindowManager } from '../lib/utils/windowManager/index';
import { useCommandProcessor } from '../lib/useCommandProcessor';
import { usePackageManager } from '../lib/utils/packageManager/index';
import { 
  NetworkHost, 
  DesktopSettings, 
  DesktopIcon, 
  ContextMenuOption,
  WallpaperOption
} from '../types/os.types';
import defaultwallpaper from '@/assets/kali-default.svg';
import { useAuth } from '../hooks/use-auth';
// Network simulation
const initialNetwork = {
  hosts: {
    '192.168.1.1': {
      ip: '192.168.1.1',
      status: 'online',
      type: 'Router',
      ports: [80, 443, 22],
      services: {
        22: 'ssh',
        80: 'http',
        443: 'https'
      }
    },
    '192.168.1.5': {
      ip: '192.168.1.5',
      status: 'online',
      type: 'Desktop',
      ports: [445, 139, 22],
      services: {
        22: 'ssh',
        139: 'netbios',
        445: 'smb'
      }
    },
    '192.168.1.8': {
      ip: '192.168.1.8',
      status: 'online',
      type: 'Unknown',
      ports: [22, 80, 3306],
      services: {
        22: 'ssh',
        80: 'http',
        3306: 'mysql'
      }
    },
    '192.168.1.10': {
      ip: '192.168.1.10',
      status: 'offline'
    },
    '192.168.1.15': {
      ip: '192.168.1.15',
      status: 'online',
      type: 'Server',
      ports: [21, 22, 80, 443],
      services: {
        21: 'ftp',
        22: 'ssh',
        80: 'http',
        443: 'https'
      },
      vulnerabilities: ['CVE-2021-4034', 'CVE-2022-0847']
    },
    '192.168.1.20': {
      ip: '192.168.1.20',
      status: 'offline'
    }
  } as Record<string, NetworkHost>
};

// Default desktop settings
const defaultDesktopSettings: DesktopSettings = {
  wallpaper: '/wallpapers/kali-default.svg',
  theme: 'dark',
  accentColor: '#0871D0',
  icons: [
    {
      id: 'terminal-icon',
      label: 'Terminal',
      icon: 'fa-terminal',
      app: 'terminal'
    },
    {
      id: 'file-manager-icon',
      label: 'File Manager',
      icon: 'fa-folder',
      app: 'file-manager'
    },
    {
      id: 'text-editor-icon',
      label: 'Text Editor',
      icon: 'fa-edit',
      app: 'text-editor'
    },
    {
      id: 'network-scanner-icon',
      label: 'Network Scanner',
      icon: 'fa-network-wired',
      app: 'network-scanner'
    },
    {
      id: 'system-monitor-icon',
      label: 'System Monitor',
      icon: 'fa-chart-line',
      app: 'system-monitor'
    },
    {
      id: 'control-panel-icon',
      label: 'Control Panel',
      icon: 'fa-cogs',
      app: 'control-panel'
    },
    {
      id: 'black-market-icon',
      label: 'Black Market',
      icon: 'fa-mask',
      app: 'black-market'
    },
    {
      id: 'social-feed-icon',
      label: 'DarkNet Social',
      icon: 'fa-users',
      app: 'social-feed'
    }
  ]
};

// Available wallpaper options
const availableWallpapers: WallpaperOption[] = [
  {
    id: 'kali-default',
    name: 'Kali Default',
    path: '/wallpapers/kali-default.svg',
    thumbnail: '/wallpapers/kali-default.svg'
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    path: '/wallpapers/matrix.svg',
    thumbnail: '/wallpapers/matrix.svg'
  },
  {
    id: 'hacker',
    name: 'Hacker Theme',
    path: '/wallpapers/hacker.svg',
    thumbnail: '/wallpapers/hacker.svg'
  },
  {
    id: 'dark-gradient',
    name: 'Dark Gradient',
    path: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY3IiB2aWV3Qm94PSIwIDAgMTIwIDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzFhMWEyZSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzE2MjEzZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjciIGZpbGw9InVybCgjZ3JhZDEpIi8+PC9zdmc+'
  },
  {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    path: 'linear-gradient(45deg, #000428 0%, #004e92 100%)',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY3IiB2aWV3Qm94PSIwIDAgMTIwIDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMDA0MjgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDRlOTIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY3IiBmaWxsPSJ1cmwoI2dyYWQyKSIvPjwvc3ZnPg=='
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    path: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY3IiB2aWV3Qm94PSIwIDAgMTIwIDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY3IiBmaWxsPSJ1cmwoI2dyYWQzKSIvPjwvc3ZnPg=='
  }
];

// System status type definitions
interface SystemStatus {
  wifiEnabled: boolean;
  wifiConnected: boolean;
  availableNetworks: {
    ssid: string;
    secured: boolean;
    signalStrength: number; // 0-100
  }[];
  connectedNetwork: string | null;
  bluetoothEnabled: boolean;
  bluetoothConnected: boolean;
  batteryLevel: number; // 0-100
  batteryCharging: boolean;
  userInfo: {
    username: string;
    fullName: string;
    role: string;
  };
}

interface OSContextValue {
  fileSystem: ReturnType<typeof useFileSystem>;
  windowManager: ReturnType<typeof useWindowManager>;
  commandProcessor: ReturnType<typeof useCommandProcessor>;
  packageManager: ReturnType<typeof usePackageManager>;
  network: typeof initialNetwork;
  desktopSettings: DesktopSettings;
  updateDesktopSettings: (settings: Partial<DesktopSettings>) => void;
  addDesktopIcon: (icon: DesktopIcon) => void;
  removeDesktopIcon: (id: string) => void;
  availableWallpapers: WallpaperOption[];
  showAppMenu: boolean;
  setShowAppMenu: React.Dispatch<React.SetStateAction<boolean>>;
  contextMenu: {
    show: boolean;
    x: number;
    y: number;
    options: ContextMenuOption[];
  };
  showContextMenu: (x: number, y: number, options: ContextMenuOption[]) => void;
  hideContextMenu: () => void;
  isSudoMode: boolean;
  setSudoMode: (value: boolean) => void;
  sudoPassword: string;
  systemStatus: SystemStatus;
  toggleWifi: () => void;
  connectToNetwork: (ssid: string) => void;
  disconnectFromNetwork: () => void;
  toggleBluetooth: () => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [network] = useState(initialNetwork);
  const [desktopSettings, setDesktopSettings] = useState<DesktopSettings>(defaultDesktopSettings);
  const [isSudoMode, setSudoMode] = useState(false);
  const [sudoPassword] = useState('kali');
  const { user } = useAuth();
  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    wifiEnabled: true,
    wifiConnected: true,
    availableNetworks: [
      { ssid: "EVIL_CORP_WIFI", secured: true, signalStrength: 85 },
      { ssid: "HackMe_Guest", secured: false, signalStrength: 72 },
      { ssid: "BlackHat_5G", secured: true, signalStrength: 60 },
      { ssid: "DefCon_Network", secured: true, signalStrength: 45 },
      { ssid: "Public_WiFi", secured: false, signalStrength: 30 }
    ],
    connectedNetwork: "EVIL_CORP_WIFI",
    bluetoothEnabled: false,
    bluetoothConnected: false,
    batteryLevel: 85,
    batteryCharging: true,
    userInfo: {
      username: user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'darknet_user',
      fullName: user?.displayName || 'DarkNet User',
      role: 'System Administrator'
    }
  });
  
  // Toggle WiFi
  const toggleWifi = () => {
    setSystemStatus(prev => ({
      ...prev,
      wifiEnabled: !prev.wifiEnabled,
      wifiConnected: !prev.wifiEnabled ? false : prev.wifiConnected,
      connectedNetwork: !prev.wifiEnabled ? null : prev.connectedNetwork
    }));
  };
  
  // Connect to a network
  const connectToNetwork = (ssid: string) => {
    const network = systemStatus.availableNetworks.find(n => n.ssid === ssid);
    if (network) {
      setSystemStatus(prev => ({
        ...prev,
        wifiConnected: true,
        connectedNetwork: ssid
      }));
    }
  };
  
  // Disconnect from network
  const disconnectFromNetwork = () => {
    setSystemStatus(prev => ({
      ...prev,
      wifiConnected: false,
      connectedNetwork: null
    }));
  };
  
  // Toggle Bluetooth
  const toggleBluetooth = () => {
    setSystemStatus(prev => ({
      ...prev,
      bluetoothEnabled: !prev.bluetoothEnabled,
      bluetoothConnected: !prev.bluetoothEnabled ? false : prev.bluetoothConnected
    }));
  };
  
  
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    options: [] as ContextMenuOption[]
  });

  // Initialize file system and window manager
  const fileSystem = useFileSystem();
  const windowManager = useWindowManager();
  const packageManager = usePackageManager();
  
  // Initialize command processor
  const commandProcessor = useCommandProcessor(
    fileSystem,
    fileSystem.currentPath,
    fileSystem.setCurrentPath,
    network,
    packageManager
  );

  // Update document body style when wallpaper changes
  useEffect(() => {
    const wallpaper = desktopSettings.wallpaper;
    if (wallpaper.startsWith('linear-gradient') || wallpaper.startsWith('radial-gradient')) {
      document.documentElement.style.setProperty(
        '--desktop-wallpaper', 
        wallpaper
      );
    } else {
      document.documentElement.style.setProperty(
        '--desktop-wallpaper', 
        `url('${wallpaper}')`
      );
    }
  }, [desktopSettings.wallpaper]);

  // Update theme and accent color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', desktopSettings.theme);
    document.documentElement.style.setProperty('--accent-color', desktopSettings.accentColor);
    
    // Update Tailwind accent colors
    const accentHex = desktopSettings.accentColor;
    const accentRgb = hexToRgb(accentHex);
    if (accentRgb) {
      document.documentElement.style.setProperty('--accent', `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`);
    }
  }, [desktopSettings.theme, desktopSettings.accentColor]);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Handle context menu
  const showContextMenu = (x: number, y: number, options: ContextMenuOption[]) => {
    setContextMenu({ show: true, x, y, options });
  };

  const hideContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  // Click outside to hide context menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        hideContextMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.show]);

  // Update desktop settings
  const updateDesktopSettings = (settings: Partial<DesktopSettings>) => {
    setDesktopSettings({ ...desktopSettings, ...settings });
  };

  // Add desktop icon
  const addDesktopIcon = (icon: DesktopIcon) => {
    if (!desktopSettings.icons.some(i => i.id === icon.id)) {
      setDesktopSettings({
        ...desktopSettings,
        icons: [...desktopSettings.icons, icon]
      });
    }
  };

  // Remove desktop icon
  const removeDesktopIcon = (id: string) => {
    setDesktopSettings({
      ...desktopSettings,
      icons: desktopSettings.icons.filter(icon => icon.id !== id)
    });
  };

  return (
    <OSContext.Provider value={{
      fileSystem,
      windowManager,
      commandProcessor,
      packageManager,
      network,
      desktopSettings,
      updateDesktopSettings,
      addDesktopIcon,
      removeDesktopIcon,
      availableWallpapers,
      showAppMenu,
      setShowAppMenu,
      contextMenu,
      showContextMenu,
      hideContextMenu,
      isSudoMode,
      setSudoMode,
      sudoPassword,
      systemStatus,
      toggleWifi,
      connectToNetwork,
      disconnectFromNetwork,
      toggleBluetooth,
      
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
