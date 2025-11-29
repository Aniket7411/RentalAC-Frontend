import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ACCard = ({ ac }) => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const productId = ac._id || ac.id;

  useEffect(() => {
    if (isAuthenticated && productId) {
      setIsWishlisted(isInWishlist(productId));
    }
  }, [isAuthenticated, productId, isInWishlist]);

  // Calculate per month price for 11 months (to show attractive pricing)
  const calculatePerMonthPrice = () => {
    if (!ac.price) return 0;
    if (typeof ac.price === 'object' && ac.price[11]) {
      // If 11 months price exists, calculate per month: total / 11
      return Math.round(ac.price[11] / 11);
    }
    // Fallback to 3 months price
    if (typeof ac.price === 'object' && ac.price[3]) {
      return ac.price[3];
    }
    return typeof ac.price === 'number' ? ac.price : 0;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          setIsWishlisted(false);
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-blue/30 hover:-translate-y-1 group h-full flex flex-col"
    >
      <Link to={`/ac/${ac._id || ac.id}`} className="relative block h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
        {ac.images && ac.images.length > 0 ? (
          <img
            src={ac.images[0]}
            alt={`${ac.brand} ${ac.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Availability Badge - Left Side */}
        {ac.status && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-lg z-10 ${ac.status === 'Available' ? 'bg-green-500/95 text-white' :
            ac.status === 'Rented Out' ? 'bg-red-500/95 text-white' :
              'bg-yellow-500/95 text-white'
            }`}>
            {ac.status}
          </div>
        )}
        
        {/* Wishlist Icon - Right Side */}
        <div className="absolute top-3 right-3 z-20">
          <FiHeart
            onClick={handleWishlistToggle}
            className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transition-all duration-300 ${isWishlisted
              ? 'text-red-500 fill-red-500'
              : 'text-white drop-shadow-lg hover:text-red-500'
              } ${loading ? 'opacity-50 cursor-wait' : ''}`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          />
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1.5 line-clamp-2 leading-tight">{ac.brand} {ac.model}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 font-medium">{ac.capacity} • {ac.type}</p>

        {/* Per Month Price (calculated from 11 months) */}
        <div className="mt-auto">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-bold text-primary-blue">
              ₹{calculatePerMonthPrice().toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">/month</span>
          </div>
          {ac.price && typeof ac.price === 'object' && ac.price[11] && (
            <p className="text-xs text-gray-500 mt-1">
              For 11 months rental
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ACCard;
