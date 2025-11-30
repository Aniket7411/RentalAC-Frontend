import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId, isLoading }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const commonReasons = [
    'Changed my mind',
    'Found a better deal',
    'Product/service no longer needed',
    'Delivery time too long',
    'Payment issues',
    'Duplicate order',
    'Other'
  ];

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!finalReason.trim()) {
      return;
    }
    onConfirm(finalReason);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={handleClose}
      >
        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg text-left overflow-hidden shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Cancel Order
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Please tell us why you're cancelling this order. This helps us improve our service.
                </p>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a reason
                  </label>
                  <div className="space-y-2">
                    {commonReasons.map((commonReason) => (
                      <label
                        key={commonReason}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={commonReason}
                          checked={selectedReason === commonReason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-700">{commonReason}</span>
                      </label>
                    ))}
                  </div>

                  {selectedReason === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify the reason
                      </label>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Enter your reason for cancellation..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim()) || isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Order
              </button>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CancelOrderModal;

