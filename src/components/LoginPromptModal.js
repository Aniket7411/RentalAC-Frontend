import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, X, AlertCircle } from 'lucide-react';

const LoginPromptModal = ({ isOpen, onClose, message = "Please login first, then you will be able to place order", redirectDelay = 3000 }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(redirectDelay / 1000);

  useEffect(() => {
    if (!isOpen) return;

    // Only set up countdown and redirect if redirectDelay > 0
    if (redirectDelay > 0) {
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
    } else {
      // No auto-redirect, just set countdown to 0
      setCountdown(0);
    }
  }, [isOpen, navigate, redirectDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectDelay > 0 ? redirectDelay / 1000 : 0);
    }
  }, [isOpen, redirectDelay]);

  const handleLoginNow = () => {
    navigate('/login');
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            style={{ touchAction: 'none' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 md:p-8 relative pointer-events-auto my-auto"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary-blue" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Login Required
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                  {message}
                </p>
              </div>

              {/* Countdown - only show if redirectDelay > 0 */}
              {redirectDelay > 0 && (
                <div className="text-center mb-5 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Redirecting to login page in{' '}
                    <span className="font-bold text-primary-blue">{countdown}</span> seconds
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleLoginNow}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-light transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Login Now
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;

