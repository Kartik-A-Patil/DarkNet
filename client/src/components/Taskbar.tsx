import React, { useEffect, useState, useRef } from "react";
import { useOS } from "../contexts/OSContext";
import { useAnimations } from "../hooks/useAnimations";

const Taskbar: React.FC = () => {
  const {
    windowManager,
    showAppMenu,
    setShowAppMenu,
    systemStatus,
    toggleWifi,
    connectToNetwork,
    disconnectFromNetwork
  } = useOS();
  const { fade, hacker } = useAnimations();
  const runningApps = windowManager.getRunningApps();
  const [time, setTime] = useState<string>(getCurrentTime());
  const [date, setDate] = useState<string>(getCurrentDate());
  const [showWifiPanel, setShowWifiPanel] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const taskbarRef = useRef<HTMLDivElement>(null);

  const wifiPanelRef = useRef<HTMLDivElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
      setDate(getCurrentDate());
    }, 1000); // Update every second for smoother time updates

    return () => clearInterval(interval);
  }, []);

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  const toggleAppMenu = () => {
    setShowAppMenu(!showAppMenu);
  };

  const handleAppClick = (id: string) => {
    const app = runningApps.find((app) => app.id === id);
    if (app?.isMinimized) {
      // If minimized, restore and activate it
      windowManager.activateWindow(id);
    } else if (app?.isActive) {
      // If active, minimize it
      windowManager.minimizeWindow(id);
    } else {
      // If not active but visible, make it active
      windowManager.activateWindow(id);
    }
  };

  // Toggle panel functions
  const toggleWifiPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWifiPanel(!showWifiPanel);
    setShowUserPanel(false);
  };

  const toggleUserPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserPanel(!showUserPanel);
    setShowWifiPanel(false);
  };

  // Click outside to close panels
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wifiPanelRef.current &&
        !wifiPanelRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("#wifi-button")
      ) {
        setShowWifiPanel(false);
      }

      if (
        userPanelRef.current &&
        !userPanelRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("#user-button")
      ) {
        setShowUserPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Taskbar entrance animation
  useEffect(() => {
    if (taskbarRef.current) {
      fade.fadeIn(taskbarRef.current);
    }
  }, [fade]);

  // Animate app launches and closes
  useEffect(() => {
    const appItems = document.querySelectorAll('.taskbar-app-item');
    appItems.forEach((item, index) => {
      fade.fadeIn(item as HTMLElement);
    });
  }, [runningApps.length, fade]);

  return (
    <div
      ref={taskbarRef}
      className="fixed bottom-0 left-0 right-0 h-12 bg-gray-900 text-white flex items-center px-2 border-t border-gray-800 z-50"
    >
      {/* Application Menu Button */}
      <div
        id="app-menu-button"
        className="px-3 py-2 rounded hover:bg-gray-700 cursor-pointer flex items-center transition duration-200"
        onClick={toggleAppMenu}
      >
        <i className="fa fa-th text-white mr-2"></i>
        <span className="text-white">Applications</span>
      </div>

      {/* Running Applications */}
      <div
        id="running-apps"
        className="flex-1 flex items-center ml-4 space-x-1 overflow-x-auto taskbar-apps"
      >
        {runningApps.map((app) => (
          <div
            key={app.id}
            className={`px-4 py-1.5 rounded cursor-pointer flex items-center transition-all duration-200
              ${
                app.isActive
                  ? "bg-gray-800 text-white border-b border-blue-700"
                  : app.isMinimized
                  ? "text-gray-400"
                  : "text-white hover:bg-gray-800"
              } taskbar-app-item`}
            onClick={() => handleAppClick(app.id)}
            title={app.title}
          >
            <i
              className={`fa ${app.icon} mr-2 ${
                app.isActive ? "" : "opacity-80"
              }`}
            ></i>
            <span>{app.title}</span>
          </div>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center ml-auto space-x-3 mr-2 relative">
        {/* WiFi Button */}
        <div
          id="wifi-button"
          className={`hover:bg-gray-700 p-1.5 rounded transition duration-200 cursor-pointer ${
            showWifiPanel ? "bg-gray-700" : ""
          }`}
          onClick={toggleWifiPanel}
        >
          <i
            className={`fa fa-wifi ${
              systemStatus.wifiEnabled
                ? systemStatus.wifiConnected
                  ? "text-green-500"
                  : "text-yellow-400"
                : "text-gray-400"
            } hover:text-white`}
          ></i>
        </div>

        {/* Battery Button */}
        <div className="hover:bg-gray-700 p-1.5 rounded transition duration-200 cursor-pointer tooltip-container">
          <i
            className={`fa ${
              systemStatus.batteryCharging
                ? "fa-battery-bolt"
                : systemStatus.batteryLevel > 75
                ? "fa-battery-full"
                : systemStatus.batteryLevel > 50
                ? "fa-battery-three-quarters"
                : systemStatus.batteryLevel > 25
                ? "fa-battery-half"
                : "fa-battery-quarter"
            } 
            ${
              systemStatus.batteryLevel < 20 ? "text-red-500" : "text-green-500"
            } hover:text-white`}
          ></i>
          <div className="tooltip hidden absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs rounded p-1 whitespace-nowrap">
            Battery: {systemStatus.batteryLevel}%
            {systemStatus.batteryCharging && " (Charging)"}
          </div>
        </div>

        {/* User Button */}
        <div
          id="user-button"
          className={`hover:bg-gray-700 p-1 rounded-full transition duration-200 cursor-pointer ${
            showUserPanel ? "bg-gray-700" : ""
          }`}
          onClick={toggleUserPanel}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {systemStatus.userInfo.username[0].toUpperCase()}
          </div>
        </div>

        {/* Clock */}
        <div id="clock" className="text-center px-2">
          <div className="text-sm font-medium text-white">{time}</div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>

        {/* WiFi Panel */}
        {showWifiPanel && (
          <div
            ref={wifiPanelRef}
            className="absolute right-12 bottom-12 w-72 bg-gray-800 rounded shadow-lg border border-gray-700 z-50"
          >
            <div className="p-3 border-b border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">WiFi</h3>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle-wifi-panel"
                    className="sr-only"
                    checked={systemStatus.wifiEnabled}
                    onChange={toggleWifi}
                  />
                  <div className="w-10 h-4 bg-gray-600 rounded-full shadow-inner"></div>
                  <div
                    className={`dot absolute w-6 h-6 rounded-full -top-1 transition-all duration-300 ${
                      systemStatus.wifiEnabled
                        ? "bg-accent right-0"
                        : "bg-gray-400 left-0"
                    }`}
                  ></div>
                </div>
              </div>

              {systemStatus.wifiEnabled && (
                <div>
                  {systemStatus.wifiConnected ? (
                    <div className="mb-2">
                      <div className="flex items-center mb-1">
                        <i className="fa fa-wifi text-green-500 mr-2"></i>
                        <span className="font-medium">
                          {systemStatus.connectedNetwork}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Connected</span>
                        <button
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={disconnectFromNetwork}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 mb-2">
                      Not connected
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto">
                    {systemStatus.availableNetworks.map((network) => (
                      <div
                        key={network.ssid}
                        className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between"
                        onClick={() => connectToNetwork(network.ssid)}
                      >
                        <div className="flex items-center">
                          <i
                            className={`fa fa-wifi mr-2 ${
                              network.signalStrength > 70
                                ? "text-green-500"
                                : network.signalStrength > 40
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          ></i>
                          <div>
                            <div className="text-sm">{network.ssid}</div>
                            <div className="text-xs text-gray-400">
                              {network.secured ? "Secured" : "Open"}
                            </div>
                          </div>
                        </div>
                        <div className="w-6 text-right">
                          {systemStatus.connectedNetwork === network.ssid && (
                            <i className="fa fa-check text-green-500"></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-700">
              <button
                className="w-full text-sm py-1 hover:bg-gray-700 rounded text-accent flex items-center justify-center"
                onClick={() => windowManager.createWindow("control-panel")}
              >
                <i className="fa fa-cog mr-2"></i>
                <span>Network Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* User Panel */}
        {showUserPanel && (
          <div
            ref={userPanelRef}
            className="absolute right-2 bottom-12 w-72 bg-gray-800 rounded shadow-lg border border-gray-700 z-50"
          >
            <div className="p-4 border-b border-gray-700 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white mr-3">
                {systemStatus.userInfo.username[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{systemStatus.userInfo.fullName}</div>
                <div className="text-sm text-gray-400">@{systemStatus.userInfo.username}</div>
                <div className="text-xs text-gray-400 mt-1">{systemStatus.userInfo.role}</div>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="text-sm py-2 px-1 hover:bg-gray-700 rounded flex items-center justify-start"
                  onClick={() => windowManager.createWindow("control-panel")}
                >
                  <i className="fa fa-cog text-gray-300 w-8 text-center"></i>
                  <span>Settings</span>
                </button>
                <button className="text-sm py-2 px-1 hover:bg-gray-700 rounded flex items-center justify-start">
                  <i className="fa fa-user text-gray-300 w-8 text-center"></i>
                  <span>Account</span>
                </button>
                <button className="text-sm py-2 px-1 hover:bg-gray-700 rounded flex items-center justify-start">
                  <i className="fa fa-shield-alt text-gray-300 w-8 text-center"></i>
                  <span>Security</span>
                </button>
                <button className="text-sm py-2 px-1 hover:bg-gray-700 rounded flex items-center justify-start">
                  <i className="fa fa-brush text-gray-300 w-8 text-center"></i>
                  <span>Themes</span>
                </button>
              </div>
            </div>

            <div className="p-2 border-t border-gray-700">
              <button className="w-full text-sm py-2 hover:bg-gray-700 rounded flex items-center justify-center text-red-400 hover:text-red-300">
                <i className="fa fa-power-off mr-2"></i>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskbar;
