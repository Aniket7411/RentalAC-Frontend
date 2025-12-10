import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock as FiTime,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiStar,
  FiInfo,
  FiShield,
  FiImage
} from 'react-icons/fi';
import { Wrench, Loader2, ArrowLeft, ChevronLeft, ChevronRight, X, Download, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import CancelOrderModal from '../../components/CancelOrderModal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { generateInvoice } from '../../utils/invoiceGenerator';

// Product Image Gallery Component
const ProductImageGallery = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex-shrink-0">
      <div className="relative w-32 h-32 md:w-40 md:h-40">
        <img
          src={images[currentImageIndex]}
          alt={productName || 'Product'}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/160';
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex space-x-2 mt-2 overflow-x-auto">
          {images.slice(0, 4).map((img, imgIdx) => (
            <img
              key={imgIdx}
              src={img}
              alt={`Thumbnail ${imgIdx + 1}`}
              className={`w-12 h-12 object-cover rounded cursor-pointer border-2 ${currentImageIndex === imgIdx ? 'border-primary-blue' : 'border-transparent'
                }`}
              onClick={() => setCurrentImageIndex(imgIdx)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/48';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrder();
  }, [id, isAuthenticated, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch from API
      const response = await apiService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        // Fallback to localStorage
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        const foundOrder = storedOrders.find(o => (o.id || o._id) === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
      // Fallback to localStorage
      try {
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        const foundOrder = storedOrders.find(o => (o.id || o._id) === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } catch (e) {
        setError('Failed to load order');
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
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleCancelClick = () => {
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    if (!id) return;

    setCancelling(true);
    try {
      const response = await apiService.cancelOrder(id, reason);
      if (response.success) {
        success('Order cancelled successfully');
        setCancelModalOpen(false);
        // Reload order
        loadOrder();
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

  const canCancelOrder = () => {
    if (!order) return false;
    const status = order.status?.toLowerCase();
    return status !== 'cancelled' && status !== 'completed' && status !== 'delivered';
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

  // Get product data from various possible locations
  const getProductData = (item) => {
    return item.productId || item.product || item.productDetails || {};
  };

  // Get all images from product
  const getProductImages = (item) => {
    const productData = getProductData(item);
    return productData.images || item.productDetails?.images || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Order Not Found</h2>
            <p className="text-text-light mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              to="/user/orders"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/user/orders"
          className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-light transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-dark">
                  Order #{order.orderId || order.id || 'N/A'}
                </h1>
                <p className="text-sm text-text-light mt-1">
                  Placed on {new Date(order.orderDate || order.createdAt || order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status || 'Pending'}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors text-sm font-medium"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
              {canCancelOrder() && (
                <button
                  onClick={handleCancelClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
              {order.cancellationReason && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 max-w-md">
                  <p className="font-semibold mb-1">Cancellation Reason:</p>
                  <p>{order.cancellationReason}</p>
                  {order.cancelledAt && (
                    <p className="mt-2 text-xs text-red-600">
                      Cancelled on: {new Date(order.cancelledAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {order.cancelledBy && (
                    <p className="mt-1 text-xs text-red-600">
                      Cancelled by: {order.cancelledBy === 'user' ? 'You' : 'Admin'}
                    </p>
                  )}
                </div>
              )}
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
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Items</h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item, idx) => {
                    const productData = getProductData(item);
                    const productImages = getProductImages(item);

                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 last:border-b">
                        {item.type === 'rental' ? (
                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              {/* Product Images Gallery */}
                              {productImages.length > 0 && (
                                <ProductImageGallery
                                  images={productImages}
                                  productName={productData.name || `${productData.brand} ${productData.model}`}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-text-dark">
                                      {productData.name || `${productData.brand} ${productData.model}`}
                                    </h3>
                                    <div className="text-sm text-text-light mt-1 space-y-1">
                                      {productData.category && <p><span className="font-medium">Category:</span> {productData.category}</p>}
                                      {productData.brand && <p><span className="font-medium">Brand:</span> {productData.brand}</p>}
                                      {productData.model && <p><span className="font-medium">Model:</span> {productData.model}</p>}
                                      {productData.capacity && <p><span className="font-medium">Capacity:</span> {productData.capacity}</p>}
                                      {(productData.type || productData.productType) && (
                                        <p><span className="font-medium">Type:</span> {productData.type || productData.productType}</p>
                                      )}
                                      {productData.location && <p><span className="font-medium">Location:</span> {productData.location}</p>}
                                      {productData.condition && <p><span className="font-medium">Condition:</span> {productData.condition}</p>}
                                      {productData.status && <p><span className="font-medium">Status:</span> {productData.status}</p>}
                                      {item.duration && (
                                        <p><span className="font-medium">Rental Duration:</span> {item.duration} months</p>
                                      )}
                                      {/* Payment Type & Monthly Payment Information */}
                                      <div className="mt-2">
                                        {item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure ? (
                                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <FiInfo className="w-4 h-4 text-blue-600" />
                                              <span className="text-sm font-semibold text-blue-700">Monthly Payment Plan</span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                              <p><span className="font-medium text-gray-700">Payment Type:</span> <span className="text-blue-600 font-semibold">Monthly Payment</span></p>
                                              <p><span className="font-medium text-gray-700">Monthly Price:</span> <span className="text-blue-600 font-semibold">₹{item.monthlyPrice.toLocaleString()}/month</span></p>
                                              {item.securityDeposit > 0 && (
                                                <p><span className="font-medium text-gray-700">Security Deposit:</span> <span className="text-blue-600 font-semibold">₹{(item.securityDeposit || 0).toLocaleString()}</span></p>
                                              )}
                                              <p><span className="font-medium text-gray-700">Tenure:</span> <span className="text-gray-900">{item.monthlyTenure} months</span></p>
                                              <p><span className="font-medium text-gray-700">Upfront Payment (1 month + Security Deposit):</span> <span className="text-gray-900 font-semibold">₹{((item.monthlyPrice || 0) + (item.securityDeposit || 0)).toLocaleString()}</span></p>
                                              {item.installationCharges && item.installationCharges.amount > 0 && (
                                                <div className="mt-2 pt-2 border-t border-blue-200">
                                                  <p><span className="font-medium text-gray-700">Installation Charges:</span> <span className="text-blue-600 font-semibold">₹{item.installationCharges.amount.toLocaleString()}</span></p>
                                                  {item.installationCharges.includedItems && item.installationCharges.includedItems.length > 0 && (
                                                    <p className="text-xs text-gray-600 mt-1">Includes: {item.installationCharges.includedItems.join(', ')}</p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="p-2 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600"><span className="font-medium">Payment Type:</span> <span className="font-semibold">Advance Payment</span></p>
                                            {item.duration && (
                                              <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Duration:</span> {item.duration} months</p>
                                            )}
                                            {item.installationCharges && item.installationCharges.amount > 0 && (
                                              <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-sm"><span className="font-medium text-gray-700">Installation Charges:</span> <span className="text-blue-600 font-semibold">₹{item.installationCharges.amount.toLocaleString()}</span></p>
                                                {item.installationCharges.includedItems && item.installationCharges.includedItems.length > 0 && (
                                                  <p className="text-xs text-gray-600 mt-1">Includes: {item.installationCharges.includedItems.join(', ')}</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p><span className="font-medium">Quantity:</span> {item.quantity || 1}</p>
                                    </div>

                                    {/* Product Description */}
                                    {productData.description && (
                                      <div className="mt-3">
                                        <p className="text-sm font-medium text-text-dark mb-1">Description:</p>
                                        <p className="text-sm text-text-light">{productData.description}</p>
                                      </div>
                                    )}

                                    {/* Product Features */}
                                    {productData.features && (
                                      <div className="mt-3 space-y-2">
                                        {productData.features.specs && productData.features.specs.length > 0 && (
                                          <div>
                                            <p className="text-sm font-medium text-text-dark mb-1">Specifications:</p>
                                            <ul className="text-sm text-text-light list-disc list-inside space-y-1">
                                              {productData.features.specs.map((spec, specIdx) => (
                                                <li key={specIdx}>{spec}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {productData.features.dimensions && (
                                          <div>
                                            <p className="text-sm font-medium text-text-dark mb-1">Dimensions:</p>
                                            <p className="text-sm text-text-light">{productData.features.dimensions}</p>
                                          </div>
                                        )}
                                        {productData.features.safety && productData.features.safety.length > 0 && (
                                          <div>
                                            <p className="text-sm font-medium text-text-dark mb-1">Safety Features:</p>
                                            <ul className="text-sm text-text-light list-disc list-inside space-y-1">
                                              {productData.features.safety.map((safety, safetyIdx) => (
                                                <li key={safetyIdx}>{safety}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Product Ratings & Reviews */}
                                    {(productData.averageRating !== undefined || productData.totalReviews !== undefined) && (
                                      <div className="mt-3 flex items-center space-x-2">
                                        {productData.averageRating !== undefined && productData.averageRating > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium text-text-dark">{productData.averageRating.toFixed(1)}</span>
                                          </div>
                                        )}
                                        {productData.totalReviews !== undefined && (
                                          <span className="text-sm text-text-light">({productData.totalReviews} reviews)</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Price Options */}
                                    {productData.price && typeof productData.price === 'object' && (
                                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-text-dark mb-2">Rental Price Options:</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          {Object.entries(productData.price).map(([months, price]) => (
                                            <div key={months} className="flex justify-between">
                                              <span className="text-text-light">{months} months:</span>
                                              <span className="font-medium text-text-dark">₹{price.toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Delivery Info */}
                                    {item.deliveryInfo?.address && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-text-dark mb-1 flex items-center space-x-2">
                                          <FiMapPin className="w-4 h-4" />
                                          <span>Delivery Address:</span>
                                        </p>
                                        <p className="text-sm text-text-light">{item.deliveryInfo.address}</p>
                                        {item.deliveryInfo.nearLandmark && (
                                          <p className="text-sm text-text-light">Near: {item.deliveryInfo.nearLandmark}</p>
                                        )}
                                        {item.deliveryInfo.pincode && (
                                          <p className="text-sm text-text-light">Pincode: {item.deliveryInfo.pincode}</p>
                                        )}
                                        {item.deliveryInfo.contactName && (
                                          <p className="text-sm text-text-light mt-1">Contact: {item.deliveryInfo.contactName}</p>
                                        )}
                                        {item.deliveryInfo.contactPhone && (
                                          <p className="text-sm text-text-light">Phone: {item.deliveryInfo.contactPhone}</p>
                                        )}
                                        {item.deliveryInfo.alternatePhone && (
                                          <p className="text-sm text-text-light">Alternate: {item.deliveryInfo.alternatePhone}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-text-light mb-1">Item Price</p>
                                    <p className="text-xl font-bold text-primary-blue">
                                      ₹{(() => {
                                        // Calculate total item price including installation charges
                                        let itemPrice = item.price || 0;
                                        if (item.installationCharges && item.installationCharges.amount) {
                                          itemPrice += item.installationCharges.amount;
                                        }
                                        return itemPrice.toLocaleString();
                                      })()}
                                    </p>
                                    {item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure ? (
                                      <div className="mt-2 text-xs space-y-1">
                                        <p className="text-blue-600 font-semibold">Monthly Payment</p>
                                        <p className="text-text-light">₹{item.monthlyPrice.toLocaleString()}/month × {item.monthlyTenure} months</p>
                                        {item.securityDeposit > 0 && (
                                          <p className="text-text-light">Security Deposit: ₹{(item.securityDeposit || 0).toLocaleString()}</p>
                                        )}
                                        <p className="text-text-light font-medium">Upfront: ₹{((item.monthlyPrice || 0) + (item.securityDeposit || 0)).toLocaleString()}</p>
                                        {item.installationCharges && item.installationCharges.amount > 0 && (
                                          <p className="text-blue-600 mt-1">+ Installation: ₹{item.installationCharges.amount.toLocaleString()}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-2 text-xs space-y-1">
                                        {item.duration && (
                                          <p className="text-text-light">Advance Payment for {item.duration} months</p>
                                        )}
                                        {item.installationCharges && item.installationCharges.amount > 0 && (
                                          <p className="text-blue-600">+ Installation: ₹{item.installationCharges.amount.toLocaleString()}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                                  e.target.src = 'https://via.placeholder.com/80';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Wrench className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-text-dark">
                                  {item.serviceDetails?.title || 'Service'}
                                </h3>
                              </div>
                              {item.serviceDetails?.description && (
                                <p className="text-sm text-text-light mb-2">{item.serviceDetails.description}</p>
                              )}
                              {item.bookingDetails && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                                  {item.bookingDetails.preferredDate && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <FiCalendar className="w-4 h-4" />
                                      <span>Date: {new Date(item.bookingDetails.preferredDate).toLocaleDateString()}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.preferredTime && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <FiTime className="w-4 h-4" />
                                      <span>Time: {formatTimeSlot(item.bookingDetails.preferredTime)}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.address && (
                                    <p className="text-sm text-text-light flex items-start space-x-2">
                                      <FiMapPin className="w-4 h-4 mt-0.5" />
                                      <span>{item.bookingDetails.address}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.contactName && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <FiUser className="w-4 h-4" />
                                      <span>Contact: {item.bookingDetails.contactName}</span>
                                    </p>
                                  )}
                                  {item.bookingDetails.contactPhone && (
                                    <p className="text-sm text-text-light flex items-center space-x-2">
                                      <FiPhone className="w-4 h-4" />
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
                        ) : (
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-dark">
                                {item.brand} {item.model || item.name}
                              </h3>
                              <p className="text-sm text-text-light">Quantity: {item.quantity || 1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary-blue">
                                ₹{(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-light">No items found in this order.</p>
              )}
            </motion.div>

            {/* User Information */}
            {order.userId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-text-dark mb-4">User Information</h2>
                <div className="space-y-3">
                  {order.userId.name && (
                    <div className="flex items-center space-x-3">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">Name</p>
                        <p className="font-medium text-text-dark">{order.userId.name}</p>
                      </div>
                    </div>
                  )}
                  {order.userId.email && (
                    <div className="flex items-center space-x-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">Email</p>
                        <p className="font-medium text-text-dark">{order.userId.email}</p>
                      </div>
                    </div>
                  )}
                  {order.userId._id && (
                    <div className="flex items-center space-x-3">
                      <FiInfo className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">User ID</p>
                        <p className="font-medium text-text-dark text-xs">{order.userId._id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer Information */}
            {order.customerInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-text-dark mb-4">Customer Information</h2>
                <div className="space-y-3">
                  {order.customerInfo.userId && (
                    <div className="flex items-center space-x-3">
                      <FiInfo className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">User ID</p>
                        <p className="font-medium text-text-dark text-xs">{order.customerInfo.userId}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-text-light">Name</p>
                      <p className="font-medium text-text-dark">{order.customerInfo.name}</p>
                    </div>
                  </div>
                  {order.customerInfo.email && (
                    <div className="flex items-center space-x-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">Email</p>
                        <p className="font-medium text-text-dark">{order.customerInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {order.customerInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">Phone</p>
                        <p className="font-medium text-text-dark">{order.customerInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {order.customerInfo.alternatePhone && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-text-light">Alternate Phone</p>
                        <p className="font-medium text-text-dark">{order.customerInfo.alternatePhone}</p>
                      </div>
                    </div>
                  )}
                  {order.customerInfo.address?.homeAddress && (
                    <div className="flex items-start space-x-3">
                      <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-text-light">Address</p>
                        <p className="font-medium text-text-dark">{order.customerInfo.address.homeAddress}</p>
                        {order.customerInfo.address.nearLandmark && (
                          <p className="text-sm text-text-light">Near: {order.customerInfo.address.nearLandmark}</p>
                        )}
                        {order.customerInfo.address.pincode && (
                          <p className="text-sm text-text-light">Pincode: {order.customerInfo.address.pincode}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Delivery Addresses */}
            {order.deliveryAddresses && order.deliveryAddresses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-text-dark mb-4">Delivery Addresses</h2>
                <div className="space-y-4">
                  {order.deliveryAddresses.map((address, addrIdx) => (
                    <div key={addrIdx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiMapPin className="w-5 h-5 text-primary-blue" />
                        <span className="font-medium text-text-dark capitalize">{address.type || 'Delivery'} Address</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {address.address && (
                          <p className="text-text-dark"><span className="font-medium">Address:</span> {address.address}</p>
                        )}
                        {address.nearLandmark && (
                          <p className="text-text-light"><span className="font-medium">Near:</span> {address.nearLandmark}</p>
                        )}
                        {address.pincode && (
                          <p className="text-text-light"><span className="font-medium">Pincode:</span> {address.pincode}</p>
                        )}
                        {address.contactName && (
                          <p className="text-text-light"><span className="font-medium">Contact Name:</span> {address.contactName}</p>
                        )}
                        {address.contactPhone && (
                          <p className="text-text-light"><span className="font-medium">Contact Phone:</span> {address.contactPhone}</p>
                        )}
                        {address.alternatePhone && (
                          <p className="text-text-light"><span className="font-medium">Alternate Phone:</span> {address.alternatePhone}</p>
                        )}
                        {address.preferredDate && (
                          <p className="text-text-light flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4" />
                            <span><span className="font-medium">Preferred Date:</span> {new Date(address.preferredDate).toLocaleDateString()}</span>
                          </p>
                        )}
                        {address.preferredTime && (
                          <p className="text-text-light flex items-center space-x-2">
                            <FiTime className="w-4 h-4" />
                            <span><span className="font-medium">Preferred Time:</span> {formatTimeSlot(address.preferredTime)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-text-light">
                  <span>Subtotal</span>
                  <span>₹{(order.total || 0).toLocaleString()}</span>
                </div>
                {order.paymentDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Payment Discount (5% Pay Now)</span>
                    <span>-₹{order.paymentDiscount.toLocaleString()}</span>
                  </div>
                )}
                {order.couponCode && order.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({order.couponCode})</span>
                    <span>-₹{order.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (order.discount !== (order.paymentDiscount || 0) + (order.couponDiscount || 0)) && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-text-dark">
                  <span>Final Total</span>
                  <span className="text-primary-blue">₹{(order.finalTotal || order.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light flex items-center space-x-2">
                      <FiCreditCard className="w-4 h-4" />
                      <span>Payment Option</span>
                    </span>
                    <span className="text-sm font-medium text-text-dark">
                      {order.paymentOption === 'payNow' ? 'Pay Now' : 'Pay Later'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Payment Status</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                    </span>
                  </div>
                  
                  {/* Payment Details (if paid) */}
                  {order.paymentStatus === 'paid' && order.paymentDetails && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-green-700 mb-2">Payment Details</p>
                      {order.paymentDetails.gateway && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Gateway:</span>
                          <span className="font-medium text-gray-900 capitalize">{order.paymentDetails.gateway}</span>
                        </div>
                      )}
                      {order.paymentDetails.transactionId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium text-gray-900 font-mono text-[10px]">{order.paymentDetails.transactionId}</span>
                        </div>
                      )}
                      {order.paymentDetails.paidAt && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Paid At:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(order.paymentDetails.paidAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Monthly Payment Items Summary */}
                  {order.items && order.items.some(item => item.isMonthlyPayment) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                        <FiInfo className="w-3 h-3" />
                        Monthly Payment Items
                      </p>
                      <div className="space-y-1 text-xs">
                        {order.items.filter(item => item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure).map((item, idx) => (
                          <p key={idx} className="text-gray-700">
                            • ₹{item.monthlyPrice.toLocaleString()}/month for {item.monthlyTenure} months (Security Deposit: ₹{(item.securityDeposit || 0).toLocaleString()})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Pay Now Button (if pending) */}
                  {order.paymentStatus !== 'paid' && order.paymentOption === 'payNow' && (
                    <button
                      onClick={() => {
                        // Navigate to payment page or trigger payment
                        navigate(`/user/checkout?orderId=${order._id || order.id}`);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors text-sm font-semibold"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-text-dark mb-2">Order Notes</h3>
                  <p className="text-sm text-text-light">{order.notes}</p>
                </div>
              )}

              {/* Order Dates */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-text-dark mb-2">Order Dates</h3>
                <div className="space-y-1 text-sm">
                  {order.orderDate && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Order Date:</span>
                      <span className="text-text-dark">{new Date(order.orderDate).toLocaleString()}</span>
                    </div>
                  )}
                  {order.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Created At:</span>
                      <span className="text-text-dark">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  {order.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Last Updated:</span>
                      <span className="text-text-dark">{new Date(order.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        orderId={id}
        isLoading={cancelling}
      />
    </div>
  );
};

export default OrderDetail;

