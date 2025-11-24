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
  const [ac, setAc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
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

      // First, try to get ACs with same brand and capacity
      let response = await apiService.getACs({
        brand: ac.brand,
        capacity: ac.capacity,
      });

      let acs = [];
      if (response.success) {
        acs = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
      }

      // Filter out current AC
      let filtered = acs.filter((relatedAC) => (relatedAC._id || relatedAC.id) !== currentACId);

      // If we don't have enough related ACs, try to get ACs with same brand only
      if (filtered.length < 3) {
        response = await apiService.getACs({ brand: ac.brand });
        if (response.success) {
          const brandACs = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          const brandFiltered = brandACs.filter((relatedAC) => {
            const relatedId = relatedAC._id || relatedAC.id;
            return relatedId !== currentACId && !filtered.some(f => (f._id || f.id) === relatedId);
          });
          filtered = [...filtered, ...brandFiltered];
        }
      }

      // If still not enough, get any other ACs
      if (filtered.length < 3) {
        response = await apiService.getACs();
        if (response.success) {
          const allACs = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          const otherACs = allACs.filter((relatedAC) => {
            const relatedId = relatedAC._id || relatedAC.id;
            return relatedId !== currentACId && !filtered.some(f => (f._id || f.id) === relatedId);
          });
          filtered = [...filtered, ...otherACs];
        }
      }

      // Set related ACs (max 3)
      setRelatedACs(filtered.slice(0, 3));
    } catch (err) {
      console.error('Failed to load related ACs:', err);
      // Fallback: try to get any ACs
      try {
        const response = await apiService.getACs();
        if (response.success) {
          const allACs = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          const currentACId = ac?._id || ac?.id;
          const filtered = allACs.filter((relatedAC) => (relatedAC._id || relatedAC.id) !== currentACId);
          setRelatedACs(filtered.slice(0, 3));
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

  const price = ac.price?.[selectedDuration] || 0;
  const hasImages = ac.images && ac.images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 sm:py-8 md:py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/browse')}
          className="flex items-center space-x-2 text-text-light hover:text-primary-blue mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Browse</span>
        </motion.button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            {hasImages ? (
              <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={ac.images[currentImageIndex]}
                  alt={`${ac.brand} ${ac.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                  }}
                />
                {ac.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:text-primary-blue shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:text-primary-blue shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
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
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg ${ac.status === 'Available' ? 'bg-green-500/90 text-white' :
                    ac.status === 'Rented Out' ? 'bg-red-500/90 text-white' :
                      'bg-yellow-500/90 text-white'
                    }`}>
                    {ac.status}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <p className="text-lg font-medium">No Image Available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* AC Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">
                  {ac.brand} {ac.model}
                </h1>
                <p className="text-base sm:text-lg text-text-light">
                  {ac.capacity} • {ac.type}
                </p>
              </div>
            </div>

            <div className="flex items-center text-text-light mb-6 pb-6 border-b border-gray-200">
              <MapPin className="w-5 h-5 mr-2 text-primary-blue" />
              <span className="text-sm sm:text-base">{ac.location}</span>
            </div>

            {ac.description && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-text-dark mb-3 text-lg">Description</h3>
                <p className="text-text-light leading-relaxed text-sm sm:text-base">{ac.description}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <h3 className="font-semibold text-text-dark mb-4 text-lg">Rental Pricing</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['monthly', 'quarterly', 'yearly'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${selectedDuration === duration
                      ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-lg'
                      : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                      }`}
                  >
                    {duration.charAt(0).toUpperCase() + duration.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-blue mb-1">
                ₹{price.toLocaleString()}
                <span className="text-base sm:text-lg md:text-xl text-text-light font-normal ml-2">
                  /{selectedDuration === 'monthly' ? 'month' : selectedDuration === 'quarterly' ? 'quarter' : 'year'}
                </span>
              </div>
            </div>

            {/* Inquiry Button */}
            {ac.status === 'Available' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInquiryForm(true)}
                className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-3.5 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-base sm:text-lg"
              >
                Inquire About Rental
              </motion.button>
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-dark">Rental Inquiry</h2>
                <button
                  onClick={() => {
                    setShowInquiryForm(false);
                    setInquiryError('');
                    setInquirySuccess(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-text-light hover:text-text-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inquirySuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <p className="text-xl font-semibold text-text-dark mb-2">
                    Thank you for your inquiry!
                  </p>
                  <p className="text-text-light">
                    We'll contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5">
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
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inquiryData.name}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light text-sm font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={inquiryData.phone}
                        onChange={handleInquiryChange}
                        required
                        maxLength={15}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-text-light mt-1">Enter 10-digit phone number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryData.email}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowInquiryForm(false);
                        setInquiryError('');
                        setInquirySuccess(false);
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submittingInquiry}
                      whileHover={{ scale: submittingInquiry ? 1 : 1.02 }}
                      whileTap={{ scale: submittingInquiry ? 1 : 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transition-all"
                    >
                      {submittingInquiry ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
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
            className="mt-12 md:mt-16"
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark">Related ACs</h2>
              <Link
                to="/browse"
                className="text-primary-blue hover:text-primary-blue-light flex items-center space-x-1 text-sm sm:text-base font-semibold group"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
