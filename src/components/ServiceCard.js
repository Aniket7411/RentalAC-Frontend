import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, ShoppingCart, User, Wrench } from 'lucide-react';

const ServiceCard = ({ service, onAddClick, onView }) => {
  const badgeIcons = {
    'Visit Within 1 Hour': <User className="w-3 h-3" />,
    'Most Booked': <ShoppingCart className="w-3 h-3" />,
    'Power Saver': <Zap className="w-3 h-3" />,
  };

  const features = Array.isArray(service.features) ? service.features : [];
  const benefits = Array.isArray(service.benefits) ? service.benefits : [];

  const handleBookClick = (e) => {
    e.stopPropagation();
    onAddClick && onAddClick(service);
  };

  const handleCardClick = () => {
    onView && onView(service);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-primary-blue/30 hover:-translate-y-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
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
      <div className="p-4 md:p-5">
          {/* Badge */}
          {service.badge && (
            <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm">
              {badgeIcons[service.badge] && badgeIcons[service.badge]}
              <span>{service.badge}</span>
            </div>
          )}

          {/* Title */}
          <h3
            className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-purple-700"
          >
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{service.description}</p>

          {/* Quick Features/Benefits preview */}
          {(features.length > 0 || benefits.length > 0) && (
            <div className="mb-4">
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
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
          <div className="flex items-baseline space-x-2 mb-4 pb-3 border-b border-gray-100">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">₹{service.price}</span>
            {service.originalPrice && (
              <span className="text-base md:text-lg text-gray-400 line-through">₹{service.originalPrice}</span>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleBookClick}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-blue to-primary-blue-light hover:from-primary-blue-light hover:to-primary-blue text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            Book Service
          </button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;

