import React from 'react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="welcome-screen h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-accent to-blue-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-4 bg-accent rounded-full flex items-center justify-center">
              <i className="fa fa-sitemap text-4xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">DEVICE CONTROL CENTER</h2>
          <p className="text-gray-400 text-lg">Advanced Network Management System</p>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <i className="fa fa-mouse-pointer text-accent"></i>
            <span>Select a device from the sidebar to view details and controls</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <i className="fa fa-radar text-blue-400"></i>
            <span>Use network scan to discover new devices</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <i className="fa fa-eye text-green-400"></i>
            <span>Monitor real-time metrics and network topology</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <div className="text-accent font-bold text-xl">6</div>
            <div className="text-gray-400">Total Devices</div>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <div className="text-green-400 font-bold text-xl">4</div>
            <div className="text-gray-400">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
