import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FiAlertCircle, FiCheckCircle, FiArrowLeft, FiLock } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, formData.password);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(result.message || 'Failed to reset password. The link may have expired. Please request a new one.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light px-8 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4"
            >
              <FiLock className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-blue-100 text-sm">Enter your new password below</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {error && !success && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm mb-6"
              >
                <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">Password Reset Successful!</span>
                </div>
                <p className="text-sm">
                  Your password has been reset successfully. Redirecting to login...
                </p>
              </motion.div>
            )}

            {!success && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-2">
                    New Password
                  </label>
                  <PasswordInput
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    name="password"
                    className="px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-dark mb-2">
                    Confirm Password
                  </label>
                  <PasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    name="confirmPassword"
                    className="px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || !token}
                  whileHover={{ scale: loading || !token ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !token ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.button>
              </form>
            )}

            {/* Back to Login Link */}
            {!success && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-sm font-medium text-primary-blue hover:text-primary-blue-light transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            )}

            {/* Request New Reset Link */}
            {error && error.includes('expired') && (
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-blue hover:text-primary-blue-light transition-colors"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;

