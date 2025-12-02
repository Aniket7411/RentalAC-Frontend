import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Zap, ShoppingCart, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ServiceBookingModal from './ServiceBookingModal';

const ServiceCard = ({ service, onAddClick, onView }) => {
  const { isAuthenticated } = useAuth();
  const { addServiceToCart } = useCart();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const badgeIcons = {
    'Visit Within 1 Hour': <User className="w-3 h-3" />,
    'Most Booked': <ShoppingCart className="w-3 h-3" />,
    'Power Saver': <Zap className="w-3 h-3" />,
  };

  const features = Array.isArray(service.features) ? service.features : [];
  const benefits = Array.isArray(service.benefits) ? service.benefits : [];

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Show booking modal to collect booking details before adding to cart
    setShowBookingModal(true);
  };

  // Note: ServiceBookingModal handles adding to cart automatically
  // No need for handleBookingSubmit - service goes through cart → checkout → order flow

  const handleCardClick = () => {
    onView && onView(service);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      className="price-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-primary-blue/30 hover:-translate-y-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
    >
      {/* Image on top */}
      <div
        className="w-full h-40 sm:h-44 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
      >
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Wrench className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 md:p-7">
        {/* Badge */}
        {service.badge && (
          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 shadow-sm">
            {badgeIcons[service.badge] && badgeIcons[service.badge]}
            <span>{service.badge}</span>
          </div>
        )}

        {/* Title */}
        <h3
          className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mb-3 hover:text-sky-700 transition-colors"
        >
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 mb-4 text-sm sm:text-base leading-relaxed line-clamp-2">{service.description}</p>

        {/* Quick Features/Benefits preview */}
        {(features.length > 0 || benefits.length > 0) && (
          <div className="mb-5">
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5">
              {(features.slice(0, 2)).map((f, i) => (
                <li key={`f-${i}`}>{f}</li>
              ))}
              {features.length === 0 && (benefits.slice(0, 2)).map((b, i) => (
                <li key={`b-${i}`}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline space-x-2 mb-5 pb-4 border-b border-gray-200">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">₹{service.price}</span>
          {service.originalPrice && (
            <span className="text-base md:text-lg text-slate-500 line-through">₹{service.originalPrice}</span>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleBookClick}
          className="cursor-hover w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-blue to-primary-blue-light hover:from-primary-blue-light hover:to-primary-blue text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] text-base"
        >
          Book Service
        </button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <ServiceBookingModal
          service={service}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        // onSubmit not needed - modal handles adding to cart automatically
        />
      )}
    </motion.div>
  );
};

export default ServiceCard;

