import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiUser, FiPhone, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Loader2, UserPlus, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifySignupOTP, sendSignupOTP, isAuthenticated, isAdmin, isUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect away from signup page
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isAuthenticated && isUser) {
        navigate('/', { replace: true }); // Redirect to home page
      }
    }
  }, [isAuthenticated, isAdmin, isUser, authLoading, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({
        ...formData,
        [name]: formatPhoneNumber(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
    setSuccess(false);
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return false;
    }
    // Email is optional, but if provided, should be valid
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await sendSignupOTP(
        formData.phone,
        formData.name.trim(),
        formData.email.trim() || null
      );

      if (result.success) {
        setSessionId(result.sessionId);
        setOtpSent(true);
        setStep('otp');
        setCountdown(60); // 60 seconds countdown
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        ...(formData.email.trim() && { email: formData.email.trim() }),
      };

      const result = await verifySignupOTP(
        formData.phone,
        otp,
        sessionId,
        userData
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/'); // Redirect to home page
        }, 1500);
      } else {
        setError(result.message || 'Invalid OTP or signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOtp('');
    setOtpSent(false);
    setSessionId(null);
    setCountdown(0);
    setError('');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  // Don't render signup form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Signup Card */}
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
              {step === 'details' ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <MessageSquare className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 'details' ? 'Create Account' : 'Verify OTP'}
            </h2>
            <p className="text-blue-100 text-sm">
              {step === 'details' 
                ? 'Sign up to get started' 
                : `OTP sent to ${formData.phone.slice(0, 5)}****${formData.phone.slice(-2)}`}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {step === 'details' ? (
              <form className="space-y-6" onSubmit={handleSendOTP}>
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                  >
                    <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-dark mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-text-dark mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="text-text-light text-sm mr-1">+91</span>
                      <FiPhone className="text-text-light w-5 h-5" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-20 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Email Field - Optional */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2">
                    Email Address <span className="text-text-light text-xs font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="user@example.com (optional)"
                    />
                  </div>
                  <p className="text-xs text-text-light mt-1">
                    Email is optional. You can add it later in your profile.
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      <span>Send OTP</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyOTP}>
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                  >
                    <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                  >
                    <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">Account created successfully! Redirecting...</span>
                  </motion.div>
                )}

                {otpSent && !success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                  >
                    <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">OTP sent successfully!</span>
                  </motion.div>
                )}

                {/* OTP Field */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-text-dark mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      autoComplete="one-time-code"
                      required
                      value={otp}
                      onChange={handleOTPChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-text-light mt-2">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-text-light">
                    Didn't receive OTP?{' '}
                    {countdown > 0 ? (
                      <span className="text-text-dark font-medium">
                        Resend in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-primary-blue hover:text-primary-blue-light font-semibold transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  whileHover={{ scale: loading || otp.length !== 6 ? 1 : 1.02 }}
                  whileTap={{ scale: loading || otp.length !== 6 ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Verify & Create Account</span>
                  )}
                </motion.button>

                {/* Back to Details */}
                <button
                  type="button"
                  onClick={handleBackToDetails}
                  className="w-full text-sm text-primary-blue hover:text-primary-blue-light font-medium transition-colors"
                >
                  ← Change Details
                </button>
              </form>
            )}

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-center text-text-light">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-blue hover:text-primary-blue-light transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
        >
          <p className="text-xs text-center text-text-light">
            <span className="font-semibold text-text-dark">Secure Signup:</span>{' '}
            We use OTP verification via Twilio. Phone number is required, email is optional.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
