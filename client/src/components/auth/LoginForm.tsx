import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Maximum allowed login attempts before temporary lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 60000; // 1 minute in milliseconds

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const { login, googleLogin, anonymousLogin, loading } = useAuth();
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (!lockedUntil) return;
    
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      
      if (remaining <= 0) {
        setLockedUntil(null);
        setLoginAttempts(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockedUntil]);
  
  // Form validation
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    let isValid = true;
    
    if (!email) {
      errors.email = "Required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email";
      isValid = false;
    }
    
    if (!password) {
      errors.password = "Required";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockedUntil && lockedUntil > Date.now()) return;
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      setLoginAttempts(0);
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_TIME;
        setLockedUntil(lockTime);
        setCountdown(LOCKOUT_TIME / 1000);
        
        toast({
          title: "Account locked",
          description: `Too many attempts. Try again in ${LOCKOUT_TIME/1000}s.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await googleLogin();
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setIsSubmitting(true);
      await anonymousLogin();
      toast({
        title: "Success",
        description: "Signed in anonymously",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Anonymous login failed",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Account is locked
  if (lockedUntil && lockedUntil > Date.now()) {
    return (
      <div className="text-center p-3 border border-red-500/20 rounded bg-red-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <h3 className="text-red-400 text-sm font-medium mt-1">Account temporarily locked</h3>
        <p className="text-gray-300 font-mono text-sm mt-1">Try again in {countdown}s</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="email" className="sr-only">Email Address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formErrors.email) setFormErrors({...formErrors, email: undefined});
          }}
          className={`w-full px-3 py-2 bg-gray-800/70 border ${
            formErrors.email ? 'border-red-500' : 'border-gray-700/50'
          } rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/70`}
          disabled={isSubmitting || loading}
        />
        {formErrors.email && (
          <p className="text-red-400 text-xs mt-0.5">{formErrors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (formErrors.password) setFormErrors({...formErrors, password: undefined});
          }}
          className={`w-full px-3 py-2 bg-gray-800/70 border ${
            formErrors.password ? 'border-red-500' : 'border-gray-700/50'
          } rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/70`}
          disabled={isSubmitting || loading}
        />
        {formErrors.password && (
          <p className="text-red-400 text-xs mt-0.5">{formErrors.password}</p>
        )}
      </div>
      
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting || loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : "Sign In"}
      </motion.button>
      
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-gray-900/50 text-gray-500 text-xs">or</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting || loading}
        className="w-full flex items-center justify-center py-1.5 px-3 bg-gray-800/50 hover:bg-gray-700/70 text-white text-sm rounded border border-gray-700/30 focus:outline-none focus:ring-1 focus:ring-gray-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
          />
        </svg>
        Google
      </button>
      
      <button
        type="button"
        onClick={handleAnonymousLogin}
        disabled={isSubmitting || loading}
        className="w-full flex items-center justify-center py-1.5 px-3 bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 text-sm rounded border border-gray-600/30 focus:outline-none focus:ring-1 focus:ring-gray-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Continue Anonymously
      </button>
    </form>
  );
};

export default LoginForm;
