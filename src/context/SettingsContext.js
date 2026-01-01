import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    instantPaymentDiscount: 10, // Default 10% for Pay Now (instant payment)
    advancePaymentDiscount: 5, // Default 5% for Book Now
    advancePaymentAmount: 500, // Default advance payment amount (configurable by admin)
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.getPublicSettings();
      if (response.success && response.data) {
        setSettings({
          instantPaymentDiscount: response.data.instantPaymentDiscount || 10,
          advancePaymentDiscount: response.data.advancePaymentDiscount || 5,
          advancePaymentAmount: response.data.advancePaymentAmount || 500,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default values
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value = {
    settings,
    loading,
    refreshSettings,
    instantPaymentDiscount: settings.instantPaymentDiscount,
    advancePaymentDiscount: settings.advancePaymentDiscount,
    advancePaymentAmount: settings.advancePaymentAmount,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

