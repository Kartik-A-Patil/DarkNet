import React, { useEffect, useState, useRef } from 'react';
import { useOS } from '../contexts/OSContext';
import { usePerformance } from '../contexts/PerformanceContext';
import { useAnimations } from '../hooks/useAnimations';
import Window from './Window';
import { AppType, ContextMenuOption } from '../types/os.types';
import PerformanceMonitorWidget from './PerformanceMonitorWidget';

const Desktop: React.FC = () => {
  const { 
    windowManager, 
    showAppMenu, 
    setShowAppMenu,
    desktopSettings,
    updateDesktopSettings,
    availableWallpapers,
    contextMenu,
    showContextMenu,
    hideContextMenu
  } = useOS();
  
  const { windows } = windowManager;
  const { isLowPerformanceMode, toggleLowPerformanceMode } = usePerformance();
  const { fade, hacker } = useAnimations();
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(true);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Desktop startup animation
  useEffect(() => {
    if (desktopRef.current) {
      fade.fadeIn(desktopRef.current);
      
      // Animate desktop icons with stagger
      setTimeout(() => {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach((icon, index) => {
          setTimeout(() => {
            fade.fadeIn(icon as HTMLElement);
          }, index * 100);
        });
      }, 300);
    }
  }, [fade]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+T to open terminal
      if (e.ctrlKey && e.altKey && e.key === 't') {
        windowManager.createWindow('terminal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [windowManager]);

  // Handle click outside app menu to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        showAppMenu && 
        !target.closest('#app-menu') && 
        !target.closest('#app-menu-button')
      ) {
        setShowAppMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAppMenu, setShowAppMenu]);

  // Handle desktop context menu
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const options: ContextMenuOption[] = [
      {
        label: 'Change Wallpaper',
        icon: 'fa-image',
        action: () => setShowWallpaperDialog(true)
      },
      {
        label: 'Create New Folder',
        icon: 'fa-folder-plus',
        action: () => createNewFolder()
      },
      {
        label: 'Create Text File',
        icon: 'fa-file-alt',
        action: () => createTextFile()
      },
      {
        label: 'Open Terminal Here',
        icon: 'fa-terminal',
        action: () => openTerminal()
      },
      {
        label: 'Arrange Icons',
        icon: 'fa-th-large',
        action: () => arrangeIcons()
      },
      {
        label: '',
        icon: '',
        action: () => {},
        separator: true
      },
      {
        label: showPerformanceMonitor ? 'Hide Performance Monitor' : 'Show Performance Monitor',
        icon: showPerformanceMonitor ? 'fa-eye-slash' : 'fa-eye',
        action: () => setShowPerformanceMonitor(!showPerformanceMonitor)
      },
      {
        label: isLowPerformanceMode ? 'Disable Low Performance Mode' : 'Enable Low Performance Mode',
        icon: isLowPerformanceMode ? 'fa-rocket' : 'fa-battery-quarter',
        action: () => toggleLowPerformanceMode()
      }
    ];
    
    showContextMenu(e.clientX, e.clientY, options);
  };

  // Handle desktop click
  const handleDesktopClick = () => {
    hideContextMenu();
    // If there are other things that need to happen on desktop click
    // add them here
  };

  // Handle desktop icon click
  const handleIconClick = (app: AppType) => {
    windowManager.createWindow(app);
  };

  // Handle desktop icon context menu
  const handleIconContextMenu = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const options: ContextMenuOption[] = [
      {
        label: 'Open',
        icon: 'fa-external-link-alt',
        action: () => {
          const icon = desktopSettings.icons.find(i => i.id === iconId);
          if (icon) {
            windowManager.createWindow(icon.app);
          }
        }
      },
      {
        label: 'Remove from Desktop',
        icon: 'fa-trash-alt',
        action: () => removeIcon(iconId)
      }
    ];
    
    showContextMenu(e.clientX, e.clientY, options);
  };

  // Create new folder on desktop
  const createNewFolder = () => {
    // Implementation would interact with the file system
    console.log("Creating new folder");
  };

  // Create text file on desktop
  const createTextFile = () => {
    // Implementation would interact with the file system
    console.log("Creating text file");
  };

  // Open terminal at desktop location
  const openTerminal = () => {
    windowManager.createWindow('terminal');
  };

  // Arrange desktop icons
  const arrangeIcons = () => {
    // Implementation would rearrange desktop icons
    console.log("Arranging icons");
  };

  // Remove icon from desktop
  const removeIcon = (iconId: string) => {
    const updatedIcons = desktopSettings.icons.filter(icon => icon.id !== iconId);
    updateDesktopSettings({ icons: updatedIcons });
  };

  // Change wallpaper
  const changeWallpaper = (wallpaperId: string) => {
    const wallpaper = availableWallpapers.find(w => w.id === wallpaperId);
    if (wallpaper) {
      updateDesktopSettings({ wallpaper: wallpaper.path });
      setShowWallpaperDialog(false);
    }
  };

  return (
    <div 
      ref={desktopRef}
      id="desktop" 
      className={`absolute inset-0 z-0 overflow-hidden opacity-0 ${
        isLowPerformanceMode ? 'low-performance-mode' : ''
      } `}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Icons */}
      <div className="p-4 grid grid-cols-1 gap-4" style={{ gridAutoRows: 'min-content', justifyItems: 'start' }}>
        {desktopSettings.icons.map(icon => (
          <div 
            key={icon.id}
            className="desktop-icon"
            onClick={() => handleIconClick(icon.app)}
            onContextMenu={(e) => handleIconContextMenu(e, icon.id)}
          >
            <i className={`fa ${icon.icon}`}></i>
            <span className="text-white drop-shadow">{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Performance Monitor Widget */}
      {showPerformanceMonitor && (
        <div className="absolute bottom-16 right-4">
          <PerformanceMonitorWidget />
        </div>
      )}

      {/* Windows */}
      {windows.map((window) => (
        <Window
          key={window.id}
          window={window}
        />
      ))}

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="context-menu" 
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.options.map((option, index) => (
            <React.Fragment key={index}>
              {option.separator && <div className="context-menu-separator"></div>}
              <div 
                className={`context-menu-item ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!option.disabled) {
                    option.action();
                    hideContextMenu();
                  }
                }}
              >
                <i className={`fa ${option.icon}`}></i>
                <span>{option.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Wallpaper Dialog */}
      {showWallpaperDialog && (
        <div className="os-dialog" onClick={() => setShowWallpaperDialog(false)}>
          <div className="os-dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-title">Choose Wallpaper</div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {availableWallpapers.map(wallpaper => (
                <div 
                  key={wallpaper.id} 
                  className={`wallpaper-thumbnail ${desktopSettings.wallpaper === wallpaper.path ? 'active' : ''}`}
                  onClick={() => changeWallpaper(wallpaper.id)}
                >
                  <img 
                    src={wallpaper.thumbnail} 
                    alt={wallpaper.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="text-xs mt-1 text-center">{wallpaper.name}</div>
                </div>
              ))}
            </div>
            <div className="os-dialog-actions">
              <button 
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() => setShowWallpaperDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desktop;
