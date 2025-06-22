import React, { useState, useEffect } from 'react';
import { Device } from '../../types';

interface CameraInterfaceProps {
  device: Device;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ device, onUpdateDevice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const config = device.config || {};

  // Simulate motion detection
  useEffect(() => {
    if (config.motionDetection && device.status === 'online') {
      const interval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance of motion
          setMotionDetected(true);
          setTimeout(() => setMotionDetected(false), 3000);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [config.motionDetection, device.status]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  const handleToggleMotionDetection = () => {
    onUpdateDevice(device.id, {
      config: {
        ...config,
        motionDetection: !config.motionDetection
      }
    });
  };

  const handleResolutionChange = (resolution: string) => {
    onUpdateDevice(device.id, {
      config: {
        ...config,
        resolution
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="camera-interface p-6 bg-gray-900 text-white">
      <h3 className="text-xl font-bold text-green-400 mb-6">SECURITY CAMERA CONTROL</h3>

      {/* Video Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative border-2 border-gray-700">
          {device.status === 'online' ? (
            <>
              <div className="text-center">
                <i className="fa fa-video text-6xl text-gray-600 mb-4"></i>
                <div className="text-gray-400">Live Stream</div>
                <div className="text-sm text-gray-500">{config.resolution || '1920x1080'}</div>
              </div>
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">REC {formatTime(recordingTime)}</span>
                </div>
              )}
              
              {/* Motion indicator */}
              {motionDetected && config.motionDetection && (
                <div className="absolute top-4 right-4 bg-yellow-600 px-3 py-1 rounded-full animate-pulse">
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  MOTION
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <i className="fa fa-video-slash text-6xl mb-4"></i>
              <div>Camera Offline</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">Recording Controls</h4>
            <div className="space-y-3">
              <button
                onClick={handleToggleRecording}
                disabled={device.status !== 'online'}
                className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
                }`}
              >
                <i className={`fa ${isRecording ? 'fa-stop' : 'fa-play'}`}></i>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              
              <div className="flex justify-between text-sm">
                <span>Auto Recording:</span>
                <span className={config.recordingEnabled ? 'text-green-400' : 'text-red-400'}>
                  {config.recordingEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">Motion Detection</h4>
            <div className="space-y-3">
              <button
                onClick={handleToggleMotionDetection}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-3 ${
                  config.motionDetection
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <i className={`fa ${config.motionDetection ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                {config.motionDetection ? 'Motion Detection ON' : 'Motion Detection OFF'}
              </button>
              
              {motionDetected && (
                <div className="bg-yellow-900 border border-yellow-600 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <i className="fa fa-exclamation-triangle"></i>
                    <span className="font-semibold">Motion Detected!</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Timestamp: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Resolution:</label>
                <select
                  value={config.resolution || '1920x1080'}
                  onChange={(e) => handleResolutionChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                >
                  <option value="640x480">640x480 (VGA)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="2560x1440">2560x1440 (2K)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Camera Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-signal text-2xl text-blue-400 mb-2"></i>
            <div className="text-sm text-gray-300">Signal</div>
            <div className="font-semibold">Strong</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-thermometer-half text-2xl text-green-400 mb-2"></i>
            <div className="text-sm text-gray-300">Temperature</div>
            <div className="font-semibold">45°C</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-hdd text-2xl text-yellow-400 mb-2"></i>
            <div className="text-sm text-gray-300">Storage</div>
            <div className="font-semibold">78%</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-clock text-2xl text-purple-400 mb-2"></i>
            <div className="text-sm text-gray-300">Uptime</div>
            <div className="font-semibold">{device.uptime || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraInterface;
