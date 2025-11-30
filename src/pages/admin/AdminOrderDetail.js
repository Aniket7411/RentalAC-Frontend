import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  User,
  CreditCard,
  Download,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { generateInvoice } from '../../utils/invoiceGenerator';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await apiService.updateOrderStatus(id, newStatus);
      if (response.success) {
        success('Order status updated successfully');
        loadOrder(); // Reload order to get updated data
      } else {
        showError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      showError('An error occurred while updating order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.homeAddress) parts.push(address.homeAddress);
      if (address.nearLandmark) parts.push(`Near ${address.nearLandmark}`);
      if (address.pincode) parts.push(`Pincode: ${address.pincode}`);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    }
    return 'N/A';
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

  const handleDownloadInvoice = () => {
    if (!order) {
      showError('Order not found');
      return;
    }
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

  const handlePrintInvoice = () => {
    if (!order) {
      showError('Order not found');
      return;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Order Not Found</h2>
            <p className="text-text-light mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              to="/admin/orders"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle customerInfo - it might come from populated userId or be in customerInfo
  let customerInfo = order.customerInfo || {};
  if (order.userId && typeof order.userId === 'object') {
    // If userId is populated, merge with customerInfo (customerInfo takes priority)
    customerInfo = {
      userId: customerInfo.userId || order.userId._id || order.userId,
      name: customerInfo.name || order.userId.name || 'N/A',
      email: customerInfo.email || order.userId.email || 'N/A',
      phone: customerInfo.phone || order.userId.phone || 'N/A',
      alternatePhone: customerInfo.alternatePhone || '',
      address: customerInfo.address || {}
    };
  }
  // Ensure address is always an object, not undefined
  if (!customerInfo.address) {
    customerInfo.address = {};
  }

  const items = order.items || [];
  const orderId = order._id || order.id;

  const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={containerClasses}>
        {/* Back Button */}
        <Link
          to="/admin/orders"
          className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-light transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-dark">
                Order #{order.orderId || orderId}
              </h1>
              <p className="text-text-light text-sm mt-1">
                Placed on: {formatDate(order.createdAt || order.orderDate)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status || 'Pending'}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
            >
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Items</h2>
              
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, idx) => {
                    // Handle product details - might be in productDetails or populated productId
                    let productDetails = item.productDetails;
                    if (!productDetails && item.productId && typeof item.productId === 'object') {
                      productDetails = {
                        brand: item.productId.brand,
                        model: item.productId.model,
                        capacity: item.productId.capacity,
                        productType: item.productId.type,
                        location: item.productId.location,
                        images: item.productId.images || []
                      };
                    }
                    if (!productDetails && item.product && typeof item.product === 'object') {
                      productDetails = {
                        brand: item.product.brand,
                        model: item.product.model,
                        capacity: item.product.capacity,
                        productType: item.product.type,
                        location: item.product.location,
                        images: item.product.images || []
                      };
                    }

                    return (
                      <div key={idx} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        {item.type === 'rental' ? (
                          <div className="flex items-start space-x-4">
                            {productDetails?.images?.[0] && (
                              <img
                                src={productDetails.images[0]}
                                alt={productDetails.brand || 'Product'}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80?text=Product';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-dark">
                                {productDetails?.brand || 'Product'} {productDetails?.model || ''}
                              </h3>
                              <div className="text-sm text-text-light mt-1 space-y-1">
                                {productDetails?.capacity && <p>Capacity: {productDetails.capacity}</p>}
                                {productDetails?.productType && <p>Type: {productDetails.productType}</p>}
                                {productDetails?.location && <p>Location: {productDetails.location}</p>}
                                {item.duration && <p>Rental Duration: {item.duration} months</p>}
                                <p>Quantity: {item.quantity || 1}</p>
                              </div>
                              {item.deliveryInfo && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm font-medium text-text-dark mb-1">Delivery Address:</p>
                                  <p className="text-sm text-text-light">{formatAddress(item.deliveryInfo.address || '')}</p>
                                  {item.deliveryInfo.contactPhone && (
                                    <p className="text-sm text-text-light mt-1">📞 Contact: {item.deliveryInfo.contactPhone}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary-blue">
                                ₹{(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : item.type === 'service' ? (
                          <div className="flex items-start space-x-4">
                            {item.serviceDetails?.image && (
                              <img
                                src={item.serviceDetails.image}
                                alt={item.serviceDetails.title}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80?text=Service';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-dark">
                                {item.serviceDetails?.title || 'Service'}
                              </h3>
                              {item.serviceDetails?.description && (
                                <p className="text-sm text-text-light mb-2">{item.serviceDetails.description}</p>
                              )}
                              {item.bookingDetails && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2">
                                  {item.bookingDetails.preferredDate && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Date: {new Date(item.bookingDetails.preferredDate).toLocaleDateString()}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.preferredTime && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <Clock className="w-4 h-4" />
                                      <span>Time: {formatTimeSlot(item.bookingDetails.preferredTime)}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.address && (
                                    <p className="text-sm text-text-light flex items-start space-x-2">
                                      <MapPin className="w-4 h-4 mt-0.5" />
                                      <span>{item.bookingDetails.address}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.contactPhone && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <Phone className="w-4 h-4" />
                                      <span>{item.bookingDetails.contactPhone}</span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary-blue">
                                ₹{(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-light">No items found in this order.</p>
              )}
            </motion.div>

            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
            >
              <h2 className="text-xl font-semibold text-text-dark mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-light">Name</p>
                  <p className="font-medium text-text-dark">{customerInfo.name || 'N/A'}</p>
                </div>
                {customerInfo.email && (
                  <div>
                    <p className="text-sm text-text-light">Email</p>
                    <p className="font-medium text-text-dark">{customerInfo.email}</p>
                  </div>
                )}
                {customerInfo.phone && (
                  <div>
                    <p className="text-sm text-text-light">Phone</p>
                    <a href={`tel:${customerInfo.phone}`} className="font-medium text-primary-blue hover:underline">
                      {customerInfo.phone}
                    </a>
                  </div>
                )}
                {customerInfo.address && (
                  <div>
                    <p className="text-sm text-text-light">Address</p>
                    <p className="font-medium text-text-dark">{formatAddress(customerInfo.address)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sticky top-24 space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-text-light">
                    <span>Subtotal</span>
                    <span>₹{(order.total || 0).toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-text-dark">
                    <span>Total</span>
                    <span>₹{(order.finalTotal || order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Option</span>
                    </span>
                    <span className="text-sm font-medium text-text-dark">
                      {order.paymentOption === 'payNow' ? 'Pay Now' : 'Pay Later'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Payment Status</span>
                    <span className={`text-sm font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancellation Info */}
              {order.cancellationReason && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Order Cancellation Details</span>
                  </h3>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 mb-2">
                      <span className="font-medium">Reason:</span> {order.cancellationReason}
                    </p>
                    <div className="text-xs text-red-600 space-y-1">
                      {order.cancelledAt && (
                        <p>Cancelled on: {formatDate(order.cancelledAt)}</p>
                      )}
                      {order.cancelledBy && (
                        <p>Cancelled by: {order.cancelledBy === 'user' ? 'Customer' : 'Admin'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Update Order Status */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">Update Order Status</h3>
                <select
                  value={order.status || 'pending'}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updatingStatus && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-text-light mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>

              {/* Invoice Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">Invoice</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={handlePrintInvoice}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

              {/* Customer Actions */}
              {customerInfo.phone && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
                  <a
                    href={`tel:${customerInfo.phone}`}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Customer</span>
                  </a>
                </div>
              )}

              {order.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-text-light">{order.notes}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

