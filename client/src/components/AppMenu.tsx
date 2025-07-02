import React, { useEffect, useState } from "react";
import { useOS } from "../contexts/OSContext";
import { useAnimations } from "../hooks/useAnimations";
import { AppType } from "../types/os.types";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

const AppMenu: React.FC = () => {
  const { windowManager, showAppMenu, setShowAppMenu } = useOS();
  const { fade, hacker } = useAnimations();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAppClick = (appType: AppType) => {
    // Animate app launch
    hacker.accessGranted('.app-menu');
    
    setTimeout(() => {
      windowManager.createWindow(appType);
      setShowAppMenu(false);
    }, 200);
  };

  // App menu animations
  useEffect(() => {
    if (showAppMenu) {
      const menu = document.querySelector('#app-menu');
      if (menu) {
        fade.fadeIn(menu as HTMLElement);
        
        // Stagger app items animation
        setTimeout(() => {
          const items = menu.querySelectorAll('.app-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              fade.fadeIn(item as HTMLElement);
            }, index * 30);
          });
        }, 100);
      }
    }
  }, [showAppMenu, fade]);

  if (!showAppMenu) {
    return null;
  }

  return (
    <div
      id="app-menu"
      className="absolute bottom-12 left-0 w-64 bg-window rounded-t shadow-lg z-50"
    >
      <div className="p-3 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search applications..."
          className="w-full bg-gray-800 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="p-2 max-h-96 overflow-y-auto">
        <style>{`
          #app-menu .app-item {
            transition:
              background 0.18s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.18s cubic-bezier(0.4,0,0.2,1),
              transform 0.18s cubic-bezier(0.4,0,0.2,1);
            will-change: background, box-shadow, transform;
          }
          #app-menu .app-item:hover {
            background: rgba(30, 32, 40, 0.32);
            box-shadow: 0 4px 18px 0 rgba(0,0,0,0.13);
            backdrop-filter: blur(16px) saturate(1.1) brightness(0.98);
            -webkit-backdrop-filter: blur(16px) saturate(1.1) brightness(0.98);
            transform: translateY(-2px) scale(1.035);
            z-index: 1;
          }
        `}</style>
        <div className="text-xs uppercase text-dimtext mb-1 mt-1 px-2">
          Accessories
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("terminal")}> 
          <i className="fa fa-terminal w-6"></i>
          <span className="ml-2">Terminal</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("text-editor")}> 
          <i className="fa fa-edit w-6"></i>
          <span className="ml-2">Text Editor</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("file-manager")}> 
          <i className="fa fa-folder w-6"></i>
          <span className="ml-2">File Manager</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("browser")}> 
          <i className="fa fa-globe w-6"></i>
          <span className="ml-2">DarkNet Browser</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("mailware")}> 
          <i className="fa fa-paper-plane w-6"></i>
          <span className="ml-2">Mailware</span>
        </div>
        <div className="text-xs uppercase text-dimtext mb-1 mt-3 px-2">
          System Tools
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("device-control")}> 
          <i className="fa fa-sitemap w-6"></i>
          <span className="ml-2">Device Control</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("network-scanner")}> 
          <i className="fa fa-network-wired w-6"></i>
          <span className="ml-2">Network Scanner</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("system-monitor")}> 
          <i className="fa fa-chart-line w-6"></i>
          <span className="ml-2">System Monitor</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("security-dashboard")}> 
          <i className="fa fa-chart-line w-6"></i>
          <span className="ml-2">security Dashboard</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("animation-demo")}> 
          <i className="fa fa-magic w-6"></i>
          <span className="ml-2">Animation Demo</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("social-feed")}> 
          <i className="fa fa-users w-6"></i>
          <span className="ml-2">DarkNet Social</span>
        </div>
        <div className="text-xs uppercase text-dimtext mb-1 mt-3 px-2">
          Hacking Tools
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("vulnerability-scanner")}> 
          <i className="fa fa-bug w-6"></i>
          <span className="ml-2">Vulnerability Scanner</span>
        </div>
        <div className="app-item p-2 rounded cursor-pointer flex items-center" onClick={() => handleAppClick("password-cracker")}> 
          <i className="fa fa-key w-6"></i>
          <span className="ml-2">Password Cracker</span>
        </div>
        
      </div>
    </div>
  );
};

export default AppMenu;
