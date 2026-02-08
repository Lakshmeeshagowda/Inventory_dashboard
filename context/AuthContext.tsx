
import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: string | null;
  signup: (email: string | null, phoneNumber: string | null, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string | null, phoneNumber: string | null, password: string) => Promise<{ success: boolean; message: string }>;
  checkUser: (email: string | null, phoneNumber: string | null) => Promise<{ exists: boolean }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  signup: async () => ({ success: false, message: '' }),
  login: async () => ({ success: false, message: '' }),
  checkUser: async () => ({ exists: false }),
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if a valid token exists on mount
    const isAuth = api.auth.isAuthenticated();
    setIsAuthenticated(isAuth);
    if(isAuth) {
        setCurrentUser(api.auth.getCurrentUser());
    }
  }, []);
  
  const signup = useCallback(async (email: string | null, phoneNumber: string | null, password: string, confirmPassword: string) => {
    const response = await api.auth.signup(email, phoneNumber, password, confirmPassword);
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(api.auth.getCurrentUser());
      showToast('Signup Successful', 'success');
    } else {
      showToast(response.message, 'error');
    }
    return { success: response.success, message: response.message };
  }, [showToast]);

  const login = useCallback(async (email: string | null, phoneNumber: string | null, password: string) => {
    const response = await api.auth.login(email, phoneNumber, password);
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(api.auth.getCurrentUser());
      showToast('Login Successful', 'success');
      return { success: true, message: 'Login Successful' };
    } else {
      showToast(response.message, 'error');
      return { success: false, message: response.message };
    }
  }, [showToast]);

  const checkUser = useCallback(async (email: string | null, phoneNumber: string | null) => {
    return await api.auth.checkUser(email, phoneNumber);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    isAuthenticated,
    currentUser,
    signup,
    login,
    checkUser,
    logout,
  }), [isAuthenticated, currentUser, signup, login, checkUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
