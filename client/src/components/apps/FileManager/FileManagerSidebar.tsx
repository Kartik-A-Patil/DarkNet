import React from 'react';

interface FileManagerSidebarProps {
  currentPath: string;
  onNavigateTo: (path: string) => void;
}

const FileManagerSidebar: React.FC<FileManagerSidebarProps> = ({
  currentPath,
  onNavigateTo,
}) => {
  const sidebarItems = [
    {
      section: "PLACES",
      items: [
        { name: "Home", path: "/home/hackos", icon: "fa-home" },
        { name: "Desktop", path: "/home/hackos/Desktop", icon: "fa-desktop" },
        { name: "Downloads", path: "/home/hackos/Downloads", icon: "fa-download" },
        { name: "Documents", path: "/home/hackos/Documents", icon: "fa-file" },
        { name: "Pictures", path: "/home/hackos/Pictures", icon: "fa-image" },
      ]
    },
    {
      section: "DEVICES",
      items: [
        { name: "System (/)", path: "/", icon: "fa-hdd" },
        { name: "Network", path: "", icon: "fa-network-wired", disabled: true },
      ]
    }
  ];

  return (
    <div className="w-48 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      {sidebarItems.map((section, idx) => (
        <div key={idx} className="p-2">
          <div className="text-xs font-medium mb-2 text-gray-400 uppercase tracking-wider">
            {section.section}
          </div>
          <div className="space-y-1">
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={`px-2 py-1.5 rounded cursor-pointer flex items-center space-x-2 text-sm transition-colors ${
                  currentPath === item.path 
                    ? "bg-gray-700 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } ${item.disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-300" : ""}`}
                onClick={() => !item.disabled && onNavigateTo(item.path)}
              >
                <i className={`fa ${item.icon} text-gray-400 w-4`}></i>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileManagerSidebar;
