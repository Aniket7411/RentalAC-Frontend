import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [isAuthenticated, navigate]);

  const loadCart = () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
      setError('');
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (updatedCart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart');
    }
  };

  const removeFromCart = (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== productId);
      updateCart(updatedCart);
      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    try {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      updateCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price?.monthly || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    // Navigate to checkout page (to be created)
    navigate('/checkout', { state: { cartItems } });
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
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-8">Shopping Cart</h1>

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

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Your cart is empty</h2>
            <p className="text-text-light mb-6">Add some products to get started!</p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link to={`/ac/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.name || 'Product'}
                        className="w-full sm:w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link to={`/ac/${item.id}`}>
                        <h3 className="text-lg font-semibold text-text-dark mb-2 hover:text-primary-blue transition-colors">
                          {item.brand} {item.model || item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-text-light mb-2">
                        {item.capacity} • {item.type}
                      </p>
                      <p className="text-xl font-bold text-primary-blue mb-4">
                        ₹{(item.price?.monthly || item.price || 0).toLocaleString()}/month
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-semibold w-12 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-text-light">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-light">
                    <span>Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-text-dark">
                    <span>Total</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/browse"
                  className="block text-center mt-4 text-primary-blue hover:text-primary-blue-light transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

