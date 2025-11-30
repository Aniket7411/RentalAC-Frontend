import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, X, AlertCircle } from 'lucide-react';

const LoginPromptModal = ({ isOpen, onClose, message = "Please login first, then you will be able to place order", redirectDelay = 3000 }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(redirectDelay / 1000);

  useEffect(() => {
    if (!isOpen) return;

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after delay
    const redirectTimer = setTimeout(() => {
      navigate('/login');
      onClose();
    }, redirectDelay);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [isOpen, navigate, redirectDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectDelay / 1000);
    }
  }, [isOpen, redirectDelay]);

  const handleLoginNow = () => {
    navigate('/login');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-primary-blue" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Login Required
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Countdown */}
              <div className="text-center mb-6">
                <p className="text-xs sm:text-sm text-gray-500">
                  Redirecting to login page in{' '}
                  <span className="font-bold text-primary-blue">{countdown}</span> seconds
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLoginNow}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-light transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Login Now
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;

