import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Settings, Save, Loader2, AlertCircle, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageSettings = () => {
  const [settings, setSettings] = useState({
    instantPaymentDiscount: 10, // Default 10% for Pay Now
    advancePaymentDiscount: 5, // Default 5% for Pay Advance
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getSettings();
      if (response.success) {
        setSettings({
          instantPaymentDiscount: response.data?.instantPaymentDiscount || 10,
          advancePaymentDiscount: response.data?.advancePaymentDiscount || 5,
        });
      } else {
        // If settings don't exist, use defaults
        setSettings({
          instantPaymentDiscount: 10,
          advancePaymentDiscount: 5,
        });
      }
    } catch (err) {
      // Use defaults if API fails
      setSettings({
        instantPaymentDiscount: 10,
        advancePaymentDiscount: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    // Ensure value is between 0 and 100
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return;
    }
    setSettings(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await apiService.updateSettings(settings);
      if (response.success) {
        success('Settings saved successfully');
        loadSettings(); // Reload to get updated values
      } else {
        showError(response.message || 'Failed to save settings');
      }
    } catch (err) {
      showError('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={containerClasses}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System Settings</p>
          <h1 className="text-3xl font-bold text-text-dark mt-2">Manage Settings</h1>
          <p className="text-text-light mt-1">Configure system-wide settings and preferences.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-primary-blue" />
            <h2 className="text-2xl font-semibold text-text-dark">Payment Settings</h2>
          </div>

          {/* Instant Payment Discount (Pay Now) */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-text-dark mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-5 h-5 text-primary-blue" />
                <span>Instant Payment Discount (Pay Now)</span>
              </div>
              <p className="text-sm text-text-light font-normal mt-1">
                Discount percentage applied when customers choose "Pay Now" option (full payment upfront). 
                This discount is applied to the total order amount.
              </p>
            </label>
            
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.instantPaymentDiscount}
                      onChange={(e) => handleChange('instantPaymentDiscount', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300"
                      placeholder="10"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-light text-lg font-semibold">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Example:</span> If a customer orders ₹10,000 worth of products 
                      and chooses "Pay Now", they will get a discount of ₹{((10000 * settings.instantPaymentDiscount) / 100).toLocaleString()} 
                      (₹{(10000 - (10000 * settings.instantPaymentDiscount) / 100).toLocaleString()} final amount).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-2 text-sm text-text-light">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Current discount: <span className="font-semibold text-primary-blue">{settings.instantPaymentDiscount}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Advance Payment Discount */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-text-dark mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-5 h-5 text-green-600" />
                <span>Advance Payment Discount (Pay Advance)</span>
              </div>
              <p className="text-sm text-text-light font-normal mt-1">
                Discount percentage applied when customers choose "Pay Advance" option (₹999 advance payment). 
                This discount is applied to the total order amount. You can change this based on offers or promotions.
              </p>
            </label>
            
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.advancePaymentDiscount}
                      onChange={(e) => handleChange('advancePaymentDiscount', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-light text-lg font-semibold">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Example:</span> If a customer orders ₹10,000 worth of products 
                      and chooses "Pay Advance", they will get a discount of ₹{((10000 * settings.advancePaymentDiscount) / 100).toLocaleString()} 
                      (₹{(10000 - (10000 * settings.advancePaymentDiscount) / 100).toLocaleString()} final amount).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-2 text-sm text-text-light">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Current discount: <span className="font-semibold text-green-600">{settings.advancePaymentDiscount}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Payment Discounts</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span><strong>Pay Now Discount:</strong> Applied when customers pay the full amount upfront.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span><strong>Pay Advance Discount:</strong> Applied when customers pay ₹999 advance and remaining after installation.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span>Both discounts are calculated on the total order amount (before any coupon discounts).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span>You can adjust these discounts based on offers, promotions, or business needs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span>Changes to these settings will apply to all new orders placed after saving.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold">•</span>
              <span>Existing orders will retain their original discount percentage.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageSettings;

