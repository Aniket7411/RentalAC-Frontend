import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { FiShoppingCart, FiHeart, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ACCard = ({ ac }) => {
  const { isAuthenticated } = useAuth();
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
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.id === (ac._id || ac.id));
      
      if (existingItem) {
        const updatedCart = cart.map(item =>
          item.id === (ac._id || ac.id)
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } else {
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
          quantity: 1,
        };
        localStorage.setItem('cart', JSON.stringify([...cart, newItem]));
      }
      
      setAddedToCart(true);
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
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
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gradient-to-r hover:from-primary-blue/20 hover:via-primary-blue-light/20 hover:to-primary-blue/20 hover:-translate-y-2 group"
      style={{
        borderImage: 'none',
      }}
    >
      <Link to={`/ac/${ac._id || ac.id}`} className="relative block h-32 sm:h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
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
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-2 z-20">
          <button
            onClick={addToWishlist}
            className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${
              addedToWishlist
                ? 'bg-green-500/90 text-white'
                : 'bg-white/90 text-red-600 hover:bg-red-50'
            }`}
            title={addedToWishlist ? 'Added to wishlist' : 'Add to wishlist'}
          >
            {addedToWishlist ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <FiHeart className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={addToCart}
            className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${
              addedToCart
                ? 'bg-green-500/90 text-white'
                : 'bg-white/90 text-primary-blue hover:bg-blue-50'
            }`}
            title={addedToCart ? 'Added to cart' : 'Add to cart'}
          >
            {addedToCart ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <FiShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
        {ac.status && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-lg z-10 ${
            ac.status === 'Available' ? 'bg-green-500/90 text-white' :
            ac.status === 'Rented Out' ? 'bg-red-500/90 text-white' :
            'bg-yellow-500/90 text-white'
          }`}>
            {ac.status}
          </div>
        )}
      </Link>
      
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-text-dark mb-1 sm:mb-2 line-clamp-1">{ac.brand} {ac.model}</h3>
        <p className="text-xs sm:text-sm text-text-light mb-2 sm:mb-3 font-medium line-clamp-1">{ac.capacity} • {ac.type}</p>
        <div className="flex items-center text-xs sm:text-sm text-text-light mb-2 sm:mb-3 md:mb-4">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-primary-blue flex-shrink-0" />
          <span className="truncate">{ac.location}</span>
        </div>
        <div className="flex items-baseline justify-between mb-3 sm:mb-4 md:mb-5 pb-2 sm:pb-3 md:pb-4 border-b border-gray-100">
          <div>
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-blue">
              ₹{ac.price?.monthly?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-xs sm:text-sm text-text-light ml-1">/month</span>
          </div>
        </div>
        <Link
          to={`/ac/${ac._id || ac.id}`}
          className="block w-full text-center bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-xs sm:text-sm md:text-base font-semibold hover:scale-[1.02]"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default ACCard;

