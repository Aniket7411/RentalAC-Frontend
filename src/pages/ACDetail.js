import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { MapPin, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Phone, Mail, Loader2, X, CheckCircle, Info, Sparkles, Wrench, RotateCcw, RefreshCw, Plus, Minus, Shield, Ruler } from 'lucide-react';
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
  const [selectedDuration, setSelectedDuration] = useState(11); // 3, 6, 9, 11, 12, 24 (as number for slider)
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedACs, setRelatedACs] = useState([]);
  const [showInstallationModal, setShowInstallationModal] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState(null);
  const [isMonthlyPayment, setIsMonthlyPayment] = useState(false); // Monthly payment option
  const [monthlyTenure, setMonthlyTenure] = useState(3); // Minimum 3 months for monthly payment
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
      // Pass monthly payment info if selected
      const duration = isMonthlyPayment ? String(monthlyTenure) : String(selectedDuration);
      addRentalToCart(ac, duration, isMonthlyPayment, isMonthlyPayment ? monthlyTenure : null);
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
    // If monthly payment is selected, calculate monthly price * tenure
    if (isMonthlyPayment && ac.monthlyPaymentEnabled && ac.monthlyPrice) {
      return ac.monthlyPrice * monthlyTenure;
    }
    // Convert selectedDuration to string key
    const durationKey = String(selectedDuration);
    return ac.price[durationKey] || ac.price['3'] || 0;
  };
  const price = getPrice();

  // Get tenure options for slider
  const tenureOptions = [3, 6, 9, 11, 12, 24];
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

            {/* Service Benefit Cards */}
            <div className="p-3 sm:p-4 md:p-5">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Card 1: Products as good as new */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                  <div className="mb-2">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Products as good as new</p>
                </div>

                {/* Card 2: Free repairs & maintenance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                  <div className="mb-2">
                    <Wrench className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Free repairs & maintenance</p>
                </div>

                {/* Card 3: Easy Returns, no questions asked */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                  <div className="mb-2">
                    <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Easy Returns, no questions asked</p>
                </div>

                {/* Card 4: Free upgrades & relocation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                  <div className="mb-2">
                    <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Free upgrades & relocation</p>
                </div>
              </div>
            </div>
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
                    className={`flex-shrink-0 p-1.5 sm:p-2 rounded-full transition-all duration-300 ${isWishlisted
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                      } ${wishlistLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isWishlisted ? 'fill-current' : ''
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
                    max={tenureOptions.length - 1}
                    step="1"
                    value={tenureOptions.indexOf(selectedDuration)}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      setSelectedDuration(tenureOptions[index]);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(tenureOptions.indexOf(selectedDuration) / (tenureOptions.length - 1)) * 100}%, #e5e7eb ${(tenureOptions.indexOf(selectedDuration) / (tenureOptions.length - 1)) * 100}%, #e5e7eb 100%)`
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

              {!isMonthlyPayment && (
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-blue">
                  ₹{price.toLocaleString()}
                  <span className="text-xs sm:text-sm md:text-base text-text-light font-normal ml-1">
                    (Total for {selectedDuration} months)
                  </span>
                </div>
              )}
            </div>

            {/* Monthly Payment Option - Show below pricing if enabled */}
            {ac.status === 'Available' && ac.monthlyPaymentEnabled && ac.monthlyPrice && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    checked={isMonthlyPayment}
                    onChange={(e) => setIsMonthlyPayment(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-blue border-gray-300 focus:ring-primary-blue"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-dark">Pay Monthly</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">New</span>
                    </div>
                    <p className="text-xs text-text-light mb-3">
                      Pay on a monthly basis instead of upfront payment
                    </p>
                    {isMonthlyPayment && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Select Tenure (Minimum 3 months) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((months) => (
                            <button
                              key={months}
                              type="button"
                              onClick={() => setMonthlyTenure(months)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                monthlyTenure === months
                                  ? 'bg-primary-blue text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-blue'
                              }`}
                            >
                              {months} {months === 1 ? 'Month' : 'Months'}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Monthly Payment:</span>
                            <span className="text-lg font-bold text-primary-blue">
                              ₹{ac.monthlyPrice.toLocaleString()}/month
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700">
                              Total for {monthlyTenure} months:
                            </span>
                            <span className="text-xl font-bold text-primary-blue">
                              ₹{(ac.monthlyPrice * monthlyTenure).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}

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

            {/* Safety and Dimensions Section */}
            <div className="mt-4 sm:mt-6 space-y-4 pt-4 sm:pt-6 border-t border-gray-200">
              {/* Safety Section */}
              {ac.features?.safety && ac.features.safety.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-blue" />
                    Safety Features
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {ac.features.safety.map((safetyItem, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-text-light">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{safetyItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dimensions/Size Section */}
              {ac.features?.dimensions && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                    <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-primary-blue" />
                    Size & Dimensions
                  </h3>
                  <p className="text-xs sm:text-sm text-text-light">
                    {ac.features.dimensions}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* FAQ and Recommended Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12">
          {/* FAQ Section - 3/5 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">
                Questions & Answers
              </h2>
              <p className="text-sm sm:text-base text-text-light">
                List of frequently asked questions from our users.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  question: "What are the steps involved in the process of renting?",
                  answer: "The rental process is simple: 1) Browse and select your preferred product, 2) Choose your rental tenure (3, 6, 9, 11, 12, or 24 months), 3) Complete KYC verification, 4) Pay security deposit and first month's rent, 5) Schedule delivery and installation, 6) Enjoy your rental product!"
                },
                {
                  question: "What kind of charges will be deducted from the deposit? When will I get my security deposit back?",
                  answer: "The security deposit may be used to cover any damages beyond normal wear and tear, missing accessories, or unpaid dues. The deposit will be refunded within 7-10 business days after the product is returned in good condition and all dues are cleared."
                },
                {
                  question: "Why do you need a KYC process? What documents are needed? What time does it take for the KYC process?",
                  answer: "KYC (Know Your Customer) is required for security and compliance. You'll need: Aadhaar card, PAN card, and a valid ID proof. The KYC process typically takes 24-48 hours for verification and approval."
                },
                {
                  question: "How long does it take for delivery? Does Rentomojo also take responsibility for installations?",
                  answer: "Delivery typically takes 2-3 business days after order confirmation and KYC approval. Yes, we provide free installation for all products. Our trained technicians will install and set up your product at your location."
                },
                {
                  question: "Will I get a new or an older product at the time of delivery? What if I don't like the quality of the product delivered to me?",
                  answer: "We provide refurbished products that are thoroughly tested and in excellent working condition. If you're not satisfied with the product quality, you can request a replacement or return within 7 days of delivery with no questions asked."
                },
                {
                  question: "How will I pay the monthly rentals? Will there be a late fee involved? Is there an auto-debit facility?",
                  answer: "You can pay monthly rentals through online payment, UPI, or bank transfer. Late fees may apply if payment is delayed beyond the due date. Yes, we offer auto-debit facility for hassle-free monthly payments."
                },
                {
                  question: "Will you relocate my rented products if I move to another house?",
                  answer: "Yes, we provide free relocation services. Simply inform us at least 7 days in advance about your new address, and we'll arrange to relocate your rented products to your new location at no extra cost."
                },
                {
                  question: "How do I return the products if I want to stop the subscription? Are there any charges if I close earlier than contracted?",
                  answer: "You can return products by contacting our customer service. If you return before the contracted period ends, there may be early termination charges as per the rental agreement. Please check your contract terms or contact us for specific details."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-medium text-text-dark pr-4 flex-1">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0">
                      {openFAQIndex === index ? (
                        <Minus className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>
                  {openFAQIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 sm:px-6 pb-3 sm:pb-4"
                    >
                      <p className="text-sm sm:text-base text-text-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommended Products Section - 2/5 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">
                Recommended Products
              </h2>
              <p className="text-sm sm:text-base text-text-light">
                Products you might like
              </p>
            </div>

            {relatedACs.length > 0 ? (
              <div className="space-y-4">
                {relatedACs.slice(0, 4).map((relatedAC) => (
                  <ACCard key={relatedAC._id || relatedAC.id} ac={relatedAC} />
                ))}
                {relatedACs.length > 4 && (
                  <Link
                    to={`/browse?category=${ac?.category || 'AC'}`}
                    className="block text-center py-3 px-4 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold text-sm sm:text-base"
                  >
                    View All Products
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-text-light">No recommended products available at the moment.</p>
              </div>
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
