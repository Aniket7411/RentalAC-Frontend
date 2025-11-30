import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Phone, MapPin, Calendar, AlertCircle, ShoppingBag, Package, Loader2, CheckCircle, Clock, XCircle, Eye, Download, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { generateInvoice } from '../../utils/invoiceGenerator';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAllOrders();
      if (response.success) {
        setOrders(response.data || []);
      } else {
        showError(response.message || 'Failed to load orders');
      }
    } catch (err) {
      showError('An error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        success('Order status updated successfully');
        loadOrders();
      } else {
        showError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      showError('An error occurred while updating order status');
    } finally {
      setUpdatingStatus(null);
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by order status
    if (filter !== 'all') {
      filtered = filtered.filter(order => {
        const orderStatus = (order.status || '').toLowerCase();
        return orderStatus === filter.toLowerCase();
      });
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        const paymentStatus = (order.paymentStatus || '').toLowerCase();
        return paymentStatus === paymentFilter.toLowerCase();
      });
    }

    return filtered;
  };

  const downloadAsCsv = (rows, sheetName) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (value) =>
      `"${String(value ?? '')
        .replace(/"/g, '""')
        .replace(/\n/g, ' ')
        .trim()}"`;

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const filteredOrders = getFilteredOrders();
    
    const data = filteredOrders.map((order, idx) => ({
      SNo: idx + 1,
      OrderID: order.orderId || order._id || 'N/A',
      CustomerName: order.customerInfo?.name || 'N/A',
      CustomerEmail: order.customerInfo?.email || 'N/A',
      CustomerPhone: order.customerInfo?.phone || 'N/A',
      TotalAmount: order.finalTotal || order.total || 0,
      Discount: order.discount || 0,
      PaymentStatus: order.paymentStatus || 'N/A',
      OrderStatus: order.status || 'N/A',
      PaymentOption: order.paymentOption || 'N/A',
      ItemsCount: order.items?.length || 0,
      OrderDate: formatDate(order.createdAt || order.orderDate),
    }));

    if (!data.length) {
      showError('No orders to export for the selected filters.');
      return;
    }

    downloadAsCsv(data, 'Orders');
  };

  const handleDownloadInvoice = (order) => {
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

  const handlePrintInvoice = (order) => {
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

  const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light">Loading orders...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();
  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    confirmed: orders.filter(o => (o.status || '').toLowerCase() === 'confirmed').length,
    processing: orders.filter(o => (o.status || '').toLowerCase() === 'processing').length,
    delivered: orders.filter(o => ['delivered', 'completed'].includes((o.status || '').toLowerCase())).length,
    paid: orders.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid').length,
    unpaid: orders.filter(o => (o.paymentStatus || '').toLowerCase() === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={containerClasses}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Orders Management</p>
            <h1 className="text-3xl font-bold text-text-dark mt-2">All Orders</h1>
            <p className="text-text-light mt-1">View and manage all customer orders from one place.</p>
          </div>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center w-auto bg-emerald-500 text-white justify-center px-4 py-2 text-sm font-medium rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
          >
            Download Excel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Total Orders</p>
            <p className="text-2xl font-bold text-text-dark mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Processing</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.processing}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Delivered</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-xs text-text-light">Unpaid</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.unpaid}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-8">
          <div className="mb-4">
            <p className="text-sm font-medium text-text-dark mb-2">Filter by Order Status:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'all'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'pending'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'confirmed'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Confirmed ({stats.confirmed})
              </button>
              <button
                onClick={() => setFilter('processing')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'processing'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Processing ({stats.processing})
              </button>
              <button
                onClick={() => setFilter('delivered')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'delivered'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Delivered ({stats.delivered})
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-dark mb-2">Filter by Payment Status:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`w-auto px-3 py-1 rounded-lg transition ${paymentFilter === 'all'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setPaymentFilter('paid')}
                className={`w-auto px-3 py-1 rounded-lg transition ${paymentFilter === 'paid'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Paid ({stats.paid})
              </button>
              <button
                onClick={() => setPaymentFilter('pending')}
                className={`w-auto px-3 py-1 rounded-lg transition ${paymentFilter === 'pending'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Pending ({stats.unpaid})
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-md border border-dashed border-slate-200 text-center">
            <ShoppingBag className="w-16 h-16 text-text-light mx-auto mb-4" />
            <p className="text-text-light text-lg">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderId = order._id || order.id;
              
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
              
              // Helper function to format address
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

              return (
                <motion.div
                  key={orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-text-dark mb-1">
                            Order #{order.orderId || orderId}
                          </h3>
                          <p className="text-text-light text-sm">
                            Placed on: {formatDate(order.createdAt || order.orderDate)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {order.status || 'Pending'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-text-dark mb-1">Customer Details</p>
                          <p className="text-sm text-text-dark">{customerInfo.name || 'N/A'}</p>
                          <p className="text-xs text-text-light">{customerInfo.email || 'N/A'}</p>
                          <div className="flex items-center space-x-2 text-text-light mt-1">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${customerInfo.phone}`} className="text-sm hover:text-primary-blue">
                              {customerInfo.phone || 'N/A'}
                            </a>
                          </div>
                        </div>
                        {customerInfo.address && (
                          <div>
                            <p className="text-sm font-medium text-text-dark mb-1">Address</p>
                            <div className="flex items-start space-x-2 text-text-light">
                              <MapPin className="w-3 h-3 mt-1" />
                              <p className="text-sm">
                                {formatAddress(customerInfo.address)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-medium text-text-dark">Order Items:</p>
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
                          // Also check item.product as fallback
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
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                              {item.type === 'rental' && (
                                <>
                                  {productDetails?.images?.[0] && (
                                    <img
                                      src={productDetails.images[0]}
                                      alt={productDetails.brand || 'Product'}
                                      className="w-16 h-16 object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/64?text=Product';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-text-dark">
                                      {productDetails?.brand || 'Product'} {productDetails?.model || ''}
                                    </p>
                                    <p className="text-xs text-text-light">
                                      Type: {item.type} | Duration: {item.duration} months | Qty: {item.quantity || 1}
                                    </p>
                                    <p className="text-sm font-semibold text-primary-blue mt-1">
                                      ₹{item.price?.toLocaleString() || 0}
                                    </p>
                                    {item.deliveryInfo && (
                                      <div className="mt-2 text-xs text-text-light">
                                        <p>📍 Delivery: {item.deliveryInfo.address || 'N/A'}</p>
                                        <p>📞 Contact: {item.deliveryInfo.contactPhone || 'N/A'}</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                              {item.type === 'service' && (
                                <>
                                  {item.serviceDetails?.image && (
                                    <img
                                      src={item.serviceDetails.image}
                                      alt={item.serviceDetails.title}
                                      className="w-16 h-16 object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/64?text=Service';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-text-dark">
                                      {item.serviceDetails?.title || 'Service'}
                                    </p>
                                    <p className="text-xs text-text-light">
                                      Type: {item.type} | Qty: {item.quantity || 1}
                                    </p>
                                    <p className="text-sm font-semibold text-primary-blue mt-1">
                                      ₹{item.price?.toLocaleString() || 0}
                                    </p>
                                    {item.bookingDetails && (
                                      <div className="mt-2 text-xs text-text-light">
                                        <p>📅 Date: {item.bookingDetails.preferredDate || 'N/A'}</p>
                                        <p>🕐 Time: {item.bookingDetails.preferredTime || 'N/A'}</p>
                                        <p>📍 Address: {item.bookingDetails.address || 'N/A'}</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Summary */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm text-text-light">Payment Option: <span className="font-medium text-text-dark">{order.paymentOption || 'N/A'}</span></p>
                          {order.discount > 0 && (
                            <p className="text-sm text-text-light">Discount: <span className="font-medium text-green-600">₹{order.discount.toLocaleString()}</span></p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-light">Total Amount</p>
                          <p className="text-2xl font-bold text-primary-blue">
                            ₹{(order.finalTotal || order.total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Cancellation Info */}
                      {order.cancellationReason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-800 mb-1">Order Cancelled</p>
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
                        </div>
                      )}
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col space-y-2 lg:w-64">
                      <label className="text-sm font-medium text-text-dark">Update Order Status</label>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(orderId, e.target.value)}
                        disabled={updatingStatus === orderId}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingStatus === orderId && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-text-light">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      )}
                      <a
                        href={`tel:${customerInfo.phone}`}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call Customer</span>
                      </a>
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                        <span>Invoice</span>
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

