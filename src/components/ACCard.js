import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ACCard = ({ ac }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 bg-gray-200">
        {ac.images && ac.images.length > 0 ? (
          <>
            <img
              src={ac.images[currentImageIndex]}
              alt={`${ac.brand} ${ac.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=AC+Image';
              }}
            />
            {ac.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/70 backdrop-blur-sm transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/70 backdrop-blur-sm transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {ac.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {ac.status && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
            ac.status === 'Available' ? 'bg-green-500 text-white' :
            ac.status === 'Rented Out' ? 'bg-red-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {ac.status}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-text-dark mb-1">{ac.brand} {ac.model}</h3>
        <p className="text-sm text-text-light mb-2">{ac.capacity} • {ac.type}</p>
        <div className="flex items-center text-sm text-text-light mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{ac.location}</span>
        </div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-blue">
              ₹{ac.price?.monthly?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-sm text-text-light">/month</span>
          </div>
        </div>
        <Link
          to={`/ac/${ac._id || ac.id}`}
          className="block w-full text-center bg-primary-blue text-white py-2 rounded-lg hover:bg-primary-blue-light transition"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default ACCard;

