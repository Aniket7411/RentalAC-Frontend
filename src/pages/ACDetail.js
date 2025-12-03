import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { MapPin, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Phone, Mail, Loader2, X, CheckCircle, Info } from 'lucide-react';
import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import ACCard from '../components/ACCard';
import InstallationChargesModal from '../components/InstallationChargesModal';

const ACDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addRentalToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [ac, setAc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const prevImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ac.images.length) % ac.images.length);
    }
  };

  const nextImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ac.images.length);
    }
  };
  const [selectedDuration, setSelectedDuration] = useState(11); // 3, 6, 9, 11 (as number for slider)
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedACs, setRelatedACs] = useState([]);
  const [showInstallationModal, setShowInstallationModal] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadAC();
  }, [id]);

  useEffect(() => {
    if (ac) {
      loadRelatedACs();
    }
  }, [ac]);

  useEffect(() => {
    if (isAuthenticated && ac) {
      const productId = ac._id || ac.id;
      if (productId) {
        setIsWishlisted(isInWishlist(productId));
      }
    } else {
      setIsWishlisted(false);
    }
  }, [isAuthenticated, ac, isInWishlist]);

  const loadAC = async () => {
    setLoading(true);
    try {
      const response = await apiService.getACById(id);
      if (response.success) {
        setAc(response.data);
      } else {
        showError(response.message || 'Failed to load AC details');
        setTimeout(() => navigate('/browse'), 2000);
      }
    } catch (err) {
      showError('An error occurred while loading AC details');
      setTimeout(() => navigate('/browse'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedACs = async () => {
    try {
      if (!ac) return;

      const currentACId = ac._id || ac.id;

      const productCategory = ac?.category || 'AC';

      // First, get products of the same category
      let response = await apiService.getACs({
        category: productCategory,
      });

      let products = [];
      if (response?.success) {
        products = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
      }

      // Filter out current product
      let filtered = products.filter((relatedProduct) => {
        const relatedId = relatedProduct?._id || relatedProduct?.id;
        return relatedId && relatedId !== currentACId;
      });

      // If we don't have enough, try to get products with same brand and category
      if (filtered.length < 6 && ac?.brand) {
        response = await apiService.getACs({
          category: productCategory,
          brand: ac.brand
        });
        if (response?.success) {
          const brandProducts = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          const brandFiltered = brandProducts.filter((relatedProduct) => {
            const relatedId = relatedProduct?._id || relatedProduct?.id;
            return relatedId && relatedId !== currentACId && !filtered.some(f => (f?._id || f?.id) === relatedId);
          });
          filtered = [...filtered, ...brandFiltered];
        }
      }

      // Set related products (max 6)
      setRelatedACs(filtered.slice(0, 6));
    } catch (err) {
      console.error('Failed to load related ACs:', err);
      // Fallback: try to get any ACs
      try {
        const response = await apiService.getACs();
        if (response.success) {
          const allProducts = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          const currentProductId = ac?._id || ac?.id;
          const productCategory = ac?.category || 'AC';
          const filtered = allProducts.filter((relatedProduct) => {
            const relatedId = relatedProduct?._id || relatedProduct?.id;
            const relatedCategory = relatedProduct?.category || 'AC';
            return relatedId && relatedId !== currentProductId && relatedCategory === productCategory;
          });
          setRelatedACs(filtered.slice(0, 6));
        }
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
      }
    }
  };


  const handleAddToCartClick = () => {
    // If AC has installation charges, show modal first
    if (ac.category === 'AC' && ac.installationCharges && ac.installationCharges.amount) {
      setShowInstallationModal(true);
    } else {
      // No installation charges, add directly to cart
      addToCart();
    }
  };

  const addToCart = () => {
    try {
      // Use CartContext to add product (works for both logged-in and non-logged-in users)
      addRentalToCart(ac, String(selectedDuration));
      setAddedToCart(true);
      success('Product added to cart successfully!');
      setTimeout(() => setAddedToCart(false), 2000);
      setShowInstallationModal(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.message || 'Failed to add product to cart. Please try again.');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showError('Please login to add to wishlist');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const productId = ac._id || ac.id;
    if (!productId) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          setIsWishlisted(false);
          success('Removed from wishlist');
        } else {
          showError(result.message || 'Failed to remove from wishlist');
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          setIsWishlisted(true);
          success('Added to wishlist');
        } else {
          showError(result.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showError('An error occurred. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light text-lg">Loading AC details...</p>
        </div>
      </div>
    );
  }

  if (!ac) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <p className="text-text-light text-lg mb-4">AC not found</p>
          <Link
            to="/browse"
            className="text-primary-blue hover:text-primary-blue-light font-semibold"
          >
            Go back to browse
          </Link>
        </div>
      </div>
    );
  }

  // Get price based on selected duration
  const getPrice = () => {
    if (!ac.price) return 0;
    // Convert selectedDuration to string key
    const durationKey = String(selectedDuration);
    return ac.price[durationKey] || ac.price['3'] || 0;
  };
  const price = getPrice();

  // Get tenure options for slider
  const tenureOptions = [3, 6, 9, 11];
  const hasImages = ac.images && ac.images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-4 sm:py-6 md:py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/browse')}
          className="flex items-center space-x-2 text-text-light hover:text-primary-blue mb-4 sm:mb-6 transition-colors group text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Browse</span>
        </motion.button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            {hasImages ? (
              <div className="flex flex-col md:flex-row gap-2 sm:gap-3 p-2 sm:p-3">
                {/* Thumbnail Images Column (Left) */}
                {ac.images.length > 1 && (
                  <div className="flex md:flex-col gap-1.5 sm:gap-2 order-2 md:order-1 md:max-h-[450px] scrollbar-hide">
                    {ac.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentImageIndex
                          ? 'border-primary-blue shadow-md scale-105'
                          : 'border-gray-200 hover:border-primary-blue/50 opacity-70 hover:opacity-100'
                          }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${ac.brand} ${ac.model} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&q=80';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Hero Image */}
                <div className="relative flex-1 order-1 md:order-2 aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={ac.images[currentImageIndex]}
                    alt={`${ac.brand} ${ac.model}`}
                    className="w-full h-full object-contain p-3 sm:p-4 md:p-6"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                    }}
                  />
                  {ac.status && (
                    <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-md ${ac.status === 'Available' ? 'bg-green-500/90 text-white' :
                      ac.status === 'Rented Out' ? 'bg-red-500/90 text-white' :
                        'bg-yellow-500/90 text-white'
                      }`}>
                      {ac.status}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <p className="text-sm sm:text-base font-medium">No Image Available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* AC Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-text-dark">
                    {ac.brand} {ac.model}
                  </h1>
                  {/* Wishlist Icon */}
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`flex-shrink-0 p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                      isWishlisted
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                    } ${wishlistLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                        isWishlisted ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-text-light">
                  {ac.capacity} • {ac.type}
                </p>
              </div>
            </div>

            <div className="flex items-center text-text-light mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-primary-blue flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{ac.location}</span>
            </div>

            {ac.description && (
              <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200">
                <h3 className="font-semibold text-text-dark mb-1 sm:mb-2 text-sm sm:text-base">Description</h3>
                <p className="text-text-light leading-relaxed text-xs sm:text-sm line-clamp-3 md:line-clamp-none">{ac.description}</p>
              </div>
            )}

            {/* Features & Specs - Compact */}
            {(ac.features?.specs?.length > 0 || ac.features?.dimensions || ac.features?.safety?.length > 0 || ac.energyRating || ac.operationType || ac.loadType) && (
              <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200">
                <h3 className="font-semibold text-text-dark mb-1.5 sm:mb-2 text-sm sm:text-base">Features & Specifications</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {ac.features?.specs?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-text-dark mb-0.5">Specifications</h4>
                      <ul className="list-disc list-inside text-xs text-text-light space-y-0.5 line-clamp-2 md:line-clamp-none">
                        {ac.features.specs.slice(0, 3).map((spec, idx) => (
                          <li key={idx}>{spec}</li>
                        ))}
                        {ac.features.specs.length > 3 && (
                          <li className="text-primary-blue cursor-pointer">+{ac.features.specs.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {ac.features?.dimensions && (
                    <div>
                      <h4 className="text-xs font-medium text-text-dark mb-0.5">Dimensions</h4>
                      <p className="text-xs text-text-light">{ac.features.dimensions}</p>
                    </div>
                  )}
                  {ac.energyRating && (
                    <div>
                      <h4 className="text-xs font-medium text-text-dark mb-0.5">Energy Rating</h4>
                      <p className="text-xs text-text-light">{ac.energyRating}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing with Range Slider */}
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-text-dark text-sm sm:text-base">Choose Tenure</h3>
                <div className="relative group">
                  <Info className="w-4 h-4 text-blue-500 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    Select rental duration
                  </div>
                </div>
              </div>
              
              {/* Range Slider */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={tenureOptions.indexOf(selectedDuration)}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      setSelectedDuration(tenureOptions[index]);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(tenureOptions.indexOf(selectedDuration) / 3) * 100}%, #e5e7eb ${(tenureOptions.indexOf(selectedDuration) / 3) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    {tenureOptions.map((option) => (
                      <div key={option} className="flex flex-col items-center">
                        <div
                          className={`w-1 h-4 ${selectedDuration === option ? 'bg-primary-blue' : 'bg-gray-400'}`}
                        />
                        <span className={`text-xs mt-1 ${selectedDuration === option ? 'font-bold text-primary-blue' : 'text-gray-600'}`}>
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-blue">
                ₹{price.toLocaleString()}
                <span className="text-xs sm:text-sm md:text-base text-text-light font-normal ml-1">
                  (Total for {selectedDuration} months)
                </span>
              </div>
            </div>

            {/* Add to Cart Button - Always shown (works for both logged-in and non-logged-in users) */}
            {ac.status === 'Available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCartClick}
                disabled={addedToCart}
                className={`w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg ${addedToCart
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
                  }`}
              >
                {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
              </motion.button>
            )}
          </motion.div>
        </div>


        {/* Related ACs Section */}
        {relatedACs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-8 sm:mt-10 md:mt-12"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-dark">
                Related {ac?.category === 'Refrigerator' ? 'Refrigerators' : ac?.category === 'Washing Machine' ? 'Washing Machines' : 'ACs'}
              </h2>
              <Link
                to={`/browse?category=${ac?.category || 'AC'}`}
                className="text-primary-blue hover:text-primary-blue-light flex items-center space-x-1 text-xs sm:text-sm md:text-base font-semibold group"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {relatedACs.map((relatedAC) => (
                <ACCard key={relatedAC._id || relatedAC.id} ac={relatedAC} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Installation Charges Modal */}
        {ac.category === 'AC' && ac.installationCharges && (
          <InstallationChargesModal
            isOpen={showInstallationModal}
            onClose={() => setShowInstallationModal(false)}
            onConfirm={addToCart}
            installationCharges={ac.installationCharges}
          />
        )}
      </div>
    </div>
  );
};

export default ACDetail;
