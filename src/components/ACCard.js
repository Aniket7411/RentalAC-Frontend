import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { FiShoppingCart, FiHeart, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ACCard = ({ ac }) => {
  const { isAuthenticated } = useAuth();
  const { addRentalToCart } = useCart();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const nextImage = (e) => {
    e.preventDefault();
    if (ac.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ac.images.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    if (ac.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ac.images.length) % ac.images.length);
    }
  };

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      addRentalToCart(ac);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Error is already handled in cart context
    }
  };

  const addToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const existingItem = wishlist.find(item => item.id === (ac._id || ac.id));

      if (!existingItem) {
        const newItem = {
          id: ac._id || ac.id,
          brand: ac.brand,
          model: ac.model,
          name: `${ac.brand} ${ac.model}`,
          capacity: ac.capacity,
          type: ac.type,
          location: ac.location,
          price: ac.price,
          images: ac.images,
        };
        localStorage.setItem('wishlist', JSON.stringify([...wishlist, newItem]));
        setAddedToWishlist(true);
        window.dispatchEvent(new Event('wishlistUpdated'));
        setTimeout(() => setAddedToWishlist(false), 2000);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-blue/30 hover:-translate-y-1 group h-full flex flex-col"
    >
      <Link to={`/ac/${ac._id || ac.id}`} className="relative block h-44 sm:h-48 md:h-52 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
        {ac.images && ac.images.length > 0 ? (
          <>
            <img
              src={ac.images[currentImageIndex]}
              alt={`${ac.brand} ${ac.model}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80';
              }}
            />
            {ac.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevImage(e);
                  }}
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md text-primary-blue opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-xl hover:shadow-2xl z-20 border border-gray-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextImage(e);
                  }}
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md text-primary-blue opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-xl hover:shadow-2xl z-20 border border-gray-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {/* Action Buttons */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-20">
          <button
            type="button"
            onClick={addToWishlist}
            className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 ${addedToWishlist
              ? 'bg-green-500/95 text-white'
              : 'text-red-600 hover:bg-red-50/90'
              }`}
            title={addedToWishlist ? 'Added to wishlist' : 'Add to wishlist'}
          >
            {addedToWishlist ? (
              <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <FiHeart className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={addToCart}
            className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 ${addedToCart
              ? 'bg-green-500/95 text-white'
              : 'text-primary-blue hover:bg-blue-50/90'
              }`}
            title={addedToCart ? 'Added to cart' : 'Add to cart'}
          >
            {addedToCart ? (
              <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
        {ac.status && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-lg z-10 ${ac.status === 'Available' ? 'bg-green-500/90 text-white' :
            ac.status === 'Rented Out' ? 'bg-red-500/90 text-white' :
              'bg-yellow-500/90 text-white'
            }`}>
            {ac.status}
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-4 md:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm sm:text-base md:text-lg text-text-dark mb-1.5 sm:mb-2 line-clamp-2">{ac.brand} {ac.model}</h3>
        <p className="text-xs sm:text-sm text-text-light mb-2 sm:mb-2.5 font-medium">{ac.capacity} • {ac.type}</p>
        {/* Location - Commented out for browsing view */}
        {/* <div className="flex items-center text-xs sm:text-sm text-text-light mb-2 sm:mb-2.5">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-primary-blue flex-shrink-0" />
          <span className="line-clamp-1">{ac.location}</span>
        </div> */}
        {/* Price - Commented out for browsing view */}
        {/* <div className="flex items-baseline justify-between mb-2.5 sm:mb-3 pb-2 sm:pb-2.5 border-b border-gray-100">
          <div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-blue">
              ₹{(ac.price?.[3] || ac.price || 0).toLocaleString() || 'N/A'}
            </span>
            <span className="text-xs sm:text-sm text-text-light ml-1">/month</span>
          </div>
        </div> */}
        <Link
          to={`/ac/${ac._id || ac.id}`}
          className="block w-full text-center bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-2 sm:py-2.5 md:py-3 rounded-lg hover:shadow-lg transition-all duration-300 text-xs sm:text-sm md:text-base font-semibold hover:scale-[1.02] mt-auto"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default ACCard;

