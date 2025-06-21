import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  
  const { anonymousLogin } = useAuth();
  const { toast } = useToast();
  
  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const currentTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
  const handleAnonymousAccess = async () => {
    setIsAnonymousLoading(true);
    try {
      await anonymousLogin();
      toast({
        title: "Anonymous Access",
        description: "Entering system in anonymous mode",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Anonymous access failed",
        variant: "destructive",
      });
    } finally {
      setIsAnonymousLoading(false);
    }
  };
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Dark overlay radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(25,25,30,0)_0%,_rgba(0,0,0,0.6)_100%)]" />
      
      {/* Grid pattern for background texture */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(100,100,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px' 
        }} 
      />
      
      {/* Time display */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-12 pointer-events-none flex flex-col items-center"
      >
        <h1 className="text-6xl font-light text-white tracking-tight mb-1 monospace">{currentTime}</h1>
        <p className="text-xs font-normal text-gray-400 uppercase tracking-wider">{currentDate}</p>
      </motion.div>
      
      {/* Auth container */}
      <div className="w-full max-w-sm z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-lg p-6"
          >
            {/* User icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full border border-gray-700/50 mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-gray-200 text-lg font-normal">
                {isLogin ? "User Login" : "New User"}
              </h2>
            </div>
            
            {isLogin ? <LoginForm /> : <SignupForm />}
            
            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors focus:outline-none"
              >
                {isLogin ? "Create new account" : "Return to login"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Anonymous access button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-6 w-full max-w-sm z-10"
      >
        <button
          onClick={handleAnonymousAccess}
          disabled={isAnonymousLoading}
          className="w-full py-2 px-4 bg-transparent border border-gray-600/40 hover:border-gray-500/60 text-gray-400 hover:text-gray-300 text-xs font-mono rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isAnonymousLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ACCESSING...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ANONYMOUS ACCESS
            </>
          )}
        </button>
      </motion.div>
      
      {/* System info */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <div className="mb-2 flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
          <span className="text-xs text-gray-500 font-mono">System Ready</span>
        </div>
        <p className="text-xs text-gray-700 font-mono">HackOS 1.0 beta</p>
      </div>
    </div>
  );
};

export default AuthScreen;