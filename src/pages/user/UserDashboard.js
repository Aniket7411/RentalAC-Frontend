import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { ShoppingBag, Wrench, Clock, CheckCircle, XCircle, ShoppingCart, Heart, Package, MapPin, Edit2, X, Save, Phone, MapPinned } from 'lucide-react';
import { FiShoppingCart, FiHeart, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [addressData, setAddressData] = useState({
    homeAddress: '',
    nearLandmark: '',
    alternateNumber: '',
    pincode: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);

  useEffect(() => {
    loadData();
    loadLocalData();
    // Load address data from user object
    if (user) {
      setAddressData({
        homeAddress: user?.homeAddress || user?.address?.homeAddress || '',
        nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
        alternateNumber: user?.address?.alternateNumber || user?.alternateNumber || '',
        pincode: user?.address?.pincode || user?.pincode || '',
      });
    }
    
    // Listen for cart/wishlist updates
    const handleCartUpdate = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    };
    
    const handleWishlistUpdate = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(wishlist.length);
      } catch (e) {
        console.error('Error loading wishlist:', e);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', () => {
      handleCartUpdate();
      handleWishlistUpdate();
    });

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const loadLocalData = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const orders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
      
      setCartCount(cart.length);
      setWishlistCount(wishlist.length);
      setOrdersCount(orders.length);
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load orders if API method exists
      if (apiService.getUserOrders) {
        try {
          const ordersRes = await apiService.getUserOrders(user?.id);
          if (ordersRes.success) {
            const orders = ordersRes.data || [];
            setOrdersCount(orders.length);
            try {
              localStorage.setItem(`orders_${user?.id}`, JSON.stringify(orders));
            } catch (e) {
              console.error('Error saving orders:', e);
            }
          }
        } catch (e) {
          console.error('Error loading orders:', e);
        }
      }
      
      // Try to load service requests from localStorage or API
      try {
        const storedServices = JSON.parse(localStorage.getItem(`serviceRequests_${user?.id}`) || '[]');
        setServiceRequests(storedServices);
      } catch (e) {
        console.error('Error loading service requests:', e);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load some data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const activeRentals = rentals.filter(r => r.status === 'Active').length;
  const pendingServices = serviceRequests.filter(s => s.status === 'Pending').length;

  const handleSaveAddress = async () => {
    if (!addressData.homeAddress.trim()) {
      setError('Home address is required');
      return;
    }

    if (addressData.pincode && !/^\d{6}$/.test(addressData.pincode.trim())) {
      setError('Pincode must be 6 digits');
      return;
    }

    if (addressData.alternateNumber && !/^\d{10}$/.test(addressData.alternateNumber.trim())) {
      setError('Alternate number must be 10 digits');
      return;
    }

    setSavingAddress(true);
    setError('');

    try {
      // Prepare address data to send to backend
      const addressUpdate = {
        homeAddress: addressData.homeAddress.trim(),
        address: {
          homeAddress: addressData.homeAddress.trim(),
          nearLandmark: addressData.nearLandmark.trim() || undefined,
          alternateNumber: addressData.alternateNumber.trim() || undefined,
          pincode: addressData.pincode.trim() || undefined,
        },
        ...(addressData.nearLandmark.trim() && { nearLandmark: addressData.nearLandmark.trim() }),
        ...(addressData.alternateNumber.trim() && { alternateNumber: addressData.alternateNumber.trim() }),
        ...(addressData.pincode.trim() && { pincode: addressData.pincode.trim() }),
      };

      const response = await apiService.updateUserProfile(addressUpdate);
      
      if (response?.success) {
        setAddressSuccess(true);
        setShowAddressEdit(false);
        // Update user context if available
        if (window.updateUserContext) {
          window.updateUserContext({ 
            ...user, 
            homeAddress: addressData.homeAddress.trim(),
            address: {
              homeAddress: addressData.homeAddress.trim(),
              nearLandmark: addressData.nearLandmark.trim(),
              alternateNumber: addressData.alternateNumber.trim(),
              pincode: addressData.pincode.trim(),
            }
          });
        }
        setTimeout(() => setAddressSuccess(false), 3000);
      } else {
        setError(response?.message || 'Failed to update address');
      }
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-text-light mb-8">Here's an overview of your activities</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 md:mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {addressSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 md:mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Address updated successfully!</span>
          </div>
        )}

        {/* Address Section */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-text-dark flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-blue" />
              Delivery Address
            </h2>
            {!showAddressEdit && (
              <button
                onClick={() => {
                  setShowAddressEdit(true);
                  // Reload address data when editing
                  setAddressData({
                    homeAddress: user?.homeAddress || user?.address?.homeAddress || '',
                    nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
                    alternateNumber: user?.address?.alternateNumber || user?.alternateNumber || '',
                    pincode: user?.address?.pincode || user?.pincode || '',
                  });
                }}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-primary-blue hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
          
          {showAddressEdit ? (
            <div className="space-y-4">
              {/* Home Address */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Home Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addressData.homeAddress}
                  onChange={(e) => handleAddressChange('homeAddress', e.target.value)}
                  placeholder="Enter your complete home address"
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                  rows="3"
                  required
                />
              </div>

              {/* Near Landmark */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  <MapPinned className="w-4 h-4 inline mr-1" />
                  Near Landmark
                </label>
                <input
                  type="text"
                  value={addressData.nearLandmark}
                  onChange={(e) => handleAddressChange('nearLandmark', e.target.value)}
                  placeholder="e.g., Near City Mall, Behind Hospital"
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Pincode and Alternate Number in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={addressData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      handleAddressChange('pincode', value);
                    }}
                    placeholder="6 digit pincode"
                    maxLength="6"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                {/* Alternate Number */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Alternate Number
                  </label>
                  <input
                    type="text"
                    value={addressData.alternateNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleAddressChange('alternateNumber', value);
                    }}
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Note about Google API */}
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 Google Maps integration will be available soon for easy address selection
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingAddress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddressEdit(false);
                    // Reset to original values
                    setAddressData({
                      homeAddress: user?.homeAddress || user?.address?.homeAddress || '',
                      nearLandmark: user?.address?.nearLandmark || user?.nearLandmark || '',
                      alternateNumber: user?.address?.alternateNumber || user?.alternateNumber || '',
                      pincode: user?.address?.pincode || user?.pincode || '',
                    });
                    setError('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-text-dark text-sm md:text-base">
              {user?.homeAddress || user?.address?.homeAddress ? (
                <>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{user?.homeAddress || user?.address?.homeAddress}</p>
                      {user?.address?.nearLandmark || user?.nearLandmark ? (
                        <p className="text-text-light text-sm mt-1">
                          Near {user?.address?.nearLandmark || user?.nearLandmark}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-light">
                        {user?.address?.pincode || user?.pincode ? (
                          <span>📮 Pincode: {user?.address?.pincode || user?.pincode}</span>
                        ) : null}
                        {user?.address?.alternateNumber || user?.alternateNumber ? (
                          <span>📱 Alt: {user?.address?.alternateNumber || user?.alternateNumber}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-text-light">No address added yet. Click Edit to add your delivery address.</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Active Rentals</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{activeRentals}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Pending Services</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{pendingServices}</p>
              </div>
              <Wrench className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/user/cart'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Cart Items</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{cartCount}</p>
              </div>
              <FiShoppingCart className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/user/wishlist'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Wishlist</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{wishlistCount}</p>
              </div>
              <FiHeart className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/browse"
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
            >
              Browse Products
            </Link>
            <Link
              to="/user/cart"
              className="px-6 py-2 bg-primary-blue-light text-white rounded-lg hover:bg-primary-blue transition"
            >
              View Cart ({cartCount})
            </Link>
            <Link
              to="/user/wishlist"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              View Wishlist ({wishlistCount})
            </Link>
            <Link
              to="/user/orders"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              My Orders ({ordersCount})
            </Link>
            <Link
              to="/service-request"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Request Service
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Cart & Wishlist Summary */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Cart & Wishlist</h2>
            <div className="space-y-4">
              <Link to="/user/cart" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <FiShoppingCart className="w-6 h-6 text-primary-blue" />
                  <div>
                    <p className="font-semibold text-text-dark">Shopping Cart</p>
                    <p className="text-sm text-text-light">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-primary-blue">View →</span>
              </Link>
              <Link to="/user/wishlist" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <FiHeart className="w-6 h-6 text-primary-blue" />
                  <div>
                    <p className="font-semibold text-text-dark">Wishlist</p>
                    <p className="text-sm text-text-light">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-primary-blue">View →</span>
              </Link>
              <Link to="/user/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <FiPackage className="w-6 h-6 text-primary-blue" />
                  <div>
                    <p className="font-semibold text-text-dark">Orders</p>
                    <p className="text-sm text-text-light">{ordersCount} order{ordersCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-primary-blue">View →</span>
              </Link>
            </div>
          </div>

          {/* Service Requests */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Service Requests</h2>
            {serviceRequests.length > 0 ? (
              <div className="space-y-4">
                {serviceRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-text-dark">
                          {request.brand} {request.model}
                        </p>
                        <p className="text-sm text-text-light">{request.acType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-light line-clamp-2">{request.description}</p>
                    <p className="text-xs text-text-light mt-1">Created: {request.createdAt}</p>
                  </div>
                ))}
                {serviceRequests.length > 3 && (
                  <Link to="/service-request" className="text-primary-blue text-sm font-medium">
                    View all service requests →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-text-light">
                No service requests yet. <Link to="/service-request" className="text-primary-blue">Request Service</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

