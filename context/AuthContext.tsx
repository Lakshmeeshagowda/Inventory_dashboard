
import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: string | null;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyLoginOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  requestOtp: async () => ({ success: false, message: '' }),
  verifyLoginOtp: async () => false,
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
  
  const requestOtp = useCallback(async (phone: string) => {
    const response = await api.auth.sendOtp(phone);
    if (response.success && response.otp) {
        showToast(`DEMO SMS: Your OTP is ${response.otp}`, 'info');
    } else if (!response.success) {
        showToast(response.message, 'error');
    }
    return { success: response.success, message: response.message };
  }, [showToast]);

  const verifyLoginOtp = useCallback(async (phone: string, otp: string) => {
    const response = await api.auth.verifyOtp(phone, otp);
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(phone); // Update UI state immediately
      showToast('Login Successful', 'success');
      return true;
    } else {
      showToast('Invalid OTP. Please try again.', 'error');
    }
    return false;
  }, [showToast]);

  const logout = useCallback(() => {
    api.auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    isAuthenticated,
    currentUser,
    requestOtp,
    verifyLoginOtp,
    logout,
  }), [isAuthenticated, currentUser, requestOtp, verifyLoginOtp, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
