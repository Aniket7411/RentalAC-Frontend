import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      
      // Try to load from API first
      const response = await apiService.getUserOrders(user?.id);
      
      if (response.success) {
        setOrders(response.data || []);
      } else {
        // Fallback to localStorage
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        setOrders(storedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to localStorage
      try {
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${user?.id}`) || '[]');
        setOrders(storedOrders);
      } catch (e) {
        setError('Failed to load orders');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-8">My Orders</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">No orders yet</h2>
            <p className="text-text-light mb-6">Start shopping to see your orders here!</p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
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
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-text-dark">
                          Order #{order.orderId || order.id || 'N/A'}
                        </h3>
                        <p className="text-sm text-text-light">
                          Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            {item.images?.[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium text-text-dark">
                                {item.brand} {item.model || item.name}
                              </p>
                              <p className="text-sm text-text-light">
                                Quantity: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Status & Total */}
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-text-light">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-blue">
                        ₹{(order.total || order.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    {order.status?.toLowerCase() !== 'cancelled' && (
                      <Link
                        to={`/user/orders/${order.id || order._id}`}
                        className="text-primary-blue hover:text-primary-blue-light text-sm font-medium"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

