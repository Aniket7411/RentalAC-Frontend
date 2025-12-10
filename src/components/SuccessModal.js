import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Sparkles, ArrowRight } from 'lucide-react';

const SuccessModal = ({ isOpen, title = 'Success', message, onClose, confirmText = 'OK', autoRedirectDelay = 5000 }) => {
  const [countdown, setCountdown] = useState(Math.ceil(autoRedirectDelay / 1000));

  useEffect(() => {
    if (!isOpen) {
      setCountdown(Math.ceil(autoRedirectDelay / 1000));
      return;
    }

    // Reset countdown when modal opens
    setCountdown(Math.ceil(autoRedirectDelay / 1000));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close and redirect after delay
    const redirectTimer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, autoRedirectDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [isOpen, autoRedirectDelay, onClose]);

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-green-300"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 animate-pulse" />
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white transition p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto drop-shadow-lg" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-green-400 border-t-transparent rounded-full"
                />
              </div>
            </motion.div>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-800 text-xl font-bold mb-3"
              >
                {message}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-gray-600 text-sm mt-4"
            >
              <span>Redirecting to orders page in</span>
              <span className="font-bold text-green-600 text-lg px-2 py-1 bg-green-100 rounded">
                {countdown}s
              </span>
            </motion.div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md flex items-center gap-2"
            >
              <span>{confirmText}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessModal;


