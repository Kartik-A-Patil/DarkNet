import React, { useEffect } from 'react';
import { OSProvider } from './contexts/OSContext';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import AppMenu from './components/AppMenu';
import { Toaster } from "@/components/ui/toaster";
import AuthScreen from './components/auth/AuthScreen';
import { useAuth } from './hooks/use-auth';
import { motion } from 'framer-motion';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { initializeNetworking } from './core/networking';

function App() {
  const { user, loading } = useAuth();

  // Initialize networking system
  useEffect(() => {
    const networkCore = initializeNetworking();
    console.log('🌐 DarkNet Networking Core initialized:', networkCore.stats);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-white text-lg font-light">Initializing System...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <PerformanceProvider>
      <OSProvider>
        {user ? (
          <div className="h-screen w-screen flex flex-col bg-desktop text-text font-ubuntu">
            <Desktop />
            <Taskbar />
            <AppMenu />
            <Toaster />
          </div>
        ) : (
          <>
            <AuthScreen />
            <Toaster />
          </>
        )}
      </OSProvider>
    </PerformanceProvider>
  );
}

export default App;
