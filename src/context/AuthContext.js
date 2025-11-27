import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Single login endpoint that auto-detects admin or user
      const response = await apiService.login(email, password);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during login. Please try again.'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiService.userSignup(userData);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during signup. Please try again.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiService.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    signup,
    forgotPassword,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
