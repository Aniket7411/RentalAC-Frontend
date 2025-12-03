import React, { useState, useEffect } from 'react';
import { X, Tag, Gift, Percent, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';

const CouponModal = ({ isOpen, onClose }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCoupons();
    }
  }, [isOpen]);

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAvailableCoupons();
      if (response.success) {
        setCoupons(response.data || []);
      } else {
        setError(response.message || 'Failed to load coupons');
      }
    } catch (err) {
      setError('Failed to load coupons. Please try again later.');
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCouponIcon = (index) => {
    const icons = [Gift, Percent, Sparkles];
    return icons[index % icons.length];
  };

  const getCouponColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
    ];
    return colors[index % colors.length];
  };

  const formatDiscount = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    } else {
      return `₹${coupon.value}`;
    }
  };

  const formatValidUntil = (validUntil) => {
    if (!validUntil) return '';
    const date = new Date(validUntil);
    return `Valid till ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white p-4 sm:p-6 rounded-t-2xl flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Tag className="w-6 h-6 sm:w-7 sm:h-7" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Special Offers & Coupons</h2>
                <p className="text-sm text-blue-100">Exclusive deals just for you!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Coupons List */}
          <div className="p-4 sm:p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No coupons available at the moment.</p>
              </div>
            ) : (
              coupons.map((coupon, index) => {
                const Icon = getCouponIcon(index);
                const color = getCouponColor(index);
                return (
                  <motion.div
                    key={coupon._id || coupon.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${color} rounded-xl p-4 sm:p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-white/20 rounded-lg p-2 sm:p-3">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base sm:text-lg">{coupon.title || 'Special Offer'}</h3>
                            <span className="bg-white/30 px-2 py-0.5 rounded text-xs sm:text-sm font-semibold">
                              {formatDiscount(coupon)} OFF
                            </span>
                          </div>
                          <p className="text-sm text-white/90 mb-2">{coupon.description || ''}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-white/20 px-3 py-1 rounded-lg font-mono text-sm sm:text-base font-bold">
                              {coupon.code}
                            </span>
                            {coupon.validUntil && (
                              <span className="text-xs text-white/80">{formatValidUntil(coupon.validUntil)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                💡 Apply these coupons at checkout to save more!
              </p>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold text-sm sm:text-base"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CouponModal;

