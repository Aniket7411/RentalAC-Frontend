import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { 
  FiZap, 
  FiDroplet, 
  FiTool, 
  FiPackage, 
  FiInfo, 
  FiCalendar, 
  FiDollarSign,
  FiCheckCircle
} from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';

const InstallationChargesModal = ({ isOpen, onClose, onConfirm, installationCharges }) => {
  if (!isOpen || !installationCharges) return null;

  const { amount, includedItems = [], extraMaterialRates = {} } = installationCharges;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Installation Charges
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* What's included section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What's included in the ₹{amount?.toLocaleString() || 0} installation charge?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {includedItems.map((item, index) => {
                    // Determine icon based on item content
                    let Icon = FiPackage;
                    let iconColor = 'text-blue-600';
                    let bgColor = 'bg-blue-50';
                    
                    if (item.toLowerCase().includes('cable') || item.toLowerCase().includes('wire') || item.toLowerCase().includes('plug')) {
                      Icon = FiZap;
                      iconColor = 'text-yellow-600';
                      bgColor = 'bg-yellow-50';
                    } else if (item.toLowerCase().includes('pipe') || item.toLowerCase().includes('drain') || item.toLowerCase().includes('copper')) {
                      Icon = FiDroplet;
                      iconColor = 'text-cyan-600';
                      bgColor = 'bg-cyan-50';
                    } else if (item.toLowerCase().includes('stand') || item.toLowerCase().includes('mounting') || item.toLowerCase().includes('kit')) {
                      Icon = FiTool;
                      iconColor = 'text-purple-600';
                      bgColor = 'bg-purple-50';
                    } else if (item.toLowerCase().includes('condenser') || item.toLowerCase().includes('odu')) {
                      Icon = FiPackage;
                      iconColor = 'text-indigo-600';
                      bgColor = 'bg-indigo-50';
                    }
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border-2 border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:border-primary-blue/30 transition-all hover:shadow-md"
                      >
                        <div className={`w-16 h-16 ${bgColor} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
                          <Icon className={`w-8 h-8 ${iconColor}`} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{item}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Extra material costs */}
              {(extraMaterialRates.copperPipe || extraMaterialRates.drainPipe || extraMaterialRates.electricWire) && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <FiInfo className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      What's the cost if I need extra material?
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {extraMaterialRates.copperPipe > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FiDroplet className="w-5 h-5 text-cyan-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Copper Pipe</p>
                          <p className="text-xs text-gray-500">₹{extraMaterialRates.copperPipe}/meter*</p>
                        </div>
                      </div>
                    )}
                    {extraMaterialRates.drainPipe > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FiDroplet className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Drain Pipe</p>
                          <p className="text-xs text-gray-500">₹{extraMaterialRates.drainPipe}/meter*</p>
                        </div>
                      </div>
                    )}
                    {extraMaterialRates.electricWire > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FiZap className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Electric Wire</p>
                          <p className="text-xs text-gray-500">₹{extraMaterialRates.electricWire}/meter*</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 italic">
                      * Approx charges, actual rates may vary
                    </p>
                  </div>
                </div>
              )}

              {/* Uninstallation fees */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Uninstallation fees
                  </h3>
                </div>
                <div className="flex items-start gap-2 ml-12">
                  <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    The uninstallation fee is covered when you end the subscription.
                  </p>
                </div>
              </div>

              {/* Payment info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FaIndianRupeeSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    When do I pay for the extra materials?
                  </h3>
                </div>
                <div className="flex items-start gap-2 ml-12">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Pay along with your 1st month's rent
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <button
                onClick={onConfirm}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                I understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InstallationChargesModal;

