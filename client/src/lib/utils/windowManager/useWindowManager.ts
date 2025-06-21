import { useState, useCallback } from "react";
import {
  AppType,
  Window,
  WindowPosition,
  WindowState
} from "../../../types/os.types";
import appDefinitions from "./appDefinitions";
import { windowAnimations } from "../../animations";

export function useWindowManager() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // Create a new window
  const createWindow = useCallback(
    (appType: AppType, options?: { title?: string; props?: any }) => {
      // Check if window already exists
      const existingWindow = windows.find((w) => w.app === appType);
      if (existingWindow) {
        // If minimized, restore it
        if (existingWindow.state === "minimized") {
          activateWindow(existingWindow.id);
          return;
        }

        activateWindow(existingWindow.id);
        return;
      }

      const appInfo = appDefinitions[appType];
      const id = `${appType}-${Date.now()}`;

      // Calculate position (offset each window slightly)
      const offset = windows.length * 25;
      const position: WindowPosition = {
        x: 50 + offset,
        y: 50 + offset,
        width: appInfo.defaultSize.width,
        height: appInfo.defaultSize.height
      };

      const newWindow: Window = {
        id,
        title: options?.title || appInfo.title,
        app: appType,
        icon: appInfo.icon,
        state: "normal",
        position,
        zIndex: nextZIndex,
        isActive: true,
        props: options?.props || {}
      };

      // Deactivate other windows
      const updatedWindows = windows.map((w) => ({ ...w, isActive: false }));

      setWindows([...updatedWindows, newWindow]);
      setActiveWindow(id);
      setNextZIndex(nextZIndex + 1);
    },
    [windows, nextZIndex]
  );

  // Activate a window (bring to front)
  const activateWindow = useCallback(
    (id: string) => {
      if (activeWindow === id) return;

      // Check if the window is minimized and needs restore animation
      const targetWindow = windows.find(w => w.id === id);
      const isMinimized = targetWindow?.state === "minimized";

      setWindows(prevWindows =>
        prevWindows.map((w) => {
          if (w.id === id) {
            return { 
              ...w, 
              isActive: true, 
              zIndex: nextZIndex, 
              state: isMinimized ? "normal" : w.state 
            };
          } else {
            return { ...w, isActive: false };
          }
        })
      );

      // If window was minimized, play restore animation after DOM update
      if (isMinimized) {
        setTimeout(() => {
          const windowElement = document.querySelector(`[data-window-id="${id}"]`) as HTMLElement;
          if (windowElement) {
            windowAnimations.restore(windowElement);
          }
        }, 50); // Small delay to ensure DOM update
      }

      setActiveWindow(id);
      setNextZIndex(nextZIndex + 1);
    },
    [windows, activeWindow, nextZIndex]
  );

  // Close a window
  const closeWindow = useCallback(
    (id: string) => {
      // Find the window element and animate close
      const windowElement = document.querySelector(`[data-window-id="${id}"]`) as HTMLElement;
      if (windowElement) {
        windowAnimations.close(windowElement).finished.then(() => {
          // Remove window after animation completes
          const newWindows = windows.filter((w) => w.id !== id);
          setWindows(newWindows);

          // If this was the active window, activate the top-most window
          if (activeWindow === id && newWindows.length > 0) {
            const topWindow = newWindows.reduce((prev, current) =>
              prev.zIndex > current.zIndex ? prev : current
            );
            setActiveWindow(topWindow.id);

            // Activate the top window
            setWindows(
              newWindows.map((w) =>
                w.id === topWindow.id ? { ...w, isActive: true } : w
              )
            );
          } else if (newWindows.length === 0) {
            setActiveWindow(null);
          }
        });
      } else {
        // Fallback if element not found
        const newWindows = windows.filter((w) => w.id !== id);
        setWindows(newWindows);
        if (activeWindow === id && newWindows.length === 0) {
          setActiveWindow(null);
        }
      }
    },
    [windows, activeWindow]
  );

  // Minimize a window
  const minimizeWindow = useCallback(
    (id: string) => {
      // First update the state immediately
      setWindows(prevWindows =>
        prevWindows.map((w) => {
          if (w.id === id) {
            return { ...w, state: "minimized", isActive: false };
          }
          return w;
        })
      );

      // Find the window element and animate minimize
      const windowElement = document.querySelector(`[data-window-id="${id}"]`) as HTMLElement;
      if (windowElement) {
        windowAnimations.minimize(windowElement);
      }

      // If this was the active window, activate the top-most visible window
      if (activeWindow === id) {
        const visibleWindows = windows.filter(
          (w) => w.id !== id && w.state !== "minimized"
        );

        if (visibleWindows.length > 0) {
          const topWindow = visibleWindows.reduce((prev, current) =>
            prev.zIndex > current.zIndex ? prev : current
          );
          setActiveWindow(topWindow.id);

          // Activate the top window
          setWindows((prevWindows) =>
            prevWindows.map((w) =>
              w.id === topWindow.id ? { ...w, isActive: true } : w
            )
          );
        } else {
          setActiveWindow(null);
        }
      }
    },
    [windows, activeWindow]
  );

  // Maximize/restore a window
  const toggleMaximize = useCallback(
    (id: string) => {
      setWindows(
        windows.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              state: w.state === "maximized" ? "normal" : "maximized"
            };
          }
          return w;
        })
      );
    },
    [windows]
  );

  // Update window position
  const updatePosition = useCallback(
    (id: string, position: Partial<WindowPosition>) => {
      setWindows(
        windows.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              position: { ...w.position, ...position }
            };
          }
          return w;
        })
      );
    },
    [windows]
  );

  // Get running applications (for taskbar)
  const getRunningApps = useCallback(() => {
    return windows.map((w) => ({
      id: w.id,
      app: w.app,
      title: w.title,
      icon: w.icon,
      isActive: w.isActive,
      isMinimized: w.state === "minimized"
    }));
  }, [windows]);

  // Add this function to update window title
  const updateWindowTitle = (windowId: string, newTitle: string) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === windowId ? { ...window, title: newTitle } : window
      )
    );
  };

  const updateWindow = (windowId: string, newProps: Partial<Window>) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === windowId ? { ...window, ...newProps } : window
      )
    );
  };

  return {
    windows,
    activeWindow,
    appDefinitions,
    createWindow,
    activateWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    updatePosition,
    getRunningApps,
    updateWindowTitle,
    updateWindow
  };
}
