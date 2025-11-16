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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image on top */}
      <div
        className="w-full h-48 sm:h-52 lg:h-56 bg-gray-100 cursor-pointer"
        onClick={() => onView && onView(service)}
      >
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x320?text=AC+Service';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Wrench className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
          {/* Badge */}
          {service.badge && (
            <div className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              {badgeIcons[service.badge] && badgeIcons[service.badge]}
              <span>{service.badge}</span>
            </div>
          )}

          {/* Title */}
          <h3
            className="text-xl md:text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-purple-700"
            onClick={() => onView && onView(service)}
          >
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>

          {/* Quick Features/Benefits preview */}
          {(features.length > 0 || benefits.length > 0) && (
            <div className="mb-4">
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
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
          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-2xl md:text-3xl font-bold text-purple-600">₹{service.price}</span>
            {service.originalPrice && (
              <span className="text-base md:text-lg text-gray-400 line-through">₹{service.originalPrice}</span>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={() => onAddClick(service)}
            className="inline-flex items-center bg-yellow-100 hover:bg-yellow-200 text-gray-900 border border-purple-500 px-4 py-2 rounded-md font-semibold transition-colors duration-200 w-auto whitespace-normal"
          >
            Add
          </button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;

