import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { MapPin, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Phone, Mail, Loader2, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import ACCard from '../components/ACCard';

const ACDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ac, setAc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('3'); // '3', '6', '9', '11'
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedACs, setRelatedACs] = useState([]);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadAC();
  }, [id]);

  useEffect(() => {
    if (ac) {
      loadRelatedACs();
    }
  }, [ac]);

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

  const nextImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ac.images.length);
    }
  };

  const prevImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ac.images.length) % ac.images.length);
    }
  };

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setInquiryData({ ...inquiryData, phone: formatted });
    } else {
      setInquiryData({ ...inquiryData, [name]: value });
    }
    setInquiryError('');
  };

  const addToCart = () => {
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
      success('Product added to cart successfully!');
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add product to cart. Please try again.');
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');

    if (!inquiryData.name || !inquiryData.phone || !inquiryData.email) {
      setInquiryError('Please fill all required fields');
      return;
    }

    if (!validatePhoneNumber(inquiryData.phone)) {
      setInquiryError('Please enter a valid 10-digit phone number');
      return;
    }

    setSubmittingInquiry(true);

    try {
      const formattedData = {
        ...inquiryData,
        phone: getFormattedPhone(inquiryData.phone),
        acDetails: ac ? {
          id: ac._id || ac.id,
          brand: ac.brand,
          model: ac.model,
          capacity: ac.capacity,
          type: ac.type,
          location: ac.location,
          price: ac.price,
        } : undefined,
      };

      const response = await apiService.createRentalInquiry(id, formattedData);
      if (response.success) {
        success('Rental inquiry submitted successfully! We will contact you soon.');
        setInquirySuccess(true);
        setInquiryData({ name: '', phone: '', email: '', message: '' });
        setTimeout(() => {
          setShowInquiryForm(false);
          setInquirySuccess(false);
        }, 2000);
      } else {
        const errorMsg = response.message || 'Failed to submit inquiry. Please try again.';
        setInquiryError(errorMsg);
        showError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setInquiryError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmittingInquiry(false);
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
    // Default to 3 months if selectedDuration is not valid
    return ac.price[selectedDuration] || ac.price[3] || 0;
    return ac.price[selectedDuration] || 0;
  };
  const price = getPrice();
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
              <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <img
                  src={ac.images[currentImageIndex]}
                  alt={`${ac.brand} ${ac.model}`}
                  className="w-full h-full object-contain p-4 sm:p-6 md:p-8"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                  }}
                />
                {ac.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:text-primary-blue shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 z-10"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:text-primary-blue shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 z-10"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
                      {ac.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                            ? 'w-8 h-2 bg-primary-blue'
                            : 'w-2 h-2 bg-gray-400 hover:bg-gray-500'
                            }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {ac.status && (
                  <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-md ${ac.status === 'Available' ? 'bg-green-500/90 text-white' :
                    ac.status === 'Rented Out' ? 'bg-red-500/90 text-white' :
                      'bg-yellow-500/90 text-white'
                    }`}>
                    {ac.status}
                  </div>
                )}
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
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4 sm:mb-5">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-dark mb-1.5 sm:mb-2">
                  {ac.brand} {ac.model}
                </h1>
                <p className="text-sm sm:text-base text-text-light">
                  {ac.capacity} • {ac.type}
                </p>
              </div>
            </div>

            <div className="flex items-center text-text-light mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-primary-blue flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base truncate">{ac.location}</span>
            </div>

            {ac.description && (
              <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                <h3 className="font-semibold text-text-dark mb-2 sm:mb-3 text-base sm:text-lg">Description</h3>
                <p className="text-text-light leading-relaxed text-xs sm:text-sm md:text-base">{ac.description}</p>
              </div>
            )}

            {/* Features & Specs */}
            {(ac.features?.specs?.length > 0 || ac.features?.dimensions || ac.features?.safety?.length > 0 || ac.energyRating || ac.operationType || ac.loadType) && (
              <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                <h3 className="font-semibold text-text-dark mb-2 sm:mb-3 text-base sm:text-lg">Features & Specifications</h3>
                <div className="space-y-2 sm:space-y-3">
                  {ac.features?.specs?.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-dark mb-1.5">Specifications</h4>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-text-light space-y-1">
                        {ac.features.specs.map((spec, idx) => (
                          <li key={idx}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ac.features?.dimensions && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-dark mb-1">Dimensions</h4>
                      <p className="text-xs sm:text-sm text-text-light">{ac.features.dimensions}</p>
                    </div>
                  )}
                  {ac.features?.safety?.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-dark mb-1.5">Safety & Usage</h4>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-text-light space-y-1">
                        {ac.features.safety.map((safety, idx) => (
                          <li key={idx}>{safety}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ac.energyRating && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-dark mb-1">Energy Rating</h4>
                      <p className="text-xs sm:text-sm text-text-light">{ac.energyRating}</p>
                    </div>
                  )}
                  {(ac.operationType || ac.loadType) && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-text-dark mb-1">Operation Details</h4>
                      <p className="text-xs sm:text-sm text-text-light">
                        {ac.operationType && `Type: ${ac.operationType}`}
                        {ac.operationType && ac.loadType && ' • '}
                        {ac.loadType && `Load: ${ac.loadType}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-4 sm:mb-5">
              <h3 className="font-semibold text-text-dark mb-3 sm:mb-4 text-base sm:text-lg">Rental Pricing</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {[
                  { key: '3', label: '3 Months' },
                  { key: '6', label: '6 Months' },
                  { key: '9', label: '9 Months' },
                  { key: '11', label: '11 Months' }
                ].map((duration) => (
                  <button
                    key={duration.key}
                    onClick={() => setSelectedDuration(duration.key)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm ${selectedDuration === duration.key
                      ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                      : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                      }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-blue mb-1">
                ₹{price.toLocaleString()}
                <span className="text-sm sm:text-base md:text-lg text-text-light font-normal ml-1 sm:ml-2">
                  /{selectedDuration === '3' ? '3 months' : selectedDuration === '6' ? '6 months' : selectedDuration === '9' ? '9 months' : '11 months'}
                </span>
              </div>
            </div>

            {/* Add to Cart / Inquiry Button */}
            {ac.status === 'Available' && (
              <>
                {isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addToCart}
                    disabled={addedToCart}
                    className={`w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg ${
                      addedToCart
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
                    }`}
                  >
                    {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg"
                  >
                    Inquire About Rental
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-dark">Rental Inquiry</h2>
                <button
                  onClick={() => {
                    setShowInquiryForm(false);
                    setInquiryError('');
                    setInquirySuccess(false);
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-text-light hover:text-text-dark"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {inquirySuccess ? (
                <div className="text-center py-6 sm:py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  >
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </motion.div>
                  <p className="text-lg sm:text-xl font-semibold text-text-dark mb-2">
                    Thank you for your inquiry!
                  </p>
                  <p className="text-sm sm:text-base text-text-light">
                    We'll contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-5">
                  {inquiryError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {inquiryError}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-text-dark mb-1.5 sm:mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inquiryData.name}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-text-dark mb-1.5 sm:mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-text-light text-xs sm:text-sm font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={inquiryData.phone}
                        onChange={handleInquiryChange}
                        required
                        maxLength={15}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-text-light mt-1">Enter 10-digit phone number</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-text-dark mb-1.5 sm:mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryData.email}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-text-dark mb-1.5 sm:mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white resize-none text-sm sm:text-base"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowInquiryForm(false);
                        setInquiryError('');
                        setInquirySuccess(false);
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submittingInquiry}
                      whileHover={{ scale: submittingInquiry ? 1 : 1.02 }}
                      whileTap={{ scale: submittingInquiry ? 1 : 0.98 }}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white rounded-lg sm:rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transition-all text-sm sm:text-base"
                    >
                      {submittingInquiry ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        'Submit Inquiry'
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default ACDetail;
