import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { apiService } from '../../services/api';
import { FiShoppingCart, FiAlertCircle, FiCheckCircle, FiCreditCard, FiClock, FiCalendar, FiMapPin, FiTag } from 'react-icons/fi';
import { Loader2, Wrench, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { Link } from 'react-router-dom';
import LoginPromptModal from '../../components/LoginPromptModal';
import SuccessModal from '../../components/SuccessModal';
import RazorpayPaymentCheckout from '../../components/RazorpayPaymentCheckout';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, calculateTotals, getPaymentBenefits, clearCart } = useCart();
  const { instantPaymentDiscount } = useSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('payLater');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(true);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const totals = calculateTotals();
  const paymentBenefits = getPaymentBenefits();
  
  // Payment discount is applied on subtotal (after product discounts)
  // For Pay Now: use instant payment discount
  // For Pay Advance: use advance payment discount (handled separately)
  const paymentDiscount = selectedPaymentOption === 'payNow' 
    ? totals.subtotal * paymentBenefits.payNow.discount 
    : 0;

  // Calculate coupon discount (applied on subtotal after product discounts)
  const couponDiscount = appliedCoupon ? (() => {
    if (appliedCoupon.type === 'percentage') {
      return totals.subtotal * (appliedCoupon.value / 100);
    } else {
      return appliedCoupon.value; // Fixed amount
    }
  })() : 0;
  
  // Total discount = product discount + payment discount + coupon discount
  const totalDiscount = (totals.productDiscountTotal || 0) + paymentDiscount + couponDiscount;
  
  // Final total = subtotal - payment discount - coupon discount
  // (Product discounts are already applied in subtotal)
  const finalTotal = totals.subtotal - paymentDiscount - couponDiscount;

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && cartItems.length === 0) {
      navigate('/user/cart');
    }
  }, [isAuthenticated, cartItems.length, navigate]);

  // Fetch available coupons
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (!isAuthenticated || cartItems.length === 0) return;

      setLoadingCoupons(true);
      try {
        const orderTotal = totals.subtotal; // Use subtotal (after product discounts) for coupon eligibility
        const response = await apiService.getAvailableCoupons(user?.id, null, orderTotal);
        if (response.success) {
          setAvailableCoupons(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching available coupons:', error);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchAvailableCoupons();
  }, [isAuthenticated, cartItems.length, totals.subtotal, user?.id]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!user) {
      setError('User information is missing. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rentals = cartItems.filter(item => {
        return item.type === 'rental' ||
          (item.type !== 'service' && (item.brand || item.model || item.price));
      });
      const services = cartItems.filter(item => item.type === 'service');

      // Create order for all rentals and services
      if (rentals.length > 0 || services.length > 0) {
        try {
          // Prepare order items with complete information
          const orderItems = [
            ...rentals.map(rental => {
              // Convert duration to number (handle both string and number)
              let selectedDuration = rental.selectedDuration || 3;
              if (typeof selectedDuration === 'string') {
                selectedDuration = parseInt(selectedDuration, 10);
              }
              // Ensure duration is valid (3, 6, 9, 11, 12, or 24)
              if (![3, 6, 9, 11, 12, 24].includes(selectedDuration)) {
                selectedDuration = 3; // Default to 3 months if invalid
              }

              const price = rental.price && typeof rental.price === 'object'
                ? (rental.price[selectedDuration] || rental.price[3] || 0)
                : (rental.price || 0);

              // Get installation charges for AC products
              const installationCharge = (rental.category === 'AC' && rental.installationCharges && rental.installationCharges.amount)
                ? rental.installationCharges.amount
                : 0;

              // Calculate price based on payment type
              let finalPrice = price;
              if (rental.isMonthlyPayment && rental.monthlyPrice && rental.monthlyTenure) {
                // Monthly payment: one month charge + security deposit
                const oneMonthCharge = rental.monthlyPrice;
                const securityDeposit = rental.securityDeposit || 0;
                finalPrice = oneMonthCharge + securityDeposit;
              }

              return {
                type: 'rental',
                productId: rental.id,
                quantity: 1, // Always 1 per product
                price: finalPrice,
                installationCharges: installationCharge, // Include installation charges
                duration: rental.isMonthlyPayment ? rental.monthlyTenure : selectedDuration, // Number: 3, 6, 9, 11, 12, or 24 (or monthly tenure)
                // Monthly payment fields
                isMonthlyPayment: rental.isMonthlyPayment || false,
                monthlyPrice: rental.monthlyPrice || null,
                monthlyTenure: rental.monthlyTenure || null,
                securityDeposit: rental.isMonthlyPayment ? (rental.securityDeposit || 0) : null,
                // Include product details for admin reference
                productDetails: {
                  brand: rental.brand,
                  model: rental.model,
                  capacity: rental.capacity,
                  productType: rental.productType || rental.type,
                  location: rental.location,
                  description: rental.description,
                  images: rental.images || [],
                  installationCharges: rental.installationCharges || null, // Include full installation charges details
                  monthlyPaymentEnabled: rental.monthlyPaymentEnabled || false,
                  monthlyPrice: rental.monthlyPrice || null,
                },
                // Include delivery information for this rental
                deliveryInfo: {
                  address: user?.homeAddress || user?.address?.homeAddress || '',
                  nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
                  pincode: user?.address?.pincode || user?.pincode || '',
                  contactName: user?.name || '',
                  contactPhone: user?.phone || '',
                  alternatePhone: user?.address?.alternateNumber || user?.alternateNumber || '',
                },
              };
            }),
            ...services.map(service => ({
              type: 'service',
              serviceId: service.serviceId,
              quantity: 1, // Always 1 per service
              price: service.servicePrice,
              // Include complete service details for admin reference
              serviceDetails: {
                title: service.serviceTitle,
                description: service.serviceDescription,
                image: service.serviceImage,
              },
              // Include complete booking details
              bookingDetails: {
                name: service.bookingDetails?.name || service.bookingDetails?.contactName || user.name || '',
                phone: service.bookingDetails?.phone || service.bookingDetails?.contactPhone || user.phone || '',
                preferredDate: service.bookingDetails?.preferredDate || service.bookingDetails?.date || '',
                preferredTime: service.bookingDetails?.preferredTime || service.bookingDetails?.time || '',
                address: service.bookingDetails?.address || '',
                addressType: service.bookingDetails?.addressType || 'myself',
                contactName: service.bookingDetails?.contactName || service.bookingDetails?.name || user.name || '',
                contactPhone: service.bookingDetails?.contactPhone || service.bookingDetails?.phone || user.phone || '',
              },
            })),
          ];

          // Generate orderId (format: ORD-YYYY-XXX)
          const generateOrderId = () => {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `ORD-${year}-${random}`;
          };

          // Collect delivery addresses
          const deliveryAddresses = [];

          // Add rental delivery addresses (from user's saved address)
          if (rentals.length > 0) {
            const userAddress = {
              type: 'rental',
              address: user?.homeAddress || user?.address?.homeAddress || '',
              nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
              pincode: user?.address?.pincode || user?.pincode || '',
              contactName: user?.name || '',
              contactPhone: user?.phone || '',
              alternatePhone: user?.address?.alternateNumber || user?.alternateNumber || '',
            };
            // Only add if address exists
            if (userAddress.address) {
              deliveryAddresses.push(userAddress);
            }
          }

          // Add service booking addresses
          services
            .filter(s => s.bookingDetails?.address)
            .forEach(s => {
              deliveryAddresses.push({
                type: 'service',
                address: s.bookingDetails.address,
                contactName: s.bookingDetails.contactName || s.bookingDetails.name || user.name || '',
                contactPhone: s.bookingDetails.contactPhone || s.bookingDetails.phone || user.phone || '',
                preferredDate: s.bookingDetails.preferredDate || s.bookingDetails.date || '',
                preferredTime: s.bookingDetails.preferredTime || s.bookingDetails.time || '',
                addressType: s.bookingDetails.addressType || 'myself',
              });
            });

          // Prepare comprehensive order data
          const orderData = {
            orderId: generateOrderId(), // Generate orderId on frontend
            items: orderItems,
            total: totals.subtotal, // Subtotal after product discounts
            productDiscount: totals.productDiscountTotal || 0, // Product discount amount
            discount: totalDiscount, // Total discount (product + payment + coupon)
            couponCode: appliedCoupon?.code || null,
            couponDiscount: couponDiscount,
            paymentDiscount: paymentDiscount,
            finalTotal: finalTotal,
            paymentOption: selectedPaymentOption,
            paymentStatus: selectedPaymentOption === 'payNow' ? 'pending' : 'pending', // Will be updated to 'paid' after payment verification
            // Include complete user information for admin reference
            customerInfo: {
              userId: user.id || user._id,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              alternatePhone: user?.address?.alternateNumber || user?.alternateNumber || '',
              // Include user's saved address details
              address: {
                homeAddress: user?.homeAddress || user?.address?.homeAddress || '',
                nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
                pincode: user?.address?.pincode || user?.pincode || '',
              },
            },
            // Include delivery/booking addresses (for both rentals and services)
            deliveryAddresses: deliveryAddresses.length > 0 ? deliveryAddresses : undefined,
            // Include order metadata with complete timestamp
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: rentals.length > 0 && services.length > 0
              ? 'Order contains both rental products and services'
              : rentals.length > 0
                ? 'Order contains rental products'
                : 'Order contains services',
          };

          // Backend fix: Email notifications are now non-blocking, so API responds quickly (< 3 seconds)
          // Order creation will succeed even if email notification fails
          const orderResponse = await apiService.createOrder(orderData);
          if (!orderResponse.success) {
            throw new Error(orderResponse.message || 'Failed to create order');
          }

          // Store order ID and order data
          const createdOrderId = orderResponse.data?.orderId || orderData.orderId;
          const orderDataResponse = orderResponse.data;
          setOrderId(createdOrderId);
          setCreatedOrder(orderDataResponse);

          // If payNow is selected, show payment checkout instead of completing order
          if (selectedPaymentOption === 'payNow') {
            setShowPaymentCheckout(true);
            setLoading(false);
            return; // Don't clear cart or show success yet - wait for payment
          }

          // For payLater, complete the order flow
          // Clear cart after successful order placement
          clearCart();

          // Show prominent success notification (toast)
          showSuccess(`🎉 Order #${createdOrderId} placed successfully!`, 5000);

          // Show success modal immediately
          setShowSuccessModal(true);
        } catch (err) {
          console.error('Error creating order:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Failed to place order';
          showError(errorMessage);
          throw err;
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  const handleApplyCoupon = async (code = null) => {
    const couponToApply = code || couponCode.trim();
    if (!couponToApply) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const rentals = cartItems.filter(item => {
        return item.type === 'rental' ||
          (item.type !== 'service' && (item.brand || item.model || item.price));
      });
      const response = await apiService.validateCoupon(couponToApply, totals.subtotal, rentals);

      if (!response.success) {
        setCouponError(response.message || 'Invalid coupon code');
        return;
      }

      const coupon = response.data;

      // Check minimum amount if required
      if (coupon.minAmount && totals.subtotal < coupon.minAmount) {
        setCouponError(`Minimum order amount of ₹${coupon.minAmount} required`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponCode('');
      showSuccess(`Coupon "${coupon.code}" applied successfully!`);
    } catch (error) {
      setCouponError(error.response?.data?.message || error.message || 'Failed to apply coupon. Please try again.');
      showError(error.response?.data?.message || error.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCouponFromList = (coupon) => {
    handleApplyCoupon(coupon.code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const rentals = cartItems.filter(item => {
    return item.type === 'rental' ||
      (item.type !== 'service' && (item.brand || item.model || item.price));
  });
  const services = cartItems.filter(item => item.type === 'service');

  // Don't render checkout form if not authenticated - just show modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <LoginPromptModal
          isOpen={true}
          onClose={() => {
            navigate('/user/cart');
          }}
          message="Please login first, then you will be able to place order"
          redirectDelay={0}
        />
      </div>
    );
  }

  // Don't render checkout form if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add items to your cart before checkout</p>
            <Link
              to="/user/cart"
              className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/user/cart"
            className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-light transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-text-dark">Checkout</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coupon Code Section */}
            <div className="bg-gradient-to-r from-primary-blue/5 to-primary-blue-light/5 border-2 border-primary-blue/20 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
                <FiTag className="w-5 h-5 text-primary-blue" />
                <span>Apply Coupon Code</span>
                <span className="text-sm font-normal text-primary-blue bg-primary-blue/10 px-2 py-1 rounded">Save More!</span>
              </h2>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyCoupon();
                      }
                    }}
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}

              {/* Available Coupons Section */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-dark flex items-center gap-2">
                      <FiTag className="w-5 h-5 text-primary-blue" />
                      Available Coupons
                    </h3>
                    <button
                      onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                      className="text-sm text-primary-blue hover:text-primary-blue-light font-medium"
                    >
                      {showAvailableCoupons ? 'Hide' : 'Show'} ({availableCoupons.length})
                    </button>
                  </div>

                  {showAvailableCoupons && (
                    <div className="space-y-3">
                      {loadingCoupons ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
                        </div>
                      ) : (
                        availableCoupons.map((coupon, index) => {
                          const formatDiscount = () => {
                            if (coupon.type === 'percentage') {
                              return `${coupon.value}% OFF`;
                            } else {
                              return `₹${coupon.value} OFF`;
                            }
                          };

                          const isEligible = !coupon.minAmount || totals.subtotal >= coupon.minAmount;

                          return (
                            <motion.div
                              key={coupon._id || coupon.id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`border-2 rounded-lg p-4 transition-all ${isEligible
                                  ? 'border-primary-blue/30 bg-gradient-to-r from-primary-blue/5 to-primary-blue-light/5 hover:border-primary-blue/50 cursor-pointer'
                                  : 'border-gray-200 bg-gray-50 opacity-60'
                                }`}
                              onClick={() => isEligible && handleApplyCouponFromList(coupon)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono font-bold text-lg text-primary-blue">
                                      {coupon.code}
                                    </span>
                                    <span className="px-2 py-1 bg-primary-blue text-white text-xs font-semibold rounded">
                                      {formatDiscount()}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-text-dark mb-1">
                                    {coupon.title}
                                  </p>
                                  <p className="text-xs text-text-light mb-2">
                                    {coupon.description}
                                  </p>
                                  {coupon.minAmount > 0 && (
                                    <p className={`text-xs ${isEligible ? 'text-green-600' : 'text-orange-600'}`}>
                                      {isEligible
                                        ? `✓ Min. order: ₹${coupon.minAmount.toLocaleString()}`
                                        : `Min. order: ₹${coupon.minAmount.toLocaleString()} required`
                                      }
                                    </p>
                                  )}
                                  {coupon.validUntil && (
                                    <p className="text-xs text-text-light mt-1">
                                      Valid till: {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                                    </p>
                                  )}
                                </div>
                                {isEligible && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApplyCouponFromList(coupon);
                                    }}
                                    className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold text-sm whitespace-nowrap flex-shrink-0"
                                  >
                                    Apply
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Option Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Select Payment Option</h2>

              <div className="space-y-4">
                {/* Pay Now Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${selectedPaymentOption === 'payNow'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="payNow"
                    checked={selectedPaymentOption === 'payNow'}
                    onChange={(e) => setSelectedPaymentOption(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FiCreditCard className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-text-dark">Pay Now</span>
                      </div>
                      {selectedPaymentOption === 'payNow' && paymentDiscount > 0 && (
                        <span className="text-sm font-semibold text-green-600">
                          Save ₹{paymentDiscount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-light mb-2">Pay immediately via online payment</p>
                    <ul className="text-xs text-text-light space-y-1">
                      {paymentBenefits.payNow.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <FiCheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>

                {/* Pay Later Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${selectedPaymentOption === 'payLater'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="payLater"
                    checked={selectedPaymentOption === 'payLater'}
                    onChange={(e) => setSelectedPaymentOption(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiClock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-text-dark">Pay Later</span>
                    </div>
                    <p className="text-sm text-text-light mb-2">Pay after service completion or on delivery</p>
                    <ul className="text-xs text-text-light space-y-1">
                      {paymentBenefits.payLater.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <FiCheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Items</h2>

              {/* Rentals */}
              {rentals.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-text-dark mb-3">Rental Products</h3>
                  {rentals.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg mb-2">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text-dark">{item.brand} {item.model}</p>
                        {item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure ? (
                          <>
                            <p className="text-xs text-blue-600 mt-1 font-medium">
                              Monthly Payment: ₹{item.monthlyPrice.toLocaleString()}/month
                            </p>
                            {item.securityDeposit > 0 && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                Security Deposit: ₹{(item.securityDeposit || 0).toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-text-light mt-1">
                              Duration: {item.monthlyTenure} months
                            </p>
                          </>
                        ) : (
                          item.selectedDuration && (
                            <p className="text-xs text-text-light mt-1">
                              Duration: {item.selectedDuration} months
                            </p>
                          )
                        )}
                        {item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0 && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            + Installation: ₹{item.installationCharges.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-dark">
                          ₹{(() => {
                            if (item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure) {
                              // Monthly payment: one month charge + security deposit
                              const oneMonthCharge = item.monthlyPrice;
                              const securityDeposit = item.securityDeposit || 0;
                              const monthlyTotal = oneMonthCharge + securityDeposit;
                              const installationCharge = (item.category === 'AC' && item.installationCharges && item.installationCharges.amount)
                                ? item.installationCharges.amount
                                : 0;
                              return (monthlyTotal + installationCharge).toLocaleString();
                            }
                            const selectedDuration = item.selectedDuration || 3;
                            const price = item.price && typeof item.price === 'object'
                              ? (item.price[selectedDuration] || item.price[3] || 0)
                              : (item.price || 0);
                            const installationCharge = (item.category === 'AC' && item.installationCharges && item.installationCharges.amount)
                              ? item.installationCharges.amount
                              : 0;
                            return (price + installationCharge).toLocaleString();
                          })()}
                        </p>
                        {item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure ? (
                          <p className="text-xs text-text-light mt-1">
                            (Monthly × {item.monthlyTenure} {item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0 ? '+ Installation' : ''})
                          </p>
                        ) : (
                          item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0 && (
                            <p className="text-xs text-text-light mt-1">
                              (Rental + Installation)
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Services */}
              {services.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-text-dark mb-3">Services</h3>
                  {services.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg mb-2 border-l-4 border-sky-500">
                      <div className="flex items-start space-x-4">
                        {item.serviceImage ? (
                          <img
                            src={item.serviceImage}
                            alt={item.serviceTitle}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-sky-100 rounded flex items-center justify-center">
                            <Wrench className="w-8 h-8 text-sky-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-text-dark mb-1">{item.serviceTitle}</p>
                          {item.bookingDetails && (
                            <div className="text-xs text-text-light space-y-1">
                              {item.bookingDetails.date && (
                                <p className="flex items-center space-x-1">
                                  <FiCalendar className="w-3 h-3" />
                                  <span>{new Date(item.bookingDetails.date).toLocaleDateString()}</span>
                                </p>
                              )}
                              {item.bookingDetails.time && (
                                <p className="flex items-center space-x-1">
                                  <FiClock className="w-3 h-3" />
                                  <span>{formatTimeSlot(item.bookingDetails.time)}</span>
                                </p>
                              )}
                              {item.bookingDetails.address && (
                                <p className="flex items-start space-x-1">
                                  <FiMapPin className="w-3 h-3 mt-0.5" />
                                  <span className="line-clamp-1">{item.bookingDetails.address}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-text-dark">
                          ₹{(item.servicePrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {totals.rentalTotal > 0 && (
                  <div className="flex justify-between text-text-light">
                    <span>Rentals</span>
                    <span>₹{(() => {
                      // Calculate rental total without installation charges
                      const rentalTotalWithoutInstallation = rentals.reduce((total, item) => {
                        if (item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure) {
                          // Monthly payment: one month charge + security deposit
                          const oneMonthCharge = item.monthlyPrice;
                          const securityDeposit = item.securityDeposit || 0;
                          return total + oneMonthCharge + securityDeposit;
                        }
                        const selectedDuration = item.selectedDuration || 3;
                        const price = item.price && typeof item.price === 'object'
                          ? (item.price[selectedDuration] || item.price[3] || 0)
                          : (item.price || 0);
                        return total + price;
                      }, 0);
                      return rentalTotalWithoutInstallation.toLocaleString();
                    })()}</span>
                  </div>
                )}
                {/* Installation Charges */}
                {rentals.some(item => item.category === 'AC' && item.installationCharges && item.installationCharges.amount > 0) && (
                  <div className="flex justify-between text-text-light">
                    <span>Installation Charges</span>
                    <span>₹{(() => {
                      const installationTotal = rentals.reduce((total, item) => {
                        if (item.category === 'AC' && item.installationCharges && item.installationCharges.amount) {
                          return total + item.installationCharges.amount;
                        }
                        return total;
                      }, 0);
                      return installationTotal.toLocaleString();
                    })()}</span>
                  </div>
                )}
                {totals.serviceTotal > 0 && (
                  <div className="flex justify-between text-text-light">
                    <span>Services</span>
                    <span>₹{totals.serviceTotal.toLocaleString()}</span>
                  </div>
                )}
                {/* Product Discount Display */}
                {totals.productDiscountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product Discount</span>
                    <span>-₹{totals.productDiscountTotal.toLocaleString()}</span>
                  </div>
                )}
                {/* Subtotal after product discounts */}
                <div className="flex justify-between text-text-dark font-semibold border-t border-gray-200 pt-2">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>
                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Payment Discount ({instantPaymentDiscount}% Pay Now)</span>
                    <span>-₹{paymentDiscount.toLocaleString()}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-text-dark">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {showPaymentCheckout && createdOrder && selectedPaymentOption === 'payNow' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Order #{orderId}</strong> has been created. Please complete the payment to confirm your order.
                    </p>
                  </div>
                  <RazorpayPaymentCheckout
                    orderId={orderId}
                    amount={finalTotal}
                    user={user}
                    onPaymentSuccess={(paymentData) => {
                      // Payment successful - clear cart and show success
                      clearCart();
                      showSuccess(`🎉 Payment successful! Order #${orderId} confirmed.`, 5000);
                      setShowSuccessModal(true);
                      setShowPaymentCheckout(false);
                    }}
                    onPaymentFailure={(error) => {
                      // Payment failed - keep order but show error
                      console.error('Payment failed:', error);
                      // Order is already created, user can retry payment later
                    }}
                    onCancel={() => {
                      // User cancelled payment - they can retry later
                      setShowPaymentCheckout(false);
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowPaymentCheckout(false);
                      setCreatedOrder(null);
                      setOrderId(null);
                    }}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel & Go Back
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-5 h-5" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-text-light text-center mt-4">
                    {selectedPaymentOption === 'payNow'
                      ? 'You will be redirected to payment gateway after order creation'
                      : 'You can pay after service completion or on delivery'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login first, then you will be able to place order"
        redirectDelay={3000}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Order Placed Successfully! 🎉"
        message={orderId ? `Your order #${orderId} has been placed successfully! We are redirecting you to the orders page.` : 'Your order has been placed successfully! We are redirecting you to the orders page.'}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/user/orders');
        }}
        confirmText="View My Orders"
        autoRedirectDelay={5000}
      />
    </div>
  );
};

export default Checkout;

