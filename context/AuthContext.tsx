
import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyLoginOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  requestOtp: async () => ({ success: false, message: '' }),
  verifyLoginOtp: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if a valid token exists in the "Database" (localStorage) on mount
    setIsAuthenticated(api.auth.isAuthenticated());
  }, []);
  
  const requestOtp = useCallback(async (phone: string) => {
    const response = await api.auth.sendOtp(phone);
    if (response.success && response.otp) {
        // In a real app, this toast wouldn't exist, the user would get an SMS.
        // For this demo, we show the OTP in a Toast notification.
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
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    isAuthenticated,
    requestOtp,
    verifyLoginOtp,
    logout,
  }), [isAuthenticated, requestOtp, verifyLoginOtp, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
