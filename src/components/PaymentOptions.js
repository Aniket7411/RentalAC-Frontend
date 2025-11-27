import React, { useState } from 'react';
import { FiCreditCard, FiDollarSign, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PaymentOptions = ({ totalAmount, onPaymentSelect, selectedOption, setSelectedOption }) => {
  const [error, setError] = useState('');

  const fullPaymentAmount = totalAmount * 0.95; // 5% discount
  const advanceAmount = 999;
  const remainingAmount = totalAmount - advanceAmount;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setError('');
    if (onPaymentSelect) {
      onPaymentSelect(option);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-text-dark mb-4">Payment Options</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Full Payment Option */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOptionSelect('full')}
        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
          selectedOption === 'full'
            ? 'border-primary-blue bg-blue-50'
            : 'border-gray-200 hover:border-primary-blue/50'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selectedOption === 'full' ? 'border-primary-blue bg-primary-blue' : 'border-gray-300'
          }`}>
            {selectedOption === 'full' && (
              <FiCheckCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FiDollarSign className="w-5 h-5 text-primary-blue" />
              <h4 className="font-semibold text-text-dark">Pay Full Amount</h4>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                5% OFF
              </span>
            </div>
            <p className="text-sm text-text-light mb-2">
              Pay the complete amount upfront and get a 5% discount
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-primary-blue">
                ₹{fullPaymentAmount.toLocaleString()}
              </span>
              <span className="text-sm text-text-light line-through">
                ₹{totalAmount.toLocaleString()}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                Save ₹{(totalAmount - fullPaymentAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advance Payment Option */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOptionSelect('advance')}
        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
          selectedOption === 'advance'
            ? 'border-primary-blue bg-blue-50'
            : 'border-gray-200 hover:border-primary-blue/50'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selectedOption === 'advance' ? 'border-primary-blue bg-primary-blue' : 'border-gray-300'
          }`}>
            {selectedOption === 'advance' && (
              <FiCheckCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FiCreditCard className="w-5 h-5 text-primary-blue" />
              <h4 className="font-semibold text-text-dark">Pay ₹999 Advance</h4>
            </div>
            <p className="text-sm text-text-light mb-2">
              Pay ₹999 now and the remaining amount after installation
            </p>
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm text-text-light">Advance Payment:</span>
                <span className="text-lg font-bold text-primary-blue">
                  ₹{advanceAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-sm text-text-light">Remaining (after installation):</span>
                <span className="text-lg font-bold text-text-dark">
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline space-x-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-text-dark">Total Amount:</span>
                <span className="text-lg font-bold text-primary-blue">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {selectedOption && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            {selectedOption === 'full' 
              ? `You will pay ₹${fullPaymentAmount.toLocaleString()} now and save ₹${(totalAmount - fullPaymentAmount).toLocaleString()}.`
              : `You will pay ₹${advanceAmount.toLocaleString()} now and ₹${remainingAmount.toLocaleString()} after installation.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;

