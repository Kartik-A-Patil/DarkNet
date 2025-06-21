import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Password strength levels
enum PasswordStrength {
  NONE = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
}

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.NONE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register, googleLogin, loading } = useAuth();
  const { toast } = useToast();
  
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(PasswordStrength.NONE);
      return;
    }
    
    // Basic strength criteria
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteria = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const metCriteria = criteria.filter(Boolean).length;
    
    if (metCriteria <= 2) {
      setPasswordStrength(PasswordStrength.WEAK);
    } else if (metCriteria <= 4) {
      setPasswordStrength(PasswordStrength.MEDIUM);
    } else {
      setPasswordStrength(PasswordStrength.STRONG);
    }
  }, [password]);
  
  // Form validation
  const validateForm = () => {
    const errors: {
      displayName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;
    
    if (!displayName.trim()) {
      errors.displayName = "Required";
      isValid = false;
    }
    
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
    } else if (password.length < 8) {
      errors.password = "Min 8 characters";
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await register(email, password, displayName);
      toast({
        title: "Account created",
        description: "You've been signed up successfully",
        variant: "default",
      });
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      toast({
        title: "Signup failed",
        description: errorMessage || "Could not create account",
        variant: "destructive",
      });
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
        title: "Google signup failed",
        description: error.message || "Could not sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get strength indicator color
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case PasswordStrength.WEAK: return 'bg-red-500';
      case PasswordStrength.MEDIUM: return 'bg-yellow-500';
      case PasswordStrength.STRONG: return 'bg-green-500';
      default: return 'bg-gray-700';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="displayName" className="sr-only">Display Name</label>
        <input
          id="displayName"
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            if (formErrors.displayName) setFormErrors({...formErrors, displayName: undefined});
          }}
          className={`w-full px-3 py-2 bg-gray-800/70 border ${
            formErrors.displayName ? 'border-red-500' : 'border-gray-700/50'
          } rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/70`}
          disabled={isSubmitting || loading}
        />
        {formErrors.displayName && (
          <p className="text-red-400 text-xs mt-0.5">{formErrors.displayName}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="sr-only">Email Address</label>
        <input
          id="email"
          type="email"
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
        {password && (
          <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3].map((segment) => (
              <div 
                key={segment}
                className={`h-1 flex-1 rounded-sm ${
                  passwordStrength >= segment ? getPasswordStrengthColor() : 'bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
        )}
        {formErrors.password && (
          <p className="text-red-400 text-xs mt-0.5">{formErrors.password}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formErrors.confirmPassword) setFormErrors({...formErrors, confirmPassword: undefined});
          }}
          className={`w-full px-3 py-2 bg-gray-800/70 border ${
            formErrors.confirmPassword ? 'border-red-500' : 'border-gray-700/50'
          } rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/70`}
          disabled={isSubmitting || loading}
        />
        {formErrors.confirmPassword && (
          <p className="text-red-400 text-xs mt-0.5">{formErrors.confirmPassword}</p>
        )}
      </div>
      
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting || loading || passwordStrength < PasswordStrength.MEDIUM}
        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting || loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        ) : "Create Account"}
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
    </form>
  );
};

export default SignupForm;
