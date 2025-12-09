import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiTrash2, FiAlertCircle, FiCheckCircle, FiEdit2, FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiPackage, FiZap, FiInfo } from 'react-icons/fi';
import { Wrench, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import ServiceBookingModal from '../../components/ServiceBookingModal';
import LoginPromptModal from '../../components/LoginPromptModal';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateCartItem, calculateTotals, getPaymentBenefits, updateServiceBookingDetails } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();
  const totals = calculateTotals();
  const paymentBenefits = getPaymentBenefits();

  // Cart is now accessible without login
  // Login will be required at checkout

  // Force reload cart when cartItems change (from context)
  useEffect(() => {
    // This ensures the component re-renders when cart updates
  }, [cartItems]);

  const handleEditService = (item) => {
    setEditingService(item);
  };

  const handleServiceBookingUpdate = async (bookingData) => {
    try {
      updateServiceBookingDetails(editingService.id, {
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.address,
        addressType: bookingData.addressType,
        contactName: bookingData.contactName,
        contactPhone: bookingData.contactPhone,
        paymentOption: bookingData.paymentOption,
      });
      setEditingService(null);
      showSuccess('Service booking details updated');
    } catch (error) {
      showError('Failed to update booking details');
    }
  };

  const handleCheckout = () => {
    // Require login for checkout
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    // Navigate to checkout page
    navigate('/checkout');
  };

  const formatTimeSlot = (time) => {
    const timeMap = {
      '10-12': '10 AM - 12 PM',
      '12-2': '12 PM - 2 PM',
      '2-4': '2 PM - 4 PM',
      '4-6': '4 PM - 6 PM',
      '6-8': '6 PM - 8 PM',
    };
    return timeMap[time] || time;
  };

  // Filter items by cart item type (rental or service)
  // Note: item.type should be 'rental' or 'service' (cart item type)
  // item.productType would be 'Split', 'Window', etc. (product type)
  // Handle both new format (type='rental'/'service') and old format (type='Split', etc.)
  const rentals = cartItems.filter(item => {
    // Check if it's explicitly marked as rental
    if (item.type === 'rental') return true;
    // If type is not 'rental' or 'service', and has product fields, it's likely a rental
    // (old format where type was product type like "Split" instead of cart item type)
    // Common product types: Split, Window, Portable, etc.
    const isProductType = item.type &&
      ['Split', 'Window', 'Portable', 'Central', 'Cassette', 'Ducted'].includes(item.type);
    if (isProductType || (item.type !== 'service' && (item.brand || item.productId || item.name || item.model || item.price))) {
      return true;
    }
    return false;
  });
  const services = cartItems.filter(item => {
    // Check if it's explicitly marked as service
    if (item.type === 'service') return true;
    // If it has service-specific fields, it's a service
    if (item.serviceId || item.serviceTitle || item.servicePrice) return true;
    return false;
  });

  // Debug: Log cart items to console (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Cart Items:', cartItems);
      console.log('Rentals:', rentals);
      console.log('Services:', services);
      console.log('Cart from localStorage:', JSON.parse(localStorage.getItem('cart') || '[]'));
    }
  }, [cartItems, rentals, services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">Shopping Cart</h1>
          <p className="text-text-light">Review your items and proceed to checkout</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg mb-4 text-xs">
            <strong>Debug Info:</strong> Total items: {cartItems.length} | Rentals: {rentals.length} | Services: {services.length}
            {cartItems.length > 0 && (
              <div className="mt-2">
                <strong>Cart Items:</strong>
                <pre className="text-xs mt-1 overflow-auto max-h-32">{JSON.stringify(cartItems, null, 2)}</pre>
              </div>
            )}
          </div>
        )} */}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Your cart is empty</h2>
            <p className="text-text-light mb-6">Add some products or services to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/browse"
                className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
              >
                Browse Products
              </Link>
              <Link
                to="/service-request"
                className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition-all font-semibold"
              >
                Browse Services
              </Link>
            </div>
          </div>
        ) : rentals.length === 0 && services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiShoppingCart className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Cart items detected but not displaying</h2>
            <p className="text-text-light mb-4">
              We found {cartItems.length} item(s) in your cart, but they couldn't be displayed properly.
            </p>
            <p className="text-sm text-text-light mb-6">
              Please try refreshing the page or adding items again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
              >
                Refresh Page
              </button>
              <Link
                to="/browse"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Rental Products */}
              {rentals.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-text-dark mb-4">
                    Rental Products ({rentals.length})
                  </h2>
                  {rentals.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row gap-0">
                        {/* Product Image - Enhanced */}
                        <Link to={`/ac/${item.id}`} className="flex-shrink-0 relative group">
                          <div className="relative w-full sm:w-48 h-48 sm:h-full bg-gradient-to-br from-gray-50 to-gray-100">
                            <img
                              src={item.images?.[0] || 'https://via.placeholder.com/200'}
                              alt={item.name || `${item.brand} ${item.model}`}
                              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200';
                              }}
                            />
                            {item.images && item.images.length > 1 && (
                              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                +{item.images.length - 1}
                              </div>
                            )}
                            {item.status && (
                              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md ${item.status === 'Available' ? 'bg-green-500 text-white' :
                                item.status === 'Rented Out' ? 'bg-red-500 text-white' :
                                  'bg-yellow-500 text-white'
                                }`}>
                                {item.status}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Details - Enhanced */}
                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Link to={`/ac/${item.id}`} className="flex-1 group">
                              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-blue transition-colors">
                                {item.brand} {item.model || item.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {item.category && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                                    <FiPackage className="w-3 h-3" />
                                    {item.category}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="inline-flex items-center gap-1 text-gray-500">
                                    <FiMapPin className="w-3.5 h-3.5" />
                                    {item.location}
                                  </span>
                                )}
                              </div>
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove from cart"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Product Specifications */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {item.capacity && (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                {item.capacity}
                              </span>
                            )}
                            {item.productType && (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                {item.productType}
                              </span>
                            )}
                          </div>

                          {/* Rental Duration Selection - Range Slider */}
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                              <label className="block text-sm font-semibold text-gray-900">
                                Choose Tenure <span className="text-red-500">*</span>
                              </label>
                              <div className="relative group">
                                <FiInfo className="w-4 h-4 text-blue-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                  Select rental duration
                                </div>
                              </div>
                            </div>

                            {/* Range Slider */}
                            <div className="mb-4">
                              <div className="relative">
                                <input
                                  type="range"
                                  min="0"
                                  max="5"
                                  step="1"
                                  value={(() => {
                                    // Ensure selectedDuration is a number
                                    let duration = item.selectedDuration;
                                    if (typeof duration === 'string') {
                                      duration = parseInt(duration, 10);
                                    }
                                    const tenureOptions = [3, 6, 9, 11, 12, 24];
                                    const index = tenureOptions.indexOf(duration);
                                    return index >= 0 ? index : 0; // Default to 0 (3 months) if not found
                                  })()}
                                  onChange={(e) => {
                                    const index = Number(e.target.value);
                                    const tenureOptions = [3, 6, 9, 11, 12, 24];
                                    updateCartItem(item.id, { selectedDuration: tenureOptions[index] });
                                  }}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                  style={{
                                    background: (() => {
                                      // Ensure selectedDuration is a number
                                      let duration = item.selectedDuration;
                                      if (typeof duration === 'string') {
                                        duration = parseInt(duration, 10);
                                      }
                                      const tenureOptions = [3, 6, 9, 11, 12, 24];
                                      const index = tenureOptions.indexOf(duration);
                                      const sliderIndex = index >= 0 ? index : 0;
                                      return `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderIndex / 5) * 100}%, #e5e7eb ${(sliderIndex / 5) * 100}%, #e5e7eb 100%)`;
                                    })()
                                  }}
                                />
                                <div className="flex justify-between mt-3">
                                  {[3, 6, 9, 11, 12, 24].map((option) => {
                                    // Ensure selectedDuration is a number for comparison
                                    let duration = item.selectedDuration;
                                    if (typeof duration === 'string') {
                                      duration = parseInt(duration, 10);
                                    }
                                    const isSelected = (duration || 3) === option;
                                    return (
                                      <div key={option} className="flex flex-col items-center">
                                        <div
                                          className={`w-1 h-4 ${isSelected ? 'bg-primary-blue' : 'bg-gray-400'}`}
                                        />
                                        <span className={`text-xs mt-1.5 font-medium ${isSelected ? 'font-bold text-primary-blue' : 'text-gray-600'}`}>
                                          {option}
                                        </span>
                                        {item?.price && item.price[option] && (
                                          <span className={`text-xs mt-0.5 ${isSelected ? 'text-primary-blue font-semibold' : 'text-gray-500'}`}>
                                            ₹{item.price[option].toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Selected Price Display */}
                            {item?.price && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Rental Price</span>
                                    <span className="text-base font-semibold text-gray-900">
                                      ₹{(() => {
                                        // Ensure selectedDuration is a number
                                        let duration = item.selectedDuration;
                                        if (typeof duration === 'string') {
                                          duration = parseInt(duration, 10);
                                        }
                                        return ((item.price[duration || 3] || item.price[3] || 0)).toLocaleString();
                                      })()}
                                    </span>
                                  </div>
                                  {item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0 && (
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <span className="text-sm font-medium text-gray-600 inline-flex items-center gap-1.5">
                                        <FiZap className="w-4 h-4 text-blue-600" />
                                        Installation
                                      </span>
                                      <span className="text-base font-semibold text-blue-600">
                                        ₹{item.installationCharges.amount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between pt-2 border-t-2 border-gray-300">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-primary-blue">
                                      ₹{(() => {
                                        // Ensure selectedDuration is a number
                                        let duration = item.selectedDuration;
                                        if (typeof duration === 'string') {
                                          duration = parseInt(duration, 10);
                                        }
                                        const rentalPrice = (item.price[duration || 3] || item.price[3] || 0);
                                        const installationCharge = (item.category === 'AC' && item.installationCharges && item.installationCharges.amount)
                                          ? item.installationCharges.amount
                                          : 0;
                                        return (rentalPrice + installationCharge).toLocaleString();
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2.5">
                                  For {(() => {
                                    // Ensure selectedDuration is a number
                                    let duration = item.selectedDuration;
                                    if (typeof duration === 'string') {
                                      duration = parseInt(duration, 10);
                                    }
                                    return duration || 3;
                                  })()} months rental
                                  {item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0 && ' + installation'}
                                </p>
                              </div>
                            )}
                            {item.discount > 0 && (
                              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                                <FiCheckCircle className="w-4 h-4" />
                                {item.discount}% discount available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Services */}
              {services.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-text-dark mb-4">
                    Services ({services.length})
                  </h2>
                  {services.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border-l-4 border-sky-500 hover:shadow-md transition-shadow duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Service Image */}
                        <div className="flex-shrink-0">
                          {item.serviceImage ? (
                            <img
                              src={item.serviceImage}
                              alt={item.serviceTitle}
                              className="w-full sm:w-32 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          ) : (
                            <div className="w-full sm:w-32 h-32 bg-sky-100 rounded-lg flex items-center justify-center">
                              <Wrench className="w-12 h-12 text-sky-500" />
                            </div>
                          )}
                        </div>

                        {/* Service Details */}
                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {item.serviceTitle}
                              </h3>
                              <p className="text-2xl font-bold text-sky-600 mb-4">
                                ₹{(item.servicePrice || 0).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Booking Details */}
                          {item.bookingDetails && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2.5 mb-4 border border-gray-200">
                              {item.bookingDetails.date && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <FiCalendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-text-light">Date:</span>
                                  <span className="font-medium text-text-dark">
                                    {new Date(item.bookingDetails.date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.bookingDetails.time && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <FiClock className="w-4 h-4 text-gray-500" />
                                  <span className="text-text-light">Time:</span>
                                  <span className="font-medium text-text-dark">
                                    {formatTimeSlot(item.bookingDetails.time)}
                                  </span>
                                </div>
                              )}
                              {item.bookingDetails.address && (
                                <div className="flex items-start space-x-2 text-sm">
                                  <FiMapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                  <div>
                                    <span className="text-text-light">Address: </span>
                                    <span className="font-medium text-text-dark">
                                      {item.bookingDetails.address.substring(0, 60)}
                                      {item.bookingDetails.address.length > 60 ? '...' : ''}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {item.bookingDetails.contactName && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <FiUser className="w-4 h-4 text-gray-500" />
                                  <span className="text-text-light">Contact:</span>
                                  <span className="font-medium text-text-dark">
                                    {item.bookingDetails.contactName}
                                  </span>
                                </div>
                              )}
                              {item.bookingDetails.paymentOption && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-text-light">Payment:</span>
                                  <span className={`font-medium px-2 py-1 rounded ${item.bookingDetails.paymentOption === 'payNow'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {item.bookingDetails.paymentOption === 'payNow' ? 'Pay Now' : 'Pay Later'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => handleEditService(item)}
                            className="flex items-center space-x-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            <span>Edit Booking Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Payment Benefits Info */}
                <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    Payment Benefits
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="bg-white/60 rounded-lg p-2.5">
                      <span className="font-semibold text-green-700">Pay Now:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-gray-600 space-y-0.5">
                        {paymentBenefits.payNow.benefits.slice(0, 2).map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5">
                      <span className="font-semibold text-blue-700">Pay Later:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-gray-600 space-y-0.5">
                        {paymentBenefits.payLater.benefits.slice(0, 2).map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {totals.rentalTotal > 0 && (
                    <>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Rentals ({totals.rentalCount})</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{(() => {
                            const rentalTotalWithoutInstallation = rentals.reduce((total, item) => {
                              // Ensure selectedDuration is a number
                              let duration = item.selectedDuration;
                              if (typeof duration === 'string') {
                                duration = parseInt(duration, 10);
                              }
                              const selectedDuration = duration || 3;
                              const price = item.price && typeof item.price === 'object'
                                ? (item.price[selectedDuration] || item.price[3] || 0)
                                : (item.price || 0);
                              return total + price;
                            }, 0);
                            return rentalTotalWithoutInstallation.toLocaleString();
                          })()}
                        </span>
                      </div>
                      {/* Installation Charges */}
                      {rentals.some(item => item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0) && (
                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-600 inline-flex items-center gap-1.5">
                            <FiZap className="w-3.5 h-3.5 text-blue-600" />
                            Installation
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            ₹{(() => {
                              const installationTotal = rentals.reduce((total, item) => {
                                if (item.category === 'AC' && item.installationCharges && item.installationCharges.amount) {
                                  return total + item.installationCharges.amount;
                                }
                                return total;
                              }, 0);
                              return installationTotal.toLocaleString();
                            })()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {totals.serviceTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Services ({totals.serviceCount})</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{totals.serviceTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-blue">
                      ₹{totals.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white rounded-xl hover:shadow-lg transition-all font-bold shadow-md shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/browse"
                  className="block text-center mt-4 text-sm text-primary-blue hover:text-primary-blue-light transition-colors font-medium"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Service Booking Edit Modal */}
        {editingService && (
          <ServiceBookingModal
            service={{
              _id: editingService.serviceId,
              id: editingService.serviceId,
              title: editingService.serviceTitle,
              price: editingService.servicePrice,
              description: editingService.serviceDescription,
              image: editingService.serviceImage,
            }}
            isOpen={!!editingService}
            onClose={() => setEditingService(null)}
            onSubmit={handleServiceBookingUpdate}
            initialData={editingService.bookingDetails}
          />
        )}

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message="Please login first, then you will be able to place order"
          redirectDelay={3000}
        />
      </div>
    </div>
  );
};

export default Cart;
