import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiService } from '../../services/api';
import { FiShoppingCart, FiAlertCircle, FiCheckCircle, FiCreditCard, FiClock, FiCalendar, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import { Loader2, Wrench, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, calculateTotals, getPaymentBenefits, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('payLater');
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const totals = calculateTotals();
  const paymentBenefits = getPaymentBenefits();
  const discount = selectedPaymentOption === 'payNow' ? totals.total * paymentBenefits.payNow.discount : 0;
  const finalTotal = totals.total - discount;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/user/cart');
      return;
    }
  }, [isAuthenticated, cartItems, navigate]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
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
          const orderItems = [
            ...rentals.map(rental => {
              const selectedDuration = rental.selectedDuration || 3;
              const price = rental.price && typeof rental.price === 'object'
                ? (rental.price[selectedDuration] || rental.price[3] || 0)
                : (rental.price || 0);
              return {
                type: 'rental',
                productId: rental.id,
                quantity: 1, // Always 1 per product
                price: price,
                duration: selectedDuration, // Include selected duration
              };
            }),
            ...services.map(service => ({
              type: 'service',
              serviceId: service.serviceId,
              quantity: 1, // Always 1 per service
              price: service.servicePrice,
              bookingDetails: service.bookingDetails,
            })),
          ];

          // Generate orderId (format: ORD-YYYY-XXX)
          const generateOrderId = () => {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `ORD-${year}-${random}`;
          };

          const orderData = {
            orderId: generateOrderId(), // Generate orderId on frontend
            items: orderItems,
            total: totals.total,
            discount: discount,
            finalTotal: finalTotal,
            paymentOption: selectedPaymentOption,
            paymentStatus: selectedPaymentOption === 'payNow' ? 'paid' : 'pending',
          };

          const orderResponse = await apiService.createOrder(orderData);
          if (!orderResponse.success) {
            throw new Error(orderResponse.message || 'Failed to create order');
          }
        } catch (err) {
          console.error('Error creating order:', err);
          showError(err.message || 'Failed to place order');
          throw err;
        }
      }

      // Service bookings are now created as part of the order
      // Individual service bookings can be created separately if needed
      // This is handled by the backend when processing the order

      // Clear cart after successful order placement
      clearCart();
      showSuccess('Order placed successfully!');

      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate('/user/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      showError(error.message || 'Failed to place order. Please try again.');
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

  const rentals = cartItems.filter(item => {
    return item.type === 'rental' ||
      (item.type !== 'service' && (item.brand || item.model || item.price));
  });
  const services = cartItems.filter(item => item.type === 'service');

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
                      {selectedPaymentOption === 'payNow' && discount > 0 && (
                        <span className="text-sm font-semibold text-green-600">
                          Save ₹{discount.toLocaleString()}
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
                        {item.selectedDuration && (
                          <p className="text-xs text-text-light mt-1">
                            Duration: {item.selectedDuration} months
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-text-dark">
                        ₹{(() => {
                          const selectedDuration = item.selectedDuration || 3;
                          const price = item.price && typeof item.price === 'object'
                            ? (item.price[selectedDuration] || item.price[3] || 0)
                            : (item.price || 0);
                          return price.toLocaleString();
                        })()}
                      </p>
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
                    <span>₹{totals.rentalTotal.toLocaleString()}</span>
                  </div>
                )}
                {totals.serviceTotal > 0 && (
                  <div className="flex justify-between text-text-light">
                    <span>Services</span>
                    <span>₹{totals.serviceTotal.toLocaleString()}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (5%)</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-text-dark">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

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
                  ? 'You will be redirected to payment gateway'
                  : 'You can pay after service completion or on delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

