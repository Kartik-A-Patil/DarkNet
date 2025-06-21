import React, { useState, useRef, useEffect } from "react";
import { useOS } from "../contexts/OSContext";
import { Window as WindowType } from "../types/os.types";
import { useEntranceAnimation, useAnimations } from "../hooks/useAnimations";
import Terminal from "./apps/Terminal";
import FileManager from "./apps/FileManager";
import TextEditor from "./apps/TextEditor";
import NetworkScanner from "./apps/NetworkScanner";
import SystemMonitor from "./apps/SystemMonitor";
import ControlPanel from "./apps/ControlPanel";
import BlackMarketShop from "./apps/BlackMarketShop";
import Mailware from "./apps/Mailware";
import SecurityDashboard from "./apps/SecurityDashboard";
import AnimationDemo from "./apps/AnimationDemo";
import SocialFeed from "./apps/SocialFeed";
import DeviceControl from "./apps/DeviceControl";
import Browser from "./apps/Browser";
interface WindowProps {
  window: WindowType;
}

const Window: React.FC<WindowProps> = ({ window }) => {
  const { windowManager } = useOS();
  const { window: windowAnim } = useAnimations();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Add entrance animation for new windows
  useEffect(() => {
    if (windowRef.current && window.state !== 'minimized') {
      // Only animate on first open, not on restoration
      const isNewWindow = !window.id.includes('-restored-');
      if (isNewWindow) {
        windowAnim.windowOpen(windowRef.current);
      }
    }
  }, []); // Only run on mount

  // Refs for tracking real-time position during drag without re-renders
  const positionRef = useRef({
    x: window.position.x,
    y: window.position.y,
    width: window.position.width,
    height: window.position.height
  });

  // Update ref when window position changes from props
  useEffect(() => {
    positionRef.current = {
      x: window.position.x,
      y: window.position.y,
      width: window.position.width,
      height: window.position.height
    };
  }, [window.position]);

  // Apply position and size styles
  const getWindowStyle = () => {
    if (window.state === "minimized") {
      // Return minimal style for minimized windows (hidden by CSS display: none)
      return {
        display: "none"
      };
    }

    if (window.state === "maximized") {
      return {
        top: 0,
        left: 0,
        width: "100%",
        height: "100%", // Leave room for taskbar
        zIndex: window.zIndex,
        borderRadius: 0,
        transform: "none"
      };
    }

    return {
      top: `${window.position.y}px`,
      left: `${window.position.x}px`,
      width: `${window.position.width}px`,
      height: `${window.position.height}px`,
      zIndex: window.zIndex,
      // No transform during normal rendering
      transform: "none"
    };
  };

  // Activate window on click
  const handleWindowClick = () => {
    if (!window.isActive) {
      windowManager.activateWindow(window.id);
    }
  };

  // Dragging functionality
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (window.state === "maximized") return;

    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Resizing functionality
  const handleResizeHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && window.state !== "maximized" && windowRef.current) {
        // Cancel any existing animation frame
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        // Use transform for smooth movement during drag
        animationFrameId = requestAnimationFrame(() => {
          if (!windowRef.current) return;

          const newX = e.clientX - dragOffset.x;
          const newY = e.clientY - dragOffset.y;

          // Use transform for performance - doesn't cause reflow
          windowRef.current.style.transform = `translate3d(${
            newX - window.position.x
          }px, ${newY - window.position.y}px, 0)`;

          // Update ref (not state) to track current position
          positionRef.current.x = newX;
          positionRef.current.y = newY;
        });
      } else if (isResizing && windowRef.current) {
        // For resizing, we'll use similar approach
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(() => {
          if (!windowRef.current) return;
          const rect = windowRef.current.getBoundingClientRect();

          const newWidth = Math.max(
            300,
            e.clientX - rect.left + (rect.left - window.position.x)
          );
          const newHeight = Math.max(
            200,
            e.clientY - rect.top + (rect.top - window.position.y)
          );

          windowRef.current.style.width = `${newWidth}px`;
          windowRef.current.style.height = `${newHeight}px`;

          // Update ref
          positionRef.current.width = newWidth;
          positionRef.current.height = newHeight;
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        // Only update React state once at the end of drag/resize
        if (windowRef.current) {
          // Reset transform
          windowRef.current.style.transform = "none";

          // Now update the state once with the final position
          windowManager.updatePosition(window.id, {
            x: positionRef.current.x,
            y: positionRef.current.y,
            width: positionRef.current.width,
            height: positionRef.current.height
          });
        }
      }

      setIsDragging(false);
      setIsResizing(false);

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    isDragging,
    isResizing,
    window.id,
    window.state,
    window.position,
    dragOffset,
    windowManager
  ]);

  // Render app content based on app type
  const renderAppContent = () => {
    switch (window.app) {
      case "terminal":
        return <Terminal />;
      case "file-manager":
        return <FileManager />;
      case "text-editor":
        return <TextEditor {...window.props} />;
      case "network-scanner":
        return <NetworkScanner />;
      case "system-monitor":
        return <SystemMonitor />;
      case "control-panel":
        return <ControlPanel />;
      case "black-market":
        return <BlackMarketShop />;
      case "settings":
        return <ControlPanel />;
      case "mailware":
        return <Mailware />;
      case "security-dashboard":
        return <SecurityDashboard />;
      case "animation-demo":
        return <AnimationDemo />;
      case "social-feed":
        return <SocialFeed />;
      case "device-control":
        return <DeviceControl />;
      case "browser":
        return <Browser {...window.props} />;
      default:
        return <div className="p-4 text-white">App not implemented yet</div>;
    }
  };

  return (
    <div
      ref={windowRef}
      className={`window absolute bg-window rounded overflow-hidden shadow-lg ${
        window.isActive
          ? "border border-accent border-opacity-50"
          : "border border-gray-700"
      } ${window.state === "minimized" ? "pointer-events-none" : ""}`}
      style={getWindowStyle()}
      onClick={handleWindowClick}
      data-app={window.app}
      data-window-id={window.id}
    >
      {/* Window Header */}
      <div
        className="window-header bg-header h-8 flex items-center justify-between px-2 cursor-move"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center">
          <i className={`fa ${window.icon} text-sm mr-2`}></i>
          <span className="text-sm font-medium">{window.title}</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="window-minimize h-4 w-4 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              windowManager.minimizeWindow(window.id);
            }}
          >
            <i className="fa fa-minus text-[8px] text-yellow-800 opacity-0 hover:opacity-100"></i>
          </button>
          <button
            className="window-maximize h-4 w-4 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              windowManager.toggleMaximize(window.id);
            }}
          >
            <i
              className={`fa ${
                window.state === "maximized" ? "fa-compress" : "fa-expand"
              } text-[8px] text-green-800 opacity-0 hover:opacity-100`}
            ></i>
          </button>
          <button
            className="window-close h-4 w-4 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              windowManager.closeWindow(window.id);
            }}
          >
            <i className="fa fa-times text-[8px] text-red-800 opacity-0 hover:opacity-100"></i>
          </button>
        </div>
      </div>

      {/* App Content */}
      <div className="app-content" style={{ height: "calc(100% - 32px)" }}>
        {renderAppContent()}
      </div>

      {/* Resize Handle (bottom right corner) */}
      {window.state !== "maximized" && (
        <div
          className="resize-handle absolute w-4 h-4 right-0 bottom-0 cursor-nwse-resize z-50"
          onMouseDown={handleResizeHandleMouseDown}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="fill-current text-gray-600"
          >
            <path
              d="M10.5,1.5 L1.5,10.5 M7.5,1.5 L1.5,7.5 M4.5,1.5 L1.5,4.5 M1.5,1.5 L1.5,1.5"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Window;
