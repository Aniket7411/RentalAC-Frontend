import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { Wrench, X, Download, Printer, ShoppingBag, Calendar, MapPin, User, Phone } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CancelOrderModal from '../../components/CancelOrderModal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { generateInvoice } from '../../utils/invoiceGenerator';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals' or 'services'
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Load product orders
      const ordersResponse = await apiService.getUserOrders(user?.id);
      if (ordersResponse.success) {
        // Sort orders by date (newest first)
        const sortedOrders = (ordersResponse.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || a.orderDate || a.date || 0);
          const dateB = new Date(b.createdAt || b.orderDate || b.date || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        setOrders(sortedOrders);
      } else {
        // Fallback to localStorage
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        // Sort orders by date (newest first)
        const sortedOrders = storedOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.orderDate || a.date || 0);
          const dateB = new Date(b.createdAt || b.orderDate || b.date || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        setOrders(sortedOrders);
      }

      // Load service bookings
      const serviceBookingsResponse = await apiService.getUserServiceBookings();
      if (serviceBookingsResponse.success) {
        const sortedBookings = (serviceBookingsResponse.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        setServiceBookings(sortedBookings);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to localStorage
      try {
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        setOrders(storedOrders);
      } catch (e) {
        setError('Failed to load orders');
        // Fallback to localStorage
        try {
          const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
          // Sort orders by date (newest first)
          const sortedOrders = storedOrders.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.orderDate || a.date || 0);
            const dateB = new Date(b.createdAt || b.orderDate || b.date || 0);
            return dateB - dateA; // Descending order (newest first)
          });
          setOrders(sortedOrders);
        } catch (err) {
          console.error('Error loading orders from localStorage:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'processing':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiPackage className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    if (!selectedOrderId) return;

    setCancelling(true);
    try {
      const response = await apiService.cancelOrder(selectedOrderId, reason);
      if (response.success) {
        success('Order cancelled successfully');
        setCancelModalOpen(false);
        setSelectedOrderId(null);
        // Reload orders
        loadOrders();
      } else {
        showError(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('An error occurred while cancelling the order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = (order) => {
    const status = order.status?.toLowerCase();
    return status !== 'cancelled' && status !== 'completed' && status !== 'delivered';
  };

  const handleDownloadInvoice = async (order) => {
    try {
      const result = generateInvoice(order, 'download');
      if (result) {
        success('Invoice downloaded successfully');
      } else {
        showError('Failed to generate invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError(error.message || 'Failed to download invoice. Please try again.');
    }
  };

  const handlePrintInvoice = async (order) => {
    try {
      const result = generateInvoice(order, 'print');
      if (!result) {
        showError('Failed to open print dialog. Please try again.');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      showError(error.message || 'Failed to print invoice. Please try again.');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">My Orders</h1>
          <p className="text-text-light">Manage and track your rental orders and service bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all relative ${
                activeTab === 'rentals'
                  ? 'text-primary-blue bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Rental Orders</span>
                {orders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'rentals' ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </div>
              {activeTab === 'rentals' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all relative ${
                activeTab === 'services'
                  ? 'text-primary-blue bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wrench className="w-5 h-5" />
                <span>Service Bookings</span>
                {serviceBookings.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'services' ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {serviceBookings.length}
                  </span>
                )}
              </div>
              {activeTab === 'services' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue"
                  initial={false}
                />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'rentals' ? (
            <motion.div
              key="rentals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-text-dark mb-2">No rental orders yet</h2>
                  <p className="text-text-light mb-6">Start shopping to see your rental orders here!</p>
                  <Link
                    to="/browse"
                    className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id || order._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              {getStatusIcon(order.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-text-dark">
                                    Order #{order.orderId || order.id || 'N/A'}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                    {order.status || 'Pending'}
                                  </span>
                                </div>
                                <p className="text-sm text-text-light flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Placed on {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {order.items && order.items.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                    {item.productDetails?.images?.[0] || item.images?.[0] ? (
                                      <img
                                        src={item.productDetails?.images?.[0] || item.images[0]}
                                        alt={item.productDetails?.brand || item.brand}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/80?text=Product';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-semibold text-text-dark">
                                        {item.productDetails?.brand || item.brand} {item.productDetails?.model || item.model || item.name}
                                      </p>
                                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-light">
                                        <span>Quantity: {item.quantity || 1}</span>
                                        {item.duration && (
                                          <span>• Duration: {item.duration} months</span>
                                        )}
                                        {item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                            Monthly Payment
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Order Actions & Total */}
                          <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
                            <div className="text-right">
                              <p className="text-sm text-text-light mb-1">Total Amount</p>
                              <p className="text-3xl font-bold text-primary-blue">
                                ₹{(order.finalTotal || order.total || order.amount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 w-full">
                              {order.status?.toLowerCase() !== 'cancelled' && (
                                <Link
                                  to={`/user/orders/${order.id || order._id}`}
                                  className="w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all text-center font-medium text-sm"
                                >
                                  View Details
                                </Link>
                              )}
                              <div className="flex items-center gap-2 w-full">
                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  className="flex-1 px-3 py-2 text-primary-blue hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1 border border-primary-blue rounded-lg transition-colors"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="hidden sm:inline">Invoice</span>
                                </button>
                                <button
                                  onClick={() => handlePrintInvoice(order)}
                                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium flex items-center justify-center border border-gray-300 rounded-lg transition-colors"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </div>
                              {canCancelOrder(order) && (
                                <button
                                  onClick={() => handleCancelClick(order.id || order._id)}
                                  className="w-full px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium flex items-center justify-center gap-1 border border-red-200 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel Order
                                </button>
                              )}
                              {order.cancellationReason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 max-w-xs">
                                  <p className="font-semibold mb-1">Cancellation Reason:</p>
                                  <p>{order.cancellationReason}</p>
                                  {order.cancelledAt && (
                                    <p className="mt-2 text-red-600 border-t border-red-200 pt-2">
                                      Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {serviceBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Wrench className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-text-dark mb-2">No service bookings yet</h2>
                  <p className="text-text-light mb-6">Book a service to see your bookings here!</p>
                  <Link
                    to="/service-request"
                    className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Book a Service
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceBookings.map((booking, index) => (
                    <motion.div
                      key={booking._id || booking.id || `service-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-l-4 border-blue-500"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Booking Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <Wrench className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-text-dark">
                                    Service Booking #{booking.bookingId || booking._id || booking.id || 'N/A'}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                    {booking.status || 'Pending'}
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-text-dark mb-1">
                                  {booking.serviceTitle || booking.service?.title || 'AC Service'}
                                </p>
                                <p className="text-sm text-text-light">
                                  {booking.serviceDescription || booking.service?.description || 'Service Request'}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {booking.date && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-xs text-text-light">Preferred Date</p>
                                    <p className="font-semibold text-text-dark">
                                      {new Date(booking.date || booking.preferredDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {booking.time && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-xs text-text-light">Preferred Time</p>
                                    <p className="font-semibold text-text-dark">
                                      {formatTimeSlot(booking.time || booking.preferredTime)}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {booking.address && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-xs text-text-light mb-1">Service Address</p>
                                    <p className="font-semibold text-text-dark">{booking.address}</p>
                                  </div>
                                </div>
                              )}
                              {booking.contactName && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <User className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-xs text-text-light">Contact Name</p>
                                    <p className="font-semibold text-text-dark">{booking.contactName}</p>
                                  </div>
                                </div>
                              )}
                              {booking.contactPhone && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Phone className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-xs text-text-light">Contact Phone</p>
                                    <p className="font-semibold text-text-dark">{booking.contactPhone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Booking Status & Price */}
                          <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
                            <div className="text-right">
                              <p className="text-sm text-text-light mb-1">Service Price</p>
                              <p className="text-3xl font-bold text-primary-blue">
                                ₹{(booking.servicePrice || booking.price || 0).toLocaleString()}
                              </p>
                            </div>
                            {booking.paymentOption && (
                              <div className="text-right">
                                <p className="text-xs text-text-light">Payment</p>
                                <p className="text-sm font-semibold text-text-dark">
                                  {booking.paymentOption === 'payNow' ? 'Paid' : 'Pay After Service'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedOrderId(null);
        }}
        onConfirm={handleCancelConfirm}
        orderId={selectedOrderId}
        isLoading={cancelling}
      />
    </div>
  );
};

export default Orders;
