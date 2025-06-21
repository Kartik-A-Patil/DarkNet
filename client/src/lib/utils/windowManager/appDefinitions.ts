import { AppType, AppInfo } from "../../../types/os.types";

// App definitions
const appDefinitions: Record<AppType, AppInfo> = {
  terminal: {
    type: "terminal",
    title: "Terminal",
    icon: "fa-terminal",
    defaultSize: { width: 700, height: 450 }
  },
  "file-manager": {
    type: "file-manager",
    title: "File Manager",
    icon: "fa-folder",
    defaultSize: { width: 800, height: 500 }
  },
  "text-editor": {
    type: "text-editor",
    title: "Text Editor",
    icon: "fa-edit",
    defaultSize: { width: 650, height: 450 }
  },
  "network-scanner": {
    type: "network-scanner",
    title: "Network Scanner",
    icon: "fa-network-wired",
    defaultSize: { width: 700, height: 500 }
  },
  "system-monitor": {
    type: "system-monitor",
    title: "System Monitor",
    icon: "fa-chart-line",
    defaultSize: { width: 800, height: 600 }
  },
  "vulnerability-scanner": {
    type: "vulnerability-scanner",
    title: "Vulnerability Scanner",
    icon: "fa-bug",
    defaultSize: { width: 700, height: 450 }
  },
  "password-cracker": {
    type: "password-cracker",
    title: "Password Cracker",
    icon: "fa-key",
    defaultSize: { width: 700, height: 450 }
  },
  "control-panel": {
    type: "control-panel",
    title: "Control Panel",
    icon: "fa-cogs",
    defaultSize: { width: 900, height: 600 }
  },
  "black-market": {
    type: "black-market",
    title: "Black Market",
    icon: "fa-mask",
    defaultSize: { width: 900, height: 600 }
  },
  settings: {
    type: "settings",
    title: "Settings",
    icon: "fa-cog",
    defaultSize: { width: 700, height: 500 }
  },
  "mailware": {
    type: "mailware",
    title: "Mailware",
    icon: "fa-paper-plane",
    defaultSize: { width: 1000, height: 650 }
  },
  "security-dashboard": {
    type: "security-dashboard",
    title: "Security Dashboard",
    icon: "fa-shield-alt",
    defaultSize: { width: 800, height: 600 }
  },
  
  "animation-demo": {
    type: "animation-demo",
    title: "Animation Demo",
    icon: "fa-magic",
    defaultSize: { width: 900, height: 700 }
  },
  "social-feed": {
    type: "social-feed",
    title: "DarkNet Social",
    icon: "fa-users",
    defaultSize: { width: 1000, height: 800 }
  },
  "device-control": {
    type: "device-control",
    title: "Device Control Center",
    icon: "fa-sitemap",
    defaultSize: { width: 1200, height: 800 }
  },
  "browser": {
    type: "browser",
    title: "DarkNet Browser",
    icon: "fa-globe",
    defaultSize: { width: 1000, height: 700 }
  }
};

export default appDefinitions;
