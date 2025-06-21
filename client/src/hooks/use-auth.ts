import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  User
} from 'firebase/auth';
import { auth } from '@/firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Register new user with email and password
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      return userCredential.user;
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Failed to create an account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const googleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      setError('');
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login anonymously
  const anonymousLogin = async () => {
    setLoading(true);
    try {
      setError('');
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (err: any) {
      console.error("Anonymous login error:", err);
      setError(err.message || 'Failed to sign in anonymously');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || 'Failed to log out');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    user,
    loading,
    error,
    register,
    login,
    googleLogin,
    anonymousLogin,
    logout
  };
}