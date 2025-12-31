import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const Wishlist = () => {
  const { user, isAuthenticated } = useAuth();
  const { wishlistItems, loading, removeFromWishlist, loadWishlist } = useWishlist();
  const { addRentalToCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate, loadWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingId(productId);
    setError('');
    try {
      const result = await removeFromWishlist(productId);
      if (!result.success) {
        setError(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (item) => {
    try {
      const product = item.product || item;
      addRentalToCart(product);
      showSuccess(`${product.brand} ${product.model || ''} added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMsg = error.message || 'Failed to add item to cart';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const getProductData = (item) => {
    // Handle both nested product structure and flat structure
    if (item.product) {
      return item.product;
    }
    return item;
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
              Browse Rental Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {wishlistItems.map((item, index) => {
              const product = getProductData(item);
              const productId = product._id || product.id || item.productId;
              const isRemoving = removingId === productId;

              return (
                <motion.div
                  key={productId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-primary-blue/30 group"
                >
                  <Link to={`/ac/${productId}`} className="relative block h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.name || `${product.brand} ${product.model}` || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromWishlist(productId);
                      }}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 z-10 flex items-center justify-center text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-5 h-5 animate-spin drop-shadow-lg" />
                      ) : (
                        <FiHeart className="w-5 h-5 fill-red-600 text-red-600 drop-shadow-lg" />
                      )}
                    </button>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/ac/${productId}`}>
                      <h3 className="font-semibold text-text-dark mb-2 hover:text-primary-blue transition-colors line-clamp-1">
                        {product.brand} {product.model || product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-text-light mb-2">
                      {product.capacity} • {product.type}
                    </p>
                    <p className="text-xl font-bold text-primary-blue mb-4">
                      ₹{(product.price?.[3] || product.price || 0).toLocaleString()}/3 months
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center space-x-2 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-medium"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
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

export default Wishlist;

