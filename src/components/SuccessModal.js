import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Sparkles } from 'lucide-react';

const SuccessModal = ({ isOpen, title = 'Success', message, onClose, confirmText = 'OK' }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-green-200"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-800 text-lg font-semibold mb-2"
              >
                {message}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-sm mt-2"
            >
              You will be redirected to your orders page shortly...
            </motion.p>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md"
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessModal;


