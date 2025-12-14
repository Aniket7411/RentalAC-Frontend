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
  const [showDescription, setShowDescription] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Valid tenure options for monthly payment: only 3, 6, 9, 11, 12, 24
  const validMonthlyTenureOptions = [3, 6, 9, 11, 12, 24];

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
      addRentalToCart(ac, duration, isMonthlyPayment, isMonthlyPayment ? monthlyTenure : null, isMonthlyPayment ? securityDeposit : null);
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
    // If monthly payment is selected, return monthly price (not total)
    if (isMonthlyPayment && ac.monthlyPaymentEnabled && ac.monthlyPrice) {
      return ac.monthlyPrice; // Return monthly price only
    }
    // Convert selectedDuration to string key
    const durationKey = String(selectedDuration);
    return ac.price[durationKey] || ac.price['3'] || 0;
  };
  const price = getPrice();

  // Get advance payment price for comparison
  const getAdvancePrice = () => {
    if (!ac.price) return 0;
    const durationKey = String(monthlyTenure);
    return ac.price[durationKey] || ac.price['3'] || 0;
  };
  const advancePrice = getAdvancePrice();

  // Get security deposit (only for monthly payment)
  const getSecurityDeposit = () => {
    if (isMonthlyPayment && ac.monthlyPaymentEnabled && ac.securityDeposit) {
      return ac.securityDeposit;
    }
    return 0;
  };
  const securityDeposit = getSecurityDeposit();

  // Calculate monthly payment total: one month charge + security deposit
  const getMonthlyPaymentTotal = () => {
    if (isMonthlyPayment && ac.monthlyPaymentEnabled && ac.monthlyPrice) {
      return ac.monthlyPrice + securityDeposit;
    }
    return 0;
  };
  const monthlyPaymentTotal = getMonthlyPaymentTotal();

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
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-primary-blue text-text-light hover:text-primary-blue mb-2 sm:mb-4 transition-all duration-200 group text-sm sm:text-base hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Browse</span>
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

            {/* Service Benefit Cards - Hidden on small screens, shown on larger screens */}
            <div className="hidden lg:block p-3 sm:p-4 md:p-5">
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
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 border border-gray-100 sticky top-4 self-start flex flex-col"
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

            <div className="flex items-center text-text-light mb-2 pb-2 border-b border-gray-200">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-primary-blue flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{ac.location}</span>
            </div>

            {/* Pricing with Range Slider - Only for Advance Payment */}
            {!isMonthlyPayment && (
              <div className="mb-3 order-4 lg:order-4">
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
                <div className="mb-3">
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

                <div className="text-xl sm:text-2xl font-bold text-primary-blue">
                  ₹{price.toLocaleString()}
                  <span className="text-xs sm:text-sm text-text-light font-normal ml-1">
                    (Total for {selectedDuration} months)
                  </span>
                </div>
              </div>
            )}

            {/* Monthly Payment Option - Show when Pay Monthly is selected */}
            {isMonthlyPayment && ac.status === 'Available' && ac.monthlyPaymentEnabled && ac.monthlyPrice && (
              <div className="mb-3 order-4 lg:order-4">
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
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={validMonthlyTenureOptions.length - 1}
                      step="1"
                      value={validMonthlyTenureOptions.indexOf(monthlyTenure)}
                      onChange={(e) => {
                        const index = Number(e.target.value);
                        setMonthlyTenure(validMonthlyTenureOptions[index]);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(validMonthlyTenureOptions.indexOf(monthlyTenure) / (validMonthlyTenureOptions.length - 1)) * 100}%, #e5e7eb ${(validMonthlyTenureOptions.indexOf(monthlyTenure) / (validMonthlyTenureOptions.length - 1)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      {validMonthlyTenureOptions.map((option) => (
                        <div key={option} className="flex flex-col items-center">
                          <div
                            className={`w-1 h-4 ${monthlyTenure === option ? 'bg-primary-blue' : 'bg-gray-400'}`}
                          />
                          <span className={`text-xs mt-1 ${monthlyTenure === option ? 'font-bold text-primary-blue' : 'text-gray-600'}`}>
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Payment Price Details - Compact */}
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Payment:</span>
                    <span className="text-lg font-bold text-primary-blue">
                      ₹{ac.monthlyPrice.toLocaleString()}/month
                    </span>
                  </div>

                  {securityDeposit > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Security Deposit:</span>
                      <span className="text-lg font-bold text-primary-blue">
                        ₹{securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                    <span className="text-sm font-medium text-gray-700">
                      Total (1 month + Deposit):
                    </span>
                    <span className="text-xl font-bold text-primary-blue">
                      ₹{monthlyPaymentTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Savings Comparison Table */}
                {ac.price && advancePrice > 0 && (
                  <div className="mb-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-bold text-gray-800">💰 Save More with Advance Payment</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Compare your monthly payment vs advance payment options:</p>
                    <div className="space-y-2">
                      {/* Current Monthly Option */}
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-300">
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-700">Monthly Payment ({monthlyTenure} months)</span>
                          <span className="text-xs text-gray-500 block">₹{ac.monthlyPrice.toLocaleString()}/month × {monthlyTenure}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          ₹{(ac.monthlyPrice * monthlyTenure).toLocaleString()}
                        </span>
                      </div>

                      {/* Advance Payment Option for Selected Tenure */}
                      <div className="flex justify-between items-center p-2.5 bg-green-100 rounded-lg border-2 border-green-500 shadow-sm">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-green-800">✨ Advance Payment ({monthlyTenure} months)</span>
                          <span className="text-xs text-green-700 block font-medium">Pay upfront & save</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-green-800 block">
                            ₹{advancePrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-green-600 bg-green-200 px-1.5 py-0.5 rounded">
                            Save ₹{((ac.monthlyPrice * monthlyTenure) - advancePrice).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Other Tenure Options Comparison - Show top 2 savings */}
                      {validMonthlyTenureOptions
                        .filter(opt => opt !== monthlyTenure && ac.price[String(opt)])
                        .map((option) => {
                          const optionAdvancePrice = ac.price[String(option)] || 0;
                          const optionMonthlyTotal = ac.monthlyPrice * option;
                          const savings = optionMonthlyTotal - optionAdvancePrice;
                          return { option, savings, optionAdvancePrice };
                        })
                        .filter(item => item.savings > 0)
                        .sort((a, b) => b.savings - a.savings)
                        .slice(0, 2)
                        .map(({ option, savings, optionAdvancePrice }) => (
                          <div key={option} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                            <div className="flex-1">
                              <span className="text-xs text-gray-600">{option} months advance:</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-gray-700">
                                ₹{optionAdvancePrice.toLocaleString()}
                              </span>
                              <span className="text-xs text-green-600 block font-medium">
                                Save ₹{savings.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {ac.description && (
              <div className="mb-2 pb-2 border-b border-gray-200 order-2 lg:order-2">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full cursor-pointer list-none flex items-center justify-between"
                >
                  <h3 className="font-semibold text-text-dark text-sm sm:text-base">Description</h3>
                  {showDescription ? (
                    <Minus className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {showDescription && (
                  <p className="text-text-light leading-relaxed text-xs sm:text-sm mt-2">{ac.description}</p>
                )}
              </div>
            )}

            {/* Collapsible Safety and Dimensions Section - Additional Details */}
            {((ac.features?.safety && ac.features.safety.length > 0) || ac.features?.dimensions) && (
              <div className="mb-2 pb-2 border-b border-gray-200 order-7 lg:order-7">
                <button
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                  className="w-full cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-text-dark hover:text-primary-blue transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-blue" />
                    Additional Details
                  </span>
                  {showAdditionalDetails ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
                {showAdditionalDetails && (
                  <div className="mt-3 space-y-3">
                    {/* Safety Section */}
                    {ac.features?.safety && ac.features.safety.length > 0 && (
                      <div>
                        <h4 className="font-medium text-text-dark mb-2 text-xs sm:text-sm">Safety Features</h4>
                        <ul className="space-y-1.5">
                          {ac.features.safety.map((safetyItem, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-text-light">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{safetyItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dimensions/Size Section */}
                    {ac.features?.dimensions && (
                      <div>
                        <h4 className="font-medium text-text-dark mb-2 text-xs sm:text-sm flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-primary-blue" />
                          Size & Dimensions
                        </h4>
                        <p className="text-xs text-text-light">
                          {ac.features.dimensions}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Features & Specs - Compact & Collapsible */}
            {(ac.features?.specs?.length > 0 || ac.features?.dimensions || ac.features?.safety?.length > 0 || ac.energyRating || ac.operationType || ac.loadType) && (
              <div className="mb-2 pb-2 border-b border-gray-200 order-3 lg:order-3">
                <button
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="w-full cursor-pointer list-none flex items-center justify-between"
                >
                  <h3 className="font-semibold text-text-dark text-sm sm:text-base">Features & Specifications</h3>
                  {showFeatures ? (
                    <Minus className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {showFeatures && (
                  <div className="space-y-1.5 mt-2">
                    {ac.features?.specs?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-text-dark mb-0.5">Specifications</h4>
                        <ul className="list-disc list-inside text-xs text-text-light space-y-0.5">
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
                )}
              </div>
            )}

            {/* Payment Type Selection Buttons */}
            {ac.status === 'Available' && (
              <div className="mb-3 order-6 lg:order-6">
                <div className="flex gap-3 mb-3">
                  {/* Pay Advance Button - Green, Left */}
                  <button
                    type="button"
                    onClick={() => setIsMonthlyPayment(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${!isMonthlyPayment
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Pay Advance
                  </button>

                  {/* Pay Monthly Button - Right */}
                  {ac.monthlyPaymentEnabled && ac.monthlyPrice && (
                    <button
                      type="button"
                      onClick={() => setIsMonthlyPayment(true)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isMonthlyPayment
                        ? 'bg-primary-blue text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Pay Monthly
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart Button - Always shown (works for both logged-in and non-logged-in users) */}
            {ac.status === 'Available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCartClick}
                disabled={addedToCart}
                className={`w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg mb-3 order-5 lg:order-5 ${addedToCart
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
                  }`}
              >
                {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Service Benefit Cards - Shown on small screens only, below product details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:hidden mt-6 sm:mt-8"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Card 1: Products as good as new */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                <div className="mb-2">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">Products as good as new</p>
              </div>

              {/* Card 2: Free repairs & maintenance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                <div className="mb-2">
                  <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">Free repairs & maintenance</p>
              </div>

              {/* Card 3: Easy Returns, no questions asked */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                <div className="mb-2">
                  <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">Easy Returns, no questions asked</p>
              </div>

              {/* Card 4: Free upgrades & relocation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col items-center text-center">
                <div className="mb-2">
                  <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">Free upgrades & relocation</p>
              </div>
            </div>
          </div>
        </motion.div>

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
                {relatedACs.slice(0, 2).map((relatedAC) => (
                  <ACCard key={relatedAC._id || relatedAC.id} ac={relatedAC} />
                ))}
                {relatedACs.length > 2 && (
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
