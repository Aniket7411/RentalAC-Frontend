import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate]);

  const loadWishlist = () => {
    try {
      setLoading(true);
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(wishlist);
      setError('');
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const updateWishlist = (updatedWishlist) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError('Failed to update wishlist');
    }
  };

  const removeFromWishlist = (productId) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      updateWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    }
  };

  const addToCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        const updatedCart = cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } else {
        const newCart = [...cart, { ...item, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
      // Optionally remove from wishlist after adding to cart
      // removeFromWishlist(item.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
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
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-8">My Wishlist</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Your wishlist is empty</h2>
            <p className="text-text-light mb-6">Start adding products you love!</p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-primary-blue/30 group"
              >
                <Link to={`/ac/${item.id}`} className="relative block h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={item.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300';
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(item.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </Link>
                
                <div className="p-4">
                  <Link to={`/ac/${item.id}`}>
                    <h3 className="font-semibold text-text-dark mb-2 hover:text-primary-blue transition-colors line-clamp-1">
                      {item.brand} {item.model || item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-text-light mb-2">
                    {item.capacity} • {item.type}
                  </p>
                  <p className="text-xl font-bold text-primary-blue mb-4">
                    ₹{(item.price?.monthly || item.price || 0).toLocaleString()}/month
                  </p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-medium"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

